import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useRemindersStore } from './reminders'
import axios from 'axios'
import i18n from '@/i18n'

const HOSPITAL_CACHE_KEY = 'booking_hospitals_cache_v1'
const HOSPITAL_CACHE_TIME_KEY = 'booking_hospitals_cache_time_v1'

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
          title: `${hospital.name}`,
          description: `${booking.department}\n${booking.date}\n${booking.time}\n${hospital.address}`,
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

    loadHospitalCache() {
      const cachedHospitals = localStorage.getItem(HOSPITAL_CACHE_KEY)
      const cachedTime = localStorage.getItem(HOSPITAL_CACHE_TIME_KEY)

      if (!cachedHospitals || !cachedTime) return false

      try {
        const parsedHospitals = JSON.parse(cachedHospitals)
        const parsedTime = Number(cachedTime)

        if (!Array.isArray(parsedHospitals) || !parsedTime) return false

        this.hospitals = parsedHospitals
        this.lastFetchTime = parsedTime
        return true
      } catch {
        return false
      }
    },

    saveHospitalCache(hospitals) {
      localStorage.setItem(HOSPITAL_CACHE_KEY, JSON.stringify(hospitals))
      localStorage.setItem(HOSPITAL_CACHE_TIME_KEY, String(Date.now()))
    },

    mapHospitalsFromOverpass(elements) {
      const t = i18n.global.t
      return elements
        .filter(item => {
          const tags = item.tags || {}
          const country = tags['addr:country'] || tags['is_in:country'] || ''
          const name = tags.name || tags['name:zh'] || ''
          const address = tags['addr:full'] || tags['addr:street'] || ''

          if (country.match(/CN|中国|中國|China/) && !country.match(/HK|Hong Kong|香港/)) {
            return false
          }

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
            address: item.tags?.['addr:full'] || item.tags?.['addr:street'] || t('common.addressNotProvided'),
            phone: item.tags?.phone || item.tags?.['contact:phone'] || t('common.phoneNotProvided'),
            rating: Math.round((4.0 + Math.random() * 0.5) * 100) / 100,
            currentWaitingPeople: Math.floor(Math.random() * 60) + 10,
            distance: 0,
            image: 'https://img.freepik.com/free-photo/hospital-building_1127-3375.jpg',
            openTime: item.tags?.['opening_hours:start'] || '08:00',
            closeTime: item.tags?.['opening_hours:end'] || '20:00',
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            departments: isHospital
              ? ['Internal Medicine', 'Surgery', 'Emergency', 'Orthopedics', 'Pediatrics']
              : ['Family Medicine', 'Internal Medicine', 'Pediatrics'],
            coordinates: { lat, lng: lon }
          }
        })
        .filter(h => h.coordinates.lat && h.coordinates.lng)
    },

    async fetchHospitalsFromAPI() {
      // Check if we have cached data (less than 1 hour old)
      const ONE_HOUR = 60 * 60 * 1000
      if (this.lastFetchTime && Date.now() - this.lastFetchTime < ONE_HOUR && this.hospitals.length > 0) {
        return // Use cached data
      }

      // Try persisted cache first when store is empty (fresh page reload)
      if (!this.hospitals.length) {
        this.loadHospitalCache()
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
        
        const endpoints = [
          'https://overpass-api.de/api/interpreter',
          'https://overpass.kumi.systems/api/interpreter'
        ]

        let hospitals = []
        let lastError = null

        for (const endpoint of endpoints) {
          try {
            const response = await axios.post(endpoint, query, {
              headers: {
                'Content-Type': 'text/plain'
              },
              timeout: 20000
            })

            hospitals = this.mapHospitalsFromOverpass(response.data?.elements || [])
            if (hospitals.length > 0) break
          } catch (error) {
            lastError = error
            const isRateLimit = error?.response?.status === 429
            if (isRateLimit) {
              console.warn(`Rate limited by ${endpoint}, trying next endpoint...`)
            }
          }
        }

        if (!hospitals.length && lastError) {
          throw lastError
        }

        if (hospitals.length > 0) {
          this.hospitals = hospitals
          this.lastFetchTime = Date.now()
          this.saveHospitalCache(hospitals)
          console.log(`Successfully loaded ${hospitals.length} hospitals and clinics`)
        }
      } catch (error) {
        const isRateLimit = error?.response?.status === 429

        if (isRateLimit) {
          console.warn('Hospital API rate limited (429). Using cached/fallback data.')
        } else {
          console.error('Failed to load hospital data:', error)
        }

        // If we already have data (from runtime cache or persisted cache), keep using it.
        if (this.hospitals.length > 0) {
          this.error = isRateLimit
            ? 'Hospital data service is busy. Showing cached results.'
            : `Unable to refresh hospital data: ${error.message}`
          return
        }

        // Final fallback: minimal sample data
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
        this.error = isRateLimit
          ? 'Hospital data service is busy. Showing limited fallback data.'
          : `Unable to load hospital data: ${error.message}`
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
