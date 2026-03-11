import { defineStore } from 'pinia'
import { useUserStore } from './user'
import i18n from '@/i18n'

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
      const t = i18n.global.t
      if (bmi < 18.5) return t('profile.bmiUnderweight')
      if (bmi < 24) return t('profile.bmiNormal')
      if (bmi < 27) return t('profile.bmiOverweight')
      return t('profile.bmiObese')
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
    loadProfile() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const profileKey = `userProfile_${userStore.userId}`
        const historyKey = `weightHistory_${userStore.userId}`
        const savedProfile = localStorage.getItem(profileKey)
        const savedHistory = localStorage.getItem(historyKey)
        
        if (savedProfile) {
          this.profile = JSON.parse(savedProfile)
        }
        if (savedHistory) {
          this.weightHistory = JSON.parse(savedHistory)
        }
      }
    },

    updateProfile(profileData) {
      this.profile = { ...this.profile, ...profileData }
      this.saveToStorage()
    },

    addWeightEntry(weight) {
      const entry = {
        id: Date.now(),
        weight: weight,
        date: new Date().toISOString()
      }
      this.weightHistory.unshift(entry)
      this.profile.weight = weight
      
      // Keep only last 30 entries
      if (this.weightHistory.length > 30) {
        this.weightHistory = this.weightHistory.slice(0, 30)
      }
      
      this.saveToStorage()
    },

    deleteWeightEntry(id) {
      this.weightHistory = this.weightHistory.filter(w => w.id !== id)
      this.saveToStorage()
    },

    saveToStorage() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const profileKey = `userProfile_${userStore.userId}`
        const historyKey = `weightHistory_${userStore.userId}`
        localStorage.setItem(profileKey, JSON.stringify(this.profile))
        localStorage.setItem(historyKey, JSON.stringify(this.weightHistory))
      }
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
