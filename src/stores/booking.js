import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useRemindersStore } from './reminders'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    bookings: [],
    userLocation: null,
    hospitals: [],
    loading: false,
    error: null,
    lastFetchTime: null
  }),

  getters: {
    sortedHospitals: (state) => (sortBy) => {
      // Update distances if user location is available
      let hospitals = state.hospitals.map(h => ({
        ...h,
        distance: state.userLocation 
          ? calculateDistance(
              state.userLocation.lat, 
              state.userLocation.lng, 
              h.coordinates.lat, 
              h.coordinates.lng
            )
          : h.distance
      }))
      
      switch (sortBy) {
        case 'nearest':
          return hospitals.sort((a, b) => a.distance - b.distance)
        case 'rating':
          return hospitals.sort((a, b) => b.rating - a.rating)
        case 'leastPeople':
          return hospitals.sort((a, b) => a.currentWaitingPeople - b.currentWaitingPeople)
        default:
          return hospitals
      }
    },

    getHospitalById: (state) => (id) => {
      return state.hospitals.find(h => h.id === id)
    },

    getUserBookings: (state) => {
      return state.bookings
    }
  },

  actions: {
    setUserLocation(location) {
      this.userLocation = location
    },
    
    async loadBookings() {
      const userStore = useUserStore()
      if (userStore.userId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/bookings/${userStore.userId}`)
          this.bookings = response.data || []
        } catch (error) {
          console.error('載入預約失敗:', error)
          this.bookings = []
        }
      }
    },

    async createBooking(booking) {
      const userStore = useUserStore()
      const remindersStore = useRemindersStore()

      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/api/bookings`, {
          userId: userStore.userId,
          hospitalId: booking.hospitalId,
          hospitalName: booking.hospitalName,
          department: booking.department,
          date: booking.date,
          time: booking.time,
          patientName: booking.patientName,
          phone: booking.phone,
          notes: booking.notes || ''
        })

        const newBooking = response.data.booking
        this.bookings.unshift(newBooking)

        const hospital = this.getHospitalById(booking.hospitalId)
        if (hospital) {
          await remindersStore.addReminder({
            title: `${hospital.name}`,
            description: `${booking.department}\n${booking.date}\n${booking.time}\n${hospital.address}`,
            time: booking.time,
            type: 'appointment',
            active: true
          })
        }

        return { success: true, booking: newBooking }
      } catch (error) {
        console.error('建立預約失敗:', error)
        return { success: false, message: error.response?.data?.message || '建立預約失敗' }
      }
    },

    async cancelBooking(bookingId) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        const response = await axios.put(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
          userId: userStore.userId
        })

        const index = this.bookings.findIndex(b => b.id === bookingId)
        if (index !== -1) {
          this.bookings[index] = response.data.booking
        }
        return { success: true }
      } catch (error) {
        console.error('取消預約失敗:', error)
        return { success: false, message: error.response?.data?.message || '取消失敗' }
      }
    },

    async deleteBooking(bookingId) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, message: '使用者未登入' }
      }

      try {
        await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`, {
          params: { userId: userStore.userId }
        })

        this.bookings = this.bookings.filter(b => b.id !== bookingId)
        return { success: true }
      } catch (error) {
        console.error('刪除預約失敗:', error)
        return { success: false, message: error.response?.data?.message || '刪除失敗' }
      }
    },

    saveToStorage() {
      return
    },

    async fetchHospitalsFromAPI() {
      // Check if we have cached data (less than 1 hour old)
      const ONE_HOUR = 60 * 60 * 1000
      if (this.lastFetchTime && Date.now() - this.lastFetchTime < ONE_HOUR && this.hospitals.length > 0) {
        return // Use cached data
      }

      this.loading = true
      this.error = null
      
      try {
        // Hong Kong bounding box - tightened to exclude mainland China border areas
        // Reduced northern boundary from 22.58 to 22.52 to avoid Shenzhen
        const bbox = '22.15,113.83,22.52,114.41'
        
        // Build Overpass API query for hospitals and clinics in Hong Kong
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="hospital"](${bbox});
            node["amenity"="clinic"](${bbox});
            way["amenity"="hospital"](${bbox});
            way["amenity"="clinic"](${bbox});
          );
          out center;
        `
        
        const response = await axios.post(
          'https://overpass-api.de/api/interpreter',
          query,
          {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
        )
        
        // Transform API response to internal format
        const hospitals = response.data.elements
          .filter(item => {
            // Filter out mainland China hospitals/clinics
            const tags = item.tags || {}
            const country = tags['addr:country'] || tags['is_in:country'] || ''
            const name = tags.name || tags['name:zh'] || ''
            const address = tags['addr:full'] || tags['addr:street'] || ''
            
            // Exclude if explicitly marked as mainland China
            if (country.match(/CN|中国|中國|China/) && !country.match(/HK|Hong Kong|香港/)) {
              return false
            }
            
            // Exclude if name or address contains mainland city names
            const mainlandKeywords = ['深圳', '广州', '东莞', 'Shenzhen', 'Guangzhou', 'Dongguan']
            if (mainlandKeywords.some(keyword => name.includes(keyword) || address.includes(keyword))) {
              return false
            }
            
            return true
          })
          .map((item, index) => {
          const isHospital = item.tags?.amenity === 'hospital'
          const lat = item.lat || item.center?.lat
          const lon = item.lon || item.center?.lon
          
          return {
            id: item.id || Date.now() + index,
            name: item.tags?.['name:zh'] || item.tags?.name || (isHospital ? 'Hospital' : 'Clinic'),
            type: isHospital ? 'hospital' : 'clinic',
            address: item.tags?.['addr:full'] || item.tags?.['addr:street'] || 'Address not provided',
            phone: item.tags?.phone || item.tags?.['contact:phone'] || 'Phone not provided',
            rating: Math.round((4.0 + Math.random() * 0.5) * 100) / 100, // Simulated rating 4.0-4.5, rounded to 2 decimals
            currentWaitingPeople: Math.floor(Math.random() * 60) + 10,
            distance: 0, // Will be calculated based on user location
            image: 'https://img.freepik.com/free-photo/hospital-building_1127-3375.jpg',
            openTime: item.tags?.['opening_hours:start'] || '08:00',
            closeTime: item.tags?.['opening_hours:end'] || '20:00',
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            departments: isHospital 
              ? ['Internal Medicine', 'Surgery', 'Emergency', 'Orthopedics', 'Pediatrics'] 
              : ['Family Medicine', 'Internal Medicine', 'Pediatrics'],
            coordinates: { lat, lng: lon }
          }
        }).filter(h => h.coordinates.lat && h.coordinates.lng) // Remove items without coordinates
        
        this.hospitals = hospitals
        this.lastFetchTime = Date.now()
        
        console.log(`Successfully loaded ${hospitals.length} hospitals and clinics`)
      } catch (error) {
        console.error('Failed to load hospital data:', error)
        this.error = `Unable to load hospital data: ${error.message}`
        
        // Fallback: Use minimal sample data if API fails
        this.hospitals = [
          {
            id: 1,
            name: 'Queen Mary Hospital',
            type: 'hospital',
            address: '102 Pok Fu Lam Road, Pok Fu Lam, Hong Kong',
            phone: '+852 2255 3838',
            rating: 4.6,
            currentWaitingPeople: 52,
            distance: 0,
            image: 'https://img.freepik.com/free-photo/hospital-building_1127-3375.jpg',
            openTime: '08:00',
            closeTime: '22:00',
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            departments: ['Internal Medicine', 'Surgery', 'Emergency', 'Orthopedics', 'Cardiology'],
            coordinates: { lat: 22.2697, lng: 114.1350 }
          }
        ]
      } finally {
        this.loading = false
      }
    },

    updateWaitingPeople() {
      // Simulate real-time update of waiting people
      this.hospitals.forEach(hospital => {
        const change = Math.floor(Math.random() * 10) - 5
        hospital.currentWaitingPeople = Math.max(0, hospital.currentWaitingPeople + change)
      })
    },

    clearData() {
      this.bookings = []
    },

    $reset() {
      this.bookings = []
    }
  }
})
