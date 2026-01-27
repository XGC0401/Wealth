<template>
  <Layout>
    <div class="suggestions-page">
      <h1 class="page-title">Random Suggestions</h1>
      
      <el-row :gutter="20">
        <el-col :xs="24" :md="8">
          <el-card class="suggestion-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon size="24"><CaretRight /></el-icon>
                <span>Exercise Suggestion</span>
              </div>
            </template>
            
            <div class="suggestion-content">
              <div v-if="currentExercise" class="suggestion-display">
                <h3>{{ currentExercise.name }}</h3>
                <p>{{ currentExercise.description }}</p>
                <div class="suggestion-details">
                  <el-tag>{{ currentExercise.duration }}</el-tag>
                  <el-tag type="success">{{ currentExercise.difficulty }}</el-tag>
                </div>
              </div>
              <el-empty v-else description="Click to get suggestion" />
            </div>
            
            <el-button type="primary" @click="getRandomExercise" style="width: 100%;">
              <el-icon><Refresh /></el-icon> Get Exercise
            </el-button>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="8">
          <el-card class="suggestion-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon size="24"><Apple /></el-icon>
                <span>Food Suggestion</span>
              </div>
            </template>
            
            <div class="suggestion-content">
              <div v-if="currentFood" class="suggestion-display">
                <h3>{{ currentFood.name }}</h3>
                <p>{{ currentFood.description }}</p>
                <div class="suggestion-details">
                  <el-tag type="warning">{{ currentFood.calories }} cal</el-tag>
                  <el-tag type="success">{{ currentFood.category }}</el-tag>
                </div>
              </div>
              <el-empty v-else description="Click to get suggestion" />
            </div>
            
            <el-button type="success" @click="getRandomFood" style="width: 100%;">
              <el-icon><Refresh /></el-icon> Get Food
            </el-button>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="8">
          <el-card class="suggestion-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon size="24"><Sunny /></el-icon>
                <span>Activity Suggestion</span>
              </div>
            </template>
            
            <div class="suggestion-content">
              <div v-if="currentActivity" class="suggestion-display">
                <h3>{{ currentActivity.name }}</h3>
                <p>{{ currentActivity.description }}</p>
                <div class="suggestion-details">
                  <el-tag type="info">{{ currentActivity.duration }}</el-tag>
                  <el-tag type="warning">{{ currentActivity.type }}</el-tag>
                </div>
              </div>
              <el-empty v-else description="Click to get suggestion" />
            </div>
            
            <el-button type="info" @click="getRandomActivity" style="width: 100%;">
              <el-icon><Refresh /></el-icon> Get Activity
            </el-button>
          </el-card>
        </el-col>
      </el-row>
      
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>Daily Wellness Tip</span>
        </template>
        <div class="wellness-tip">
          <el-icon size="48" color="#409EFF"><MagicStick /></el-icon>
          <div class="tip-content">
            <h3>{{ dailyTip.title }}</h3>
            <p>{{ dailyTip.content }}</p>
          </div>
          <el-button @click="getNewTip">
            <el-icon><Refresh /></el-icon> New Tip
          </el-button>
        </div>
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { ref } from 'vue'
import Layout from '../components/Layout.vue'

const exercises = [
  { name: 'Morning Yoga Flow', description: 'Start your day with energizing yoga poses', duration: '15-20 min', difficulty: 'Beginner' },
  { name: 'HIIT Cardio Blast', description: 'High-intensity interval training for maximum burn', duration: '20-30 min', difficulty: 'Advanced' },
  { name: 'Evening Walk', description: 'Relaxing walk to end your day peacefully', duration: '30-45 min', difficulty: 'Beginner' },
  { name: 'Core Strengthening', description: 'Build a strong core with targeted exercises', duration: '15 min', difficulty: 'Intermediate' },
  { name: 'Cycling Adventure', description: 'Explore your neighborhood on two wheels', duration: '45-60 min', difficulty: 'Intermediate' },
  { name: 'Swimming Session', description: 'Full-body workout in the pool', duration: '30-40 min', difficulty: 'Intermediate' },
  { name: 'Dance Workout', description: 'Fun cardio through dancing', duration: '30 min', difficulty: 'Beginner' }
]

const foods = [
  { name: 'Greek Yogurt Bowl', description: 'Protein-rich breakfast with berries and granola', calories: 250, category: 'Breakfast' },
  { name: 'Quinoa Salad', description: 'Nutritious lunch with mixed vegetables', calories: 350, category: 'Lunch' },
  { name: 'Grilled Salmon', description: 'Omega-3 rich dinner option', calories: 400, category: 'Dinner' },
  { name: 'Smoothie Bowl', description: 'Refreshing blend of fruits and superfoods', calories: 300, category: 'Breakfast' },
  { name: 'Avocado Toast', description: 'Healthy fats on whole grain bread', calories: 280, category: 'Breakfast' },
  { name: 'Chicken Stir-fry', description: 'Lean protein with colorful vegetables', calories: 380, category: 'Dinner' },
  { name: 'Mixed Nuts', description: 'Healthy snack packed with nutrients', calories: 180, category: 'Snack' }
]

const activities = [
  { name: 'Meditation Session', description: 'Clear your mind with guided meditation', duration: '10-15 min', type: 'Mental' },
  { name: 'Nature Walk', description: 'Connect with nature and breathe fresh air', duration: '30 min', type: 'Outdoor' },
  { name: 'Journaling', description: 'Reflect on your day and thoughts', duration: '15 min', type: 'Mental' },
  { name: 'Stretching Routine', description: 'Improve flexibility and reduce tension', duration: '10 min', type: 'Physical' },
  { name: 'Social Call', description: 'Connect with a friend or family member', duration: '20 min', type: 'Social' },
  { name: 'Reading Time', description: 'Relax with a good book', duration: '30 min', type: 'Mental' },
  { name: 'Hobby Time', description: 'Engage in your favorite hobby', duration: '30-60 min', type: 'Creative' }
]

const wellnessTips = [
  { title: 'Stay Hydrated', content: 'Drink at least 8 glasses of water daily to maintain optimal health and energy levels.' },
  { title: 'Quality Sleep', content: 'Aim for 7-9 hours of sleep each night to support physical and mental recovery.' },
  { title: 'Mindful Eating', content: 'Pay attention to your food, eat slowly, and stop when you\'re satisfied, not stuffed.' },
  { title: 'Regular Movement', content: 'Take short breaks every hour to stretch or walk, even if just for a few minutes.' },
  { title: 'Gratitude Practice', content: 'Write down three things you\'re grateful for each day to boost mental well-being.' },
  { title: 'Limit Screen Time', content: 'Give your eyes a break and reduce screen time, especially before bed.' },
  { title: 'Deep Breathing', content: 'Practice deep breathing exercises to reduce stress and anxiety throughout the day.' }
]

const currentExercise = ref(null)
const currentFood = ref(null)
const currentActivity = ref(null)
const dailyTip = ref(wellnessTips[Math.floor(Math.random() * wellnessTips.length)])

const getRandomExercise = () => {
  currentExercise.value = exercises[Math.floor(Math.random() * exercises.length)]
}

const getRandomFood = () => {
  currentFood.value = foods[Math.floor(Math.random() * foods.length)]
}

const getRandomActivity = () => {
  currentActivity.value = activities[Math.floor(Math.random() * activities.length)]
}

const getNewTip = () => {
  dailyTip.value = wellnessTips[Math.floor(Math.random() * wellnessTips.length)]
}
</script>

<style scoped>
.suggestions-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
}

.suggestion-card {
  margin-bottom: 20px;
  min-height: 350px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.suggestion-content {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.suggestion-display {
  text-align: center;
  width: 100%;
}

.suggestion-display h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.suggestion-display p {
  margin: 0 0 15px 0;
  color: #666;
}

.suggestion-details {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.wellness-tip {
  display: flex;
  align-items: center;
  gap: 20px;
}

.tip-content {
  flex: 1;
}

.tip-content h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.tip-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}
</style>
