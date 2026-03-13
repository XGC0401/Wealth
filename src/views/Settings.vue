<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>{{ $t('settings.title') }}</h1>
      <p>{{ $t('settings.subtitle') }}</p>
    </div>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24"><User /></el-icon>
          <span>{{ $t('settings.personalInfo') }}</span>
        </div>
      </template>

      <div class="settings-content">
        <!-- Profile Picture -->
        <div class="setting-item">
          <div class="setting-label">{{ $t('settings.profilePicture') }}</div>
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
                <el-button type="primary" :icon="Upload">{{ $t('settings.uploadAvatar') }}</el-button>
              </el-upload>
              <el-button v-if="profilePicture" type="danger" :icon="Delete" @click="removeProfilePicture">
                {{ $t('settings.removeAvatar') }}
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
          label-position="top"
          class="settings-form"
        >
          <el-form-item :label="$t('auth.loginName')" prop="username">
            <el-input v-model="formData.username" :placeholder="$t('auth.loginNamePlaceholder')" />
          </el-form-item>

          <el-form-item :label="$t('auth.displayName')" prop="name">
            <el-input v-model="formData.name" :placeholder="$t('auth.displayNamePlaceholder')" />
          </el-form-item>

          <el-form-item :label="$t('auth.email')" prop="email">
            <el-input v-model="formData.email" type="email" :placeholder="$t('auth.emailPlaceholder')" />
          </el-form-item>

          <el-divider />

          <h3 class="section-title">{{ $t('settings.changePassword') }}</h3>
          <p class="section-description">{{ $t('settings.changePasswordHint') }}</p>

          <el-form-item :label="$t('auth.currentPassword')" prop="currentPassword">
            <el-input
              v-model="formData.currentPassword"
              type="password"
              :placeholder="$t('auth.currentPasswordPlaceholder')"
              show-password
            />
          </el-form-item>

          <el-form-item :label="$t('auth.newPassword')" prop="newPassword">
            <el-input
              v-model="formData.newPassword"
              type="password"
              :placeholder="$t('auth.newPasswordPlaceholder')"
              show-password
            />
          </el-form-item>

          <el-form-item :label="$t('auth.confirmPassword')" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              :placeholder="$t('auth.confirmPasswordPlaceholder')"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleSave">
              {{ $t('settings.saveChanges') }}
            </el-button>
            <el-button @click="handleReset">
              {{ $t('common.reset') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const { t } = useI18n()
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
    callback(new Error(t('auth.passwordMismatch')))
  } else {
    callback()
  }
}

const rules = computed(() => ({
  username: [
    { required: true, message: t('auth.loginNameRequired'), trigger: 'blur' }
  ],
  name: [
    { required: true, message: t('auth.displayNameRequired'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: ['blur', 'change'] }
  ],
  newPassword: [
    { min: 6, message: t('auth.passwordMinLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}))

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
    ElMessage.error(t('settings.avatarUploadError'))
    return false
  }
  if (!isLt2M) {
    ElMessage.error(t('settings.avatarSizeError'))
    return false
  }
  return true
}

const handleUpload = (options) => {
  const file = options.file
  const reader = new FileReader()
  
  reader.onload = (e) => {
    profilePicture.value = e.target.result
    ElMessage.success(t('settings.avatarUpdated'))
  }
  
  reader.readAsDataURL(file)
}

const removeProfilePicture = () => {
  profilePicture.value = null
  ElMessage.success(t('settings.avatarRemoved'))
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
          ElMessage.success(t('settings.updateSuccess'))
          // Clear password fields
          formData.currentPassword = ''
          formData.newPassword = ''
          formData.confirmPassword = ''
        } else {
          ElMessage.error(result.message || t('settings.updateFailed'))
        }
      } catch (error) {
        console.error('Settings update error:', error)
        const errorMsg = error.response?.data?.message || error.message || t('settings.updateError')
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

.settings-form :deep(.el-form-item) {
  margin-bottom: 18px;
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
