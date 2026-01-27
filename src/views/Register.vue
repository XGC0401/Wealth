<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h1>💚 Wealth</h1>
          <p>Create Your Account</p>
        </div>
      </template>
      
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-position="top">
        <el-form-item label="Full Name" prop="name">
          <el-input v-model="registerForm.name" placeholder="Enter your full name" prefix-icon="User" />
        </el-form-item>
        
        <el-form-item label="Email" prop="email">
          <el-input v-model="registerForm.email" placeholder="Enter your email" prefix-icon="Message" />
        </el-form-item>
        
        <el-form-item label="Password" prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="Enter your password"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="Confirm your password"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleRegister" style="width: 100%;" :loading="loading">
            Register
          </el-button>
        </el-form-item>
        
        <div class="footer-links">
          <span>Already have an account?</span>
          <el-link type="primary" @click="goToLogin">Login here</el-link>
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
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please confirm password'))
  } else if (value !== registerForm.password) {
    callback(new Error('Passwords do not match'))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: 'Please input your name', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please input email', trigger: 'blur' },
    { type: 'email', message: 'Please input valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  await registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        authStore.register({
          name: registerForm.name,
          email: registerForm.email
        })
        ElMessage.success('Registration successful!')
        router.push('/dashboard')
        loading.value = false
      }, 500)
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.register-card {
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
