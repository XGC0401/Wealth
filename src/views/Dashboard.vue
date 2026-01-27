<template>
  <Layout>
    <div class="dashboard">
      <h1 class="page-title">Dashboard</h1>
      
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <el-statistic title="Total Activities" :value="dataStore.activities.length">
              <template #prefix>
                <el-icon style="color: #67C23A;"><CaretRight /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <el-statistic title="Meals Logged" :value="dataStore.meals.length">
              <template #prefix>
                <el-icon style="color: #E6A23C;"><Apple /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <el-statistic title="Mental Health Logs" :value="dataStore.mentalHealthLogs.length">
              <template #prefix>
                <el-icon style="color: #409EFF;"><Sunny /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <el-statistic title="Active Reminders" :value="dataStore.reminders.length">
              <template #prefix>
                <el-icon style="color: #F56C6C;"><Bell /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :xs="24" :md="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>Recent Activities</span>
                <el-button type="primary" size="small" @click="goToActivities">View All</el-button>
              </div>
            </template>
            <div v-if="dataStore.activities.length > 0">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-info">
                  <strong>{{ activity.type }}</strong>
                  <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                </div>
                <div class="activity-details">
                  {{ activity.duration }} min • {{ activity.calories }} cal
                </div>
              </div>
            </div>
            <el-empty v-else description="No activities logged yet" />
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>Active Reminders</span>
                <el-button type="primary" size="small" @click="goToWellnessPlan">Manage</el-button>
              </div>
            </template>
            <div v-if="dataStore.reminders.length > 0">
              <div v-for="reminder in dataStore.reminders.slice(0, 5)" :key="reminder.id" class="reminder-item">
                <el-icon style="color: #409EFF;"><Bell /></el-icon>
                <div class="reminder-info">
                  <strong>{{ reminder.title }}</strong>
                  <span class="reminder-time">{{ reminder.time }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="No active reminders" />
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>Quick Actions</span>
              </div>
            </template>
            <div class="quick-actions">
              <el-button type="primary" @click="goToActivities">
                <el-icon><CaretRight /></el-icon> Log Activity
              </el-button>
              <el-button type="success" @click="goToDiet">
                <el-icon><Apple /></el-icon> Log Meal
              </el-button>
              <el-button type="info" @click="goToMentalHealth">
                <el-icon><Sunny /></el-icon> Mental Health Check
              </el-button>
              <el-button type="warning" @click="goToSuggestions">
                <el-icon><MagicStick /></el-icon> Get Suggestion
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/data'
import Layout from '../components/Layout.vue'

const router = useRouter()
const dataStore = useDataStore()

const recentActivities = computed(() => dataStore.activities.slice(0, 5))

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const goToActivities = () => router.push('/activities')
const goToDiet = () => router.push('/diet')
const goToMentalHealth = () => router.push('/mental-health')
const goToWellnessPlan = () => router.push('/wellness-plan')
const goToSuggestions = () => router.push('/suggestions')

onMounted(() => {
  dataStore.loadFromLocalStorage()
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
}

.stat-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-item, .reminder-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child, .reminder-item:last-child {
  border-bottom: none;
}

.activity-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.activity-time, .reminder-time {
  font-size: 12px;
  color: #999;
}

.activity-details {
  font-size: 14px;
  color: #666;
}

.reminder-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reminder-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
