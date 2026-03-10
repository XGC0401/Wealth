import { defineStore } from 'pinia'
import { useUserStore } from './user'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useRemindersStore = defineStore('reminders', {
  state: () => ({
    reminders: []
  }),

  actions: {
    async loadReminders() {
      const userStore = useUserStore()
      if (userStore.userId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/reminders/${userStore.userId}`)
          this.reminders = response.data || []
        } catch (error) {
          console.error('載入提醒失敗:', error)
          this.reminders = []
        }
      }
    },

    async addReminder(reminder) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/reminders`, {
          userId: userStore.userId,
          title: reminder.title,
          description: reminder.description,
          type: reminder.type,
          time: reminder.time,
          active: reminder.active !== false
        })

        this.reminders.unshift(response.data.reminder)
        return { success: true }
      } catch (error) {
        console.error('新增提醒失敗:', error)
        return { success: false, message: error.response?.data?.message || '新增失敗' }
      }
    },

    async deleteReminder(id) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        await axios.delete(`${API_BASE_URL}/api/reminders/${id}`, {
          params: { userId: userStore.userId }
        })

        this.reminders = this.reminders.filter(r => r.id !== id)
        return { success: true }
      } catch (error) {
        console.error('刪除提醒失敗:', error)
        return { success: false, message: error.response?.data?.message || '刪除失敗' }
      }
    },

    async toggleReminder(id) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const response = await axios.put(`${API_BASE_URL}/api/reminders/${id}/toggle`, {
          userId: userStore.userId
        })

        const index = this.reminders.findIndex(r => r.id === id)
        if (index !== -1) {
          this.reminders[index] = response.data.reminder
        }
        return { success: true }
      } catch (error) {
        console.error('切換提醒狀態失敗:', error)
        return { success: false, message: error.response?.data?.message || '更新失敗' }
      }
    },

    saveToStorage() {
      return
    },

    clearData() {
      this.reminders = []
    },

    $reset() {
      this.reminders = []
    }
  }
})
