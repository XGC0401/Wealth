import { defineStore } from 'pinia'
import { useUserStore } from './user'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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
    async loadMeals() {
      const userStore = useUserStore()
      if (userStore.userId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/diet/${userStore.userId}`)
          this.meals = response.data || []
        } catch (error) {
          console.error('載入飲食紀錄失敗:', error)
          this.meals = []
        }
      }
    },

    async addMeal(meal) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/diet`, {
          userId: userStore.userId,
          mealType: meal.mealType,
          name: meal.name,
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          notes: meal.notes || '',
          date: meal.date || new Date().toISOString()
        })

        this.meals.unshift(response.data.meal)
        return { success: true }
      } catch (error) {
        console.error('新增飲食紀錄失敗:', error)
        return { success: false, message: error.response?.data?.message || '新增失敗' }
      }
    },

    async deleteMeal(id) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        await axios.delete(`${API_BASE_URL}/api/diet/${id}`, {
          params: { userId: userStore.userId }
        })

        this.meals = this.meals.filter(m => m.id !== id)
        return { success: true }
      } catch (error) {
        console.error('刪除飲食紀錄失敗:', error)
        return { success: false, message: error.response?.data?.message || '刪除失敗' }
      }
    },

    saveToStorage() {
      return
    },

    clearData() {
      this.meals = []
    },

    $reset() {
      this.meals = []
    }
  }
})
