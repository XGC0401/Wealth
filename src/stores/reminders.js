import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useRemindersStore = defineStore('reminders', {
  state: () => ({
    reminders: []
  }),

  actions: {
    loadReminders() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `reminders_${userStore.userId}`
        this.reminders = JSON.parse(localStorage.getItem(key)) || []
      }
    },

    addReminder(reminder) {
      const newReminder = {
        id: Date.now(),
        ...reminder,
        createdAt: new Date().toISOString()
      }
      this.reminders.push(newReminder)
      this.saveToStorage()
    },

    deleteReminder(id) {
      this.reminders = this.reminders.filter(r => r.id !== id)
      this.saveToStorage()
    },

    toggleReminder(id) {
      const reminder = this.reminders.find(r => r.id === id)
      if (reminder) {
        reminder.active = !reminder.active
        this.saveToStorage()
      }
    },

    saveToStorage() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `reminders_${userStore.userId}`
        localStorage.setItem(key, JSON.stringify(this.reminders))
      }
    },

    clearData() {
      this.reminders = []
    },

    $reset() {
      this.reminders = []
    }
  }
})
