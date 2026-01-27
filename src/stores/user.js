import { defineStore } from 'pinia'

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
      // Mock login - replace with actual API call
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Get or create user ID based on username (simulating a real user database)
        const existingUsersKey = 'registered_users'
        const existingUsers = JSON.parse(localStorage.getItem(existingUsersKey)) || {}
        
        // Check if user exists, if not return error
        if (!existingUsers[credentials.username]) {
          return { success: false, message: '使用者名稱或密碼錯誤' }
        }
        
        // Use the existing user data
        const mockUser = existingUsers[credentials.username]
        const mockToken = 'mock-token-' + Date.now()
        
        this.user = mockUser
        this.token = mockToken
        
        localStorage.setItem('user', JSON.stringify(mockUser))
        localStorage.setItem('token', mockToken)
        
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    async register(userData) {
      // Mock registration - replace with actual API call
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Store users in a registry (simulating a real user database)
        const existingUsersKey = 'registered_users'
        const existingUsers = JSON.parse(localStorage.getItem(existingUsersKey)) || {}
        
        // Check if username already exists
        if (existingUsers[userData.username]) {
          return { success: false, message: '使用者名稱已存在' }
        }
        
        // Create unique user ID based on username to ensure consistency
        const mockUser = {
          id: `user_${userData.username}_${Date.now()}`,
          username: userData.username,
          email: userData.email,
          name: userData.name
        }
        
        // Save to user registry
        existingUsers[userData.username] = mockUser
        localStorage.setItem(existingUsersKey, JSON.stringify(existingUsers))
        
        const mockToken = 'mock-token-' + Date.now()
        
        this.user = mockUser
        this.token = mockToken
        
        localStorage.setItem('user', JSON.stringify(mockUser))
        localStorage.setItem('token', mockToken)
        
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    async logout() {
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
    }
  }
})
