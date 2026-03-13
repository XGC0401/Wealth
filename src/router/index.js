import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
          path: 'random-generator',
          name: 'RandomGenerator',
          component: () => import('@/views/RandomGenerator.vue')
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
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (!requiresAuth && userStore.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next('/')
  } else {
    // Load user data when navigating to authenticated pages
    if (requiresAuth && userStore.isLoggedIn) {
      try {
        const { useActivitiesStore } = await import('@/stores/activities')
        const { useDietStore } = await import('@/stores/diet')
        const { useMentalHealthStore } = await import('@/stores/mentalHealth')
        const { useRemindersStore } = await import('@/stores/reminders')
        const { useProfileStore } = await import('@/stores/profile')
        
        const activitiesStore = useActivitiesStore()
        const dietStore = useDietStore()
        const mentalHealthStore = useMentalHealthStore()
        const remindersStore = useRemindersStore()
        const profileStore = useProfileStore()
        
        // Always reload data to ensure it's for the current user
        activitiesStore.loadActivities()
        dietStore.loadMeals()
        mentalHealthStore.loadPractices()
        remindersStore.loadReminders()
        profileStore.loadProfile()
      } catch (e) {
        console.warn('Error loading user data:', e)
      }
    }
    next()
  }
})

export default router
