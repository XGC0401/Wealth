import { defineStore } from 'pinia'
import { useUserStore } from './user'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: {
      weight: null,
      height: null,
      age: null,
      gender: '',
      targetWeight: null,
      targetDate: null,
      goal: '',
      dailyCalorieGoal: 2000,
      bmi: null
    },
    weightHistory: []
  }),

  getters: {
    currentBMI: (state) => {
      if (state.profile.weight && state.profile.height) {
        const heightInMeters = state.profile.height / 100
        return (state.profile.weight / (heightInMeters * heightInMeters)).toFixed(1)
      }
      return null
    },
    
    bmiStatus: (state) => {
      const bmi = state.currentBMI
      if (!bmi) return null
      if (bmi < 18.5) return '過輕'
      if (bmi < 24) return '正常'
      if (bmi < 27) return '過重'
      return '肥胖'
    },

    weightToLose: (state) => {
      if (state.profile.weight && state.profile.targetWeight) {
        return (state.profile.weight - state.profile.targetWeight).toFixed(1)
      }
      return null
    },

    daysRemaining: (state) => {
      if (!state.profile.targetDate) return null
      const target = new Date(state.profile.targetDate)
      const today = new Date()
      const diff = target - today
      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    },

    weeklyWeightGoal: (state) => {
      const days = state.daysRemaining
      const weightDiff = state.weightToLose
      if (!days || !weightDiff || days <= 0) return null
      const weeks = days / 7
      return (weightDiff / weeks).toFixed(2)
    }
  },

  actions: {
    async loadProfile() {
      const userStore = useUserStore()
      if (userStore.userId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/profile/${userStore.userId}`)
          if (response.data.profile) {
            this.profile = {
              ...this.profile,
              ...response.data.profile
            }
          }
          this.weightHistory = response.data.weightHistory || []
        } catch (error) {
          console.error('載入個人資料失敗:', error)
        }
      }
    },

    async updateProfile(profileData) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const payload = { ...this.profile, ...profileData }
        const response = await axios.put(`${API_BASE_URL}/api/profile/${userStore.userId}`, payload)
        this.profile = {
          ...this.profile,
          ...response.data.profile
        }
        return { success: true }
      } catch (error) {
        console.error('更新個人資料失敗:', error)
        return { success: false, message: error.response?.data?.message || '更新失敗' }
      }
    },

    async addWeightEntry(weight) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/profile/${userStore.userId}/weight-history`, {
          weight
        })

        this.weightHistory.unshift(response.data.entry)
        this.profile.weight = weight

        if (this.weightHistory.length > 30) {
          this.weightHistory = this.weightHistory.slice(0, 30)
        }

        return { success: true }
      } catch (error) {
        console.error('新增體重紀錄失敗:', error)
        return { success: false, message: error.response?.data?.message || '新增失敗' }
      }
    },

    async deleteWeightEntry(id) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        await axios.delete(`${API_BASE_URL}/api/profile/${userStore.userId}/weight-history/${id}`)
        this.weightHistory = this.weightHistory.filter(w => w.id !== id)
        return { success: true }
      } catch (error) {
        console.error('刪除體重紀錄失敗:', error)
        return { success: false, message: error.response?.data?.message || '刪除失敗' }
      }
    },

    saveToStorage() {
      return
    },

    clearData() {
      this.profile = {
        weight: null,
        height: null,
        age: null,
        gender: '',
        targetWeight: null,
        targetDate: null,
        goal: '',
        dailyCalorieGoal: 2000,
        bmi: null
      }
      this.weightHistory = []
    },

    $reset() {
      this.profile = {
        weight: null,
        height: null,
        age: null,
        gender: '',
        targetWeight: null,
        targetDate: null,
        goal: '',
        dailyCalorieGoal: 2000,
        bmi: null
      }
      this.weightHistory = []
    }
  }
})
