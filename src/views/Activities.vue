<template>
  <Layout>
    <div class="activities-page">
      <h1 class="page-title">Physical Activities</h1>
      
      <el-card style="margin-bottom: 20px;">
        <template #header>
          <span>Log New Activity</span>
        </template>
        
        <el-form :model="activityForm" ref="activityFormRef" label-position="top">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="Activity Type" prop="type">
                <el-select v-model="activityForm.type" placeholder="Select activity" style="width: 100%;">
                  <el-option label="Running" value="Running" />
                  <el-option label="Walking" value="Walking" />
                  <el-option label="Cycling" value="Cycling" />
                  <el-option label="Swimming" value="Swimming" />
                  <el-option label="Yoga" value="Yoga" />
                  <el-option label="Gym Workout" value="Gym Workout" />
                  <el-option label="Dancing" value="Dancing" />
                  <el-option label="Sports" value="Sports" />
                  <el-option label="Other" value="Other" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="Duration (minutes)" prop="duration">
                <el-input-number v-model="activityForm.duration" :min="1" :max="500" style="width: 100%;" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="Calories Burned" prop="calories">
                <el-input-number v-model="activityForm.calories" :min="0" :max="5000" style="width: 100%;" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="Intensity" prop="intensity">
                <el-select v-model="activityForm.intensity" placeholder="Select intensity" style="width: 100%;">
                  <el-option label="Light" value="Light" />
                  <el-option label="Moderate" value="Moderate" />
                  <el-option label="Intense" value="Intense" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="24">
              <el-form-item label="Notes" prop="notes">
                <el-input v-model="activityForm.notes" type="textarea" :rows="3" placeholder="Additional notes..." />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-button type="primary" @click="handleAddActivity">
            <el-icon><Plus /></el-icon> Add Activity
          </el-button>
        </el-form>
      </el-card>
      
      <el-card>
        <template #header>
          <span>Activity History</span>
        </template>
        
        <el-table :data="dataStore.activities" style="width: 100%">
          <el-table-column prop="type" label="Activity" width="150" />
          <el-table-column prop="duration" label="Duration (min)" width="130" />
          <el-table-column prop="calories" label="Calories" width="100" />
          <el-table-column prop="intensity" label="Intensity" width="120" />
          <el-table-column prop="notes" label="Notes" />
          <el-table-column label="Date" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.timestamp) }}
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-if="dataStore.activities.length === 0" description="No activities logged yet" />
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useDataStore } from '../stores/data'
import { ElMessage } from 'element-plus'
import Layout from '../components/Layout.vue'

const dataStore = useDataStore()
const activityFormRef = ref(null)

const activityForm = reactive({
  type: '',
  duration: 30,
  calories: 0,
  intensity: 'Moderate',
  notes: ''
})

const handleAddActivity = () => {
  if (!activityForm.type) {
    ElMessage.warning('Please select an activity type')
    return
  }
  
  dataStore.addActivity({ ...activityForm })
  ElMessage.success('Activity logged successfully!')
  
  // Reset form
  activityForm.type = ''
  activityForm.duration = 30
  activityForm.calories = 0
  activityForm.intensity = 'Moderate'
  activityForm.notes = ''
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>

<style scoped>
.activities-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
}
</style>
