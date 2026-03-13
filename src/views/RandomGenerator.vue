<template>
  <div class="random-generator-page">
    <div class="page-header">
      <h1>{{ $t('randomGenerator.title') }}</h1>
      <p>{{ $t('randomGenerator.subtitle') }}</p>
    </div>

    <!-- Generator Cards -->
    <el-row :gutter="20">
      <!-- Exercise Generator -->
      <el-col :xs="24" :md="8">
        <el-card class="generator-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="30" color="#409eff"><Bicycle /></el-icon>
              <h3>{{ $t('randomGenerator.exercise') }}</h3>
            </div>
          </template>

          <div class="generator-content">
            <div v-if="randomExercise" class="result">
              <h4>{{ randomExercise.name }}</h4>
              <p class="description">{{ randomExercise.description }}</p>
              <div class="details">
                <el-tag type="success">{{ randomExercise.duration }} {{ $t('common.minutes') }}</el-tag>
                <el-tag type="warning">{{ randomExercise.difficulty }}</el-tag>
              </div>
            </div>
            <el-empty v-else :description="$t('randomGenerator.clickToGenerate')" :image-size="100" />
          </div>

          <el-button type="primary" :icon="Refresh" @click="generateExercise" class="generate-btn">
            {{ $t('randomGenerator.randomRecommend') }}
          </el-button>
        </el-card>
      </el-col>

      <!-- Food Generator -->
      <el-col :xs="24" :md="8">
        <el-card class="generator-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="30" color="#67c23a"><Food /></el-icon>
              <h3>{{ $t('randomGenerator.food') }}</h3>
            </div>
          </template>

          <div class="generator-content">
            <div v-if="randomFood" class="result">
              <h4>{{ randomFood.name }}</h4>
              <p class="description">{{ randomFood.description }}</p>
              <div class="details">
                <el-tag type="success">{{ randomFood.calories }} {{ $t('diet.calories') }}</el-tag>
                <el-tag type="warning">{{ randomFood.category }}</el-tag>
              </div>
            </div>
            <el-empty v-else :description="$t('randomGenerator.clickToGenerate')" :image-size="100" />
          </div>

          <el-button type="success" :icon="Refresh" @click="generateFood" class="generate-btn">
            {{ $t('randomGenerator.randomRecommend') }}
          </el-button>
        </el-card>
      </el-col>

      <!-- Activity Generator -->
      <el-col :xs="24" :md="8">
        <el-card class="generator-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="30" color="#e6a23c"><Sunny /></el-icon>
              <h3>{{ $t('randomGenerator.activity') }}</h3>
            </div>
          </template>

          <div class="generator-content">
            <div v-if="randomActivity" class="result">
              <h4>{{ randomActivity.name }}</h4>
              <p class="description">{{ randomActivity.description }}</p>
              <div class="details">
                <el-tag type="success">{{ randomActivity.duration }} {{ $t('common.minutes') }}</el-tag>
                <el-tag type="warning">{{ randomActivity.type }}</el-tag>
              </div>
            </div>
            <el-empty v-else :description="$t('randomGenerator.clickToGenerate')" :image-size="100" />
          </div>

          <el-button type="warning" :icon="Refresh" @click="generateActivity" class="generate-btn">
            {{ $t('randomGenerator.randomRecommend') }}
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Actions -->
    <el-card class="actions-card">
      <template #header>
        <h3>{{ $t('randomGenerator.quickActions') }}</h3>
      </template>
      <div class="quick-actions">
        <el-button
          v-if="randomExercise"
          type="primary"
          @click="addToActivities"
        >
          {{ $t('randomGenerator.addToActivities') }}
        </el-button>
        <el-button
          v-if="randomFood"
          type="success"
          @click="addToDiet"
        >
          {{ $t('randomGenerator.addToDiet') }}
        </el-button>
        <el-button
          v-if="randomActivity"
          type="warning"
          @click="addToMentalHealth"
        >
          {{ $t('randomGenerator.addToMentalHealth') }}
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const activitiesStore = useActivitiesStore()
const dietStore = useDietStore()
const mentalHealthStore = useMentalHealthStore()

const randomExercise = ref(null)
const randomFood = ref(null)
const randomActivity = ref(null)

const exercises = [
  { nameKey: 'randomGenerator.exercises.jogging', descKey: 'randomGenerator.exercisesDesc.jogging', duration: 30, difficultyKey: 'randomGenerator.medium' },
  { nameKey: 'randomGenerator.exercises.squat', descKey: 'randomGenerator.exercisesDesc.squat', duration: 15, difficultyKey: 'randomGenerator.easy' },
  { nameKey: 'randomGenerator.exercises.yoga', descKey: 'randomGenerator.exercisesDesc.yoga', duration: 45, difficultyKey: 'randomGenerator.easy' },
  { nameKey: 'randomGenerator.exercises.swimming', descKey: 'randomGenerator.exercisesDesc.swimming', duration: 40, difficultyKey: 'randomGenerator.medium' },
  { nameKey: 'randomGenerator.exercises.weightTraining', descKey: 'randomGenerator.exercisesDesc.weightTraining', duration: 50, difficultyKey: 'randomGenerator.hard' },
  { nameKey: 'randomGenerator.exercises.cycling', descKey: 'randomGenerator.exercisesDesc.cycling', duration: 35, difficultyKey: 'randomGenerator.medium' },
  { nameKey: 'randomGenerator.exercises.burpees', descKey: 'randomGenerator.exercisesDesc.burpees', duration: 20, difficultyKey: 'randomGenerator.hard' },
  { nameKey: 'randomGenerator.exercises.stretching', descKey: 'randomGenerator.exercisesDesc.stretching', duration: 15, difficultyKey: 'randomGenerator.easy' },
  { nameKey: 'randomGenerator.exercises.hiking', descKey: 'randomGenerator.exercisesDesc.hiking', duration: 90, difficultyKey: 'randomGenerator.hard' },
  { nameKey: 'randomGenerator.exercises.jumpRope', descKey: 'randomGenerator.exercisesDesc.jumpRope', duration: 15, difficultyKey: 'randomGenerator.medium' }
]

const foods = [
  { nameKey: 'randomGenerator.foods.chickenSalad', descKey: 'randomGenerator.foodsDesc.chickenSalad', calories: 350, categoryKey: 'randomGenerator.mainDish' },
  { nameKey: 'randomGenerator.foods.oatmeal', descKey: 'randomGenerator.foodsDesc.oatmeal', calories: 250, categoryKey: 'randomGenerator.breakfast' },
  { nameKey: 'randomGenerator.foods.salmon', descKey: 'randomGenerator.foodsDesc.salmon', calories: 400, categoryKey: 'randomGenerator.mainDish' },
  { nameKey: 'randomGenerator.foods.greekYogurt', descKey: 'randomGenerator.foodsDesc.greekYogurt', calories: 150, categoryKey: 'randomGenerator.snack' },
  { nameKey: 'randomGenerator.foods.greenSalad', descKey: 'randomGenerator.foodsDesc.greenSalad', calories: 100, categoryKey: 'randomGenerator.sideDish' },
  { nameKey: 'randomGenerator.foods.brownRice', descKey: 'randomGenerator.foodsDesc.brownRice', calories: 200, categoryKey: 'randomGenerator.mainDish' },
  { nameKey: 'randomGenerator.foods.nuts', descKey: 'randomGenerator.foodsDesc.nuts', calories: 180, categoryKey: 'randomGenerator.snack' },
  { nameKey: 'randomGenerator.foods.boiledEgg', descKey: 'randomGenerator.foodsDesc.boiledEgg', calories: 70, categoryKey: 'randomGenerator.snack' },
  { nameKey: 'randomGenerator.foods.avocadoToast', descKey: 'randomGenerator.foodsDesc.avocadoToast', calories: 320, categoryKey: 'randomGenerator.breakfast' },
  { nameKey: 'randomGenerator.foods.blueberries', descKey: 'randomGenerator.foodsDesc.blueberries', calories: 85, categoryKey: 'randomGenerator.fruit' }
]

const activities = [
  { nameKey: 'randomGenerator.activities.meditation', descKey: 'randomGenerator.activitiesDesc.meditation', duration: 15, typeKey: 'randomGenerator.mentalHealth' },
  { nameKey: 'randomGenerator.activities.gratitudeJournal', descKey: 'randomGenerator.activitiesDesc.gratitudeJournal', duration: 10, typeKey: 'randomGenerator.mentalHealth' },
  { nameKey: 'randomGenerator.activities.breathing', descKey: 'randomGenerator.activitiesDesc.breathing', duration: 5, typeKey: 'randomGenerator.relaxation' },
  { nameKey: 'randomGenerator.activities.reading', descKey: 'randomGenerator.activitiesDesc.reading', duration: 30, typeKey: 'randomGenerator.leisure' },
  { nameKey: 'randomGenerator.activities.walking', descKey: 'randomGenerator.activitiesDesc.walking', duration: 20, typeKey: 'randomGenerator.leisure' },
  { nameKey: 'randomGenerator.activities.mindfulness', descKey: 'randomGenerator.activitiesDesc.mindfulness', duration: 15, typeKey: 'randomGenerator.mentalHealth' },
  { nameKey: 'randomGenerator.activities.music', descKey: 'randomGenerator.activitiesDesc.music', duration: 20, typeKey: 'randomGenerator.relaxation' },
  { nameKey: 'randomGenerator.activities.journaling', descKey: 'randomGenerator.activitiesDesc.journaling', duration: 15, typeKey: 'randomGenerator.mentalHealth' },
  { nameKey: 'randomGenerator.activities.bath', descKey: 'randomGenerator.activitiesDesc.bath', duration: 25, typeKey: 'randomGenerator.relaxation' },
  { nameKey: 'randomGenerator.activities.drawing', descKey: 'randomGenerator.activitiesDesc.drawing', duration: 30, typeKey: 'randomGenerator.creative' }
]

const generateExercise = () => {
  const exercise = exercises[Math.floor(Math.random() * exercises.length)]
  randomExercise.value = {
    name: t(exercise.nameKey),
    description: t(exercise.descKey),
    duration: exercise.duration,
    difficulty: t(exercise.difficultyKey)
  }
  ElMessage.success(t('randomGenerator.exerciseRecommended'))
}

const generateFood = () => {
  const food = foods[Math.floor(Math.random() * foods.length)]
  randomFood.value = {
    name: t(food.nameKey),
    description: t(food.descKey),
    calories: food.calories,
    category: t(food.categoryKey)
  }
  ElMessage.success(t('randomGenerator.foodRecommended'))
}

const generateActivity = () => {
  const activity = activities[Math.floor(Math.random() * activities.length)]
  randomActivity.value = {
    name: t(activity.nameKey),
    description: t(activity.descKey),
    duration: activity.duration,
    type: t(activity.typeKey)
  }
  ElMessage.success(t('randomGenerator.activityRecommended'))
}

const addToActivities = () => {
  if (randomExercise.value) {
    activitiesStore.addActivity({
      name: randomExercise.value.name,
      type: t('activities.typeCardio'),
      duration: randomExercise.value.duration,
      calories: randomExercise.value.duration * 8 // Rough estimate
    })
    ElMessage.success(t('randomGenerator.addedToActivities'))
  }
}

const addToDiet = () => {
  if (randomFood.value) {
    dietStore.addMeal({
      name: randomFood.value.name,
      mealType: t('diet.snack'),
      calories: randomFood.value.calories,
      protein: 0,
      carbs: 0,
      fat: 0
    })
    ElMessage.success(t('randomGenerator.addedToDiet'))
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
    ElMessage.success(t('randomGenerator.addedToMentalHealth'))
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
