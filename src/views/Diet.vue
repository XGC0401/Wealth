<template>
  <div class="diet-page">
    <div class="page-header">
      <h1>飲食記錄</h1>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
        新增飲食
      </el-button>
    </div>

    <!-- Today's Summary -->
    <el-row :gutter="20" class="summary-row">
      <el-col :span="8">
        <el-card class="summary-card">
          <div class="summary-content">
            <el-icon :size="40" color="#67c23a"><Food /></el-icon>
            <div>
              <div class="summary-value">{{ dietStore.todayMeals.length }}</div>
              <div class="summary-label">今日餐數</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="summary-card">
          <div class="summary-content">
            <el-icon :size="40" color="#e6a23c"><TrendCharts /></el-icon>
            <div>
              <div class="summary-value">{{ dietStore.todayCalories }}</div>
              <div class="summary-label">今日卡路里</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="summary-card">
          <div class="summary-content">
            <el-icon :size="40" color="#409eff"><Trophy /></el-icon>
            <div>
              <div class="summary-value">{{ calorieStatus }}</div>
              <div class="summary-label">攝取狀態</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Meal List -->
    <el-card>
      <div v-if="dietStore.meals.length > 0">
        <el-table :data="paginatedMeals" stripe style="width: 100%">
          <el-table-column prop="name" label="餐點名稱" min-width="150" />
          <el-table-column prop="mealType" label="餐別" width="100">
            <template #default="{ row }">
              <el-tag :type="getMealTypeColor(row.mealType)">
                {{ row.mealType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="卡路里" width="100">
            <template #default="{ row }">
              {{ row.calories }} 卡
            </template>
          </el-table-column>
          <el-table-column prop="protein" label="蛋白質(g)" width="100" />
          <el-table-column prop="carbs" label="碳水(g)" width="100" />
          <el-table-column prop="fat" label="脂肪(g)" width="100" />
          <el-table-column label="日期" width="180">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="handleDelete(row.id)"
                link
              >
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="dietStore.meals.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <el-empty v-else description="還沒有任何飲食記錄" :image-size="200" />
    </el-card>

    <!-- Add Meal Dialog -->
    <el-dialog
      v-model="showAddDialog"
      title="新增飲食記錄"
      width="500px"
    >
      <el-form
        ref="mealFormRef"
        :model="mealForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="餐點名稱" prop="name">
          <el-input v-model="mealForm.name" placeholder="例如：雞胸肉沙拉" />
        </el-form-item>

        <el-form-item label="餐別" prop="mealType">
          <el-select v-model="mealForm.mealType" placeholder="請選擇餐別" style="width: 100%">
            <el-option label="早餐" value="早餐" />
            <el-option label="午餐" value="午餐" />
            <el-option label="晚餐" value="晚餐" />
            <el-option label="點心" value="點心" />
          </el-select>
        </el-form-item>

        <el-form-item label="卡路里" prop="calories">
          <el-input-number
            v-model="mealForm.calories"
            :min="0"
            :max="2000"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="蛋白質 (g)">
          <el-input-number
            v-model="mealForm.protein"
            :min="0"
            :max="500"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="碳水化合物 (g)">
          <el-input-number
            v-model="mealForm.carbs"
            :min="0"
            :max="500"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="脂肪 (g)">
          <el-input-number
            v-model="mealForm.fat"
            :min="0"
            :max="500"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="備註">
          <el-input
            v-model="mealForm.notes"
            type="textarea"
            :rows="3"
            placeholder="其他備註..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddMeal">
          確定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useDietStore } from '@/stores/diet'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

const dietStore = useDietStore()
const showAddDialog = ref(false)
const mealFormRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

const mealForm = reactive({
  name: '',
  mealType: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  notes: ''
})

const rules = {
  name: [{ required: true, message: '請輸入餐點名稱', trigger: 'blur' }],
  mealType: [{ required: true, message: '請選擇餐別', trigger: 'change' }],
  calories: [{ required: true, message: '請輸入卡路里', trigger: 'blur' }]
}

const calorieStatus = computed(() => {
  const calories = dietStore.todayCalories
  if (calories < 1500) return '偏低'
  if (calories < 2500) return '正常'
  return '偏高'
})

const paginatedMeals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return dietStore.meals.slice(start, end)
})

const getMealTypeColor = (type) => {
  const colors = {
    '早餐': 'success',
    '午餐': 'warning',
    '晚餐': 'danger',
    '點心': 'info'
  }
  return colors[type] || ''
}

const handleAddMeal = async () => {
  if (!mealFormRef.value) return
  
  await mealFormRef.value.validate((valid) => {
    if (valid) {
      dietStore.addMeal({ ...mealForm })
      ElMessage.success('飲食記錄已新增')
      showAddDialog.value = false
      resetForm()
    }
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('確定要刪除這筆飲食記錄嗎？', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    dietStore.deleteMeal(id)
    ElMessage.success('已刪除')
  } catch {
    // User cancelled
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const resetForm = () => {
  Object.assign(mealForm, {
    name: '',
    mealType: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: ''
  })
  mealFormRef.value?.resetFields()
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.diet-page {
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

.summary-row {
  margin-bottom: 20px;
}

.summary-card {
  margin-bottom: 20px;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.summary-label {
  font-size: 14px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
