import { defineStore } from 'pinia'
import { useUserStore } from './user'

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
    loadActivities() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `activities_${userStore.userId}`
        this.activities = JSON.parse(localStorage.getItem(key)) || []
      }
    },

    addActivity(activity) {
      const newActivity = {
        id: Date.now(),
        ...activity,
        date: activity.date || new Date().toISOString()
      }
      this.activities.unshift(newActivity)
      this.saveToStorage()
    },

    deleteActivity(id) {
      this.activities = this.activities.filter(a => a.id !== id)
      this.saveToStorage()
    },

    updateActivity(id, updates) {
      const index = this.activities.findIndex(a => a.id === id)
      if (index !== -1) {
        this.activities[index] = { ...this.activities[index], ...updates }
        this.saveToStorage()
      }
    },

    saveToStorage() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `activities_${userStore.userId}`
        localStorage.setItem(key, JSON.stringify(this.activities))
      }
    },

    clearData() {
      this.activities = []
    },

    $reset() {
      this.activities = []
    }
  }
})
