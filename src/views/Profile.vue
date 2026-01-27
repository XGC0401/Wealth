<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>個人資料與目標</h1>
      <el-button type="primary" :icon="Edit" @click="showEditDialog = true">
        編輯資料
      </el-button>
    </div>

    <!-- Profile Stats -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="35" color="#409eff"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ profileStore.profile.age || '-' }}</div>
              <div class="stat-label">年齡</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="35" color="#67c23a"><TrendCharts /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ profileStore.profile.weight || '-' }}</div>
              <div class="stat-label">體重 (kg)</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="35" color="#e6a23c"><Rank /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ profileStore.profile.height || '-' }}</div>
              <div class="stat-label">身高 (cm)</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="35" color="#f56c6c"><DataAnalysis /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ profileStore.currentBMI || '-' }}</div>
              <div class="stat-label">BMI {{ profileStore.bmiStatus ? `(${profileStore.bmiStatus})` : '' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Goal Section -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="goal-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="24" color="#409eff"><Flag /></el-icon>
              <span>我的目標</span>
            </div>
          </template>

          <div v-if="profileStore.profile.targetWeight" class="goal-content">
            <div class="goal-item">
              <span class="goal-label">目標類型：</span>
              <el-tag type="success">{{ profileStore.profile.goal || '減重' }}</el-tag>
            </div>
            
            <div class="goal-item">
              <span class="goal-label">目標體重：</span>
              <span class="goal-value">{{ profileStore.profile.targetWeight }} kg</span>
            </div>

            <div class="goal-item">
              <span class="goal-label">目標日期：</span>
              <span class="goal-value">{{ formatDate(profileStore.profile.targetDate) }}</span>
            </div>

            <div class="goal-item">
              <span class="goal-label">需減重：</span>
              <span class="goal-value highlight">{{ profileStore.weightToLose }} kg</span>
            </div>

            <div class="goal-item">
              <span class="goal-label">剩餘天數：</span>
              <span class="goal-value">{{ profileStore.daysRemaining }} 天</span>
            </div>

            <div class="goal-item">
              <span class="goal-label">每週目標：</span>
              <span class="goal-value">{{ profileStore.weeklyWeightGoal }} kg/週</span>
            </div>

            <div class="progress-section">
              <div class="progress-header">
                <span>目標進度</span>
                <span>{{ goalProgress }}%</span>
              </div>
              <el-progress :percentage="goalProgress" :color="progressColor" />
            </div>
          </div>

          <el-empty v-else description="尚未設定目標" :image-size="120">
            <el-button type="primary" @click="showEditDialog = true">
              設定目標
            </el-button>
          </el-empty>
        </el-card>
      </el-col>

      <!-- Calendar -->
      <el-col :xs="24" :md="12">
        <el-card class="calendar-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="24" color="#67c23a"><Calendar /></el-icon>
              <span>目標日曆</span>
            </div>
          </template>

          <el-calendar v-model="calendarDate">
            <template #date-cell="{ data }">
              <div class="calendar-day" :class="getDayClass(data.day)">
                <span>{{ data.day.split('-').slice(2).join('-') }}</span>
                <div v-if="isTargetDate(data.day)" class="target-marker">
                  🎯
                </div>
                <div v-if="isToday(data.day)" class="today-marker">
                  📍
                </div>
              </div>
            </template>
          </el-calendar>
        </el-card>
      </el-col>
    </el-row>

    <!-- Weight History -->
    <el-card class="weight-history-card">
      <template #header>
        <div class="card-header">
          <span>體重記錄</span>
          <el-button type="primary" size="small" :icon="Plus" @click="showWeightDialog = true">
            記錄體重
          </el-button>
        </div>
      </template>

      <div v-if="profileStore.weightHistory.length > 0">
        <el-table :data="paginatedWeightHistory" stripe style="width: 100%">
          <el-table-column prop="weight" label="體重 (kg)" width="120">
            <template #default="{ row }">
              {{ row.weight }} kg
            </template>
          </el-table-column>
          <el-table-column label="日期" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.date) }}
            </template>
          </el-table-column>
          <el-table-column label="變化" width="120">
            <template #default="{ row, $index }">
              <el-tag v-if="$index < profileStore.weightHistory.length - 1" 
                :type="getWeightChangeType(row, $index)">
                {{ getWeightChange(row, $index) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="BMI" width="100">
            <template #default="{ row }">
              {{ calculateBMI(row.weight) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="handleDeleteWeight(row.id)"
                link
              >
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="profileStore.weightHistory.length"
            layout="prev, pager, next"
          />
        </div>
      </div>

      <el-empty v-else description="還沒有體重記錄" :image-size="150" />
    </el-card>

    <!-- Edit Profile Dialog -->
    <el-dialog
      v-model="showEditDialog"
      title="編輯個人資料與目標"
      width="600px"
    >
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="120px"
      >
        <el-divider content-position="left">基本資料</el-divider>

        <el-form-item label="年齡" prop="age">
          <el-input-number
            v-model="profileForm.age"
            :min="10"
            :max="120"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="性別" prop="gender">
          <el-radio-group v-model="profileForm.gender">
            <el-radio label="男性">男性</el-radio>
            <el-radio label="女性">女性</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="身高 (cm)" prop="height">
          <el-input-number
            v-model="profileForm.height"
            :min="100"
            :max="250"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="當前體重 (kg)" prop="weight">
          <el-input-number
            v-model="profileForm.weight"
            :min="30"
            :max="300"
            :precision="1"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>

        <el-divider content-position="left">目標設定</el-divider>

        <el-form-item label="目標類型" prop="goal">
          <el-select v-model="profileForm.goal" placeholder="請選擇目標" style="width: 100%">
            <el-option label="減重" value="減重" />
            <el-option label="增重" value="增重" />
            <el-option label="維持體重" value="維持體重" />
            <el-option label="增肌" value="增肌" />
            <el-option label="體態塑形" value="體態塑形" />
          </el-select>
        </el-form-item>

        <el-form-item label="目標體重 (kg)" prop="targetWeight">
          <el-input-number
            v-model="profileForm.targetWeight"
            :min="30"
            :max="300"
            :precision="1"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="目標日期" prop="targetDate">
          <el-date-picker
            v-model="profileForm.targetDate"
            type="date"
            placeholder="選擇目標日期"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>

        <el-form-item label="每日卡路里目標">
          <el-input-number
            v-model="profileForm.dailyCalorieGoal"
            :min="1000"
            :max="5000"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProfile">
          儲存
        </el-button>
      </template>
    </el-dialog>

    <!-- Add Weight Dialog -->
    <el-dialog
      v-model="showWeightDialog"
      title="記錄體重"
      width="400px"
    >
      <el-form
        ref="weightFormRef"
        :model="weightForm"
        :rules="weightRules"
        label-width="100px"
      >
        <el-form-item label="體重 (kg)" prop="weight">
          <el-input-number
            v-model="weightForm.weight"
            :min="30"
            :max="300"
            :precision="1"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showWeightDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddWeight">
          確定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, Plus, Delete, User, Flag, Calendar,
  TrendCharts, Rank, DataAnalysis
} from '@element-plus/icons-vue'

const profileStore = useProfileStore()
const showEditDialog = ref(false)
const showWeightDialog = ref(false)
const profileFormRef = ref(null)
const weightFormRef = ref(null)
const calendarDate = ref(new Date())
const currentPage = ref(1)
const pageSize = ref(10)

const profileForm = reactive({
  age: profileStore.profile.age || null,
  gender: profileStore.profile.gender || '',
  height: profileStore.profile.height || null,
  weight: profileStore.profile.weight || null,
  targetWeight: profileStore.profile.targetWeight || null,
  targetDate: profileStore.profile.targetDate ? new Date(profileStore.profile.targetDate) : null,
  goal: profileStore.profile.goal || '',
  dailyCalorieGoal: profileStore.profile.dailyCalorieGoal || 2000
})

const weightForm = reactive({
  weight: profileStore.profile.weight || null
})

const profileRules = {
  age: [{ required: true, message: '請輸入年齡', trigger: 'blur' }],
  gender: [{ required: true, message: '請選擇性別', trigger: 'change' }],
  height: [{ required: true, message: '請輸入身高', trigger: 'blur' }],
  weight: [{ required: true, message: '請輸入體重', trigger: 'blur' }]
}

const weightRules = {
  weight: [{ required: true, message: '請輸入體重', trigger: 'blur' }]
}

const paginatedWeightHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return profileStore.weightHistory.slice(start, end)
})

const goalProgress = computed(() => {
  if (!profileStore.profile.weight || !profileStore.profile.targetWeight) return 0
  
  const initialWeight = profileStore.weightHistory.length > 0 
    ? profileStore.weightHistory[profileStore.weightHistory.length - 1].weight 
    : profileStore.profile.weight
  
  const totalToLose = Math.abs(initialWeight - profileStore.profile.targetWeight)
  const currentProgress = Math.abs(initialWeight - profileStore.profile.weight)
  
  const progress = (currentProgress / totalToLose) * 100
  return Math.min(Math.round(progress), 100)
})

const progressColor = computed(() => {
  const progress = goalProgress.value
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
})

const disabledDate = (date) => {
  return date < new Date()
}

const isTargetDate = (dateStr) => {
  if (!profileStore.profile.targetDate) return false
  const target = new Date(profileStore.profile.targetDate).toDateString()
  const check = new Date(dateStr).toDateString()
  return target === check
}

const isToday = (dateStr) => {
  const today = new Date().toDateString()
  const check = new Date(dateStr).toDateString()
  return today === check
}

const getDayClass = (dateStr) => {
  const classes = []
  if (isTargetDate(dateStr)) classes.push('target-day')
  if (isToday(dateStr)) classes.push('today')
  return classes.join(' ')
}

const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate((valid) => {
    if (valid) {
      profileStore.updateProfile({
        ...profileForm,
        targetDate: profileForm.targetDate ? profileForm.targetDate.toISOString() : null
      })
      ElMessage.success('資料已儲存')
      showEditDialog.value = false
    }
  })
}

const handleAddWeight = async () => {
  if (!weightFormRef.value) return
  
  await weightFormRef.value.validate((valid) => {
    if (valid) {
      profileStore.addWeightEntry(weightForm.weight)
      ElMessage.success('體重已記錄')
      showWeightDialog.value = false
    }
  })
}

const handleDeleteWeight = async (id) => {
  try {
    await ElMessageBox.confirm('確定要刪除這筆體重記錄嗎？', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    profileStore.deleteWeightEntry(id)
    ElMessage.success('已刪除')
  } catch {
    // User cancelled
  }
}

const calculateBMI = (weight) => {
  if (!profileStore.profile.height || !weight) return '-'
  const heightInMeters = profileStore.profile.height / 100
  return (weight / (heightInMeters * heightInMeters)).toFixed(1)
}

const getWeightChange = (row, index) => {
  if (index >= profileStore.weightHistory.length - 1) return '-'
  const prevWeight = profileStore.weightHistory[index + 1].weight
  const change = (row.weight - prevWeight).toFixed(1)
  return change > 0 ? `+${change} kg` : `${change} kg`
}

const getWeightChangeType = (row, index) => {
  if (index >= profileStore.weightHistory.length - 1) return ''
  const prevWeight = profileStore.weightHistory[index + 1].weight
  const change = row.weight - prevWeight
  
  if (change > 0) return 'danger'
  if (change < 0) return 'success'
  return 'info'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.profile-page {
  max-width: 1400px;
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

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.goal-card, .calendar-card, .weight-history-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.goal-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.goal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
}

.goal-label {
  font-weight: 500;
  color: #606266;
}

.goal-value {
  font-weight: 600;
  color: #303133;
}

.goal-value.highlight {
  color: #409eff;
  font-size: 18px;
}

.progress-section {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 500;
  color: #606266;
}

.calendar-day {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.calendar-day.target-day {
  background: #e1f3d8;
  border-radius: 4px;
}

.calendar-day.today {
  background: #ecf5ff;
  border-radius: 4px;
  font-weight: bold;
}

.target-marker, .today-marker {
  font-size: 16px;
  margin-top: 2px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-calendar-table .el-calendar-day) {
  height: 80px;
}
</style>
