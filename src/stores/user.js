import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
    userId: (state) => state.user?.id || null
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          username: credentials.username,
          password: credentials.password
        })
        
        if (response.data.success) {
          this.user = response.data.user
          this.token = response.data.token
          
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('token', response.data.token)
          
          return { success: true }
        }
        
        return { success: false, message: response.data.message }
      } catch (error) {
        if (error.response?.data?.message) {
          return { success: false, message: error.response.data.message }
        }
        return { success: false, message: this.$i18n ? this.$i18n.t('common.connectionError') : '無法連接到伺服器' }
      }
    },

    async register(userData) {
      try {
        const response = await axios.post(`${API_URL}/auth/register`, {
          username: userData.username,
          email: userData.email,
          name: userData.name,
          password: userData.password
        })
        
        if (response.data.success) {
          this.user = response.data.user
          this.token = response.data.token
          
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('token', response.data.token)
          
          return { success: true }
        }
        
        return { success: false, message: response.data.message }
      } catch (error) {
        if (error.response?.data?.message) {
          return { success: false, message: error.response.data.message }
        }
        return { success: false, message: this.$i18n ? this.$i18n.t('common.connectionError') : '無法連接到伺服器' }
      }
    },

    async logout() {
      // Notify server to clear session
      try {
        if (this.token) {
          await axios.post(`${API_URL}/auth/logout`, { token: this.token })
        }
      } catch (error) {
        console.warn('Error logging out from server:', error)
      }
      
      // Clear user data
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      // Clear all stores
      try {
        const { useActivitiesStore } = await import('./activities')
        const { useDietStore } = await import('./diet')
        const { useMentalHealthStore } = await import('./mentalHealth')
        const { useRemindersStore } = await import('./reminders')
        const { useProfileStore } = await import('./profile')
        
        useActivitiesStore().$reset()
        useDietStore().$reset()
        useMentalHealthStore().$reset()
        useRemindersStore().$reset()
        useProfileStore().$reset()
      } catch (e) {
        // Stores might not be initialized
        console.warn('Error clearing stores:', e)
      }
    },

    async updateProfile(updateData) {
      try {
        console.log('Updating profile with data:', { ...updateData, profilePicture: updateData.profilePicture ? 'base64_data' : null })
        const response = await axios.put(`${API_URL}/auth/update-profile`, {
          token: this.token,
          ...updateData
        })
        
        console.log('Update response:', response.data)
        
        if (response.data.success) {
          // Update local user data
          this.user = response.data.user
          localStorage.setItem('user', JSON.stringify(response.data.user))
          
          return { success: true, message: response.data.message }
        }
        
        return { success: false, message: response.data.message }
      } catch (error) {
        console.error('Update profile error:', error)
        if (error.response?.data?.message) {
          return { success: false, message: error.response.data.message }
        }
        return { success: false, message: this.$i18n ? this.$i18n.t('common.updateFailed') : '更新失敗' }
      }
    }
  }
})
