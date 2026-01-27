<template>
  <div class="home-page">
    <div class="page-header">
      <h1>歡迎回來，{{ userStore.currentUser?.name }}！</h1>
      <p>這是您今天的健康概覽</p>
    </div>

    <!-- Stats Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-1">
          <div class="stat-content">
            <el-icon :size="40"><Bicycle /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ todayActivitiesCount }}</div>
              <div class="stat-label">今日活動</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-2">
          <div class="stat-content">
            <el-icon :size="40"><Food /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ todayCalories }}</div>
              <div class="stat-label">今日卡路里</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-3">
          <div class="stat-content">
            <el-icon :size="40"><Sunny /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ todayMentalPractices }}</div>
              <div class="stat-label">心理練習</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-4">
          <div class="stat-content">
            <el-icon :size="40"><BellFilled /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ activeRemindersCount }}</div>
              <div class="stat-label">活動提醒</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts and Recent Activities -->
    <el-row :gutter="20" class="content-row">
      <!-- Recent Activities -->
      <el-col :xs="24" :md="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>最近活動</span>
              <el-button text @click="$router.push('/activities')">查看全部</el-button>
            </div>
          </template>
          <div v-if="recentActivities.length > 0" class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <el-icon color="#409eff"><Bicycle /></el-icon>
              <div class="activity-details">
                <div class="activity-name">{{ activity.name }}</div>
                <div class="activity-meta">{{ activity.duration }} 分鐘 · {{ formatDate(activity.date) }}</div>
              </div>
            </div>
          </div>
          <el-empty v-else description="還沒有任何活動記錄" :image-size="120" />
        </el-card>
      </el-col>

      <!-- Recent Meals -->
      <el-col :xs="24" :md="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>最近飲食</span>
              <el-button text @click="$router.push('/diet')">查看全部</el-button>
            </div>
          </template>
          <div v-if="recentMeals.length > 0" class="meal-list">
            <div v-for="meal in recentMeals" :key="meal.id" class="meal-item">
              <el-icon color="#67c23a"><Food /></el-icon>
              <div class="meal-details">
                <div class="meal-name">{{ meal.name }}</div>
                <div class="meal-meta">{{ meal.calories }} 卡路里 · {{ formatDate(meal.date) }}</div>
              </div>
            </div>
          </div>
          <el-empty v-else description="還沒有任何飲食記錄" :image-size="120" />
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Actions -->
    <el-card class="quick-actions-card">
      <template #header>
        <span>快速操作</span>
      </template>
      <el-row :gutter="15">
        <el-col :xs="12" :sm="6">
          <div class="quick-action" @click="$router.push('/activities')">
            <el-icon :size="30" color="#409eff"><Bicycle /></el-icon>
            <span>記錄活動</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="quick-action" @click="$router.push('/diet')">
            <el-icon :size="30" color="#67c23a"><Food /></el-icon>
            <span>記錄飲食</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="quick-action" @click="$router.push('/mental-health')">
            <el-icon :size="30" color="#e6a23c"><Sunny /></el-icon>
            <span>心理健康</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="quick-action" @click="$router.push('/random-generator')">
            <el-icon :size="30" color="#f56c6c"><Dice /></el-icon>
            <span>隨機推薦</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useActivitiesStore } from '@/stores/activities'
import { useDietStore } from '@/stores/diet'
import { useMentalHealthStore } from '@/stores/mentalHealth'
import { useRemindersStore } from '@/stores/reminders'

const userStore = useUserStore()
const activitiesStore = useActivitiesStore()
const dietStore = useDietStore()
const mentalHealthStore = useMentalHealthStore()
const remindersStore = useRemindersStore()

const todayActivitiesCount = computed(() => activitiesStore.todayActivities.length)
const todayCalories = computed(() => dietStore.todayCalories)
const todayMentalPractices = computed(() => {
  const today = new Date().toDateString()
  return mentalHealthStore.practices.filter(p => 
    new Date(p.date).toDateString() === today
  ).length
})
const activeRemindersCount = computed(() => 
  remindersStore.reminders.filter(r => r.active).length
)

const recentActivities = computed(() => 
  activitiesStore.activities.slice(0, 5)
)

const recentMeals = computed(() => 
  dietStore.meals.slice(0, 5)
)

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  
  return d.toLocaleDateString('zh-TW')
}
</script>

<style scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  color: #909399;
  font-size: 16px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  border: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-card-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-card-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-card-4 {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.content-row {
  margin-bottom: 20px;
}

.content-card {
  margin-bottom: 20px;
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.activity-list, .meal-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item, .meal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: background 0.3s;
}

.activity-item:hover, .meal-item:hover {
  background: #e9ecef;
}

.activity-details, .meal-details {
  flex: 1;
}

.activity-name, .meal-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.activity-meta, .meal-meta {
  font-size: 13px;
  color: #909399;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 25px;
  background: #f5f7fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-action:hover {
  background: #e9ecef;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.quick-action span {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
</style>
