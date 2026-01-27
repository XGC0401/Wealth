import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataStore = defineStore('data', () => {
  const activities = ref([])
  const meals = ref([])
  const mentalHealthLogs = ref([])
  const wellnessPlans = ref([])
  const reminders = ref([])
  const communityPosts = ref([])
  const chatMessages = ref([])

  // Activities
  const addActivity = (activity) => {
    activities.value.unshift({
      id: Date.now(),
      ...activity,
      timestamp: new Date().toISOString()
    })
    saveToLocalStorage('activities', activities.value)
  }

  // Diet
  const addMeal = (meal) => {
    meals.value.unshift({
      id: Date.now(),
      ...meal,
      timestamp: new Date().toISOString()
    })
    saveToLocalStorage('meals', meals.value)
  }

  // Mental Health
  const addMentalHealthLog = (log) => {
    mentalHealthLogs.value.unshift({
      id: Date.now(),
      ...log,
      timestamp: new Date().toISOString()
    })
    saveToLocalStorage('mentalHealthLogs', mentalHealthLogs.value)
  }

  // Wellness Plans
  const addWellnessPlan = (plan) => {
    wellnessPlans.value.push({
      id: Date.now(),
      ...plan,
      createdAt: new Date().toISOString()
    })
    saveToLocalStorage('wellnessPlans', wellnessPlans.value)
  }

  const updateWellnessPlan = (id, updates) => {
    const index = wellnessPlans.value.findIndex(p => p.id === id)
    if (index !== -1) {
      wellnessPlans.value[index] = { ...wellnessPlans.value[index], ...updates }
      saveToLocalStorage('wellnessPlans', wellnessPlans.value)
    }
  }

  // Reminders
  const addReminder = (reminder) => {
    reminders.value.push({
      id: Date.now(),
      ...reminder
    })
    saveToLocalStorage('reminders', reminders.value)
  }

  const removeReminder = (id) => {
    reminders.value = reminders.value.filter(r => r.id !== id)
    saveToLocalStorage('reminders', reminders.value)
  }

  // Community
  const addCommunityPost = (post) => {
    communityPosts.value.unshift({
      id: Date.now(),
      ...post,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    })
    saveToLocalStorage('communityPosts', communityPosts.value)
  }

  const likeCommunityPost = (id) => {
    const post = communityPosts.value.find(p => p.id === id)
    if (post) {
      post.likes++
      saveToLocalStorage('communityPosts', communityPosts.value)
    }
  }

  const addCommentToPost = (postId, comment) => {
    const post = communityPosts.value.find(p => p.id === postId)
    if (post) {
      post.comments.push({
        id: Date.now(),
        ...comment,
        timestamp: new Date().toISOString()
      })
      saveToLocalStorage('communityPosts', communityPosts.value)
    }
  }

  // Chat
  const addChatMessage = (message) => {
    chatMessages.value.push({
      id: Date.now(),
      ...message,
      timestamp: new Date().toISOString()
    })
    saveToLocalStorage('chatMessages', chatMessages.value)
  }

  // Helper functions
  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data))
  }

  const loadFromLocalStorage = () => {
    const keys = ['activities', 'meals', 'mentalHealthLogs', 'wellnessPlans', 'reminders', 'communityPosts', 'chatMessages']
    keys.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        switch(key) {
          case 'activities': activities.value = JSON.parse(data); break;
          case 'meals': meals.value = JSON.parse(data); break;
          case 'mentalHealthLogs': mentalHealthLogs.value = JSON.parse(data); break;
          case 'wellnessPlans': wellnessPlans.value = JSON.parse(data); break;
          case 'reminders': reminders.value = JSON.parse(data); break;
          case 'communityPosts': communityPosts.value = JSON.parse(data); break;
          case 'chatMessages': chatMessages.value = JSON.parse(data); break;
        }
      }
    })
  }

  return {
    activities,
    meals,
    mentalHealthLogs,
    wellnessPlans,
    reminders,
    communityPosts,
    chatMessages,
    addActivity,
    addMeal,
    addMentalHealthLog,
    addWellnessPlan,
    updateWellnessPlan,
    addReminder,
    removeReminder,
    addCommunityPost,
    likeCommunityPost,
    addCommentToPost,
    addChatMessage,
    loadFromLocalStorage
  }
})
