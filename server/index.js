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

const parseActivityNotes = (notesValue) => {
  if (!notesValue) {
    return { name: null, notes: '' };
  }

  if (typeof notesValue === 'string') {
    try {
      const parsed = JSON.parse(notesValue);
      if (parsed && typeof parsed === 'object') {
        return {
          name: parsed.name || null,
          notes: parsed.notes || ''
        };
      }
    } catch (_) {
      return { name: null, notes: notesValue };
    }
  }

  return { name: null, notes: String(notesValue) };
};

const buildActivityNotes = (name, notes) => JSON.stringify({
  name: name || '',
  notes: notes || ''
});

const mapActivityRecord = (record) => {
  const parsed = parseActivityNotes(record.notes);

  return {
    id: record.id,
    userId: record.user_id,
    name: parsed.name || record.activity_type,
    type: record.activity_type,
    duration: record.duration,
    calories: record.calories || 0,
    date: record.activity_date || record.created_at,
    notes: parsed.notes,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
};

const mapDietLog = (record) => ({
  id: record.id,
  userId: record.user_id,
  name: record.food_item,
  mealType: record.meal_type || '',
  calories: record.calories || 0,
  protein: Number(record.proteins || 0),
  carbs: Number(record.carbs || 0),
  fat: Number(record.fats || 0),
  notes: record.notes || '',
  date: record.log_date || record.created_at,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

const mapMentalHealthLog = (record) => ({
  id: record.id,
  userId: record.user_id,
  name: record.notes || record.activity_type,
  type: record.activity_type || '其他',
  duration: record.duration || 0,
  mood: record.mood_level || null,
  notes: record.notes || '',
  date: record.log_date || record.created_at,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

const mapReminder = (record) => {
  const scheduled = record.scheduled_time ? new Date(record.scheduled_time) : null;
  const time = scheduled
    ? `${String(scheduled.getHours()).padStart(2, '0')}:${String(scheduled.getMinutes()).padStart(2, '0')}`
    : '09:00';

  return {
    id: record.id,
    userId: record.user_id,
    title: record.title,
    description: record.description || '',
    type: record.reminder_type || 'custom',
    frequency: 'daily',
    time,
    active: !record.is_completed,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
};

const parseBookingNotes = (notesValue) => {
  if (!notesValue) return {};
  try {
    return JSON.parse(notesValue);
  } catch (_) {
    return { notes: notesValue };
  }
};

const buildBookingNotes = (payload) => JSON.stringify({
  hospitalId: payload.hospitalId || null,
  department: payload.department || '',
  patientName: payload.patientName || '',
  phone: payload.phone || '',
  notes: payload.notes || ''
});

const mapBookingRecord = (record) => {
  const details = parseBookingNotes(record.notes);
  return {
    id: record.id,
    userId: record.user_id,
    hospitalId: details.hospitalId || null,
    hospitalName: record.hospital_name || '',
    department: record.doctor_name || details.department || '',
    date: record.appointment_date,
    time: record.appointment_time ? String(record.appointment_time).slice(0, 5) : '',
    patientName: details.patientName || '',
    phone: details.phone || '',
    notes: details.notes || '',
    status: record.status || 'pending',
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
};

const parseWellnessDescription = (descriptionValue) => {
  if (!descriptionValue) {
    return { description: '', goals: [], progress: 0 };
  }

  try {
    const parsed = JSON.parse(descriptionValue);
    if (parsed && typeof parsed === 'object') {
      return {
        description: parsed.description || '',
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        progress: Number(parsed.progress || 0)
      };
    }
  } catch (_) {
    return { description: descriptionValue, goals: [], progress: 0 };
  }

  return { description: String(descriptionValue), goals: [], progress: 0 };
};

const buildWellnessDescription = (payload) => JSON.stringify({
  description: payload.description || '',
  goals: Array.isArray(payload.goals) ? payload.goals : [],
  progress: Number(payload.progress || 0)
});

const mapWellnessPlan = (record) => {
  const parsed = parseWellnessDescription(record.description);
  return {
    id: record.id,
    userId: record.user_id,
    title: record.title,
    description: parsed.description,
    goals: parsed.goals,
    progress: parsed.progress,
    active: record.status === 'active',
    startDate: record.start_date,
    targetDate: record.end_date,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
};

const mapCommunityPost = (record) => ({
  id: record.id,
  userId: record.user_id,
  username: record.username,
  content: record.content,
  category: record.category || '',
  likes: record.likes || 0,
  comments: record.comments || 0,
  shares: record.shares || 0,
  isLiked: !!record.is_liked,
  isMine: true,
  createdAt: record.created_at,
  updatedAt: record.updated_at
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
      .order('activity_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (activitiesError) {
      throw activitiesError;
    }

    res.json((activities || []).map(mapActivityRecord));
  } catch (error) {
    console.error('取得活動錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 添加活動
app.post('/api/activities', async (req, res) => {
  try {
    const {
      user_id,
      userId,
      activity_type,
      type,
      name,
      duration,
      calories,
      date,
      notes
    } = req.body;

    const normalizedUserId = user_id || userId;
    const normalizedType = activity_type || type;

    if (!normalizedUserId || !normalizedType || !duration) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const activityDate = date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const activityNotes = buildActivityNotes(name, notes);

    const { data: newActivity, error: insertError } = await supabase
      .from('activities')
      .insert({
        user_id: normalizedUserId,
        activity_type: normalizedType,
        duration,
        calories: calories || 0,
        activity_date: activityDate,
        notes: activityNotes
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({
      message: '活動已添加',
      activity: mapActivityRecord(newActivity)
    });
  } catch (error) {
    console.error('添加活動錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 更新活動
app.put('/api/activities/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    const { userId, name, type, duration, calories, date, notes } = req.body;

    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (type) updateData.activity_type = type;
    if (duration !== undefined) updateData.duration = duration;
    if (calories !== undefined) updateData.calories = calories;
    if (date) updateData.activity_date = new Date(date).toISOString().slice(0, 10);
    if (name !== undefined || notes !== undefined) {
      updateData.notes = buildActivityNotes(name, notes);
    }

    const { data: updatedActivity, error: updateError } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', activityId)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!updatedActivity) {
      return res.status(404).json({ message: '活動不存在' });
    }

    res.json({
      message: '活動已更新',
      activity: mapActivityRecord(updatedActivity)
    });
  } catch (error) {
    console.error('更新活動錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 刪除活動
app.delete('/api/activities/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data: deletedActivity, error: deleteError } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (deleteError) {
      throw deleteError;
    }

    if (!deletedActivity) {
      return res.status(404).json({ message: '活動不存在' });
    }

    res.json({ message: '活動已刪除' });
  } catch (error) {
    console.error('刪除活動錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 飲食相關 API ============

app.get('/api/diet/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('diet_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapDietLog));
  } catch (error) {
    console.error('取得飲食紀錄錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/api/diet', async (req, res) => {
  try {
    const { userId, mealType, name, calories, protein, carbs, fat, notes, date } = req.body;
    if (!userId || !name) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const { data, error } = await supabase
      .from('diet_logs')
      .insert({
        user_id: userId,
        meal_type: mealType || null,
        food_item: name,
        calories: calories || 0,
        proteins: protein || 0,
        carbs: carbs || 0,
        fats: fat || 0,
        notes: notes || '',
        log_date: date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ meal: mapDietLog(data) });
  } catch (error) {
    console.error('新增飲食紀錄錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.delete('/api/diet/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data, error } = await supabase
      .from('diet_logs')
      .delete()
      .eq('id', mealId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: '紀錄不存在' });
    res.json({ message: '已刪除' });
  } catch (error) {
    console.error('刪除飲食紀錄錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 心理健康相關 API ============

app.get('/api/mental-health/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('mental_health_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapMentalHealthLog));
  } catch (error) {
    console.error('取得心理健康紀錄錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/api/mental-health', async (req, res) => {
  try {
    const { userId, name, type, duration, mood, notes, date } = req.body;
    if (!userId || !type) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const mergedNotes = notes || name || '';
    const { data, error } = await supabase
      .from('mental_health_logs')
      .insert({
        user_id: userId,
        activity_type: type,
        duration: duration || 0,
        mood_level: mood || null,
        notes: mergedNotes,
        log_date: date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ practice: mapMentalHealthLog(data) });
  } catch (error) {
    console.error('新增心理健康紀錄錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.delete('/api/mental-health/:practiceId', async (req, res) => {
  try {
    const { practiceId } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data, error } = await supabase
      .from('mental_health_logs')
      .delete()
      .eq('id', practiceId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: '紀錄不存在' });
    res.json({ message: '已刪除' });
  } catch (error) {
    console.error('刪除心理健康紀錄錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 提醒相關 API ============

app.get('/api/reminders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapReminder));
  } catch (error) {
    console.error('取得提醒錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/api/reminders', async (req, res) => {
  try {
    const { userId, title, description, type, time, active } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const scheduledTime = `${today}T${time || '09:00'}:00`;

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: userId,
        title,
        description: description || '',
        reminder_type: type || 'custom',
        scheduled_time: scheduledTime,
        is_completed: active === false
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ reminder: mapReminder(data) });
  } catch (error) {
    console.error('新增提醒錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.put('/api/reminders/:reminderId/toggle', async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data: existing, error: findError } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', reminderId)
      .eq('user_id', userId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return res.status(404).json({ message: '提醒不存在' });

    const { data, error } = await supabase
      .from('reminders')
      .update({
        is_completed: !existing.is_completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', reminderId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ reminder: mapReminder(data) });
  } catch (error) {
    console.error('切換提醒狀態錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.delete('/api/reminders/:reminderId', async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data, error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: '提醒不存在' });
    res.json({ message: '已刪除' });
  } catch (error) {
    console.error('刪除提醒錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 預約相關 API ============

app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapBookingRecord));
  } catch (error) {
    console.error('取得預約錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, hospitalName, hospitalId, department, date, time, patientName, phone, notes } = req.body;
    if (!userId || !hospitalName || !date || !time) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        hospital_name: hospitalName,
        doctor_name: department || '',
        appointment_date: date,
        appointment_time: time,
        status: 'confirmed',
        notes: buildBookingNotes({ hospitalId, department, patientName, phone, notes })
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ booking: mapBookingRecord(data) });
  } catch (error) {
    console.error('新增預約錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.put('/api/bookings/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: '預約不存在' });
    res.json({ booking: mapBookingRecord(data) });
  } catch (error) {
    console.error('取消預約錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.delete('/api/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: '預約不存在' });
    res.json({ message: '已刪除' });
  } catch (error) {
    console.error('刪除預約錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 健康計畫 API ============

app.get('/api/wellness-plans/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('wellness_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapWellnessPlan));
  } catch (error) {
    console.error('取得健康計畫錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/api/wellness-plans', async (req, res) => {
  try {
    const { userId, title, description, goals, progress, active, startDate, targetDate } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const { data, error } = await supabase
      .from('wellness_plans')
      .insert({
        user_id: userId,
        title,
        description: buildWellnessDescription({ description, goals, progress: progress || 0 }),
        start_date: startDate ? new Date(startDate).toISOString().slice(0, 10) : null,
        end_date: targetDate ? new Date(targetDate).toISOString().slice(0, 10) : null,
        status: active === false ? 'completed' : 'active'
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ plan: mapWellnessPlan(data) });
  } catch (error) {
    console.error('新增健康計畫錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.put('/api/wellness-plans/:planId/status', async (req, res) => {
  try {
    const { planId } = req.params;
    const { userId, active, progress } = req.body;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data: existing, error: findError } = await supabase
      .from('wellness_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', userId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return res.status(404).json({ message: '計畫不存在' });

    const existingDesc = parseWellnessDescription(existing.description);

    const { data, error } = await supabase
      .from('wellness_plans')
      .update({
        status: active ? 'active' : 'completed',
        description: buildWellnessDescription({
          description: existingDesc.description,
          goals: existingDesc.goals,
          progress: progress ?? existingDesc.progress
        }),
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ plan: mapWellnessPlan(data) });
  } catch (error) {
    console.error('更新健康計畫狀態錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.delete('/api/wellness-plans/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data, error } = await supabase
      .from('wellness_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: '計畫不存在' });
    res.json({ message: '已刪除' });
  } catch (error) {
    console.error('刪除健康計畫錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 社群貼文 API ============

app.get('/api/community-posts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map((item) => ({
      ...mapCommunityPost(item),
      isMine: String(item.user_id) === String(userId)
    })));
  } catch (error) {
    console.error('取得社群貼文錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/api/community-posts', async (req, res) => {
  try {
    const { userId, username, content, category } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        username: username || 'User',
        content,
        category: category || null,
        likes: 0,
        comments: 0,
        shares: 0,
        is_liked: false
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ post: mapCommunityPost(data) });
  } catch (error) {
    console.error('新增社群貼文錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.put('/api/community-posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data: existing, error: findError } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return res.status(404).json({ message: '貼文不存在' });

    const nextLiked = !existing.is_liked;
    const nextLikes = Math.max(0, (existing.likes || 0) + (nextLiked ? 1 : -1));

    const { data, error } = await supabase
      .from('community_posts')
      .update({
        is_liked: nextLiked,
        likes: nextLikes,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ post: mapCommunityPost(data) });
  } catch (error) {
    console.error('切換貼文喜歡錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.delete('/api/community-posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: '缺少 userId' });
    }

    const { data, error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: '貼文不存在' });
    res.json({ message: '已刪除' });
  } catch (error) {
    console.error('刪除貼文錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============ 個人檔案 API ============

app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    const { data: history, error: historyError } = await supabase
      .from('weight_history')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });

    if (historyError) throw historyError;

    res.json({
      profile: profile
        ? {
            weight: profile.weight,
            height: profile.height,
            age: profile.age,
            gender: profile.gender || '',
            targetWeight: profile.target_weight,
            targetDate: profile.target_date,
            goal: profile.goal || '',
            dailyCalorieGoal: profile.daily_calorie_goal || 2000,
            bmi: null
          }
        : null,
      weightHistory: (history || []).map((item) => ({
        id: item.id,
        weight: item.weight,
        date: item.recorded_at
      }))
    });
  } catch (error) {
    console.error('取得個人檔案錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.put('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { weight, height, age, gender, targetWeight, targetDate, goal, dailyCalorieGoal } = req.body;

    const payload = {
      user_id: userId,
      weight: weight || null,
      height: height || null,
      age: age || null,
      gender: gender || '',
      target_weight: targetWeight || null,
      target_date: targetDate ? new Date(targetDate).toISOString().slice(0, 10) : null,
      goal: goal || '',
      daily_calorie_goal: dailyCalorieGoal || 2000,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      profile: {
        weight: data.weight,
        height: data.height,
        age: data.age,
        gender: data.gender,
        targetWeight: data.target_weight,
        targetDate: data.target_date,
        goal: data.goal,
        dailyCalorieGoal: data.daily_calorie_goal,
        bmi: null
      }
    });
  } catch (error) {
    console.error('更新個人檔案錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/api/profile/:userId/weight-history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { weight } = req.body;
    if (!weight) {
      return res.status(400).json({ message: '缺少體重數值' });
    }

    const { data, error } = await supabase
      .from('weight_history')
      .insert({
        user_id: userId,
        weight,
        recorded_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({
      entry: {
        id: data.id,
        weight: data.weight,
        date: data.recorded_at
      }
    });
  } catch (error) {
    console.error('新增體重紀錄錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.delete('/api/profile/:userId/weight-history/:entryId', async (req, res) => {
  try {
    const { userId, entryId } = req.params;
    const { data, error } = await supabase
      .from('weight_history')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: '紀錄不存在' });
    res.json({ message: '已刪除' });
  } catch (error) {
    console.error('刪除體重紀錄錯誤:', error);
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
