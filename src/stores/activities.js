import { defineStore } from 'pinia'
import { useUserStore } from './user'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    activities: []
  }),

  init() {
    const userStore = useUserStore()
    if (userStore.userId) {
      this.loadActivities()
    }
  },

  getters: {
    todayActivities: (state) => {
      const today = new Date().toDateString()
      return state.activities.filter(a => new Date(a.date).toDateString() === today)
    },
    totalActivities: (state) => state.activities.length
  },

  actions: {
    async loadActivities() {
      const userStore = useUserStore()
      if (userStore.userId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/activities/${userStore.userId}`)
          this.activities = response.data || []
        } catch (error) {
          console.error('載入活動失敗:', error)
          this.activities = []
        }
      }
    },

    async addActivity(activity) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/activities`, {
          userId: userStore.userId,
          name: activity.name,
          type: activity.type,
          duration: activity.duration,
          calories: activity.calories || 0,
          date: activity.date || new Date().toISOString(),
          notes: activity.notes || ''
        })

        this.activities.unshift(response.data.activity)
        return { success: true }
      } catch (error) {
        console.error('新增活動失敗:', error)
        return { success: false, message: error.response?.data?.message || '新增活動失敗' }
      }
    },

    async deleteActivity(id) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        await axios.delete(`${API_BASE_URL}/api/activities/${id}`, {
          params: { userId: userStore.userId }
        })

        this.activities = this.activities.filter(a => a.id !== id)
        return { success: true }
      } catch (error) {
        console.error('刪除活動失敗:', error)
        return { success: false, message: error.response?.data?.message || '刪除活動失敗' }
      }
    },

    async updateActivity(id, updates) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const current = this.activities.find(a => a.id === id)
        if (!current) {
          return { success: false, message: '活動不存在' }
        }

        const response = await axios.put(`${API_BASE_URL}/api/activities/${id}`, {
          userId: userStore.userId,
          name: updates.name ?? current.name,
          type: updates.type ?? current.type,
          duration: updates.duration ?? current.duration,
          calories: updates.calories ?? current.calories,
          date: updates.date ?? current.date,
          notes: updates.notes ?? current.notes
        })

        const index = this.activities.findIndex(a => a.id === id)
        if (index !== -1) {
          this.activities[index] = response.data.activity
        }
        return { success: true }
      } catch (error) {
        console.error('更新活動失敗:', error)
        return { success: false, message: error.response?.data?.message || '更新活動失敗' }
      }
    },

    saveToStorage() {
      return
    },

    clearData() {
      this.activities = []
    },

    $reset() {
      this.activities = []
    }
  }
})
