<template>
  <Layout>
    <div class="diet-page">
      <h1 class="page-title">Diet Log</h1>
      
      <el-card style="margin-bottom: 20px;">
        <template #header>
          <span>Log New Meal</span>
        </template>
        
        <el-form :model="mealForm" ref="mealFormRef" label-position="top">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="Meal Type" prop="mealType">
                <el-select v-model="mealForm.mealType" placeholder="Select meal type" style="width: 100%;">
                  <el-option label="Breakfast" value="Breakfast" />
                  <el-option label="Lunch" value="Lunch" />
                  <el-option label="Dinner" value="Dinner" />
                  <el-option label="Snack" value="Snack" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="Food Items" prop="foodItems">
                <el-input v-model="mealForm.foodItems" placeholder="e.g., Chicken salad, Rice..." />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="Calories" prop="calories">
                <el-input-number v-model="mealForm.calories" :min="0" :max="5000" style="width: 100%;" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="Water Intake (ml)" prop="waterIntake">
                <el-input-number v-model="mealForm.waterIntake" :min="0" :max="5000" style="width: 100%;" />
              </el-form-item>
            </el-col>
            
            <el-col :span="24">
              <el-form-item label="Notes" prop="notes">
                <el-input v-model="mealForm.notes" type="textarea" :rows="3" placeholder="Additional notes..." />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-button type="primary" @click="handleAddMeal">
            <el-icon><Plus /></el-icon> Add Meal
          </el-button>
        </el-form>
      </el-card>
      
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :xs="24" :sm="8">
          <el-card>
            <el-statistic title="Today's Calories" :value="todayCalories">
              <template #suffix>kcal</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card>
            <el-statistic title="Today's Water" :value="todayWater">
              <template #suffix>ml</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card>
            <el-statistic title="Meals Today" :value="todayMeals" />
          </el-card>
        </el-col>
      </el-row>
      
      <el-card>
        <template #header>
          <span>Meal History</span>
        </template>
        
        <el-table :data="dataStore.meals" style="width: 100%">
          <el-table-column prop="mealType" label="Meal Type" width="120" />
          <el-table-column prop="foodItems" label="Food Items" />
          <el-table-column prop="calories" label="Calories" width="100" />
          <el-table-column prop="waterIntake" label="Water (ml)" width="120" />
          <el-table-column prop="notes" label="Notes" />
          <el-table-column label="Date" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.timestamp) }}
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-if="dataStore.meals.length === 0" description="No meals logged yet" />
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useDataStore } from '../stores/data'
import { ElMessage } from 'element-plus'
import Layout from '../components/Layout.vue'

const dataStore = useDataStore()
const mealFormRef = ref(null)

const mealForm = reactive({
  mealType: '',
  foodItems: '',
  calories: 0,
  waterIntake: 0,
  notes: ''
})

const todayCalories = computed(() => {
  const today = new Date().toDateString()
  return dataStore.meals
    .filter(meal => new Date(meal.timestamp).toDateString() === today)
    .reduce((sum, meal) => sum + meal.calories, 0)
})

const todayWater = computed(() => {
  const today = new Date().toDateString()
  return dataStore.meals
    .filter(meal => new Date(meal.timestamp).toDateString() === today)
    .reduce((sum, meal) => sum + meal.waterIntake, 0)
})

const todayMeals = computed(() => {
  const today = new Date().toDateString()
  return dataStore.meals
    .filter(meal => new Date(meal.timestamp).toDateString() === today)
    .length
})

const handleAddMeal = () => {
  if (!mealForm.mealType || !mealForm.foodItems) {
    ElMessage.warning('Please fill in meal type and food items')
    return
  }
  
  dataStore.addMeal({ ...mealForm })
  ElMessage.success('Meal logged successfully!')
  
  // Reset form
  mealForm.mealType = ''
  mealForm.foodItems = ''
  mealForm.calories = 0
  mealForm.waterIntake = 0
  mealForm.notes = ''
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>

<style scoped>
.diet-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
}
</style>
