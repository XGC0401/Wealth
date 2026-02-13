import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Supabase SDK 連接
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('缺少 Supabase 連線配置，請確認 .env 設置。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

// ============ 認證相關 API ============

// 註冊新用戶
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    // 驗證輸入
    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    // 檢查用戶是否已存在
    const { data: existingUsers, error: existingError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`);

    if (existingError) {
      throw existingError;
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(409).json({ message: '用戶已存在' });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 創建用戶
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username,
        name,
        email,
        password: hashedPassword
      })
      .select('id, username, name, email')
      .single();

    if (insertError) {
      throw insertError;
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: '註冊成功',
      user: newUser,
      token
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 登錄
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;

    if (!identifier || !password) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    // 查找用戶
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, name, email, password')
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return res.status(401).json({ message: '用戶不存在' });
    }

    // 驗證密碼
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: '密碼錯誤' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登錄成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('登錄錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 用戶相關 API ============

// 獲取用戶信息
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, name, email, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return res.status(404).json({ message: '用戶不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error('取得用戶錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 更新用戶信息
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email } = req.body;

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ username, email })
      .eq('id', userId)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!updatedUser) {
      return res.status(404).json({ message: '用戶不存在' });
    }

    res.json({
      message: '用戶信息已更新',
      user: updatedUser
    });
  } catch (error) {
    console.error('更新用戶錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 活動相關 API ============

// 獲取用戶所有活動
app.get('/api/activities/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (activitiesError) {
      throw activitiesError;
    }

    res.json(activities || []);
  } catch (error) {
    console.error('取得活動錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 添加活動
app.post('/api/activities', async (req, res) => {
  try {
    const { user_id, activity_type, duration, calories } = req.body;

    if (!user_id || !activity_type || !duration) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const { data: newActivity, error: insertError } = await supabase
      .from('activities')
      .insert({
        user_id,
        activity_type,
        duration,
        calories: calories || 0
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({
      message: '活動已添加',
      activity: newActivity
    });
  } catch (error) {
    console.error('添加活動錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 檢查服務器健康狀態 ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'API 正在運行', timestamp: new Date() });
});

// ============ 啟動伺服器 ============

app.listen(PORT, () => {
  console.log(`🚀 API 伺服器正在運行於 http://localhost:${PORT}`);
});
