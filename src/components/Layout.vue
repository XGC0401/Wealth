<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <h2>💚 Wealth</h2>
        <div class="header-right">
          <span class="username">{{ authStore.user?.name }}</span>
          <el-button @click="handleLogout" type="danger" size="small">Logout</el-button>
        </div>
      </div>
    </el-header>
    
    <el-container>
      <el-aside width="250px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          @select="handleMenuSelect"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><Grid /></el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          
          <el-menu-item index="/activities">
            <el-icon><CaretRight /></el-icon>
            <span>Physical Activities</span>
          </el-menu-item>
          
          <el-menu-item index="/diet">
            <el-icon><Apple /></el-icon>
            <span>Diet Log</span>
          </el-menu-item>
          
          <el-menu-item index="/mental-health">
            <el-icon><Sunny /></el-icon>
            <span>Mental Health</span>
          </el-menu-item>
          
          <el-menu-item index="/wellness-plan">
            <el-icon><Document /></el-icon>
            <span>Wellness Plans</span>
          </el-menu-item>
          
          <el-menu-item index="/suggestions">
            <el-icon><MagicStick /></el-icon>
            <span>Random Suggestions</span>
          </el-menu-item>
          
          <el-menu-item index="/community">
            <el-icon><User /></el-icon>
            <span>Community</span>
          </el-menu-item>
          
          <el-menu-item index="/chat">
            <el-icon><ChatDotRound /></el-icon>
            <span>Chat Room</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main class="main-content">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('Logged out successfully')
  router.push('/login')
}

onMounted(() => {
  authStore.checkAuth()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-content h2 {
  margin: 0;
  font-size: 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  font-weight: 500;
}

.sidebar {
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

.el-menu-vertical {
  border-right: none;
}

.main-content {
  background: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
