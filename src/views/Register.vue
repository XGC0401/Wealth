<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <!-- Language Switcher -->
        <div class="language-switcher">
          <el-switch
            v-model="isEnglish"
            active-text="EN"
            :inactive-text="$t('common.chinese')"
            @change="switchLanguage"
          />
        </div>
        
        <div class="register-header">
          <el-icon :size="50" color="#409eff"><TrophyBase /></el-icon>
          <h1>{{ $t('app.title') }}</h1>
          <p>{{ $t('auth.register') }}</p>
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
              :placeholder="$t('auth.loginNamePlaceholder')"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="name">
            <el-input
              v-model="registerForm.name"
              :placeholder="$t('auth.displayNamePlaceholder')"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              :placeholder="$t('auth.emailPlaceholder')"
              size="large"
              :prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              :placeholder="$t('auth.passwordPlaceholder')"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              :placeholder="$t('auth.confirmPasswordPlaceholder')"
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
              {{ $t('auth.register') }}
            </el-button>
          </el-form-item>

          <div class="register-footer">
            <span>{{ $t('auth.alreadyHaveAccount') }}</span>
            <router-link to="/login" class="login-link">{{ $t('auth.loginNow') }}</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const { t, locale } = useI18n()
const registerFormRef = ref(null)
const loading = ref(false)

// Language switcher
const isEnglish = ref(locale.value === 'en')

const switchLanguage = () => {
  const newLocale = isEnglish.value ? 'en' : 'zh'
  locale.value = newLocale
  localStorage.setItem('language', newLocale)
  
  // Reload page to apply ElementPlus locale
  window.location.reload()
}

const registerForm = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error(t('auth.passwordMismatch')))
  } else {
    callback()
  }
}

const rules = computed(() => ({
  username: [
    { required: true, message: t('auth.loginNameRequired'), trigger: 'blur' },
    { min: 3, message: t('auth.loginNameMinLength'), trigger: 'blur' }
  ],
  name: [
    { required: true, message: t('auth.displayNameRequired'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMinLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}))

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
          
          ElMessage.success(t('auth.registerSuccess'))
          router.push('/')
        } else {
          ElMessage.error(result.message || t('auth.registerError'))
        }
      } catch (error) {
        ElMessage.error(t('auth.registerError'))
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
  position: relative;
}

.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
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
