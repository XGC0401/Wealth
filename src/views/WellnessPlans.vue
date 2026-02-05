<template>
  <div class="wellness-plans-page">
    <div class="page-header">
      <h1>健康計畫</h1>
      <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
        創建計畫
      </el-button>
    </div>

    <!-- Plans Grid -->
    <el-row :gutter="20">
      <el-col
        v-for="plan in plans"
        :key="plan.id"
        :xs="24"
        :md="12"
      >
        <el-card class="plan-card">
          <template #header>
            <div class="plan-header">
              <div>
                <h3>{{ plan.title }}</h3>
                <el-tag :type="plan.active ? 'success' : 'info'" size="small">
                  {{ plan.active ? '進行中' : '已完成' }}
                </el-tag>
              </div>
              <el-dropdown>
                <el-icon class="more-icon"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="togglePlanStatus(plan.id)">
                      {{ plan.active ? '標記為完成' : '重新啟動' }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="deletePlan(plan.id)" divided>
                      刪除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>

          <div class="plan-content">
            <p class="plan-description">{{ plan.description }}</p>
            
            <div class="plan-details">
              <div class="detail-item">
                <el-icon><Calendar /></el-icon>
                <span>開始日期：{{ formatDate(plan.startDate) }}</span>
              </div>
              <div class="detail-item">
                <el-icon><Flag /></el-icon>
                <span>目標日期：{{ formatDate(plan.targetDate) }}</span>
              </div>
            </div>

            <div class="plan-goals">
              <h4>每週目標：</h4>
              <ul>
                <li v-for="(goal, index) in plan.goals" :key="index">
                  {{ goal }}
                </li>
              </ul>
            </div>

            <div class="plan-progress">
              <div class="progress-header">
                <span>完成度</span>
              </div>
              <el-progress :percentage="plan.progress" :color="getProgressColor(plan.progress)" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-if="plans.length === 0"
      description="還沒有創建任何健康計畫"
      :image-size="200"
    />

    <!-- Create Plan Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      title="創建健康計畫"
      width="600px"
    >
      <el-form
        ref="planFormRef"
        :model="planForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="計畫標題" prop="title">
          <el-input v-model="planForm.title" placeholder="例如：30天健身挑戰" />
        </el-form-item>

        <el-form-item label="計畫描述" prop="description">
          <el-input
            v-model="planForm.description"
            type="textarea"
            :rows="3"
            placeholder="描述您的健康計畫..."
          />
        </el-form-item>

        <el-form-item label="開始日期" prop="startDate">
          <el-date-picker
            v-model="planForm.startDate"
            type="date"
            placeholder="選擇開始日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="目標日期" prop="targetDate">
          <el-date-picker
            v-model="planForm.targetDate"
            type="date"
            placeholder="選擇目標日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="每週目標">
          <div class="goals-input">
            <el-input
              v-for="(goal, index) in planForm.goals"
              :key="index"
              v-model="planForm.goals[index]"
              placeholder="輸入目標"
              class="goal-input"
            >
              <template #append>
                <el-button
                  :icon="Delete"
                  @click="removeGoal(index)"
                  v-if="planForm.goals.length > 1"
                />
              </template>
            </el-input>
            <el-button :icon="Plus" @click="addGoal" class="add-goal-btn">
              新增目標
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreatePlan">
          創建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Calendar, Flag, MoreFilled } from '@element-plus/icons-vue'

const showCreateDialog = ref(false)
const planFormRef = ref(null)

const plans = ref(JSON.parse(localStorage.getItem('wellnessPlans') || '[]'))

const planForm = reactive({
  title: '',
  description: '',
  startDate: new Date(),
  targetDate: null,
  goals: ['']
})

const rules = {
  title: [{ required: true, message: '請輸入計畫標題', trigger: 'blur' }],
  description: [{ required: true, message: '請輸入計畫描述', trigger: 'blur' }],
  startDate: [{ required: true, message: '請選擇開始日期', trigger: 'change' }],
  targetDate: [{ required: true, message: '請選擇目標日期', trigger: 'change' }]
}

const addGoal = () => {
  planForm.goals.push('')
}

const removeGoal = (index) => {
  planForm.goals.splice(index, 1)
}

const handleCreatePlan = async () => {
  if (!planFormRef.value) return
  
  await planFormRef.value.validate((valid) => {
    if (valid) {
      const newPlan = {
        id: Date.now(),
        ...planForm,
        goals: planForm.goals.filter(g => g.trim() !== ''),
        active: true,
        progress: 0,
        createdAt: new Date().toISOString()
      }
      
      plans.value.unshift(newPlan)
      savePlans()
      ElMessage.success('健康計畫已創建')
      showCreateDialog.value = false
      resetForm()
    }
  })
}

const togglePlanStatus = (id) => {
  const plan = plans.value.find(p => p.id === id)
  if (plan) {
    plan.active = !plan.active
    if (!plan.active) {
      plan.progress = 100
    } else {
      plan.progress = 0
    }
    savePlans()
    ElMessage.success(plan.active ? '計畫已重新啟動' : '計畫已標記為完成')
  }
}

const deletePlan = async (id) => {
  try {
    await ElMessageBox.confirm('確定要刪除這個健康計畫嗎？', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    plans.value = plans.value.filter(p => p.id !== id)
    savePlans()
    ElMessage.success('已刪除')
  } catch {
    // User cancelled
  }
}

const savePlans = () => {
  localStorage.setItem('wellnessPlans', JSON.stringify(plans.value))
}

const resetForm = () => {
  Object.assign(planForm, {
    title: '',
    description: '',
    startDate: new Date(),
    targetDate: null,
    goals: ['']
  })
  planFormRef.value?.resetFields()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-TW')
}

const getProgressColor = (progress) => {
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
}
</script>

<style scoped>
.wellness-plans-page {
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

.plan-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.plan-header h3 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 8px;
}

.more-icon {
  cursor: pointer;
  font-size: 20px;
  color: #909399;
}

.more-icon:hover {
  color: #606266;
}

.plan-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.plan-description {
  color: #606266;
  line-height: 1.6;
}

.plan-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.plan-goals h4 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.plan-goals ul {
  padding-left: 20px;
  color: #606266;
}

.plan-goals li {
  margin-bottom: 5px;
}

.plan-progress {
  margin-top: 10px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.goals-input {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.goal-input {
  width: 100%;
}

.add-goal-btn {
  width: 100%;
}
</style>
