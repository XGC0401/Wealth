<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <el-icon :size="50" color="#409eff"><TrophyBase /></el-icon>
          <h1>Wealth</h1>
          <p>健康與健身追蹤器</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="登入名稱"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密碼"
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
              class="login-button"
              native-type="submit"
            >
              登入
            </el-button>
          </el-form-item>

          <div class="login-footer">
            <span>還沒有帳號？</span>
            <router-link to="/register" class="register-link">立即註冊</router-link>
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
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '請輸入登入名稱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少 6 個字元', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userStore.login(loginForm)
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
          
          ElMessage.success('登入成功！')
          router.push('/')
        } else {
          ElMessage.error(result.message || '登入失敗')
        }
      } catch (error) {
        ElMessage.error('登入時發生錯誤')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  margin: 15px 0 5px;
  font-size: 32px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-top: 30px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

.register-link {
  color: #409eff;
  text-decoration: none;
  margin-left: 5px;
  font-weight: 500;
}

.register-link:hover {
  color: #66b1ff;
}
</style>
