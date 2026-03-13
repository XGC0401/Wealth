import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useDietStore = defineStore('diet', {
  state: () => ({
    meals: []
  }),

  getters: {
    todayMeals: (state) => {
      const today = new Date().toDateString()
      return state.meals.filter(m => new Date(m.date).toDateString() === today)
    },
    todayCalories: (state) => {
      const today = new Date().toDateString()
      return state.meals
        .filter(m => new Date(m.date).toDateString() === today)
        .reduce((sum, m) => sum + (m.calories || 0), 0)
    }
  },

  actions: {
    loadMeals() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `meals_${userStore.userId}`
        let loaded = JSON.parse(localStorage.getItem(key)) || []
        // Migrate old Chinese mealType values to English keys
        // Map both Chinese and English to keys for migration
        const typeMap = {
          '早餐': 'breakfast',
          '午餐': 'lunch',
          '晚餐': 'dinner',
          '點心': 'snack',
          'breakfast': 'breakfast',
          'lunch': 'lunch',
          'dinner': 'dinner',
          'snack': 'snack'
        }
        loaded = loaded.map(meal => {
          if (typeMap[meal.mealType]) {
            return { ...meal, mealType: typeMap[meal.mealType] }
          }
          return meal
        })
        this.meals = loaded
        // Save migrated data back to storage
        localStorage.setItem(key, JSON.stringify(this.meals))
      }
    },

    addMeal(meal) {
      const newMeal = {
        id: Date.now(),
        ...meal,
        date: meal.date || new Date().toISOString()
      }
      this.meals.unshift(newMeal)
      this.saveToStorage()
    },

    deleteMeal(id) {
      this.meals = this.meals.filter(m => m.id !== id)
      this.saveToStorage()
    },

    saveToStorage() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `meals_${userStore.userId}`
        localStorage.setItem(key, JSON.stringify(this.meals))
      }
    },

    clearData() {
      this.meals = []
    },

    $reset() {
      this.meals = []
    }
  }
})
