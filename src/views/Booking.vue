<template>
  <div class="booking-page">
    <div class="page-header">
      <h1>{{ $t('booking.title') }}</h1>
      <div class="header-actions">
        <el-button-group>
          <el-button 
            :type="viewMode === 'list' ? 'primary' : ''" 
            :icon="List"
            @click="viewMode = 'list'"
          >
            {{ $t('booking.listView') }}
          </el-button>
          <el-button 
            :type="viewMode === 'map' ? 'primary' : ''" 
            :icon="LocationInformation"
            @click="viewMode = 'map'"
          >
            {{ $t('booking.mapView') }}
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="bookingStore.loading" class="loading-container">
      <el-skeleton :rows="8" animated />
      <div style="text-align: center; margin-top: 20px; color: #409eff;">
        <el-icon class="is-loading" :size="20"><Loading /></el-icon>
        <span style="margin-left: 8px;">{{ $t('booking.loading') }}</span>
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
          <span class="filter-label">{{ $t('booking.filterType') }}</span>
          <el-radio-group v-model="typeFilter" size="default" style="margin-right: 30px;">
            <el-radio-button value="all">{{ $t('booking.all') }}</el-radio-button>
            <el-radio-button value="hospital">{{ $t('booking.hospital') }}</el-radio-button>
            <el-radio-button value="clinic">{{ $t('booking.clinic') }}</el-radio-button>
          </el-radio-group>
          
          <span class="filter-label">{{ $t('booking.sortBy') }}</span>
          <el-radio-group v-model="sortBy" @change="handleSortChange">
            <el-radio-button value="nearest">
              <el-icon><LocationFilled /></el-icon>
              {{ $t('booking.nearest') }}
            </el-radio-button>
            <el-radio-button value="rating">
              <el-icon><StarFilled /></el-icon>
              {{ $t('booking.highestRating') }}
            </el-radio-button>
            <el-radio-button value="leastPeople">
              <el-icon><User /></el-icon>
              {{ $t('booking.leastPeople') }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </el-card>

      <!-- Nearby Section -->
      <div style="margin-bottom: 32px;">
        <h2>{{ $t('booking.nearest') }}:</h2>
        <el-row :gutter="20" class="hospital-list">
          <el-col 
            v-for="hospital in nearbyHospitals" 
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
                  {{ hospital.type === 'hospital' ? $t('booking.hospital') : $t('booking.clinic') }}
                </el-tag>
              </div>
              <div class="hospital-info">
                <h3 class="hospital-name">{{ hospital.name }}</h3>
                <div class="info-row">
                  <el-icon><Location /></el-icon>
                  <span>{{ formatAddress(hospital.address) }}</span>
                </div>
                <div class="info-row">
                  <el-icon><Phone /></el-icon>
                  <span>{{ formatPhone(hospital.phone) }}</span>
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
                      {{ hospital.currentWaitingPeople }} {{ $t('booking.people') }}
                    </el-tag>
                  </div>
                </div>
                <el-button 
                  type="primary" 
                  class="book-btn" 
                  @click="openDetailDialog(hospital)"
                >
                  {{ $t('booking.viewDetailAndBook') }}
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div style="text-align:center; margin-top:20px;">
          <el-button v-if="showNearbyCount < (nearbyHospitalsAll.length)" @click="handleSeeMoreNearby">
            {{ $t('common.viewAll') }}
          </el-button>
        </div>
      </div>

      <!-- Highest Rating Section -->
      <div>
        <h2>{{ $t('booking.highestRating') }}:</h2>
        <el-row :gutter="20" class="hospital-list">
          <el-col 
            v-for="hospital in ratingHospitals" 
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
                  {{ hospital.type === 'hospital' ? $t('booking.hospital') : $t('booking.clinic') }}
                </el-tag>
              </div>
              <div class="hospital-info">
                <h3 class="hospital-name">{{ hospital.name }}</h3>
                <div class="info-row">
                  <el-icon><Location /></el-icon>
                  <span>{{ formatAddress(hospital.address) }}</span>
                </div>
                <div class="info-row">
                  <el-icon><Phone /></el-icon>
                  <span>{{ formatPhone(hospital.phone) }}</span>
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
                      {{ hospital.currentWaitingPeople }} {{ $t('booking.people') }}
                    </el-tag>
                  </div>
                </div>
                <el-button 
                  type="primary" 
                  class="book-btn" 
                  @click="openDetailDialog(hospital)"
                >
                  {{ $t('booking.viewDetailAndBook') }}
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div style="text-align:center; margin-top:20px;">
          <el-button v-if="showRatingCount < (ratingHospitalsAll.length)" @click="handleSeeMoreRating">
            {{ $t('common.viewAll') }}
          </el-button>
        </div>
      </div>
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
            {{ userLocation ? $t('booking.located') : $t('booking.getMyLocation') }}
          </el-button>
          <el-text v-if="userLocation" type="success">
            <el-icon><SuccessFilled /></el-icon>
            {{ $t('booking.locationSuccess') }}
          </el-text>
          
          <div style="margin-left: 20px; display: inline-block;">
            <span class="filter-label">{{ $t('booking.typeFilter') }}</span>
            <el-radio-group v-model="typeFilter" size="small">
              <el-radio-button value="all">{{ $t('booking.all') }}</el-radio-button>
              <el-radio-button value="hospital">{{ $t('booking.hospital') }}</el-radio-button>
              <el-radio-button value="clinic">{{ $t('booking.clinic') }}</el-radio-button>
            </el-radio-group>
          </div>
          
          <el-tag type="info">
            {{ $t('booking.mapTotal', { count: filteredHospitalsForMap.length }) }}
          </el-tag>
          <el-button 
            @click="fitMapToMarkers"
            :icon="LocationInformation"
            size="small"
          >
            {{ $t('booking.showAll') }}
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
                  <h4>{{ $t('booking.yourLocation') }}</h4>
                  <p>{{ $t('booking.currentLocation') }}</p>
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
                      {{ formatAddress(hospital.address) }}
                    </p>
                    <p>
                      <el-icon><Phone /></el-icon>
                      {{ formatPhone(hospital.phone) }}
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
                      {{ hospital.rating }} {{ $t('booking.score') }}
                    </p>
                    <p v-if="userLocation">
                      <el-icon><LocationFilled /></el-icon>
                      {{ $t('booking.distanceAbout', { distance: getDistance(hospital) }) }}
                    </p>
                    <el-button 
                      type="primary" 
                      size="small"
                      style="margin-top: 8px; width: 100%"
                      @click="openDetailDialog(hospital)"
                    >
                      {{ $t('booking.viewDetailAndBook') }}
                    </el-button>
                  </div>
                </l-popup>
              </l-marker>
            </template>
          </l-map>
        </div>
        
        <!-- Hospital list for map view -->
        <div class="map-sidebar">
          <h3>{{ $t('booking.hospitalListTitle', { count: filteredHospitalsForMap.length }) }}</h3>
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
                    {{ $t('booking.distance') }} {{ getDistance(hospital) }} km
                  </template>
                  <template v-else>
                    {{ hospital.type === 'hospital' ? $t('booking.hospital') : $t('booking.clinic') }}
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
          <el-tab-pane :label="$t('booking.basicInfo')" name="info">
            <div class="detail-section">
              <img :src="selectedHospital.image" class="detail-image" />
              
              <el-descriptions :column="1" border>
                <el-descriptions-item :label="$t('booking.institutionType')">
                  <el-tag :type="selectedHospital.type === 'hospital' ? 'danger' : 'success'">
                    {{ selectedHospital.type === 'hospital' ? $t('booking.hospital') : $t('booking.clinic') }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('booking.address')">
                  {{ formatAddress(selectedHospital.address) }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('booking.phone')">
                  {{ formatPhone(selectedHospital.phone) }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('booking.businessHours')">
                  {{ selectedHospital.openTime }} - {{ selectedHospital.closeTime }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('booking.workingDays')">
                  {{ selectedHospital.workingDays.map(translateWorkingDay).join('、') }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('booking.rating')">
                  <el-rate 
                    v-model="selectedHospital.rating" 
                    disabled 
                    show-score 
                    text-color="#ff9900"
                    :score-template="$t('booking.scoreTemplate')"
                  />
                </el-descriptions-item>
                <el-descriptions-item :label="$t('booking.currentWaiting')">
                  <el-tag type="warning">{{ selectedHospital.currentWaitingPeople }} {{ $t('booking.people') }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('booking.distance')">
                  {{ selectedHospital.distance }} {{ $t('booking.km') }}
                </el-descriptions-item>
              </el-descriptions>
              
              <div class="departments-section">
                <h4>{{ $t('booking.departments') }}</h4>
                <div class="departments-tags">
                  <el-tag 
                    v-for="dept in selectedHospital.departments" 
                    :key="dept"
                    class="dept-tag"
                  >
                    {{ translateDepartment(dept) }}
                  </el-tag>
                </div>

                <div class="dialog-book-action">
                  <el-button type="primary" @click="goToBookingTab">
                    {{ $t('booking.bookNow') }}
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane :label="$t('booking.bookNow')" name="booking">
            <el-form 
              ref="bookingFormRef"
              :model="bookingForm" 
              :rules="bookingRules"
              label-width="100px"
            >
              <el-form-item :label="$t('booking.departmentLabel')" prop="department">
                <el-select 
                  v-model="bookingForm.department" 
                  :placeholder="$t('booking.departmentPlaceholder')"
                  style="width: 100%"
                >
                  <el-option
                    v-for="dept in selectedHospital.departments"
                    :key="dept"
                    :label="translateDepartment(dept)"
                    :value="dept"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item :label="$t('booking.dateLabel')" prop="date">
                <el-date-picker
                  v-model="bookingForm.date"
                  type="date"
                  :placeholder="$t('booking.datePlaceholder')"
                  style="width: 100%"
                  :disabled-date="disabledDate"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleDateChange"
                />
              </el-form-item>
              
              <el-form-item :label="$t('booking.timeLabel')" prop="time">
                <el-select 
                  v-model="bookingForm.time" 
                  :placeholder="$t('booking.timePlaceholder')"
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
              
              <el-form-item :label="$t('booking.patientNameLabel')" prop="patientName">
                <el-input 
                  v-model="bookingForm.patientName" 
                  :placeholder="$t('booking.patientNamePlaceholder')"
                />
              </el-form-item>
              
              <el-form-item :label="$t('booking.phoneLabel')" prop="phone">
                <el-input 
                  v-model="bookingForm.phone" 
                  :placeholder="$t('booking.phonePlaceholder')"
                />
              </el-form-item>
              
              <el-form-item :label="$t('booking.notesLabel')">
                <el-input 
                  v-model="bookingForm.notes" 
                  type="textarea"
                  :rows="3"
                  :placeholder="$t('booking.notesPlaceholder')"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="handleBooking" :loading="bookingLoading">
                  {{ $t('booking.confirmBooking') }}
                </el-button>
                <el-button @click="resetBookingForm">{{ $t('booking.reset') }}</el-button>
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
          <span>{{ $t('booking.myBookings') }}</span>
          <el-tag type="info">{{ $t('booking.totalCount', { count: myBookings.length }) }}</el-tag>
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
                  <p><strong>{{ $t('booking.departmentLabel') }}</strong>{{ translateDepartment(booking.department) }}</p>
                  <p><strong>{{ $t('booking.patientLabel') }}</strong>{{ booking.patientName }}</p>
                  <p><strong>{{ $t('booking.phoneLabel') }}</strong>{{ booking.phone }}</p>
                  <p v-if="booking.notes"><strong>{{ $t('booking.notesLabel') }}</strong>{{ booking.notes }}</p>
                  <el-tag :type="booking.status === 'confirmed' ? 'success' : 'info'">
                    {{ booking.status === 'confirmed' ? $t('booking.confirmed') : $t('booking.cancelled') }}
                  </el-tag>
                </div>
                <div class="booking-actions">
                  <el-button 
                    v-if="booking.status === 'confirmed'"
                    type="warning" 
                    size="small"
                    @click="handleCancelBooking(booking.id)"
                  >
                    {{ $t('booking.cancelBooking') }}
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small"
                    @click="handleDeleteBooking(booking.id)"
                  >
                    {{ $t('booking.deleteRecord') }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <el-empty v-else :description="$t('booking.noBookings')" :image-size="150" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

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
  department: [{ required: true, message: t('booking.departmentRequired'), trigger: 'change' }],
  date: [{ required: true, message: t('booking.dateRequired'), trigger: 'change' }],
  time: [{ required: true, message: t('booking.timeRequired'), trigger: 'change' }],
  patientName: [{ required: true, message: t('booking.patientNameRequired'), trigger: 'blur' }],
  phone: [
    { required: true, message: t('booking.phoneRequired'), trigger: 'blur' },
    { pattern: /^09\d{8}$/, message: t('booking.phoneInvalid'), trigger: 'blur' }
  ]
}

// Computed


// Two independent incremental loading states
const initialShowCount = 5
const incrementCount = 10
const showNearbyCount = ref(initialShowCount)
const showRatingCount = ref(initialShowCount)

const nearbyHospitalsAll = computed(() => {
  const hospitals = bookingStore.sortedHospitals('nearest')
  if (typeFilter.value === 'all') return hospitals
  return hospitals.filter(h => h.type === typeFilter.value)
})
const ratingHospitalsAll = computed(() => {
  const hospitals = bookingStore.sortedHospitals('rating')
  if (typeFilter.value === 'all') return hospitals
  return hospitals.filter(h => h.type === typeFilter.value)
})

const nearbyHospitals = computed(() => {
  return nearbyHospitalsAll.value.slice(0, showNearbyCount.value)
})
const ratingHospitals = computed(() => {
  return ratingHospitalsAll.value.slice(0, showRatingCount.value)
})

const handleSeeMoreNearby = () => {
  showNearbyCount.value += incrementCount
}
const handleSeeMoreRating = () => {
  showRatingCount.value += incrementCount
}

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

const weekdayKeyMap = {
  Sun: 'booking.daySun',
  Mon: 'booking.dayMon',
  Tue: 'booking.dayTue',
  Wed: 'booking.dayWed',
  Thu: 'booking.dayThu',
  Fri: 'booking.dayFri',
  Sat: 'booking.daySat'
}

const departmentKeyMap = {
  'Internal Medicine': 'booking.deptInternalMedicine',
  Surgery: 'booking.deptSurgery',
  Emergency: 'booking.deptEmergency',
  Orthopedics: 'booking.deptOrthopedics',
  Pediatrics: 'booking.deptPediatrics',
  'Family Medicine': 'booking.deptFamilyMedicine',
  Cardiology: 'booking.deptCardiology'
}

const translateWorkingDay = (day) => {
  const shortDay = String(day).slice(0, 3)
  const key = weekdayKeyMap[shortDay]
  return key ? t(key) : day
}

const translateDepartment = (department) => {
  const key = departmentKeyMap[department]
  return key ? t(key) : department
}

const formatAddress = (address) => {
  if (!address || address === 'Address not provided') {
    return t('common.addressNotProvided')
  }
  return address
}

const formatPhone = (phone) => {
  if (!phone || phone === 'Phone not provided') {
    return t('common.phoneNotProvided')
  }
  return phone
}

// Methods
const getUserLocation = () => {
  if (!navigator.geolocation) {
    ElMessage.error(t('booking.geolocationNotSupported'))
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
      ElMessage.success(t('booking.locationSuccessMessage'))
    },
    (error) => {
      locatingUser.value = false
      console.error('Geolocation error:', error)
      ElMessage.error(t('booking.locationError'))
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

const goToBookingTab = () => {
  activeTab.value = 'booking'
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
  
  // Check if it's a working day (store uses weekday codes like Mon/Tue)
  const dayOfWeek = date.getDay()
  const dayCodes = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const workingDays = selectedHospital.value?.workingDays

  if (!Array.isArray(workingDays) || workingDays.length === 0) {
    return date < today || date > maxDate
  }

  const normalizedWorkingDays = workingDays.map((day) => String(day).slice(0, 3))
  const isWorkingDay = normalizedWorkingDays.includes(dayCodes[dayOfWeek])
  
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
          message: t('booking.bookingSuccess'),
          duration: 3000
        })
        
        showDetailDialog.value = false
        resetBookingForm()
        bookingLoading.value = false
      }, 1000)
    } else {
      ElMessage.error(t('booking.fillAllFields'))
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
  return hospital ? hospital.name : t('booking.unknownHospital')
}

const handleCancelBooking = (bookingId) => {
  ElMessageBox.confirm(
    t('booking.cancelConfirmMessage'),
    t('booking.cancelBooking'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    bookingStore.cancelBooking(bookingId)
    ElMessage.success(t('booking.cancelledSuccess'))
  }).catch(() => {
    // Cancelled
  })
}

const handleDeleteBooking = (bookingId) => {
  ElMessageBox.confirm(
    t('booking.deleteConfirmMessage'),
    t('booking.deleteRecord'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    bookingStore.deleteBooking(bookingId)
    ElMessage.success(t('booking.deletedSuccess'))
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

.dialog-book-action {
  margin-top: 16px;
  display: flex;
  justify-content: center;
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
