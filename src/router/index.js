import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/Home.vue')
        },
        {
          path: 'activities',
          name: 'Activities',
          component: () => import('@/views/Activities.vue')
        },
        {
          path: 'diet',
          name: 'Diet',
          component: () => import('@/views/Diet.vue')
        },
        {
          path: 'mental-health',
          name: 'MentalHealth',
          component: () => import('@/views/MentalHealth.vue')
        },
        {
          path: 'wellness-plans',
          name: 'WellnessPlans',
          component: () => import('@/views/WellnessPlans.vue')
        },
        {
          path: 'reminders',
          name: 'Reminders',
          component: () => import('@/views/Reminders.vue')
        },
        {
          path: 'community',
          name: 'Community',
          component: () => import('@/views/Community.vue')
        },
        {
          path: 'booking',
          name: 'Booking',
          component: () => import('@/views/Booking.vue'),
          meta: { title: '醫院與診所預約' }
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/Profile.vue')
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue')
        }
      ]
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // Debug log
  console.log('路由守衛檢查:', {
    path: to.path,
    requiresAuth,
    isLoggedIn: userStore.isLoggedIn,
    hasToken: !!userStore.token,
    user: userStore.currentUser
  })

  if (requiresAuth && !userStore.isLoggedIn) {
    // 需要認證但未登入 → 轉到登入頁
    console.log('未認證，重定向到登入頁')
    next('/login')
  } else if (!requiresAuth && userStore.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    // 已登入卻要去登入/註冊頁 → 轉到首頁
    console.log('已登入，重定向到首頁')
    next('/')
  } else {
    // 其他情況 → 正常進行
    next()
  }
})

export default router
