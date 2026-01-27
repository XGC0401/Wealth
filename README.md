# Wealth - Health and Wellness Tracker 💚

A comprehensive health and wellness tracking web application built with Vue.js and Element Plus UI library.

## Features

### 1. **Authentication System**
- User registration with validation
- Login functionality
- Secure session management

### 2. **Dashboard**
- Overview of all health metrics
- Statistics for activities, meals, and mental health logs
- Quick action buttons for common tasks
- Recent activities display
- Active reminders overview

### 3. **Physical Activities Tracking**
- Log various types of exercises (Running, Cycling, Yoga, etc.)
- Track duration, calories burned, and intensity
- View complete activity history
- Add custom notes for each activity

### 4. **Diet Logging**
- Log meals by type (Breakfast, Lunch, Dinner, Snacks)
- Track calories and water intake
- Daily summaries of nutrition
- Complete meal history

### 5. **Mental Health Practices**
- Track meditation, journaling, and other mental wellness activities
- Rate mood before and after practices
- Monitor mood improvement trends
- Weekly session statistics

### 6. **Wellness Plans & Reminders**
- Create personalized wellness plans with goals and duration
- Set custom reminders for hydration, exercise, medication, etc.
- Multiple reminder frequencies (Daily, Every 2 hours, etc.)
- Track plan completion

### 7. **Random Suggestions**
- Get random exercise suggestions with difficulty levels
- Discover healthy food recommendations
- Explore wellness activities
- Daily wellness tips

### 8. **Chat Room**
- Real-time messaging with other users
- Share progress and encourage others
- Community guidelines for respectful interaction

### 9. **Community Feature**
- Share wellness journey posts
- Categorized posts (Fitness, Nutrition, Mental Health, etc.)
- Like and comment on posts
- Filter posts by category

## Technology Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **UI Library**: Element Plus
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Icons**: Element Plus Icons

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/XGC0401/Wealth.git
cd Wealth
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

5. **Preview production build**
```bash
npm run preview
```

## Project Structure

```
Wealth/
├── index.html                 # Entry HTML file
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── src/
│   ├── main.js              # Application entry point
│   ├── App.vue              # Root component
│   ├── components/          # Reusable components
│   │   └── Layout.vue       # Main layout with navigation
│   ├── views/               # Page components
│   │   ├── Login.vue        # Login page
│   │   ├── Register.vue     # Registration page
│   │   ├── Dashboard.vue    # Dashboard home
│   │   ├── Activities.vue   # Physical activities tracking
│   │   ├── Diet.vue         # Diet logging
│   │   ├── MentalHealth.vue # Mental health tracking
│   │   ├── WellnessPlan.vue # Wellness plans & reminders
│   │   ├── Suggestions.vue  # Random suggestions
│   │   ├── ChatRoom.vue     # Chat functionality
│   │   └── Community.vue    # Community posts
│   ├── stores/              # Pinia state stores
│   │   ├── auth.js          # Authentication store
│   │   └── data.js          # Application data store
│   └── router/              # Vue Router configuration
│       └── index.js         # Route definitions
```

## Usage Guide

### Getting Started

1. **Register an Account**: Create a new account with your name, email, and password
2. **Login**: Access your dashboard with your credentials
3. **Explore Features**: Navigate through different sections using the sidebar menu

### Logging Activities

- Navigate to "Physical Activities"
- Select activity type, duration, calories, and intensity
- Add optional notes
- Click "Add Activity" to save

### Tracking Diet

- Go to "Diet Log"
- Select meal type and enter food items
- Input calories and water intake
- View daily summaries at the top

### Mental Health

- Access "Mental Health" section
- Choose practice type (Meditation, Journaling, etc.)
- Rate your mood before and after
- Track improvements over time

### Setting Reminders

- Visit "Wellness Plans"
- Add reminders for hydration, exercise, etc.
- Set time and frequency
- View and manage active reminders

### Community Interaction

- Share your progress in "Community"
- Like and comment on others' posts
- Ask questions and get support
- Join the "Chat Room" for real-time conversations

## Data Storage

The application uses browser's localStorage to persist data, including:
- User authentication details
- Activity logs
- Meal records
- Mental health logs
- Wellness plans
- Reminders
- Community posts
- Chat messages

**Note**: Data is stored locally on your device and will persist between sessions.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License

## Author

Software Methodology Project
