// 測試 Supabase 連接
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 開始測試 Supabase 連接...');
console.log('配置信息:');
console.log('  URL:', process.env.SUPABASE_URL);
console.log('');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 缺少 Supabase 連線配置，請檢查 .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

console.log('⏳ 嘗試連接...');

// 設置超時
const timeout = setTimeout(() => {
  console.error('❌ 連接超時 (15秒未響應)');
  process.exit(1);
}, 16000);

const run = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  clearTimeout(timeout);

  if (error) {
    console.error('❌ 查詢失敗:');
    console.error('  錯誤信息:', error.message);
    console.error('');
    process.exit(1);
  }

  console.log('✅ 連接成功！');
  console.log('   users 表可讀取，行數:', Array.isArray(data) ? data.length : 0);
  process.exit(0);
};

run();
