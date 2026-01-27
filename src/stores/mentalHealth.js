import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useMentalHealthStore = defineStore('mentalHealth', {
  state: () => ({
    practices: []
  }),

  actions: {
    loadPractices() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `mentalPractices_${userStore.userId}`
        this.practices = JSON.parse(localStorage.getItem(key)) || []
      }
    },

    addPractice(practice) {
      const newPractice = {
        id: Date.now(),
        ...practice,
        date: practice.date || new Date().toISOString()
      }
      this.practices.unshift(newPractice)
      this.saveToStorage()
    },

    deletePractice(id) {
      this.practices = this.practices.filter(p => p.id !== id)
      this.saveToStorage()
    },

    saveToStorage() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `mentalPractices_${userStore.userId}`
        localStorage.setItem(key, JSON.stringify(this.practices))
      }
    },

    clearData() {
      this.practices = []
    },

    $reset() {
      this.practices = []
    }
  }
})
