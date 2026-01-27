<template>
  <div class="mental-health-page">
    <div class="page-header">
      <h1>心理健康練習</h1>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
        新增練習
      </el-button>
    </div>

    <!-- Practice List -->
    <el-row :gutter="20">
      <el-col
        v-for="practice in mentalHealthStore.practices"
        :key="practice.id"
        :xs="24"
        :sm="12"
        :md="8"
      >
        <el-card class="practice-card" shadow="hover">
          <div class="practice-header">
            <el-icon :size="30" :color="getPracticeColor(practice.type)">
              <component :is="getPracticeIcon(practice.type)" />
            </el-icon>
            <el-tag :type="getPracticeTagType(practice.type)">
              {{ practice.type }}
            </el-tag>
          </div>
          <h3 class="practice-name">{{ practice.name }}</h3>
          <div class="practice-info">
            <div class="info-item">
              <el-icon><Clock /></el-icon>
              <span>{{ practice.duration }} 分鐘</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(practice.date) }}</span>
            </div>
          </div>
          <div v-if="practice.mood" class="practice-mood">
            <span>心情：</span>
            <el-rate v-model="practice.mood" disabled show-score />
          </div>
          <p v-if="practice.notes" class="practice-notes">{{ practice.notes }}</p>
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            @click="handleDelete(practice.id)"
            class="delete-btn"
          >
            刪除
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-if="mentalHealthStore.practices.length === 0"
      description="還沒有任何心理健康練習記錄"
      :image-size="200"
    />

    <!-- Add Practice Dialog -->
    <el-dialog
      v-model="showAddDialog"
      title="新增心理健康練習"
      width="500px"
    >
      <el-form
        ref="practiceFormRef"
        :model="practiceForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="練習名稱" prop="name">
          <el-input v-model="practiceForm.name" placeholder="例如：冥想練習" />
        </el-form-item>

        <el-form-item label="練習類型" prop="type">
          <el-select v-model="practiceForm.type" placeholder="請選擇類型" style="width: 100%">
            <el-option label="冥想" value="冥想" />
            <el-option label="呼吸練習" value="呼吸練習" />
            <el-option label="正念練習" value="正念練習" />
            <el-option label="感恩日記" value="感恩日記" />
            <el-option label="放鬆技巧" value="放鬆技巧" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="時長（分鐘）" prop="duration">
          <el-input-number
            v-model="practiceForm.duration"
            :min="1"
            :max="180"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="心情評分">
          <el-rate v-model="practiceForm.mood" show-score />
        </el-form-item>

        <el-form-item label="備註">
          <el-input
            v-model="practiceForm.notes"
            type="textarea"
            :rows="4"
            placeholder="記錄您的感受和想法..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddPractice">
          確定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMentalHealthStore } from '@/stores/mentalHealth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Clock, Calendar, Sunny, Promotion, MagicStick } from '@element-plus/icons-vue'

const mentalHealthStore = useMentalHealthStore()
const showAddDialog = ref(false)
const practiceFormRef = ref(null)

const practiceForm = reactive({
  name: '',
  type: '',
  duration: 10,
  mood: 3,
  notes: ''
})

const rules = {
  name: [{ required: true, message: '請輸入練習名稱', trigger: 'blur' }],
  type: [{ required: true, message: '請選擇練習類型', trigger: 'change' }],
  duration: [{ required: true, message: '請輸入時長', trigger: 'blur' }]
}

const getPracticeIcon = (type) => {
  const icons = {
    '冥想': Sunny,
    '呼吸練習': Promotion,
    '正念練習': MagicStick,
    '感恩日記': Calendar,
    '放鬆技巧': Sunny
  }
  return icons[type] || Sunny
}

const getPracticeColor = (type) => {
  const colors = {
    '冥想': '#409eff',
    '呼吸練習': '#67c23a',
    '正念練習': '#e6a23c',
    '感恩日記': '#f56c6c',
    '放鬆技巧': '#909399'
  }
  return colors[type] || '#409eff'
}

const getPracticeTagType = (type) => {
  const types = {
    '冥想': '',
    '呼吸練習': 'success',
    '正念練習': 'warning',
    '感恩日記': 'danger',
    '放鬆技巧': 'info'
  }
  return types[type] || ''
}

const handleAddPractice = async () => {
  if (!practiceFormRef.value) return
  
  await practiceFormRef.value.validate((valid) => {
    if (valid) {
      mentalHealthStore.addPractice({ ...practiceForm })
      ElMessage.success('練習記錄已新增')
      showAddDialog.value = false
      resetForm()
    }
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('確定要刪除這筆練習記錄嗎？', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    mentalHealthStore.deletePractice(id)
    ElMessage.success('已刪除')
  } catch {
    // User cancelled
  }
}

const resetForm = () => {
  Object.assign(practiceForm, {
    name: '',
    type: '',
    duration: 10,
    mood: 3,
    notes: ''
  })
  practiceFormRef.value?.resetFields()
}

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  return d.toLocaleDateString('zh-TW')
}
</script>

<style scoped>
.mental-health-page {
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

.practice-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.practice-card:hover {
  transform: translateY(-5px);
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.practice-name {
  font-size: 18px;
  color: #303133;
  margin-bottom: 12px;
}

.practice-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.practice-mood {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.practice-notes {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
  white-space: pre-wrap;
}

.delete-btn {
  width: 100%;
}
</style>
