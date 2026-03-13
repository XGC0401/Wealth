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
            <!-- Language Switcher -->
            <el-switch
              v-model="isEnglish"
              class="language-switch"
              active-text="EN"
              :inactive-text="$t('common.chinese')"
              @change="switchLanguage"
            />
            
            <el-dropdown>
              <span class="user-dropdown">
                <el-avatar :size="35" :src="userAvatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ userStore.currentUser?.name || $t('app.user') }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/settings')">
                    <el-icon><Setting /></el-icon>
                    {{ $t('nav.settings') }}
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>
                    {{ $t('auth.logout') }}
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
              <span>{{ $t('nav.dashboard') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/activities">
              <el-icon><Bicycle /></el-icon>
              <span>{{ $t('nav.activities') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/diet">
              <el-icon><Food /></el-icon>
              <span>{{ $t('nav.diet') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/mental-health">
              <el-icon><Sunny /></el-icon>
              <span>{{ $t('nav.mentalHealth') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/wellness-plans">
              <el-icon><Document /></el-icon>
              <span>{{ $t('nav.wellnessPlans') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/reminders">
              <el-icon><BellFilled /></el-icon>
              <span>{{ $t('nav.reminders') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/community">
              <el-icon><UserFilled /></el-icon>
              <span>{{ $t('nav.community') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/random-generator">
              <el-icon><MagicStick /></el-icon>
              <span>{{ $t('nav.randomGenerator') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/booking">
              <el-icon><Calendar /></el-icon>
              <span>{{ $t('nav.booking') }}</span>
            </el-menu-item>
            
            <el-menu-item index="/profile">
              <el-icon><User /></el-icon>
              <span>{{ $t('nav.profile') }}</span>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { locale } = useI18n()

const activeMenu = computed(() => route.path)
const userAvatar = computed(() => userStore.currentUser?.profilePicture || null)

// Language switcher
const isEnglish = ref(locale.value === 'en')

const switchLanguage = () => {
  const newLocale = isEnglish.value ? 'en' : 'zh'
  locale.value = newLocale
  localStorage.setItem('language', newLocale)
  
  // Reload page to apply ElementPlus locale
  window.location.reload()
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success($t('common.logoutSuccess'))
    // Force page reload to clear all state
    window.location.href = '/login'
  } catch (error) {
    ElMessage.error($t('common.logoutError'))
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
  gap: 20px;
}

.language-switch {
  --el-switch-on-color: #409eff;
  --el-switch-off-color: #67c23a;
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
