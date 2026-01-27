import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Activities from '../views/Activities.vue'
import Diet from '../views/Diet.vue'
import MentalHealth from '../views/MentalHealth.vue'
import WellnessPlan from '../views/WellnessPlan.vue'
import Suggestions from '../views/Suggestions.vue'
import ChatRoom from '../views/ChatRoom.vue'
import Community from '../views/Community.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: Activities,
    meta: { requiresAuth: true }
  },
  {
    path: '/diet',
    name: 'Diet',
    component: Diet,
    meta: { requiresAuth: true }
  },
  {
    path: '/mental-health',
    name: 'MentalHealth',
    component: MentalHealth,
    meta: { requiresAuth: true }
  },
  {
    path: '/wellness-plan',
    name: 'WellnessPlan',
    component: WellnessPlan,
    meta: { requiresAuth: true }
  },
  {
    path: '/suggestions',
    name: 'Suggestions',
    component: Suggestions,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'ChatRoom',
    component: ChatRoom,
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: Community,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
