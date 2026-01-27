<template>
  <div class="chatroom-page">
    <div class="page-header">
      <h1>健康聊天室</h1>
      <el-tag type="success">{{ onlineUsers }} 人在線</el-tag>
    </div>

    <el-card class="chat-container">
      <!-- Messages Area -->
      <div ref="messagesContainer" class="messages-area">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', { 'my-message': message.isMine }]"
        >
          <div class="message-header">
            <el-avatar :size="35">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="message-info">
              <span class="username">{{ message.username }}</span>
              <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            </div>
          </div>
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>

        <div v-if="messages.length === 0" class="empty-messages">
          <el-empty description="還沒有訊息，開始聊天吧！" :image-size="150" />
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <el-input
          v-model="newMessage"
          placeholder="輸入訊息..."
          :rows="2"
          type="textarea"
          resize="none"
          @keydown.enter.exact.prevent="sendMessage"
        />
        <el-button
          type="primary"
          :icon="ChatDotRound"
          @click="sendMessage"
          :disabled="!newMessage.trim()"
        >
          發送
        </el-button>
      </div>
    </el-card>

    <!-- Quick Messages -->
    <el-card class="quick-messages-card">
      <template #header>
        <span>快速訊息</span>
      </template>
      <div class="quick-messages">
        <el-button
          v-for="quickMsg in quickMessages"
          :key="quickMsg"
          size="small"
          @click="sendQuickMessage(quickMsg)"
        >
          {{ quickMsg }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ChatDotRound, User } from '@element-plus/icons-vue'

const userStore = useUserStore()
const messagesContainer = ref(null)
const newMessage = ref('')
const onlineUsers = ref(Math.floor(Math.random() * 50) + 20)

const messages = ref(JSON.parse(localStorage.getItem('chatMessages') || '[]'))

const saveMessages = () => {
  // Keep only last 50 messages
  if (messages.value.length > 50) {
    messages.value = messages.value.slice(-50)
  }
  localStorage.setItem('chatMessages', JSON.stringify(messages.value))
}

// Add some sample messages if empty
if (messages.value.length === 0) {
  messages.value = [
    {
      id: 1,
      username: '健康教練',
      content: '歡迎來到健康聊天室！在這裡可以和大家分享健康心得 💪',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isMine: false
    },
    {
      id: 2,
      username: '運動愛好者',
      content: '大家今天都做了什麼運動呀？',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isMine: false
    },
    {
      id: 3,
      username: '營養師',
      content: '記得每天要喝足夠的水哦，至少 2000ml！',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isMine: false
    }
  ]
  saveMessages()
}

const quickMessages = [
  '大家好！👋',
  '今天運動了嗎？',
  '一起加油！💪',
  '健康最重要！',
  '謝謝分享！'
]

const sendMessage = () => {
  if (!newMessage.value.trim()) return

  const message = {
    id: Date.now(),
    username: userStore.currentUser?.name || '使用者',
    content: newMessage.value.trim(),
    timestamp: new Date().toISOString(),
    isMine: true
  }

  messages.value.push(message)
  saveMessages()
  newMessage.value = ''
  
  nextTick(() => {
    scrollToBottom()
  })

  // Simulate random responses
  setTimeout(() => {
    simulateResponse()
  }, 2000 + Math.random() * 3000)
}

const sendQuickMessage = (msg) => {
  newMessage.value = msg
  sendMessage()
}

const simulateResponse = () => {
  const responses = [
    '很棒的分享！',
    '我也覺得這樣很好！',
    '謝謝你的建議！',
    '一起努力！',
    '加油加油！💪'
  ]

  const randomUser = ['健康達人', '運動教練', '營養專家', '健身愛好者'][Math.floor(Math.random() * 4)]
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]

  const message = {
    id: Date.now(),
    username: randomUser,
    content: randomResponse,
    timestamp: new Date().toISOString(),
    isMine: false
  }

  messages.value.push(message)
  saveMessages()
  
  nextTick(() => {
    scrollToBottom()
  })
}


const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-TW', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

onMounted(() => {
  setTimeout(() => {
    scrollToBottom()
  }, 100)
  
  // Update online users count periodically
  setInterval(() => {
    onlineUsers.value = Math.floor(Math.random() * 50) + 20
  }, 30000)
})
</script>

<style scoped>
.chatroom-page {
  max-width: 900px;
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

.chat-container {
  height: 600px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in;
}

.my-message {
  flex-direction: row-reverse;
}

.my-message .message-header {
  flex-direction: row-reverse;
}

.my-message .message-content {
  background: #409eff;
  color: white;
  border-radius: 12px 12px 0 12px;
}

.message-header {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-shrink: 0;
}

.message-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.timestamp {
  font-size: 12px;
  color: #909399;
}

.message-content {
  background: white;
  padding: 10px 15px;
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  word-wrap: break-word;
  line-height: 1.6;
}

.empty-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.input-area {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-area .el-input {
  flex: 1;
}

.quick-messages-card {
  margin-bottom: 20px;
}

.quick-messages {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar Styling */
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
</style>
