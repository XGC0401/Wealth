<template>
  <div class="diet-page">
    <div class="page-header">
      <h1>{{ $t('diet.title') }}</h1>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
        {{ $t('diet.addMeal') }}
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
              <div class="summary-label">{{ $t('diet.todayMeals') }}</div>
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
              <div class="summary-label">{{ $t('diet.todayCalories') }}</div>
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
              <div class="summary-label">{{ $t('diet.intakeStatus') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Meal List -->
    <el-card>
      <div v-if="dietStore.meals.length > 0">
        <el-table :data="paginatedMeals" stripe style="width: 100%">
          <el-table-column prop="name" :label="$t('diet.mealName')" min-width="150" />
          <el-table-column prop="mealType" :label="$t('diet.mealType')" width="100">
            <template #default="{ row }">
              <el-tag :type="getMealTypeColor(row.mealType)">
                {{ $t('diet.' + row.mealType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('diet.calories')" width="100">
            <template #default="{ row }">
              {{ row.calories }} {{ $t('common.kcal') }}
            </template>
          </el-table-column>
          <el-table-column prop="protein" :label="$t('diet.protein')" width="100" />
          <el-table-column prop="carbs" :label="$t('diet.carbs')" width="100" />
          <el-table-column prop="fat" :label="$t('diet.fat')" width="100" />
          <el-table-column :label="$t('common.date')" width="180">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.operation')" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="handleDelete(row.id)"
                link
              >
                {{ $t('common.delete') }}
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

      <el-empty v-else :description="$t('diet.noMeals')" :image-size="200" />
    </el-card>

    <!-- Add Meal Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="$t('diet.addDialogTitle')"
      width="500px"
    >
      <el-form
        ref="mealFormRef"
        :model="mealForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="$t('diet.mealName')" prop="name">
          <el-input v-model="mealForm.name" :placeholder="$t('diet.namePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('diet.mealType')" prop="mealType">
          <el-select v-model="mealForm.mealType" :placeholder="$t('diet.typePlaceholder')" style="width: 100%">
            <el-option :label="$t('diet.breakfast')" value="breakfast" />
            <el-option :label="$t('diet.lunch')" value="lunch" />
            <el-option :label="$t('diet.dinner')" value="dinner" />
            <el-option :label="$t('diet.snack')" value="snack" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('diet.calories')" prop="calories">
          <el-input-number
            v-model="mealForm.calories"
            :min="0"
            :max="2000"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('diet.protein')">
          <el-input-number
            v-model="mealForm.protein"
            :min="0"
            :max="500"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('diet.carbsFull')">
          <el-input-number
            v-model="mealForm.carbs"
            :min="0"
            :max="500"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('diet.fatFull')">
          <el-input-number
            v-model="mealForm.fat"
            :min="0"
            :max="500"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('common.notes')">
          <el-input
            v-model="mealForm.notes"
            type="textarea"
            :rows="3"
            :placeholder="$t('diet.notesPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleAddMeal">
          {{ $t('common.confirm') }}
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
  name: [{ required: true, message: t('diet.nameRequired'), trigger: 'blur' }],
  mealType: [{ required: true, message: t('diet.typeRequired'), trigger: 'change' }],
  calories: [{ required: true, message: t('diet.caloriesRequired'), trigger: 'blur' }]
}

const calorieStatus = computed(() => {
  const calories = dietStore.todayCalories
  if (calories < 1500) return t('diet.statusLow')
  if (calories < 2500) return t('diet.statusNormal')
  return t('diet.statusHigh')
})

const paginatedMeals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return dietStore.meals.slice(start, end)
})

const getMealTypeColor = (type) => {
  const colors = {
    breakfast: 'success',
    lunch: 'warning',
    dinner: 'danger',
    snack: 'info'
  }
  return colors[type] || ''
}

const handleAddMeal = async () => {
  if (!mealFormRef.value) return
  
  await mealFormRef.value.validate((valid) => {
    if (valid) {
      dietStore.addMeal({ ...mealForm })
      ElMessage.success(t('diet.addSuccess'))
      showAddDialog.value = false
      resetForm()
    }
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('diet.deleteConfirm'),
      t('diet.deleteTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    dietStore.deleteMeal(id)
    ElMessage.success(t('diet.deleteSuccess'))
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
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return t('common.today')
  if (days === 1) return t('common.yesterday')
  return d.toLocaleDateString(locale.value)
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
