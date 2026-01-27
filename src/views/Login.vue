<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h1>💚 Wealth</h1>
          <p>Health and Wellness Tracker</p>
        </div>
      </template>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-position="top">
        <el-form-item label="Email" prop="email">
          <el-input v-model="loginForm.email" placeholder="Enter your email" prefix-icon="User" />
        </el-form-item>
        
        <el-form-item label="Password" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="Enter your password"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%;" :loading="loading">
            Login
          </el-button>
        </el-form-item>
        
        <div class="footer-links">
          <span>Don't have an account?</span>
          <el-link type="primary" @click="goToRegister">Register here</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: 'Please input email', trigger: 'blur' },
    { type: 'email', message: 'Please input valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        authStore.login({
          email: loginForm.email,
          name: loginForm.email.split('@')[0]
        })
        ElMessage.success('Login successful!')
        router.push('/dashboard')
        loading.value = false
      }, 500)
    }
  })
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
}

.card-header h1 {
  margin: 0;
  font-size: 36px;
  color: #667eea;
}

.card-header p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

.footer-links {
  text-align: center;
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 5px;
  font-size: 14px;
}
</style>
