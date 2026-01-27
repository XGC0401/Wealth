<template>
  <div class="random-generator-page">
    <div class="page-header">
      <h1>隨機推薦</h1>
      <p>不知道該做什麼？讓我們為您推薦！</p>
    </div>

    <!-- Generator Cards -->
    <el-row :gutter="20">
      <!-- Exercise Generator -->
      <el-col :xs="24" :md="8">
        <el-card class="generator-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="30" color="#409eff"><Bicycle /></el-icon>
              <h3>隨機運動</h3>
            </div>
          </template>

          <div class="generator-content">
            <div v-if="randomExercise" class="result">
              <h4>{{ randomExercise.name }}</h4>
              <p class="description">{{ randomExercise.description }}</p>
              <div class="details">
                <el-tag type="success">{{ randomExercise.duration }} 分鐘</el-tag>
                <el-tag type="warning">{{ randomExercise.difficulty }}</el-tag>
              </div>
            </div>
            <el-empty v-else description="點擊按鈕獲取推薦" :image-size="100" />
          </div>

          <el-button type="primary" :icon="Refresh" @click="generateExercise" class="generate-btn">
            隨機推薦
          </el-button>
        </el-card>
      </el-col>

      <!-- Food Generator -->
      <el-col :xs="24" :md="8">
        <el-card class="generator-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="30" color="#67c23a"><Food /></el-icon>
              <h3>隨機食物</h3>
            </div>
          </template>

          <div class="generator-content">
            <div v-if="randomFood" class="result">
              <h4>{{ randomFood.name }}</h4>
              <p class="description">{{ randomFood.description }}</p>
              <div class="details">
                <el-tag type="success">{{ randomFood.calories }} 卡路里</el-tag>
                <el-tag type="warning">{{ randomFood.category }}</el-tag>
              </div>
            </div>
            <el-empty v-else description="點擊按鈕獲取推薦" :image-size="100" />
          </div>

          <el-button type="success" :icon="Refresh" @click="generateFood" class="generate-btn">
            隨機推薦
          </el-button>
        </el-card>
      </el-col>

      <!-- Activity Generator -->
      <el-col :xs="24" :md="8">
        <el-card class="generator-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="30" color="#e6a23c"><Sunny /></el-icon>
              <h3>隨機活動</h3>
            </div>
          </template>

          <div class="generator-content">
            <div v-if="randomActivity" class="result">
              <h4>{{ randomActivity.name }}</h4>
              <p class="description">{{ randomActivity.description }}</p>
              <div class="details">
                <el-tag type="success">{{ randomActivity.duration }} 分鐘</el-tag>
                <el-tag type="warning">{{ randomActivity.type }}</el-tag>
              </div>
            </div>
            <el-empty v-else description="點擊按鈕獲取推薦" :image-size="100" />
          </div>

          <el-button type="warning" :icon="Refresh" @click="generateActivity" class="generate-btn">
            隨機推薦
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Actions -->
    <el-card class="actions-card">
      <template #header>
        <h3>快速操作</h3>
      </template>
      <div class="quick-actions">
        <el-button
          v-if="randomExercise"
          type="primary"
          @click="addToActivities"
        >
          將運動加入記錄
        </el-button>
        <el-button
          v-if="randomFood"
          type="success"
          @click="addToDiet"
        >
          將食物加入記錄
        </el-button>
        <el-button
          v-if="randomActivity"
          type="warning"
          @click="addToMentalHealth"
        >
          將活動加入記錄
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useActivitiesStore } from '@/stores/activities'
import { useDietStore } from '@/stores/diet'
import { useMentalHealthStore } from '@/stores/mentalHealth'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const activitiesStore = useActivitiesStore()
const dietStore = useDietStore()
const mentalHealthStore = useMentalHealthStore()

const randomExercise = ref(null)
const randomFood = ref(null)
const randomActivity = ref(null)

const exercises = [
  { name: '慢跑', description: '在戶外或跑步機上進行有氧運動', duration: 30, difficulty: '中等' },
  { name: '深蹲', description: '強化下肢肌肉的力量訓練', duration: 15, difficulty: '簡單' },
  { name: '瑜珈', description: '提升柔軟度和平衡感', duration: 45, difficulty: '簡單' },
  { name: '游泳', description: '全身性有氧運動', duration: 40, difficulty: '中等' },
  { name: '重量訓練', description: '使用器械或啞鈴進行力量訓練', duration: 50, difficulty: '困難' },
  { name: '騎自行車', description: '低衝擊有氧運動', duration: 35, difficulty: '中等' },
  { name: '波比跳', description: '高強度全身訓練', duration: 20, difficulty: '困難' },
  { name: '伸展運動', description: '放鬆肌肉，提升柔軟度', duration: 15, difficulty: '簡單' },
  { name: '登山', description: '親近大自然的有氧運動', duration: 90, difficulty: '困難' },
  { name: '跳繩', description: '高效燃脂的有氧運動', duration: 15, difficulty: '中等' }
]

const foods = [
  { name: '雞胸肉沙拉', description: '高蛋白低脂的健康餐點', calories: 350, category: '主食' },
  { name: '燕麥粥', description: '富含纖維的早餐選擇', calories: 250, category: '早餐' },
  { name: '三文魚', description: '富含 Omega-3 的優質蛋白質', calories: 400, category: '主食' },
  { name: '希臘優格', description: '高蛋白的健康點心', calories: 150, category: '點心' },
  { name: '綠色蔬菜沙拉', description: '豐富維生素和礦物質', calories: 100, category: '配菜' },
  { name: '糙米飯', description: '優質碳水化合物來源', calories: 200, category: '主食' },
  { name: '堅果', description: '健康的脂肪和蛋白質', calories: 180, category: '點心' },
  { name: '水煮蛋', description: '完美的蛋白質來源', calories: 70, category: '點心' },
  { name: '酪梨吐司', description: '營養均衡的早餐', calories: 320, category: '早餐' },
  { name: '藍莓', description: '富含抗氧化物的水果', calories: 85, category: '水果' }
]

const activities = [
  { name: '冥想練習', description: '通過冥想放鬆身心', duration: 15, type: '心理健康' },
  { name: '感恩日記', description: '記錄今天值得感恩的事', duration: 10, type: '心理健康' },
  { name: '深呼吸練習', description: '進行深呼吸放鬆練習', duration: 5, type: '放鬆' },
  { name: '閱讀', description: '閱讀一本好書充實心靈', duration: 30, type: '休閒' },
  { name: '散步', description: '悠閒地散步放鬆心情', duration: 20, type: '休閒' },
  { name: '正念練習', description: '專注當下，覺察自己的感受', duration: 15, type: '心理健康' },
  { name: '聽音樂', description: '聆聽舒緩的音樂放鬆', duration: 20, type: '放鬆' },
  { name: '寫日記', description: '記錄今天的想法和心情', duration: 15, type: '心理健康' },
  { name: '泡澡', description: '享受溫暖舒適的泡澡時光', duration: 25, type: '放鬆' },
  { name: '畫畫', description: '通過繪畫表達內心感受', duration: 30, type: '創意' }
]

const generateExercise = () => {
  randomExercise.value = exercises[Math.floor(Math.random() * exercises.length)]
  ElMessage.success('已為您推薦運動！')
}

const generateFood = () => {
  randomFood.value = foods[Math.floor(Math.random() * foods.length)]
  ElMessage.success('已為您推薦食物！')
}

const generateActivity = () => {
  randomActivity.value = activities[Math.floor(Math.random() * activities.length)]
  ElMessage.success('已為您推薦活動！')
}

const addToActivities = () => {
  if (randomExercise.value) {
    activitiesStore.addActivity({
      name: randomExercise.value.name,
      type: '有氧運動',
      duration: randomExercise.value.duration,
      calories: randomExercise.value.duration * 8 // Rough estimate
    })
    ElMessage.success('運動已加入記錄')
  }
}

const addToDiet = () => {
  if (randomFood.value) {
    dietStore.addMeal({
      name: randomFood.value.name,
      mealType: '點心',
      calories: randomFood.value.calories,
      protein: 0,
      carbs: 0,
      fat: 0
    })
    ElMessage.success('食物已加入記錄')
  }
}

const addToMentalHealth = () => {
  if (randomActivity.value) {
    mentalHealthStore.addPractice({
      name: randomActivity.value.name,
      type: randomActivity.value.type,
      duration: randomActivity.value.duration,
      mood: 4
    })
    ElMessage.success('活動已加入記錄')
  }
}
</script>

<style scoped>
.random-generator-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  color: #909399;
  font-size: 16px;
}

.generator-card {
  margin-bottom: 20px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h3 {
  font-size: 18px;
  color: #303133;
  margin: 0;
}

.generator-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  margin-bottom: 20px;
}

.result {
  text-align: center;
  width: 100%;
}

.result h4 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 12px;
}

.description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
}

.details {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.generate-btn {
  width: 100%;
}

.actions-card {
  margin-top: 20px;
}

.quick-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  flex: 1;
  min-width: 200px;
}
</style>
