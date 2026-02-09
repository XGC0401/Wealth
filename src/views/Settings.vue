<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>設定</h1>
      <p>管理您的帳戶設定</p>
    </div>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24"><User /></el-icon>
          <span>個人資料</span>
        </div>
      </template>

      <div class="settings-content">
        <!-- Profile Picture -->
        <div class="setting-item">
          <div class="setting-label">個人頭像</div>
          <div class="profile-picture-section">
            <el-avatar :size="100" :src="profilePicture">
              <el-icon :size="50"><User /></el-icon>
            </el-avatar>
            <div class="picture-actions">
              <el-upload
                :show-file-list="false"
                :before-upload="beforeUpload"
                :http-request="handleUpload"
                accept="image/*"
              >
                <el-button type="primary" :icon="Upload">上傳頭像</el-button>
              </el-upload>
              <el-button v-if="profilePicture" type="danger" :icon="Delete" @click="removeProfilePicture">
                移除頭像
              </el-button>
            </div>
          </div>
        </div>

        <el-divider />

        <!-- User Information Form -->
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          label-position="left"
        >
          <el-form-item label="登入名稱" prop="username">
            <el-input v-model="formData.username" placeholder="請輸入登入名稱" />
          </el-form-item>

          <el-form-item label="顯示名稱" prop="name">
            <el-input v-model="formData.name" placeholder="請輸入顯示名稱" />
          </el-form-item>

          <el-form-item label="電子郵件" prop="email">
            <el-input v-model="formData.email" type="email" placeholder="請輸入電子郵件" />
          </el-form-item>

          <el-divider />

          <h3 class="section-title">變更密碼</h3>
          <p class="section-description">如果您不想變更密碼，請留空</p>

          <el-form-item label="當前密碼" prop="currentPassword">
            <el-input
              v-model="formData.currentPassword"
              type="password"
              placeholder="請輸入當前密碼"
              show-password
            />
          </el-form-item>

          <el-form-item label="新密碼" prop="newPassword">
            <el-input
              v-model="formData.newPassword"
              type="password"
              placeholder="請輸入新密碼（至少6個字元）"
              show-password
            />
          </el-form-item>

          <el-form-item label="確認新密碼" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="請再次輸入新密碼"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleSave">
              儲存變更
            </el-button>
            <el-button @click="handleReset">
              重設
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const profilePicture = ref(null)

const formData = reactive({
  username: '',
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value && value !== formData.newPassword) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '請輸入登入名稱', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '請輸入顯示名稱', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件地址', trigger: ['blur', 'change'] }
  ],
  newPassword: [
    { min: 6, message: '密碼長度至少 6 個字元', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const loadUserData = () => {
  const user = userStore.currentUser
  if (user) {
    formData.username = user.username || ''
    formData.name = user.name || ''
    formData.email = user.email || ''
    profilePicture.value = user.profilePicture || null
  }
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上傳圖片檔案！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('圖片大小不能超過 2MB！')
    return false
  }
  return true
}

const handleUpload = (options) => {
  const file = options.file
  const reader = new FileReader()
  
  reader.onload = (e) => {
    profilePicture.value = e.target.result
    ElMessage.success('頭像已更新')
  }
  
  reader.readAsDataURL(file)
}

const removeProfilePicture = () => {
  profilePicture.value = null
  ElMessage.success('頭像已移除')
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // Prepare update data
        const updateData = {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          profilePicture: profilePicture.value
        }

        // If changing password
        if (formData.currentPassword && formData.newPassword) {
          updateData.currentPassword = formData.currentPassword
          updateData.newPassword = formData.newPassword
        }

        const result = await userStore.updateProfile(updateData)
        
        if (result.success) {
          ElMessage.success('設定已儲存')
          // Clear password fields
          formData.currentPassword = ''
          formData.newPassword = ''
          formData.confirmPassword = ''
        } else {
          ElMessage.error(result.message || '儲存失敗')
        }
      } catch (error) {
        console.error('Settings update error:', error)
        const errorMsg = error.response?.data?.message || error.message || '儲存時發生錯誤'
        ElMessage.error(errorMsg)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleReset = () => {
  loadUserData()
  formData.currentPassword = ''
  formData.newPassword = ''
  formData.confirmPassword = ''
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.settings-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #909399;
  margin: 0;
}

.settings-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.settings-content {
  padding: 20px;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.profile-picture-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.picture-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 20px 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: #909399;
  margin: 0 0 16px 0;
}

.el-form {
  max-width: 600px;
}

@media (max-width: 768px) {
  .settings-content {
    padding: 10px;
  }

  .profile-picture-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .el-form {
    max-width: 100%;
  }

  :deep(.el-form-item__label) {
    width: 100% !important;
    text-align: left;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style>
