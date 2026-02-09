<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <el-icon :size="50" color="#409eff"><TrophyBase /></el-icon>
          <h1>Wealth</h1>
          <p>註冊新帳號</p>
        </div>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="rules"
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="登入名稱"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="name">
            <el-input
              v-model="registerForm.name"
              placeholder="顯示名稱"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="電子郵件"
              size="large"
              :prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密碼"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="確認密碼"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="register-button"
              native-type="submit"
            >
              註冊
            </el-button>
          </el-form-item>

          <div class="register-footer">
            <span>已有帳號？</span>
            <router-link to="/login" class="login-link">立即登入</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '請輸入登入名稱', trigger: 'blur' },
    { min: 3, message: '登入名稱至少 3 個字元', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '請輸入顯示名稱', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的電子郵件格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少 6 個字元', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請確認密碼', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userStore.register(registerForm)
        if (result.success) {
          // Clear all stores first to ensure clean state
          const { useActivitiesStore } = await import('@/stores/activities')
          const { useDietStore } = await import('@/stores/diet')
          const { useMentalHealthStore } = await import('@/stores/mentalHealth')
          const { useRemindersStore } = await import('@/stores/reminders')
          const { useProfileStore } = await import('@/stores/profile')
          
          const activitiesStore = useActivitiesStore()
          const dietStore = useDietStore()
          const mentalHealthStore = useMentalHealthStore()
          const remindersStore = useRemindersStore()
          const profileStore = useProfileStore()
          
          // Reset all stores
          activitiesStore.$reset()
          dietStore.$reset()
          mentalHealthStore.$reset()
          remindersStore.$reset()
          profileStore.$reset()
          
          // Load new user data
          activitiesStore.loadActivities()
          dietStore.loadMeals()
          mentalHealthStore.loadPractices()
          remindersStore.loadReminders()
          profileStore.loadProfile()
          
          ElMessage.success('註冊成功！')
          router.push('/')
        } else {
          ElMessage.error(result.message || '註冊失敗')
        }
      } catch (error) {
        ElMessage.error('註冊時發生錯誤')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 420px;
}

.register-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  margin: 15px 0 5px;
  font-size: 32px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.register-header p {
  color: #909399;
  font-size: 14px;
}

.register-form {
  margin-top: 30px;
}

.register-button {
  width: 100%;
  margin-top: 10px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

.login-link {
  color: #409eff;
  text-decoration: none;
  margin-left: 5px;
  font-weight: 500;
}

.login-link:hover {
  color: #66b1ff;
}
</style>
