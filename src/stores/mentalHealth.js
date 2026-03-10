import { defineStore } from 'pinia'
import { useUserStore } from './user'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useMentalHealthStore = defineStore('mentalHealth', {
  state: () => ({
    practices: []
  }),

  actions: {
    async loadPractices() {
      const userStore = useUserStore()
      if (userStore.userId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/mental-health/${userStore.userId}`)
          this.practices = response.data || []
        } catch (error) {
          console.error('載入心理健康紀錄失敗:', error)
          this.practices = []
        }
      }
    },

    async addPractice(practice) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/mental-health`, {
          userId: userStore.userId,
          name: practice.name,
          type: practice.type,
          duration: practice.duration || 0,
          mood: practice.mood || null,
          notes: practice.notes || '',
          date: practice.date || new Date().toISOString()
        })

        this.practices.unshift(response.data.practice)
        return { success: true }
      } catch (error) {
        console.error('新增心理健康紀錄失敗:', error)
        return { success: false, message: error.response?.data?.message || '新增失敗' }
      }
    },

    async deletePractice(id) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        await axios.delete(`${API_BASE_URL}/api/mental-health/${id}`, {
          params: { userId: userStore.userId }
        })

        this.practices = this.practices.filter(p => p.id !== id)
        return { success: true }
      } catch (error) {
        console.error('刪除心理健康紀錄失敗:', error)
        return { success: false, message: error.response?.data?.message || '刪除失敗' }
      }
    },

    saveToStorage() {
      return
    },

    clearData() {
      this.practices = []
    },

    $reset() {
      this.practices = []
    }
  }
})
