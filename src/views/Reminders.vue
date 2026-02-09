<template>
  <div class="reminders-page">
    <div class="page-header">
      <h1>{{ $t('reminders.title') }}</h1>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
        {{ $t('reminders.addReminder') }}
      </el-button>
    </div>

    <!-- Reminders List -->
    <el-row :gutter="20">
      <el-col
        v-for="reminder in remindersStore.reminders"
        :key="reminder.id"
        :xs="24"
        :sm="12"
        :md="8"
      >
        <el-card class="reminder-card" :class="{ inactive: !reminder.active }">
          <div class="reminder-header">
            <el-icon :size="30" :color="getReminderColor(reminder.type)">
              <component :is="getReminderIcon(reminder.type)" />
            </el-icon>
            <el-switch
              :model-value="reminder.active"
              @change="handleToggle(reminder.id)"
            />
          </div>

          <h3 class="reminder-title">{{ reminder.title }}</h3>
          <p class="reminder-description">{{ reminder.description }}</p>

          <div class="reminder-details">
            <div class="detail-item">
              <el-icon><Clock /></el-icon>
              <span>{{ reminder.time }}</span>
            </div>
            <div class="detail-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ getReminderFrequency(reminder.frequency) }}</span>
            </div>
          </div>

          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            @click="handleDelete(reminder.id)"
            class="delete-btn"
          >
            {{ $t('common.delete') }}
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-if="remindersStore.reminders.length === 0"
      :description="$t('reminders.noReminders')"
      :image-size="200"
    />

    <!-- Add Reminder Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="$t('reminders.addDialogTitle')"
      width="500px"
    >
      <el-form
        ref="reminderFormRef"
        :model="reminderForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="$t('reminders.reminderTitle')" prop="title">
          <el-input v-model="reminderForm.title" :placeholder="$t('reminders.titlePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('reminders.reminderType')" prop="type">
          <el-select v-model="reminderForm.type" :placeholder="$t('reminders.typePlaceholder')" style="width: 100%">
            <el-option :label="$t('reminders.typeHydration')" value="hydration">
              <el-icon><Coffee /></el-icon>
              <span style="margin-left: 10px">{{ $t('reminders.typeHydration') }}</span>
            </el-option>
            <el-option :label="$t('reminders.typeExercise')" value="exercise">
              <el-icon><Bicycle /></el-icon>
              <span style="margin-left: 10px">{{ $t('reminders.typeExercise') }}</span>
            </el-option>
            <el-option :label="$t('reminders.typeMeal')" value="meal">
              <el-icon><Food /></el-icon>
              <span style="margin-left: 10px">{{ $t('reminders.typeMeal') }}</span>
            </el-option>
            <el-option :label="$t('reminders.typeRest')" value="rest">
              <el-icon><Moon /></el-icon>
              <span style="margin-left: 10px">{{ $t('reminders.typeRest') }}</span>
            </el-option>
            <el-option :label="$t('reminders.typeMeditation')" value="meditation">
              <el-icon><Sunny /></el-icon>
              <span style="margin-left: 10px">{{ $t('reminders.typeMeditation') }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('reminders.reminderTime')" prop="time">
          <el-time-picker
            v-model="reminderForm.time"
            format="HH:mm"
            :placeholder="$t('reminders.selectTime')"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('reminders.frequency')" prop="frequency">
          <el-select v-model="reminderForm.frequency" :placeholder="$t('reminders.frequencyPlaceholder')" style="width: 100%">
            <el-option :label="$t('reminders.daily')" value="daily" />
            <el-option :label="$t('reminders.weekdays')" value="weekdays" />
            <el-option :label="$t('reminders.weekends')" value="weekends" />
            <el-option :label="$t('reminders.custom')" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('reminders.description')">
          <el-input
            v-model="reminderForm.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('reminders.descriptionPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleAddReminder">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRemindersStore } from '@/stores/reminders'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Delete, Clock, Calendar, 
  Coffee, Bicycle, Food, Moon, Sunny 
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const remindersStore = useRemindersStore()
const showAddDialog = ref(false)
const reminderFormRef = ref(null)

const reminderForm = reactive({
  title: '',
  type: '',
  time: null,
  frequency: 'daily',
  description: '',
  active: true
})

const rules = {
  title: [{ required: true, message: t('reminders.titleRequired'), trigger: 'blur' }],
  type: [{ required: true, message: t('reminders.typeRequired'), trigger: 'change' }],
  time: [{ required: true, message: t('reminders.timeRequired'), trigger: 'change' }],
  frequency: [{ required: true, message: t('reminders.frequencyRequired'), trigger: 'change' }]
}

const getReminderIcon = (type) => {
  const icons = {
    hydration: Coffee,
    exercise: Bicycle,
    meal: Food,
    rest: Moon,
    meditation: Sunny
  }
  return icons[type] || Clock
}

const getReminderColor = (type) => {
  const colors = {
    hydration: '#409eff',
    exercise: '#67c23a',
    meal: '#e6a23c',
    rest: '#909399',
    meditation: '#f56c6c'
  }
  return colors[type] || '#409eff'
}

const getReminderFrequency = (frequency) => {
  const frequencies = {
    daily: t('reminders.daily'),
    weekdays: t('reminders.weekdays'),
    weekends: t('reminders.weekends'),
    custom: t('reminders.custom')
  }
  return frequencies[frequency] || frequency
}

const handleAddReminder = async () => {
  if (!reminderFormRef.value) return
  
  await reminderFormRef.value.validate((valid) => {
    if (valid) {
      const time = reminderForm.time
      const timeString = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
      
      remindersStore.addReminder({
        ...reminderForm,
        time: timeString
      })
      
      ElMessage.success(t('reminders.addSuccess'))
      showAddDialog.value = false
      resetForm()
    }
  })
}

const handleToggle = (id) => {
  remindersStore.toggleReminder(id)
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('reminders.deleteConfirm'),
      t('reminders.deleteTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    remindersStore.deleteReminder(id)
    ElMessage.success(t('reminders.deleteSuccess'))
  } catch {
    // User cancelled
  }
}

const resetForm = () => {
  Object.assign(reminderForm, {
    title: '',
    type: '',
    time: null,
    frequency: 'daily',
    description: '',
    active: true
  })
  reminderFormRef.value?.resetFields()
}
</script>

<style scoped>
.reminders-page {
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

.reminder-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.reminder-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.reminder-card.inactive {
  opacity: 0.6;
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.reminder-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 8px;
}

.reminder-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
  min-height: 40px;
}

.reminder-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.delete-btn {
  width: 100%;
}
</style>
