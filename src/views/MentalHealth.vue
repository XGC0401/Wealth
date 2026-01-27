<template>
  <Layout>
    <div class="mental-health-page">
      <h1 class="page-title">Mental Health Tracking</h1>
      
      <el-card style="margin-bottom: 20px;">
        <template #header>
          <span>Log Mental Health Practice</span>
        </template>
        
        <el-form :model="mentalHealthForm" ref="mentalHealthFormRef" label-position="top">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="Practice Type" prop="type">
                <el-select v-model="mentalHealthForm.type" placeholder="Select practice" style="width: 100%;">
                  <el-option label="Meditation" value="Meditation" />
                  <el-option label="Journaling" value="Journaling" />
                  <el-option label="Breathing Exercises" value="Breathing Exercises" />
                  <el-option label="Mindfulness" value="Mindfulness" />
                  <el-option label="Therapy Session" value="Therapy Session" />
                  <el-option label="Relaxation" value="Relaxation" />
                  <el-option label="Other" value="Other" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="Duration (minutes)" prop="duration">
                <el-input-number v-model="mentalHealthForm.duration" :min="1" :max="500" style="width: 100%;" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="Mood Before" prop="moodBefore">
                <el-rate v-model="mentalHealthForm.moodBefore" :max="5" show-text :texts="moodTexts" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12">
              <el-form-item label="Mood After" prop="moodAfter">
                <el-rate v-model="mentalHealthForm.moodAfter" :max="5" show-text :texts="moodTexts" />
              </el-form-item>
            </el-col>
            
            <el-col :span="24">
              <el-form-item label="Notes / Reflections" prop="notes">
                <el-input v-model="mentalHealthForm.notes" type="textarea" :rows="4" placeholder="How do you feel? Any thoughts..." />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-button type="primary" @click="handleAddLog">
            <el-icon><Plus /></el-icon> Add Log
          </el-button>
        </el-form>
      </el-card>
      
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :xs="24" :sm="8">
          <el-card>
            <el-statistic title="Total Sessions" :value="dataStore.mentalHealthLogs.length" />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card>
            <el-statistic title="This Week" :value="thisWeekSessions" />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card>
            <el-statistic title="Avg Mood Improvement" :value="avgMoodImprovement" :precision="1">
              <template #suffix>⭐</template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>
      
      <el-card>
        <template #header>
          <span>Mental Health History</span>
        </template>
        
        <el-table :data="dataStore.mentalHealthLogs" style="width: 100%">
          <el-table-column prop="type" label="Practice" width="150" />
          <el-table-column prop="duration" label="Duration (min)" width="130" />
          <el-table-column label="Mood Before" width="130">
            <template #default="scope">
              <el-rate v-model="scope.row.moodBefore" disabled :max="5" />
            </template>
          </el-table-column>
          <el-table-column label="Mood After" width="130">
            <template #default="scope">
              <el-rate v-model="scope.row.moodAfter" disabled :max="5" />
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="Notes" show-overflow-tooltip />
          <el-table-column label="Date" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.timestamp) }}
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-if="dataStore.mentalHealthLogs.length === 0" description="No mental health logs yet" />
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
const mentalHealthFormRef = ref(null)

const moodTexts = ['Very Poor', 'Poor', 'Okay', 'Good', 'Excellent']

const mentalHealthForm = reactive({
  type: '',
  duration: 15,
  moodBefore: 3,
  moodAfter: 4,
  notes: ''
})

const thisWeekSessions = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return dataStore.mentalHealthLogs.filter(log => new Date(log.timestamp) >= oneWeekAgo).length
})

const avgMoodImprovement = computed(() => {
  if (dataStore.mentalHealthLogs.length === 0) return 0
  const improvements = dataStore.mentalHealthLogs.map(log => log.moodAfter - log.moodBefore)
  const sum = improvements.reduce((a, b) => a + b, 0)
  return sum / dataStore.mentalHealthLogs.length
})

const handleAddLog = () => {
  if (!mentalHealthForm.type) {
    ElMessage.warning('Please select a practice type')
    return
  }
  
  dataStore.addMentalHealthLog({ ...mentalHealthForm })
  ElMessage.success('Mental health log added successfully!')
  
  // Reset form
  mentalHealthForm.type = ''
  mentalHealthForm.duration = 15
  mentalHealthForm.moodBefore = 3
  mentalHealthForm.moodAfter = 4
  mentalHealthForm.notes = ''
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>

<style scoped>
.mental-health-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
}
</style>
