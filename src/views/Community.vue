<template>
  <div class="community-page">
    <div class="page-header">
      <h1>{{ $t('community.title') }}</h1>
      <el-button type="primary" :icon="Plus" @click="showPostDialog = true">
        {{ $t('community.sharePost') }}
      </el-button>
    </div>

    <!-- Posts List -->
    <div class="posts-container">
      <el-card
        v-for="post in posts"
        :key="post.id"
        class="post-card"
        shadow="hover"
      >
        <div class="post-header">
          <div class="user-info">
            <el-avatar :size="40">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="user-details">
              <div class="username">{{ post.username }}</div>
              <div class="post-time">{{ formatTime(post.createdAt) }}</div>
            </div>
          </div>
          <el-dropdown v-if="post.isMine">
            <el-icon class="more-icon"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="deletePost(post.id)">
                  {{ $t('common.delete') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="post-content">
          <p>{{ post.content }}</p>
          <div v-if="post.image" class="post-image">
            <img :src="post.image" alt="Post image" />
          </div>
          <el-tag v-if="post.category" type="info" size="small" class="post-category">
            #{{ getCategoryName(post.category) }}
          </el-tag>
        </div>

        <div class="post-stats">
          <div class="stat-item">
            <el-icon :size="18" color="#f56c6c"><StarFilled /></el-icon>
            <span>{{ post.likes || 0 }}</span>
          </div>
          <div class="stat-item">
            <el-icon :size="18" color="#409eff"><ChatDotRound /></el-icon>
            <span>{{ post.comments || 0 }}</span>
          </div>
          <div class="stat-item">
            <el-icon :size="18" color="#67c23a"><Share /></el-icon>
            <span>{{ post.shares || 0 }}</span>
          </div>
        </div>

        <div class="post-actions">
          <el-button
            text
            :icon="post.isLiked ? StarFilled : Star"
            @click="toggleLike(post.id)"
          >
            {{ post.isLiked ? $t('community.liked') : $t('community.like') }}
          </el-button>
          <el-button text :icon="ChatDotRound">
            {{ $t('community.comment') }}
          </el-button>
          <el-button text :icon="Share">
            {{ $t('community.share') }}
          </el-button>
        </div>
      </el-card>
    </div>

    <el-empty
      v-if="posts.length === 0"
      :description="$t('community.noPosts')"
      :image-size="200"
    />

    <!-- Create Post Dialog -->
    <el-dialog
      v-model="showPostDialog"
      :title="$t('community.sharePost')"
      width="600px"
    >
      <el-form
        ref="postFormRef"
        :model="postForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item :label="$t('community.content')" prop="content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="6"
            :placeholder="$t('community.contentPlaceholder')"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('community.category')">
          <el-select v-model="postForm.category" :placeholder="$t('community.categoryPlaceholder')" style="width: 100%">
            <el-option :label="$t('community.categoryFitness')" value="fitness" />
            <el-option :label="$t('community.categoryDiet')" value="diet" />
            <el-option :label="$t('community.categoryMentalHealth')" value="mentalHealth" />
            <el-option :label="$t('community.categoryLifestyle')" value="lifestyle" />
            <el-option :label="$t('community.categoryExperience')" value="experience" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPostDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleCreatePost">
          {{ $t('community.publish') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, User, MoreFilled, ChatDotRound, 
  Share, Star, StarFilled 
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const { t } = useI18n()

const userStore = useUserStore()
const showPostDialog = ref(false)
const postFormRef = ref(null)

const posts = ref([])

const loadPosts = async () => {
  if (!userStore.userId) return
  try {
    const response = await axios.get(`${API_BASE_URL}/api/community-posts/${userStore.userId}`)
    posts.value = response.data || []
  } catch (error) {
    console.error('載入貼文失敗:', error)
    ElMessage.error(error.response?.data?.message || t('common.error'))
  }
}

const postForm = reactive({
  content: '',
  category: ''
})

const rules = {
  content: [
    { required: true, message: t('community.contentRequired'), trigger: 'blur' },
    { min: 10, message: t('community.contentMinLength'), trigger: 'blur' }
  ]
}

const handleCreatePost = async () => {
  if (!postFormRef.value) return

  const valid = await postFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const response = await axios.post(`${API_BASE_URL}/api/community-posts`, {
      userId: userStore.userId,
      username: userStore.currentUser?.name || t('common.user'),
      content: postForm.content,
      category: postForm.category
    })

    posts.value.unshift({ ...response.data.post, isMine: true })
    ElMessage.success(t('community.publishSuccess'))
    showPostDialog.value = false
    resetForm()
  } catch (error) {
    console.error('發布貼文失敗:', error)
    ElMessage.error(error.response?.data?.message || t('common.error'))
  }
}

const toggleLike = async (id) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/community-posts/${id}/like`, {
      userId: userStore.userId
    })

    const index = posts.value.findIndex(p => p.id === id)
    if (index !== -1) {
      posts.value[index] = {
        ...posts.value[index],
        ...response.data.post,
        isMine: posts.value[index].isMine
      }
    }
  } catch (error) {
    console.error('按讚失敗:', error)
    ElMessage.error(error.response?.data?.message || t('common.error'))
  }
}

const deletePost = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('community.deleteConfirm'),
      t('community.deleteTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    await axios.delete(`${API_BASE_URL}/api/community-posts/${id}`, {
      params: { userId: userStore.userId }
    })
    posts.value = posts.value.filter(p => p.id !== id)
    ElMessage.success(t('community.deleteSuccess'))
  } catch {
    // User cancelled
  }
}

const resetForm = () => {
  Object.assign(postForm, {
    content: '',
    category: ''
  })
  postFormRef.value?.resetFields()
}

const formatTime = (date) => {
  const now = new Date()
  const postDate = new Date(date)
  const diff = now - postDate
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return t('common.justNow')
  if (minutes < 60) return t('common.minutesAgo', { n: minutes })
  if (hours < 24) return t('common.hoursAgo', { n: hours })
  if (days < 7) return t('common.daysAgo', { n: days })
  
  return postDate.toLocaleDateString()
}

const getCategoryName = (category) => {
  const categoryMap = {
    'fitness': 'community.categoryFitness',
    'diet': 'community.categoryDiet',
    'mentalHealth': 'community.categoryMentalHealth',
    'lifestyle': 'community.categoryLifestyle',
    'experience': 'community.categoryExperience'
  }
  return t(categoryMap[category] || category)
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.community-page {
  max-width: 800px;
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

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  transition: transform 0.3s;
}

.post-card:hover {
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.post-time {
  font-size: 13px;
  color: #909399;
}

.more-icon {
  cursor: pointer;
  font-size: 20px;
  color: #909399;
}

.more-icon:hover {
  color: #606266;
}

.post-content {
  margin-bottom: 15px;
}

.post-content p {
  color: #303133;
  line-height: 1.8;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.post-image {
  margin: 15px 0;
}

.post-image img {
  width: 100%;
  border-radius: 8px;
}

.post-category {
  margin-top: 10px;
}

.post-stats {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 14px;
}

.post-actions {
  display: flex;
  justify-content: space-around;
}
</style>
