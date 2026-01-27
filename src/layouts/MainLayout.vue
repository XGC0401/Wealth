<template>
  <div class="main-layout">
    <el-container>
      <!-- Header -->
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <el-icon :size="28" color="#409eff"><TrophyBase /></el-icon>
            <span class="logo-text">Wealth</span>
          </div>
          <div class="user-info">
            <el-dropdown>
              <span class="user-dropdown">
                <el-avatar :size="35" :src="userAvatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ userStore.currentUser?.name || '使用者' }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>
                    登出
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-container>
        <!-- Sidebar -->
        <el-aside width="220px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            router
          >
            <el-menu-item index="/">
              <el-icon><Odometer /></el-icon>
              <span>儀表板</span>
            </el-menu-item>
            
            <el-menu-item index="/activities">
              <el-icon><Bicycle /></el-icon>
              <span>體能活動</span>
            </el-menu-item>
            
            <el-menu-item index="/diet">
              <el-icon><Food /></el-icon>
              <span>飲食紀錄</span>
            </el-menu-item>
            
            <el-menu-item index="/mental-health">
              <el-icon><Sunny /></el-icon>
              <span>心理健康</span>
            </el-menu-item>
            
            <el-menu-item index="/wellness-plans">
              <el-icon><Document /></el-icon>
              <span>健康計畫</span>
            </el-menu-item>
            
            <el-menu-item index="/reminders">
              <el-icon><BellFilled /></el-icon>
              <span>提醒設置</span>
            </el-menu-item>
            
            <el-menu-item index="/community">
              <el-icon><UserFilled /></el-icon>
              <span>社群分享</span>
            </el-menu-item>
            
            <el-menu-item index="/random-generator">
              <el-icon><MagicStick /></el-icon>
              <span>隨機推薦</span>
            </el-menu-item>
            
            <el-menu-item index="/chatroom">
              <el-icon><ChatDotRound /></el-icon>
              <span>聊天室</span>
            </el-menu-item>
            
            <el-menu-item index="/profile">
              <el-icon><User /></el-icon>
              <span>個人資料</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <!-- Main Content -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const userAvatar = computed(() => null)

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('已成功登出')
    // Force page reload to clear all state
    window.location.href = '/login'
  } catch (error) {
    ElMessage.error('登出時發生錯誤')
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
}

.el-container {
  min-height: 100vh;
}

.header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,.08);
  padding: 0 20px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.logo-text {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-dropdown:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

.sidebar {
  background: #fff;
  box-shadow: 2px 0 4px rgba(0,0,0,.08);
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
  padding: 10px 0;
}

.sidebar-menu .el-menu-item {
  margin: 4px 10px;
  border-radius: 6px;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
