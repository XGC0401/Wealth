<template>
  <Layout>
    <div class="chat-page">
      <h1 class="page-title">Chat Room</h1>
      
      <el-card class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div v-if="dataStore.chatMessages.length === 0" class="empty-chat">
            <el-empty description="No messages yet. Start the conversation!" />
          </div>
          
          <div 
            v-for="message in dataStore.chatMessages" 
            :key="message.id"
            :class="['message', { 'own-message': message.sender === authStore.user?.name }]"
          >
            <div class="message-header">
              <el-avatar :size="32">{{ message.sender.charAt(0).toUpperCase() }}</el-avatar>
              <div class="message-info">
                <strong>{{ message.sender }}</strong>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
            </div>
            <div class="message-content">
              {{ message.content }}
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="newMessage"
            placeholder="Type your message..."
            @keyup.enter="sendMessage"
          >
            <template #append>
              <el-button type="primary" @click="sendMessage">
                <el-icon><Promotion /></el-icon> Send
              </el-button>
            </template>
          </el-input>
        </div>
      </el-card>
      
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>Chat Room Guidelines</span>
        </template>
        <ul class="guidelines">
          <li>Be respectful and supportive to all members</li>
          <li>Share your wellness journey and tips</li>
          <li>Ask questions and help others when you can</li>
          <li>Keep conversations positive and encouraging</li>
          <li>Respect privacy - don't share personal information</li>
        </ul>
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useDataStore } from '../stores/data'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import Layout from '../components/Layout.vue'

const dataStore = useDataStore()
const authStore = useAuthStore()
const chatMessagesRef = ref(null)
const newMessage = ref('')

const sendMessage = () => {
  if (!newMessage.value.trim()) {
    ElMessage.warning('Please enter a message')
    return
  }
  
  dataStore.addChatMessage({
    sender: authStore.user?.name || 'Anonymous',
    content: newMessage.value
  })
  
  newMessage.value = ''
  
  // Scroll to bottom
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
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
  
  return date.toLocaleString()
}

onMounted(() => {
  // Add welcome message if no messages exist
  if (dataStore.chatMessages.length === 0) {
    dataStore.addChatMessage({
      sender: 'Wealth Bot',
      content: 'Welcome to the Wealth Health & Wellness Chat Room! Feel free to share your progress, ask questions, and support each other. 💚'
    })
  }
  
  // Scroll to bottom
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
})
</script>

<style scoped>
.chat-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 20px 0;
  color: #333;
}

.chat-container {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f9f9f9;
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.message {
  margin-bottom: 20px;
  max-width: 70%;
}

.own-message {
  margin-left: auto;
}

.own-message .message-content {
  background: #409EFF;
  color: white;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.message-info {
  display: flex;
  flex-direction: column;
}

.message-info strong {
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-content {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.chat-input {
  padding: 20px;
  background: white;
  border-top: 1px solid #eee;
}

.guidelines {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
}

.guidelines li {
  color: #666;
}
</style>
