<template>
  <div class="reminders-page">
    <div class="page-header">
      <h1>提醒設置</h1>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
        新增提醒
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
            刪除
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-if="remindersStore.reminders.length === 0"
      description="還沒有設置任何提醒"
      :image-size="200"
    />

    <!-- Add Reminder Dialog -->
    <el-dialog
      v-model="showAddDialog"
      title="新增提醒"
      width="500px"
    >
      <el-form
        ref="reminderFormRef"
        :model="reminderForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="提醒標題" prop="title">
          <el-input v-model="reminderForm.title" placeholder="例如：喝水提醒" />
        </el-form-item>

        <el-form-item label="提醒類型" prop="type">
          <el-select v-model="reminderForm.type" placeholder="請選擇類型" style="width: 100%">
            <el-option label="喝水" value="hydration">
              <el-icon><Coffee /></el-icon>
              <span style="margin-left: 10px">喝水</span>
            </el-option>
            <el-option label="運動" value="exercise">
              <el-icon><Bicycle /></el-icon>
              <span style="margin-left: 10px">運動</span>
            </el-option>
            <el-option label="飲食" value="meal">
              <el-icon><Food /></el-icon>
              <span style="margin-left: 10px">飲食</span>
            </el-option>
            <el-option label="休息" value="rest">
              <el-icon><Moon /></el-icon>
              <span style="margin-left: 10px">休息</span>
            </el-option>
            <el-option label="冥想" value="meditation">
              <el-icon><Sunny /></el-icon>
              <span style="margin-left: 10px">冥想</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="提醒時間" prop="time">
          <el-time-picker
            v-model="reminderForm.time"
            format="HH:mm"
            placeholder="選擇時間"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="重複頻率" prop="frequency">
          <el-select v-model="reminderForm.frequency" placeholder="請選擇頻率" style="width: 100%">
            <el-option label="每天" value="daily" />
            <el-option label="工作日" value="weekdays" />
            <el-option label="週末" value="weekends" />
            <el-option label="自訂..." value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="reminderForm.description"
            type="textarea"
            :rows="3"
            placeholder="添加提醒描述..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddReminder">
          確定
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
  title: [{ required: true, message: '請輸入提醒標題', trigger: 'blur' }],
  type: [{ required: true, message: '請選擇提醒類型', trigger: 'change' }],
  time: [{ required: true, message: '請選擇提醒時間', trigger: 'change' }],
  frequency: [{ required: true, message: '請選擇重複頻率', trigger: 'change' }]
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
    daily: '每天',
    weekdays: '工作日',
    weekends: '週末',
    custom: '自訂'
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
      
      ElMessage.success('提醒已新增')
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
    await ElMessageBox.confirm('確定要刪除這個提醒嗎？', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    remindersStore.deleteReminder(id)
    ElMessage.success('已刪除')
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
