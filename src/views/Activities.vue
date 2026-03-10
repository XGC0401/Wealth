<template>
  <div class="activities-page">
    <div class="page-header">
      <h1>{{ $t('activities.title') }}</h1>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
        {{ $t('activities.addActivity') }}
      </el-button>
    </div>

    <!-- Activity List -->
    <el-card>
      <div v-if="activitiesStore.activities.length > 0">
        <el-table :data="paginatedActivities" stripe style="width: 100%">
          <el-table-column prop="name" :label="$t('activities.activityName')" min-width="150" />
          <el-table-column prop="type" :label="$t('activities.activityType')" width="120" />
          <el-table-column :label="$t('activities.duration')" width="100">
            <template #default="{ row }">
              {{ row.duration }} {{ $t('common.minutes') }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('activities.caloriesBurned')" width="120">
            <template #default="{ row }">
              {{ row.calories || 0 }} {{ $t('common.kcal') }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.date')" width="180">
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column prop="notes" :label="$t('common.notes')" min-width="150">
            <template #default="{ row }">
              {{ row.notes || '-' }}
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
            :total="activitiesStore.activities.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <el-empty v-else :description="$t('activities.noActivities')" :image-size="200" />
    </el-card>

    <!-- Add Activity Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="$t('activities.addDialogTitle')"
      width="500px"
    >
      <el-form
        ref="activityFormRef"
        :model="activityForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="$t('activities.activityName')" prop="name">
          <el-input v-model="activityForm.name" :placeholder="$t('activities.namePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('activities.activityType')" prop="type">
          <el-select v-model="activityForm.type" :placeholder="$t('activities.typePlaceholder')" style="width: 100%">
            <el-option :label="$t('activities.typeAerobic')" value="有氧運動" />
            <el-option :label="$t('activities.typeStrength')" value="重量訓練" />
            <el-option :label="$t('activities.typeYoga')" value="瑜珈" />
            <el-option :label="$t('activities.typeFlexibility')" value="伸展運動" />
            <el-option :label="$t('activities.typeSports')" value="球類運動" />
            <el-option :label="$t('activities.typeOther')" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('activities.duration')" prop="duration">
          <el-input-number
            v-model="activityForm.duration"
            :min="1"
            :max="300"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('activities.caloriesBurned')" prop="calories">
          <el-input-number
            v-model="activityForm.calories"
            :min="0"
            :max="2000"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="$t('common.notes')">
          <el-input
            v-model="activityForm.notes"
            type="textarea"
            :rows="3"
            :placeholder="$t('activities.notesPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleAddActivity">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useActivitiesStore } from '@/stores/activities'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
  name: [{ required: true, message: t('activities.nameRequired'), trigger: 'blur' }],
  type: [{ required: true, message: t('activities.typeRequired'), trigger: 'change' }],
  duration: [{ required: true, message: t('activities.durationRequired'), trigger: 'blur' }]
}

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return activitiesStore.activities.slice(start, end)
})

const handleAddActivity = async () => {
  if (!activityFormRef.value) return

  const valid = await activityFormRef.value.validate().catch(() => false)
  if (!valid) return

  const result = await activitiesStore.addActivity({ ...activityForm })
  if (result.success) {
    ElMessage.success(t('activities.addSuccess'))
    showAddDialog.value = false
    resetForm()
    return
  }

  ElMessage.error(result.message || t('common.error'))
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('activities.deleteConfirm'),
      t('activities.deleteTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    const result = await activitiesStore.deleteActivity(id)
    if (result.success) {
      ElMessage.success(t('activities.deleteSuccess'))
      return
    }

    ElMessage.error(result.message || t('common.error'))
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

onMounted(() => {
  activitiesStore.loadActivities()
})
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
