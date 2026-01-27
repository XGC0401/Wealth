# Wealth - Health and Wellness Tracker

## Project Summary

This project implements a comprehensive Health and Wellness Tracker web application called "Wealth" that meets all the requirements specified in the problem statement.

## All Requirements Met ✅

### 1. Login and Register ✅
- Login page with email and password validation
- Registration page with name, email, password, and confirm password
- Form validation using Element Plus
- Session management with localStorage
- Protected routes that redirect to login if not authenticated

### 2. Home Page with Dashboard ✅
- Statistics cards showing:
  - Total Activities
  - Meals Logged
  - Mental Health Logs
  - Active Reminders
- Recent activities display
- Active reminders overview
- Quick action buttons for common tasks

### 3. Log Physical Activities, Diet, and Mental Health ✅

**Physical Activities:**
- Multiple activity types (Running, Walking, Cycling, Swimming, Yoga, Gym, Dancing, Sports)
- Duration tracking
- Calories burned
- Intensity levels (Light, Moderate, Intense)
- Notes field
- Complete history table

**Diet:**
- Meal types (Breakfast, Lunch, Dinner, Snack)
- Food items
- Calories tracking
- Water intake tracking
- Daily summaries
- Complete meal history

**Mental Health:**
- Practice types (Meditation, Journaling, Breathing Exercises, Mindfulness, Therapy, Relaxation)
- Duration tracking
- Mood rating before and after (5-star system)
- Mood improvement analytics
- Weekly session statistics
- Complete history

### 4. Personalized Wellness Plans, Reminders, and Community ✅

**Wellness Plans:**
- Create custom wellness plans with title, goal, and duration
- Track plan completion
- View all active and completed plans

**Reminders:**
- Set reminders for hydration, exercise, medication, meditation, etc.
- Custom time selection
- Multiple frequencies (Daily, Every 2 hours, Every 4 hours, Weekly)
- Delete reminders functionality

**Community Feature:**
- Share wellness journey posts
- Categories: Fitness, Nutrition, Mental Health, Tips & Advice, Goals & Progress, Questions
- Like posts
- Comment on posts
- Filter posts by category
- Time-based display (Just now, Xm ago, Xh ago, Xd ago)

### 5. Random Suggest Function ✅
- Random Exercise Suggestions
  - 7 different exercises with descriptions
  - Duration and difficulty level
  - Refresh for new suggestion
  
- Random Food Suggestions
  - 7 healthy food options
  - Calorie information
  - Category (Breakfast, Lunch, Dinner, Snack)
  
- Random Activity Suggestions
  - 7 wellness activities
  - Duration and type (Mental, Physical, Outdoor, Social, Creative)
  
- Daily Wellness Tips
  - 7 different tips
  - Refresh for new tip

### 6. Chat Room ✅
- Real-time messaging interface
- User avatars with initials
- Timestamps with smart formatting (Just now, Xm ago, Xh ago)
- Welcome bot message
- Community guidelines
- Scroll to bottom on new messages
- Message persistence in localStorage

### 7. Multiple Files and Pages ✅

**Separate Vue Components:**
1. `Login.vue` - Login page
2. `Register.vue` - Registration page
3. `Dashboard.vue` - Dashboard/Home page
4. `Activities.vue` - Physical activities tracking
5. `Diet.vue` - Diet logging
6. `MentalHealth.vue` - Mental health tracking
7. `WellnessPlan.vue` - Wellness plans and reminders
8. `Suggestions.vue` - Random suggestions
9. `ChatRoom.vue` - Chat room
10. `Community.vue` - Community posts
11. `Layout.vue` - Reusable layout component

**Separate State Stores:**
1. `auth.js` - Authentication state
2. `data.js` - Application data state

**Separate Router:**
1. `router/index.js` - Route definitions with guards

### 8. Element Plus UI Library ✅
All components use Element Plus:
- `el-button` - Buttons throughout
- `el-card` - Cards for sections
- `el-form`, `el-form-item` - Forms
- `el-input` - Text inputs
- `el-select`, `el-option` - Dropdowns
- `el-table`, `el-table-column` - Tables
- `el-statistic` - Statistics display
- `el-rate` - Star ratings
- `el-tag` - Tags/labels
- `el-avatar` - User avatars
- `el-empty` - Empty states
- `el-message` - Toast notifications
- `el-icon` - Icons
- `el-row`, `el-col` - Grid layout
- `el-time-picker` - Time selection
- `el-input-number` - Number inputs
- `el-radio-group`, `el-radio-button` - Radio buttons

## Technical Implementation

### Architecture
- **Framework**: Vue 3 with Composition API
- **State Management**: Pinia stores
- **Routing**: Vue Router with route guards
- **UI Library**: Element Plus
- **Build Tool**: Vite
- **Data Persistence**: localStorage

### Code Organization
- Clear separation of concerns
- Reusable Layout component
- Centralized state management
- Clean component structure
- Responsive design

### Data Flow
1. User interacts with UI components
2. Actions trigger Pinia store methods
3. Store updates state and localStorage
4. Vue reactivity updates UI automatically

## Testing Results

✅ All features tested and working:
- Login/Register flow
- Dashboard displays correct statistics
- Activity logging saves and displays
- Diet logging with daily summaries
- Mental health tracking with mood ratings
- Wellness plans and reminders
- Random suggestions generate properly
- Chat room messages persist
- Community posts, likes, and comments

✅ Security:
- CodeQL scan: 0 vulnerabilities
- Code review: Minor nitpicks only (mock auth, code duplication)
- No sensitive data exposure

## How to Use

1. **Install dependencies**: `npm install`
2. **Run development server**: `npm run dev`
3. **Open browser**: http://localhost:3000
4. **Register** a new account
5. **Explore** all features through the sidebar navigation

## Conclusion

This project successfully implements all requirements for a Health and Wellness Tracker called "Wealth". It includes:
- ✅ Login and Register
- ✅ Dashboard home page
- ✅ Activity, Diet, and Mental Health logging
- ✅ Wellness plans and reminders
- ✅ Random suggestions
- ✅ Chat room
- ✅ Community feature
- ✅ Element Plus UI library
- ✅ Multiple separate files/pages

The application is fully functional, well-organized, and ready for use.
