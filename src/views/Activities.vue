<template>
  <div class="activities-page">
    <div class="page-header">
      <h1>體能活動記錄</h1>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
        新增活動
      </el-button>
    </div>

    <!-- Activity List -->
    <el-card>
      <div v-if="activitiesStore.activities.length > 0">
        <el-table :data="paginatedActivities" stripe style="width: 100%">
          <el-table-column prop="name" label="活動名稱" min-width="150" />
          <el-table-column prop="type" label="類型" width="120" />
          <el-table-column label="時長" width="100">
            <template #default="{ row }">
              {{ row.duration }} 分鐘
            </template>
          </el-table-column>
          <el-table-column label="消耗卡路里" width="120">
            <template #default="{ row }">
              {{ row.calories || 0 }} 卡
            </template>
          </el-table-column>
          <el-table-column label="日期" width="180">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="備註" min-width="150">
            <template #default="{ row }">
              {{ row.notes || '-' }}
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
            :total="activitiesStore.activities.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <el-empty v-else description="還沒有任何活動記錄" :image-size="200" />
    </el-card>

    <!-- Add Activity Dialog -->
    <el-dialog
      v-model="showAddDialog"
      title="新增體能活動"
      width="500px"
    >
      <el-form
        ref="activityFormRef"
        :model="activityForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="活動名稱" prop="name">
          <el-input v-model="activityForm.name" placeholder="例如：慢跑" />
        </el-form-item>

        <el-form-item label="活動類型" prop="type">
          <el-select v-model="activityForm.type" placeholder="請選擇類型" style="width: 100%">
            <el-option label="有氧運動" value="有氧運動" />
            <el-option label="重量訓練" value="重量訓練" />
            <el-option label="瑜珈" value="瑜珈" />
            <el-option label="伸展運動" value="伸展運動" />
            <el-option label="球類運動" value="球類運動" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="時長（分鐘）" prop="duration">
          <el-input-number
            v-model="activityForm.duration"
            :min="1"
            :max="300"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="消耗卡路里" prop="calories">
          <el-input-number
            v-model="activityForm.calories"
            :min="0"
            :max="2000"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="備註">
          <el-input
            v-model="activityForm.notes"
            type="textarea"
            :rows="3"
            placeholder="其他備註..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddActivity">
          確定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useActivitiesStore } from '@/stores/activities'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

const activitiesStore = useActivitiesStore()
const showAddDialog = ref(false)
const activityFormRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

const activityForm = reactive({
  name: '',
  type: '',
  duration: 30,
  calories: 0,
  notes: ''
})

const rules = {
  name: [{ required: true, message: '請輸入活動名稱', trigger: 'blur' }],
  type: [{ required: true, message: '請選擇活動類型', trigger: 'change' }],
  duration: [{ required: true, message: '請輸入時長', trigger: 'blur' }]
}

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return activitiesStore.activities.slice(start, end)
})

const handleAddActivity = async () => {
  if (!activityFormRef.value) return
  
  await activityFormRef.value.validate((valid) => {
    if (valid) {
      activitiesStore.addActivity({ ...activityForm })
      ElMessage.success('活動已新增')
      showAddDialog.value = false
      resetForm()
    }
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('確定要刪除這筆活動記錄嗎？', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    activitiesStore.deleteActivity(id)
    ElMessage.success('已刪除')
  } catch {
    // User cancelled
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const resetForm = () => {
  Object.assign(activityForm, {
    name: '',
    type: '',
    duration: 30,
    calories: 0,
    notes: ''
  })
  activityFormRef.value?.resetFields()
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
.activities-page {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
