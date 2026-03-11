<template>
  <div class="mental-health-page">
    <div class="page-header">
      <h1>{{ $t('mentalHealth.title') }}</h1>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
        {{ $t('mentalHealth.addPractice') }}
      </el-button>
    </div>

    <!-- Practice List -->
    <el-row :gutter="20">
      <el-col
        v-for="practice in mentalHealthStore.practices"
        :key="practice.id"
        :xs="24"
        :sm="12"
        :md="8"
      >
        <el-card class="practice-card" shadow="hover">
          <div class="practice-header">
            <el-icon :size="30" :color="getPracticeColor(practice.type)">
              <component :is="getPracticeIcon(practice.type)" />
            </el-icon>
            <el-tag :type="getPracticeTagType(practice.type)">
              {{ $t('mentalHealth.type' + capitalize(practice.type)) }}
            </el-tag>
          </div>
          <h3 class="practice-name">{{ practice.name }}</h3>
          <div class="practice-info">
            <div class="info-item">
              <el-icon><Clock /></el-icon>
              <span>{{ practice.duration }} {{ $t('common.minutes') }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(practice.date) }}</span>
            </div>
          </div>
          <div v-if="practice.mood" class="practice-mood">
            <span>{{ $t('mentalHealth.mood') }}</span>
            <el-rate v-model="practice.mood" disabled show-score />
          </div>
          <p v-if="practice.notes" class="practice-notes">{{ practice.notes }}</p>
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            @click="handleDelete(practice.id)"
            class="delete-btn"
          >
            {{ $t('common.delete') }}
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-if="mentalHealthStore.practices.length === 0"
      :description="$t('mentalHealth.noPractices')"
      :image-size="200"
    />

    <!-- Add Practice Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="$t('mentalHealth.addDialogTitle')"
      width="500px"
    >
      <el-form
        ref="practiceFormRef"
        :model="practiceForm"
        :rules="rules"
        label-position="top"
        class="mental-health-form"
      >
        <el-form-item :label="$t('mentalHealth.practiceName')" prop="name">
          <el-input v-model="practiceForm.name" :placeholder="$t('mentalHealth.namePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('mentalHealth.practiceType')" prop="type">
          <el-select v-model="practiceForm.type" :placeholder="$t('mentalHealth.typePlaceholder')" style="width: 100%">
            <el-option :label="$t('mentalHealth.typeMeditation')" value="meditation" />
            <el-option :label="$t('mentalHealth.typeBreathing')" value="breathing" />
            <el-option :label="$t('mentalHealth.typeMindfulness')" value="mindfulness" />
            <el-option :label="$t('mentalHealth.typeGratitude')" value="gratitude" />
            <el-option :label="$t('mentalHealth.typeRelaxation')" value="relaxation" />
            <el-option :label="$t('activities.typeOther')" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('activities.duration')" prop="duration">
          <el-input-number
            v-model="practiceForm.duration"
            :min="1"
            :max="180"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('mentalHealth.moodRating')">
          <el-rate v-model="practiceForm.mood" show-score />
        </el-form-item>

        <el-form-item :label="$t('common.notes')">
          <el-input
            v-model="practiceForm.notes"
            type="textarea"
            :rows="4"
            :placeholder="$t('mentalHealth.notesPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleAddPractice">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMentalHealthStore } from '@/stores/mentalHealth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Clock, Calendar, Sunny, Promotion, MagicStick } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const mentalHealthStore = useMentalHealthStore()
const showAddDialog = ref(false)
const practiceFormRef = ref(null)

const practiceForm = reactive({
  name: '',
  type: '',
  duration: 10,
  mood: 3,
  notes: ''
})

const rules = {
  name: [{ required: true, message: t('mentalHealth.nameRequired'), trigger: 'blur' }],
  type: [{ required: true, message: t('mentalHealth.typeRequired'), trigger: 'change' }],
  duration: [{ required: true, message: t('mentalHealth.durationRequired'), trigger: 'blur' }]
}

const getPracticeIcon = (type) => {
  const icons = {
    meditation: Sunny,
    breathing: Promotion,
    mindfulness: MagicStick,
    gratitude: Calendar,
    relaxation: Sunny
  }
  return icons[type] || Sunny
}

const getPracticeColor = (type) => {
  const colors = {
    meditation: '#409eff',
    breathing: '#67c23a',
    mindfulness: '#e6a23c',
    gratitude: '#f56c6c',
    relaxation: '#909399'
  }
  return colors[type] || '#409eff'
}

const getPracticeTagType = (type) => {
  const types = {
    meditation: '',
    breathing: 'success',
    mindfulness: 'warning',
    gratitude: 'danger',
    relaxation: 'info'
  }
  return types[type] || ''
}

const handleAddPractice = async () => {
  if (!practiceFormRef.value) return
  
  await practiceFormRef.value.validate((valid) => {
    if (valid) {
      mentalHealthStore.addPractice({ ...practiceForm })
      ElMessage.success(t('mentalHealth.addSuccess'))
      showAddDialog.value = false
      resetForm()
    }
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('mentalHealth.deleteConfirm'),
      t('mentalHealth.deleteTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    mentalHealthStore.deletePractice(id)
    ElMessage.success(t('mentalHealth.deleteSuccess'))
  } catch {
    // User cancelled
  }
}

const resetForm = () => {
  Object.assign(practiceForm, {
    name: '',
    type: '',
    duration: 10,
    mood: 3,
    notes: ''
  })
  practiceFormRef.value?.resetFields()
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return t('common.today')
  if (days === 1) return t('common.yesterday')
  return d.toLocaleDateString(locale.value)
}
</script>

<style scoped>
.mental-health-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 28px;
  color: #303133;
}

.practice-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.practice-card:hover {
  transform: translateY(-5px);
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.practice-name {
  font-size: 18px;
  color: #303133;
  margin-bottom: 12px;
}

.practice-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.practice-mood {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.practice-notes {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
  white-space: pre-wrap;
}

.mental-health-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.delete-btn {
  width: 100%;
}
</style>
