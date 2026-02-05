import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useRemindersStore } from './reminders'
import axios from 'axios'

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
    
    loadBookings() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `bookings_${userStore.userId}`
        this.bookings = JSON.parse(localStorage.getItem(key)) || []
      }
    },

    createBooking(booking) {
      const userStore = useUserStore()
      const remindersStore = useRemindersStore()
      
      const newBooking = {
        id: Date.now(),
        userId: userStore.userId,
        ...booking,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
      
      this.bookings.push(newBooking)
      this.saveToStorage()

      // Create a reminder for the booking
      const hospital = this.getHospitalById(booking.hospitalId)
      if (hospital) {
        remindersStore.addReminder({
          title: `醫院預約：${hospital.name}`,
          description: `預約科別：${booking.department}\n預約日期：${booking.date}\n預約時間：${booking.time}\n地點：${hospital.address}`,
          time: `${booking.date} ${booking.time}`,
          type: 'appointment',
          active: true
        })
      }

      return newBooking
    },

    cancelBooking(bookingId) {
      const booking = this.bookings.find(b => b.id === bookingId)
      if (booking) {
        booking.status = 'cancelled'
        this.saveToStorage()
      }
    },

    deleteBooking(bookingId) {
      this.bookings = this.bookings.filter(b => b.id !== bookingId)
      this.saveToStorage()
    },

    saveToStorage() {
      const userStore = useUserStore()
      if (userStore.userId) {
        const key = `bookings_${userStore.userId}`
        localStorage.setItem(key, JSON.stringify(this.bookings))
      }
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
            name: item.tags?.['name:zh'] || item.tags?.name || (isHospital ? '醫院' : '診所'),
            type: isHospital ? 'hospital' : 'clinic',
            address: item.tags?.['addr:full'] || item.tags?.['addr:street'] || '地址未提供',
            phone: item.tags?.phone || item.tags?.['contact:phone'] || '電話未提供',
            rating: Math.round((4.0 + Math.random() * 0.5) * 100) / 100, // Simulated rating 4.0-4.5, rounded to 2 decimals
            currentWaitingPeople: Math.floor(Math.random() * 60) + 10,
            distance: 0, // Will be calculated based on user location
            image: 'https://img.freepik.com/free-photo/hospital-building_1127-3375.jpg',
            openTime: item.tags?.['opening_hours:start'] || '08:00',
            closeTime: item.tags?.['opening_hours:end'] || '20:00',
            workingDays: ['一', '二', '三', '四', '五', '六', '日'],
            departments: isHospital 
              ? ['內科', '外科', '急診科', '骨科', '兒科'] 
              : ['家庭醫學科', '內科', '兒科'],
            coordinates: { lat, lng: lon }
          }
        }).filter(h => h.coordinates.lat && h.coordinates.lng) // Remove items without coordinates
        
        this.hospitals = hospitals
        this.lastFetchTime = Date.now()
        
        console.log(`成功載入 ${hospitals.length} 間醫院和診所`)
      } catch (error) {
        console.error('載入醫院數據失敗:', error)
        this.error = `無法載入醫院數據: ${error.message}`
        
        // Fallback: Use minimal sample data if API fails
        this.hospitals = [
          {
            id: 1,
            name: '香港瑪麗醫院',
            type: 'hospital',
            address: '香港薄扶林薄扶林道102號',
            phone: '+852 2255 3838',
            rating: 4.6,
            currentWaitingPeople: 52,
            distance: 0,
            image: 'https://img.freepik.com/free-photo/hospital-building_1127-3375.jpg',
            openTime: '08:00',
            closeTime: '22:00',
            workingDays: ['一', '二', '三', '四', '五', '六', '日'],
            departments: ['內科', '外科', '急診科', '骨科', '心臟科'],
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
