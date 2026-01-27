<template>
  <Layout>
    <div class="community-page">
      <h1 class="page-title">Community</h1>
      
      <el-card style="margin-bottom: 20px;">
        <template #header>
          <span>Share Your Progress</span>
        </template>
        
        <el-form :model="postForm" ref="postFormRef" label-position="top">
          <el-form-item label="Title" prop="title">
            <el-input v-model="postForm.title" placeholder="Give your post a title..." />
          </el-form-item>
          
          <el-form-item label="Content" prop="content">
            <el-input 
              v-model="postForm.content" 
              type="textarea" 
              :rows="4" 
              placeholder="Share your wellness journey, tips, or ask for advice..."
            />
          </el-form-item>
          
          <el-form-item label="Category" prop="category">
            <el-select v-model="postForm.category" placeholder="Select category" style="width: 100%;">
              <el-option label="💪 Fitness" value="Fitness" />
              <el-option label="🥗 Nutrition" value="Nutrition" />
              <el-option label="🧘 Mental Health" value="Mental Health" />
              <el-option label="💡 Tips & Advice" value="Tips & Advice" />
              <el-option label="🎯 Goals & Progress" value="Goals & Progress" />
              <el-option label="❓ Questions" value="Questions" />
            </el-select>
          </el-form-item>
          
          <el-button type="primary" @click="handleCreatePost">
            <el-icon><Edit /></el-icon> Share Post
          </el-button>
        </el-form>
      </el-card>
      
      <el-card>
        <template #header>
          <div class="card-header">
            <span>Community Posts</span>
            <el-radio-group v-model="filterCategory" size="small">
              <el-radio-button label="">All</el-radio-button>
              <el-radio-button label="Fitness">Fitness</el-radio-button>
              <el-radio-button label="Nutrition">Nutrition</el-radio-button>
              <el-radio-button label="Mental Health">Mental Health</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        
        <div v-if="filteredPosts.length > 0">
          <div v-for="post in filteredPosts" :key="post.id" class="post-item">
            <div class="post-header">
              <el-avatar :size="40">{{ post.author.charAt(0).toUpperCase() }}</el-avatar>
              <div class="post-meta">
                <strong>{{ post.author }}</strong>
                <span class="post-time">{{ formatTime(post.timestamp) }}</span>
              </div>
              <el-tag size="small">{{ post.category }}</el-tag>
            </div>
            
            <div class="post-content">
              <h3>{{ post.title }}</h3>
              <p>{{ post.content }}</p>
            </div>
            
            <div class="post-actions">
              <el-button 
                size="small" 
                @click="handleLikePost(post.id)"
                :type="post.liked ? 'primary' : 'default'"
              >
                <el-icon><StarFilled /></el-icon> {{ post.likes }} Likes
              </el-button>
              
              <el-button size="small" @click="toggleComments(post.id)">
                <el-icon><ChatDotRound /></el-icon> {{ post.comments.length }} Comments
              </el-button>
            </div>
            
            <div v-if="showComments[post.id]" class="comments-section">
              <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                <strong>{{ comment.author }}</strong>
                <p>{{ comment.content }}</p>
                <span class="comment-time">{{ formatTime(comment.timestamp) }}</span>
              </div>
              
              <div class="add-comment">
                <el-input
                  v-model="newComments[post.id]"
                  placeholder="Add a comment..."
                  size="small"
                >
                  <template #append>
                    <el-button @click="handleAddComment(post.id)">Post</el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </div>
        </div>
        
        <el-empty v-else description="No posts yet. Be the first to share!" />
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useDataStore } from '../stores/data'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import Layout from '../components/Layout.vue'

const dataStore = useDataStore()
const authStore = useAuthStore()
const postFormRef = ref(null)
const filterCategory = ref('')
const showComments = ref({})
const newComments = ref({})

const postForm = reactive({
  title: '',
  content: '',
  category: ''
})

const filteredPosts = computed(() => {
  if (!filterCategory.value) return dataStore.communityPosts
  return dataStore.communityPosts.filter(post => post.category === filterCategory.value)
})

const handleCreatePost = () => {
  if (!postForm.title || !postForm.content || !postForm.category) {
    ElMessage.warning('Please fill in all fields')
    return
  }
  
  dataStore.addCommunityPost({
    ...postForm,
    author: authStore.user?.name || 'Anonymous'
  })
  
  ElMessage.success('Post shared successfully!')
  
  // Reset form
  postForm.title = ''
  postForm.content = ''
  postForm.category = ''
}

const handleLikePost = (postId) => {
  dataStore.likeCommunityPost(postId)
  const post = dataStore.communityPosts.find(p => p.id === postId)
  if (post) {
    post.liked = true
  }
}

const toggleComments = (postId) => {
  showComments.value[postId] = !showComments.value[postId]
}

const handleAddComment = (postId) => {
  const commentContent = newComments.value[postId]
  if (!commentContent || !commentContent.trim()) {
    ElMessage.warning('Please enter a comment')
    return
  }
  
  dataStore.addCommentToPost(postId, {
    author: authStore.user?.name || 'Anonymous',
    content: commentContent
  })
  
  newComments.value[postId] = ''
  ElMessage.success('Comment added!')
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}
</script>

<style scoped>
.community-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.post-item {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 15px;
  background: #fafafa;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.post-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-meta strong {
  font-size: 15px;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.post-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.post-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.comments-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.comment-item {
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 10px;
}

.comment-item strong {
  font-size: 14px;
  color: #333;
}

.comment-item p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.add-comment {
  margin-top: 10px;
}
</style>
