<template>
  <Layout>
    <div class="wellness-plan-page">
      <h1 class="page-title">Wellness Plans & Reminders</h1>
      
      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <el-card style="margin-bottom: 20px;">
            <template #header>
              <span>Create Wellness Plan</span>
            </template>
            
            <el-form :model="planForm" ref="planFormRef" label-position="top">
              <el-form-item label="Plan Title" prop="title">
                <el-input v-model="planForm.title" placeholder="e.g., 30-Day Fitness Challenge" />
              </el-form-item>
              
              <el-form-item label="Goal" prop="goal">
                <el-input v-model="planForm.goal" type="textarea" :rows="3" placeholder="What do you want to achieve?" />
              </el-form-item>
              
              <el-form-item label="Duration (days)" prop="duration">
                <el-input-number v-model="planForm.duration" :min="1" :max="365" style="width: 100%;" />
              </el-form-item>
              
              <el-button type="primary" @click="handleCreatePlan">
                <el-icon><Plus /></el-icon> Create Plan
              </el-button>
            </el-form>
          </el-card>
          
          <el-card>
            <template #header>
              <span>My Wellness Plans</span>
            </template>
            
            <div v-if="dataStore.wellnessPlans.length > 0">
              <div v-for="plan in dataStore.wellnessPlans" :key="plan.id" class="plan-item">
                <div class="plan-header">
                  <strong>{{ plan.title }}</strong>
                  <el-tag :type="plan.completed ? 'success' : 'info'">
                    {{ plan.completed ? 'Completed' : 'Active' }}
                  </el-tag>
                </div>
                <p class="plan-goal">{{ plan.goal }}</p>
                <div class="plan-meta">
                  <span>Duration: {{ plan.duration }} days</span>
                  <el-button 
                    v-if="!plan.completed" 
                    type="success" 
                    size="small" 
                    @click="markPlanComplete(plan.id)"
                  >
                    Mark Complete
                  </el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="No wellness plans yet" />
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="12">
          <el-card style="margin-bottom: 20px;">
            <template #header>
              <span>Add Reminder</span>
            </template>
            
            <el-form :model="reminderForm" ref="reminderFormRef" label-position="top">
              <el-form-item label="Reminder Title" prop="title">
                <el-select v-model="reminderForm.title" placeholder="Select or type" style="width: 100%;" allow-create filterable>
                  <el-option label="Drink Water" value="Drink Water" />
                  <el-option label="Exercise" value="Exercise" />
                  <el-option label="Take Medication" value="Take Medication" />
                  <el-option label="Meditation" value="Meditation" />
                  <el-option label="Healthy Snack" value="Healthy Snack" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="Time" prop="time">
                <el-time-picker v-model="reminderForm.time" format="HH:mm" style="width: 100%;" />
              </el-form-item>
              
              <el-form-item label="Frequency" prop="frequency">
                <el-select v-model="reminderForm.frequency" placeholder="Select frequency" style="width: 100%;">
                  <el-option label="Daily" value="Daily" />
                  <el-option label="Every 2 hours" value="Every 2 hours" />
                  <el-option label="Every 4 hours" value="Every 4 hours" />
                  <el-option label="Weekly" value="Weekly" />
                </el-select>
              </el-form-item>
              
              <el-button type="primary" @click="handleAddReminder">
                <el-icon><Plus /></el-icon> Add Reminder
              </el-button>
            </el-form>
          </el-card>
          
          <el-card>
            <template #header>
              <span>Active Reminders</span>
            </template>
            
            <div v-if="dataStore.reminders.length > 0">
              <div v-for="reminder in dataStore.reminders" :key="reminder.id" class="reminder-item">
                <div class="reminder-content">
                  <div>
                    <strong>{{ reminder.title }}</strong>
                    <div class="reminder-meta">
                      <el-icon><Clock /></el-icon>
                      {{ formatTime(reminder.time) }} • {{ reminder.frequency }}
                    </div>
                  </div>
                  <el-button type="danger" size="small" @click="handleDeleteReminder(reminder.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="No active reminders" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useDataStore } from '../stores/data'
import { ElMessage } from 'element-plus'
import Layout from '../components/Layout.vue'

const dataStore = useDataStore()
const planFormRef = ref(null)
const reminderFormRef = ref(null)

const planForm = reactive({
  title: '',
  goal: '',
  duration: 30
})

const reminderForm = reactive({
  title: '',
  time: '',
  frequency: 'Daily'
})

const handleCreatePlan = () => {
  if (!planForm.title || !planForm.goal) {
    ElMessage.warning('Please fill in title and goal')
    return
  }
  
  dataStore.addWellnessPlan({
    ...planForm,
    completed: false
  })
  ElMessage.success('Wellness plan created successfully!')
  
  // Reset form
  planForm.title = ''
  planForm.goal = ''
  planForm.duration = 30
}

const markPlanComplete = (id) => {
  dataStore.updateWellnessPlan(id, { completed: true })
  ElMessage.success('Plan marked as complete!')
}

const handleAddReminder = () => {
  if (!reminderForm.title || !reminderForm.time) {
    ElMessage.warning('Please fill in title and time')
    return
  }
  
  dataStore.addReminder({
    title: reminderForm.title,
    time: reminderForm.time,
    frequency: reminderForm.frequency
  })
  ElMessage.success('Reminder added successfully!')
  
  // Reset form
  reminderForm.title = ''
  reminderForm.time = ''
  reminderForm.frequency = 'Daily'
}

const handleDeleteReminder = (id) => {
  dataStore.removeReminder(id)
  ElMessage.success('Reminder deleted')
}

const formatTime = (time) => {
  if (!time) return ''
  if (time instanceof Date) {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return time
}
</script>

<style scoped>
.wellness-plan-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
}

.plan-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.plan-goal {
  margin: 10px 0;
  color: #666;
}

.plan-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #999;
}

.reminder-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
}

.reminder-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reminder-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #999;
  margin-top: 5px;
}
</style>
