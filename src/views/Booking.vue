<template>
  <div class="booking-page">
    <div class="page-header">
      <h1>醫院與診所預約</h1>
      <div class="header-actions">
        <el-button-group>
          <el-button 
            :type="viewMode === 'list' ? 'primary' : ''" 
            :icon="List"
            @click="viewMode = 'list'"
          >
            列表
          </el-button>
          <el-button 
            :type="viewMode === 'map' ? 'primary' : ''" 
            :icon="LocationInformation"
            @click="viewMode = 'map'"
          >
            地圖
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="bookingStore.loading" class="loading-container">
      <el-skeleton :rows="8" animated />
      <div style="text-align: center; margin-top: 20px; color: #409eff;">
        <el-icon class="is-loading" :size="20"><Loading /></el-icon>
        <span style="margin-left: 8px;">正在從地圖服務載入醫院和診所數據...</span>
      </div>
    </div>

    <!-- Error State -->
    <el-alert
      v-if="bookingStore.error"
      type="error"
      :title="bookingStore.error"
      show-icon
      style="margin-bottom: 20px;"
      :closable="false"
    />

    <!-- List View -->
    <div v-if="viewMode === 'list' && !bookingStore.loading">
      <!-- Sort and Filter -->
      <el-card class="filter-card">
        <div class="filter-section">
          <span class="filter-label">類型篩選：</span>
          <el-radio-group v-model="typeFilter" size="default" style="margin-right: 30px;">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="hospital">醫院</el-radio-button>
            <el-radio-button label="clinic">診所</el-radio-button>
          </el-radio-group>
          
          <span class="filter-label">排序方式：</span>
          <el-radio-group v-model="sortBy" @change="handleSortChange">
            <el-radio-button label="nearest">
              <el-icon><LocationFilled /></el-icon>
              最近距離
            </el-radio-button>
            <el-radio-button label="rating">
              <el-icon><StarFilled /></el-icon>
              評分最高
            </el-radio-button>
            <el-radio-button label="leastPeople">
              <el-icon><User /></el-icon>
              人數最少
            </el-radio-button>
          </el-radio-group>
        </div>
      </el-card>

      <!-- Hospital/Clinic List -->
      <el-row :gutter="20" class="hospital-list">
        <el-col 
          v-for="hospital in sortedHospitals" 
          :key="hospital.id" 
          :xs="24" 
          :sm="12" 
          :lg="8"
        >
          <el-card 
            class="hospital-card" 
            :body-style="{ padding: '0px' }"
            shadow="hover"
          >
            <div class="hospital-image-container">
              <img :src="hospital.image" class="hospital-image" />
              <el-tag 
                :type="hospital.type === 'hospital' ? 'danger' : 'success'" 
                class="hospital-type-tag"
              >
                {{ hospital.type === 'hospital' ? '醫院' : '診所' }}
              </el-tag>
            </div>
            <div class="hospital-info">
              <h3 class="hospital-name">{{ hospital.name }}</h3>
              
              <div class="info-row">
                <el-icon><Location /></el-icon>
                <span>{{ hospital.address }}</span>
              </div>
              
              <div class="info-row">
                <el-icon><Phone /></el-icon>
                <span>{{ hospital.phone }}</span>
              </div>
              
              <div class="info-row">
                <el-icon><Clock /></el-icon>
                <span>{{ hospital.openTime }} - {{ hospital.closeTime }}</span>
              </div>
              
              <div class="stats-row">
                <div class="stat-item">
                  <el-icon color="#f56c6c"><LocationFilled /></el-icon>
                  <span>{{ hospital.distance }} km</span>
                </div>
                <div class="stat-item">
                  <el-rate 
                    v-model="hospital.rating" 
                    disabled 
                    show-score 
                    text-color="#ff9900"
                    score-template="{value}"
                  />
                </div>
                <div class="stat-item">
                  <el-tag type="info" size="small">
                    <el-icon><User /></el-icon>
                    {{ hospital.currentWaitingPeople }} 人
                  </el-tag>
                </div>
              </div>
              
              <el-button 
                type="primary" 
                class="book-btn" 
                @click="openDetailDialog(hospital)"
              >
                查看詳情並預約
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Map View -->
    <div v-if="viewMode === 'map' && !bookingStore.loading">
      <el-card class="map-card">
        <div class="map-controls">
          <el-button 
            type="primary" 
            :icon="Aim"
            @click="getUserLocation"
            :loading="locatingUser"
          >
            {{ userLocation ? '已定位' : '取得我的位置' }}
          </el-button>
          <el-text v-if="userLocation" type="success">
            <el-icon><SuccessFilled /></el-icon>
            已定位到您的位置
          </el-text>
          
          <div style="margin-left: 20px; display: inline-block;">
            <span class="filter-label">類型篩選：</span>
            <el-radio-group v-model="typeFilter" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="hospital">醫院</el-radio-button>
              <el-radio-button label="clinic">診所</el-radio-button>
            </el-radio-group>
          </div>
          
          <el-tag type="info">
            地圖上共有 {{ filteredHospitalsForMap.length }} 個醫療機構
          </el-tag>
          <el-button 
            @click="fitMapToMarkers"
            :icon="LocationInformation"
            size="small"
          >
            顯示全部
          </el-button>
        </div>
        
        <div class="leaflet-map-container">
          <l-map 
            ref="map"
            v-model:zoom="zoom"
            :center="mapCenter"
            :use-global-leaflet="false"
            :min-zoom="10"
            :max-zoom="18"
            style="height: 600px; width: 100%;"
            @ready="onMapReady"
          >
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            ></l-tile-layer>
            
            <!-- User Location Marker -->
            <l-marker 
              v-if="userLocation"
              :lat-lng="[userLocation.lat, userLocation.lng]"
            >
              <l-icon :icon-size="[40, 40]" :icon-anchor="[20, 20]" class-name="custom-marker">
                <div class="user-marker-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#409eff" width="24" height="24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
              </l-icon>
              <l-popup>
                <div class="popup-content">
                  <h4>您的位置</h4>
                  <p>目前所在地點</p>
                </div>
              </l-popup>
            </l-marker>
            
            <!-- Hospital Markers -->
            <template v-for="hospital in filteredHospitalsForMap" :key="`marker-${hospital.id}`">
              <l-marker
                :lat-lng="[hospital.coordinates.lat, hospital.coordinates.lng]"
              >
                <l-icon :icon-size="[32, 32]" :icon-anchor="[16, 32]" class-name="custom-marker">
                  <div :class="['marker-icon', hospital.type]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="16" height="16">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                </l-icon>
                <l-popup :options="{ maxWidth: 300 }">
                  <div class="popup-content">
                    <h4>{{ hospital.name }}</h4>
                    <p>
                      <el-icon><Location /></el-icon>
                      {{ hospital.address }}
                    </p>
                    <p>
                      <el-icon><Phone /></el-icon>
                      {{ hospital.phone }}
                    </p>
                    <p>
                      <el-icon><Clock /></el-icon>
                      {{ hospital.openTime }} - {{ hospital.closeTime }}
                    </p>
                    <p>
                      <el-rate 
                        v-model="hospital.rating" 
                        disabled 
                        size="small"
                      />
                      {{ hospital.rating }} 分
                    </p>
                    <p v-if="userLocation">
                      <el-icon><LocationFilled /></el-icon>
                      距離約 {{ getDistance(hospital) }} 公里
                    </p>
                    <el-button 
                      type="primary" 
                      size="small"
                      style="margin-top: 8px; width: 100%"
                      @click="openDetailDialog(hospital)"
                    >
                      查看詳情並預約
                    </el-button>
                  </div>
                </l-popup>
              </l-marker>
            </template>
          </l-map>
        </div>
        
        <!-- Hospital list for map view -->
        <div class="map-sidebar">
          <h3>醫療機構列表 ({{ filteredHospitalsForMap.length }})</h3>
          <el-scrollbar height="600px">
            <div 
              v-for="hospital in filteredHospitalsForMap" 
              :key="`sidebar-${hospital.id}`"
              class="map-list-item"
              @click="flyToHospital(hospital)"
            >
              <el-icon :color="hospital.type === 'hospital' ? '#f56c6c' : '#67c23a'">
                <LocationFilled />
              </el-icon>
              <div class="map-list-info">
                <div class="map-list-name">{{ hospital.name }}</div>
                <div class="map-list-distance">
                  <template v-if="userLocation">
                    距離 {{ getDistance(hospital) }} km
                  </template>
                  <template v-else>
                    {{ hospital.type === 'hospital' ? '醫院' : '診所' }}
                  </template>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-card>
    </div>

    <!-- Detail & Booking Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      :title="selectedHospital?.name"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedHospital" class="detail-content">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本資訊" name="info">
            <div class="detail-section">
              <img :src="selectedHospital.image" class="detail-image" />
              
              <el-descriptions :column="1" border>
                <el-descriptions-item label="機構類型">
                  <el-tag :type="selectedHospital.type === 'hospital' ? 'danger' : 'success'">
                    {{ selectedHospital.type === 'hospital' ? '醫院' : '診所' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="地址">
                  {{ selectedHospital.address }}
                </el-descriptions-item>
                <el-descriptions-item label="電話">
                  {{ selectedHospital.phone }}
                </el-descriptions-item>
                <el-descriptions-item label="營業時間">
                  {{ selectedHospital.openTime }} - {{ selectedHospital.closeTime }}
                </el-descriptions-item>
                <el-descriptions-item label="營業日">
                  {{ selectedHospital.workingDays.join('、') }}
                </el-descriptions-item>
                <el-descriptions-item label="評分">
                  <el-rate 
                    v-model="selectedHospital.rating" 
                    disabled 
                    show-score 
                    text-color="#ff9900"
                    score-template="{value} 分"
                  />
                </el-descriptions-item>
                <el-descriptions-item label="目前等候人數">
                  <el-tag type="warning">{{ selectedHospital.currentWaitingPeople }} 人</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="距離">
                  {{ selectedHospital.distance }} 公里
                </el-descriptions-item>
              </el-descriptions>
              
              <div class="departments-section">
                <h4>診療科別</h4>
                <div class="departments-tags">
                  <el-tag 
                    v-for="dept in selectedHospital.departments" 
                    :key="dept"
                    class="dept-tag"
                  >
                    {{ dept }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="立即預約" name="booking">
            <el-form 
              ref="bookingFormRef"
              :model="bookingForm" 
              :rules="bookingRules"
              label-width="100px"
            >
              <el-form-item label="診療科別" prop="department">
                <el-select 
                  v-model="bookingForm.department" 
                  placeholder="請選擇科別"
                  style="width: 100%"
                >
                  <el-option
                    v-for="dept in selectedHospital.departments"
                    :key="dept"
                    :label="dept"
                    :value="dept"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="預約日期" prop="date">
                <el-date-picker
                  v-model="bookingForm.date"
                  type="date"
                  placeholder="選擇日期"
                  style="width: 100%"
                  :disabled-date="disabledDate"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleDateChange"
                />
              </el-form-item>
              
              <el-form-item label="預約時段" prop="time">
                <el-select 
                  v-model="bookingForm.time" 
                  placeholder="請選擇時段"
                  style="width: 100%"
                  :disabled="!bookingForm.date"
                >
                  <el-option
                    v-for="slot in availableTimeSlots"
                    :key="slot"
                    :label="slot"
                    :value="slot"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="就診人姓名" prop="patientName">
                <el-input 
                  v-model="bookingForm.patientName" 
                  placeholder="請輸入就診人姓名"
                />
              </el-form-item>
              
              <el-form-item label="聯絡電話" prop="phone">
                <el-input 
                  v-model="bookingForm.phone" 
                  placeholder="請輸入聯絡電話"
                />
              </el-form-item>
              
              <el-form-item label="備註">
                <el-input 
                  v-model="bookingForm.notes" 
                  type="textarea"
                  :rows="3"
                  placeholder="症狀描述或其他備註..."
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="handleBooking" :loading="bookingLoading">
                  確認預約
                </el-button>
                <el-button @click="resetBookingForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- My Bookings -->
    <el-card class="my-bookings-card">
      <template #header>
        <div class="card-header">
          <span>我的預約記錄</span>
          <el-tag type="info">共 {{ myBookings.length }} 筆</el-tag>
        </div>
      </template>
      
      <div v-if="myBookings.length > 0">
        <el-timeline>
          <el-timeline-item
            v-for="booking in myBookings"
            :key="booking.id"
            :timestamp="booking.date + ' ' + booking.time"
            placement="top"
            :type="booking.status === 'confirmed' ? 'success' : 'info'"
          >
            <el-card>
              <div class="booking-item">
                <div class="booking-info">
                  <h4>{{ getHospitalName(booking.hospitalId) }}</h4>
                  <p><strong>科別：</strong>{{ booking.department }}</p>
                  <p><strong>就診人：</strong>{{ booking.patientName }}</p>
                  <p><strong>電話：</strong>{{ booking.phone }}</p>
                  <p v-if="booking.notes"><strong>備註：</strong>{{ booking.notes }}</p>
                  <el-tag :type="booking.status === 'confirmed' ? 'success' : 'info'">
                    {{ booking.status === 'confirmed' ? '已確認' : '已取消' }}
                  </el-tag>
                </div>
                <div class="booking-actions">
                  <el-button 
                    v-if="booking.status === 'confirmed'"
                    type="warning" 
                    size="small"
                    @click="handleCancelBooking(booking.id)"
                  >
                    取消預約
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small"
                    @click="handleDeleteBooking(booking.id)"
                  >
                    刪除記錄
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <el-empty v-else description="還沒有任何預約記錄" :image-size="150" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  List, 
  LocationInformation, 
  LocationFilled, 
  StarFilled, 
  User,
  UserFilled,
  Location,
  Phone,
  Clock,
  Aim,
  SuccessFilled,
  Loading
} from '@element-plus/icons-vue'
import { 
  LMap, 
  LTileLayer, 
  LMarker, 
  LPopup,
  LIcon
} from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
})

const bookingStore = useBookingStore()
const userStore = useUserStore()

const viewMode = ref('list')
const sortBy = ref('nearest')
const typeFilter = ref('all')
const showDetailDialog = ref(false)
const selectedHospital = ref(null)
const activeTab = ref('info')
const bookingFormRef = ref(null)
const bookingLoading = ref(false)

// Map related
const map = ref(null)
const zoom = ref(10)
const mapCenter = ref([22.3500, 114.1500]) // Center of Hong Kong
const userLocation = ref(null)
const locatingUser = ref(false)

const bookingForm = reactive({
  department: '',
  date: '',
  time: '',
  patientName: userStore.currentUser?.name || '',
  phone: '',
  notes: ''
})

const bookingRules = {
  department: [{ required: true, message: '請選擇診療科別', trigger: 'change' }],
  date: [{ required: true, message: '請選擇預約日期', trigger: 'change' }],
  time: [{ required: true, message: '請選擇預約時段', trigger: 'change' }],
  patientName: [{ required: true, message: '請輸入就診人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '請輸入聯絡電話', trigger: 'blur' },
    { pattern: /^09\d{8}$/, message: '請輸入正確的手機號碼', trigger: 'blur' }
  ]
}

// Computed
const sortedHospitals = computed(() => {
  const hospitals = bookingStore.sortedHospitals(sortBy.value)
  if (typeFilter.value === 'all') return hospitals
  return hospitals.filter(h => h.type === typeFilter.value)
})

const sortedHospitalsForMap = computed(() => {
  if (!userLocation.value) {
    return bookingStore.hospitals
  }
  return bookingStore.sortedHospitals('nearest')
})

const filteredHospitalsForMap = computed(() => {
  if (typeFilter.value === 'all') return sortedHospitalsForMap.value
  return sortedHospitalsForMap.value.filter(h => h.type === typeFilter.value)
})

const myBookings = computed(() => {
  return bookingStore.getUserBookings
})

const availableTimeSlots = computed(() => {
  if (!bookingForm.date || !selectedHospital.value) return []
  
  const slots = []
  const openHour = parseInt(selectedHospital.value.openTime.split(':')[0])
  const closeHour = parseInt(selectedHospital.value.closeTime.split(':')[0])
  
  // Morning slots
  for (let i = openHour; i < 12 && i < closeHour; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`)
    slots.push(`${String(i).padStart(2, '0')}:30`)
  }
  
  // Afternoon slots
  for (let i = 14; i < closeHour; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`)
    slots.push(`${String(i).padStart(2, '0')}:30`)
  }
  
  return slots
})

// Methods
const getUserLocation = () => {
  if (!navigator.geolocation) {
    ElMessage.error('您的瀏覽器不支援地理位置功能')
    return
  }

  locatingUser.value = true
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      userLocation.value = location
      bookingStore.setUserLocation(location)
      mapCenter.value = [location.lat, location.lng]
      zoom.value = 14
      locatingUser.value = false
      ElMessage.success('已成功定位您的位置')
    },
    (error) => {
      locatingUser.value = false
      console.error('Geolocation error:', error)
      ElMessage.error('無法取得您的位置，請確認已允許位置存取權限')
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const flyToHospital = (hospital) => {
  if (map.value && map.value.leafletObject) {
    map.value.leafletObject.flyTo(
      [hospital.coordinates.lat, hospital.coordinates.lng],
      16,
      { duration: 1 }
    )
  }
}

const getDistance = (hospital) => {
  if (!userLocation.value) return hospital.distance
  
  const R = 6371 // Radius of Earth in km
  const dLat = (hospital.coordinates.lat - userLocation.value.lat) * Math.PI / 180
  const dLon = (hospital.coordinates.lng - userLocation.value.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLocation.value.lat * Math.PI / 180) * 
    Math.cos(hospital.coordinates.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 10) / 10
}

const handleSortChange = () => {
  // Sort is handled by computed property
}

const openDetailDialog = (hospital) => {
  selectedHospital.value = hospital
  showDetailDialog.value = true
  activeTab.value = 'info'
  resetBookingForm()
}

const fitMapToMarkers = () => {
  if (map.value && map.value.leafletObject && bookingStore.hospitals.length > 0) {
    // Use setTimeout to ensure map is fully rendered
    setTimeout(() => {
      try {
        // Create bounds from all hospital coordinates
        const coordinates = bookingStore.hospitals.map(h => [h.coordinates.lat, h.coordinates.lng])
        
        // Find min/max coordinates to ensure all markers are included
        const lats = coordinates.map(c => c[0])
        const lngs = coordinates.map(c => c[1])
        const bounds = [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)]
        ]
        
        map.value.leafletObject.fitBounds(bounds, { 
          padding: [100, 100],
          maxZoom: 12,
          animate: true,
          duration: 1
        })
        console.log(`Map fitted to ${coordinates.length} markers, bounds:`, bounds)
      } catch (error) {
        console.error('Error fitting map bounds:', error)
      }
    }, 500)
  }
}

const onMapReady = () => {
  // When map is ready, fit bounds to show all markers
  console.log('Map ready, fitting bounds for', bookingStore.hospitals.length, 'hospitals')
  setTimeout(() => {
    fitMapToMarkers()
  }, 800)
}

const disabledDate = (date) => {
  // Disable past dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Disable dates beyond 3 months
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  
  // Check if it's a working day
  const dayOfWeek = date.getDay()
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']
  const isWorkingDay = selectedHospital.value?.workingDays.includes(dayNames[dayOfWeek])
  
  return date < today || date > maxDate || !isWorkingDay
}

const handleDateChange = () => {
  bookingForm.time = '' // Reset time when date changes
}

const handleBooking = async () => {
  if (!bookingFormRef.value) return
  
  await bookingFormRef.value.validate((valid) => {
    if (valid) {
      bookingLoading.value = true
      
      setTimeout(() => {
        const booking = {
          hospitalId: selectedHospital.value.id,
          hospitalName: selectedHospital.value.name,
          department: bookingForm.department,
          date: bookingForm.date,
          time: bookingForm.time,
          patientName: bookingForm.patientName,
          phone: bookingForm.phone,
          notes: bookingForm.notes
        }
        
        bookingStore.createBooking(booking)
        
        ElMessage.success({
          message: '預約成功！已自動新增提醒通知',
          duration: 3000
        })
        
        showDetailDialog.value = false
        resetBookingForm()
        bookingLoading.value = false
      }, 1000)
    } else {
      ElMessage.error('請完整填寫預約資訊')
    }
  })
}

const resetBookingForm = () => {
  if (bookingFormRef.value) {
    bookingFormRef.value.resetFields()
  }
  bookingForm.department = ''
  bookingForm.date = ''
  bookingForm.time = ''
  bookingForm.patientName = userStore.currentUser?.name || ''
  bookingForm.phone = ''
  bookingForm.notes = ''
}

const getHospitalName = (hospitalId) => {
  const hospital = bookingStore.getHospitalById(hospitalId)
  return hospital ? hospital.name : '未知醫院'
}

const handleCancelBooking = (bookingId) => {
  ElMessageBox.confirm(
    '確定要取消此預約嗎？',
    '取消預約',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    bookingStore.cancelBooking(bookingId)
    ElMessage.success('已取消預約')
  }).catch(() => {
    // Cancelled
  })
}

const handleDeleteBooking = (bookingId) => {
  ElMessageBox.confirm(
    '確定要刪除此預約記錄嗎？',
    '刪除記錄',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    bookingStore.deleteBooking(bookingId)
    ElMessage.success('已刪除記錄')
  }).catch(() => {
    // Cancelled
  })
}

// Watch for view mode changes and auto-detect location when switching to map
watch(viewMode, (newMode) => {
  if (newMode === 'map') {
    // Fit map to show all markers first
    setTimeout(() => {
      console.log('View switched to map, fitting bounds')
      fitMapToMarkers()
    }, 800)
    
    // Then get user location if not already available
    if (!userLocation.value) {
      setTimeout(() => {
        getUserLocation()
      }, 1500)
    }
  }
})

let updateInterval = null

onMounted(async () => {
  bookingStore.loadBookings()
  
  // Fetch hospitals from OpenStreetMap API
  await bookingStore.fetchHospitalsFromAPI()
  
  // Get user location for distance calculations
  getUserLocation()
  
  // Update waiting people count every 30 seconds
  updateInterval = setInterval(() => {
    bookingStore.updateWaitingPeople()
  }, 30000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.booking-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 28px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: #606266;
}

.hospital-list {
  margin-bottom: 30px;
}

.hospital-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
  cursor: pointer;
}

.hospital-card:hover {
  transform: translateY(-5px);
}

.hospital-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.hospital-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hospital-type-tag {
  position: absolute;
  top: 10px;
  right: 10px;
}

.hospital-info {
  padding: 15px;
}

.hospital-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.info-row .el-icon {
  color: #909399;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
  padding: 10px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.book-btn {
  width: 100%;
  margin-top: 10px;
}

/* Map View */
.map-card {
  margin-bottom: 30px;
}

.map-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.leaflet-map-container {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* Hide default Leaflet marker icons */
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

:deep(.leaflet-marker-icon) {
  background: transparent;
  border: none;
}

.marker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid white;
}

.marker-icon:hover {
  transform: rotate(-45deg) scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.marker-icon svg {
  transform: rotate(45deg);
}

.marker-icon.hospital {
  background: linear-gradient(135deg, #f56c6c 0%, #d64545 100%);
}

.marker-icon.clinic {
  background: linear-gradient(135deg, #67c23a 0%, #4fa323 100%);
}

.user-marker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.5);
  animation: pulse 2s infinite;
  border: 3px solid #409eff;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.popup-content {
  min-width: 250px;
  padding: 5px;
}

.popup-content h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.popup-content p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.5;
}

.popup-content .el-icon {
  color: #909399;
  flex-shrink: 0;
}

.popup-content .el-rate {
  display: inline-flex;
  margin-right: 5px;
}

.map-sidebar h3 {
  margin-bottom: 15px;
  color: #303133;
}

.map-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.map-list-item:hover {
  background: #ecf5ff;
  transform: translateX(5px);
}

.map-list-info {
  flex: 1;
}

.map-list-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.map-list-distance {
  font-size: 13px;
  color: #909399;
}

/* Detail Dialog */
.detail-content {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

.departments-section {
  margin-top: 20px;
}

.departments-section h4 {
  margin-bottom: 12px;
  color: #303133;
}

.departments-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dept-tag {
  cursor: pointer;
}

/* My Bookings */
.my-bookings-card {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.booking-info h4 {
  margin-bottom: 10px;
  color: #303133;
}

.booking-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .map-markers {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }
  
  .booking-item {
    flex-direction: column;
  }
  
  .booking-actions {
    flex-direction: row;
    width: 100%;
  }
}
</style>
