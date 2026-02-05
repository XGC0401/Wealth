# File-Based User Storage

User login information is now stored in a **JSON file** instead of browser localStorage.

## File Location

📁 **`/workspaces/Wealth/data/users.json`**

This file stores:
- All registered users (username, email, name, password)
- Active login sessions (tokens)

## How to Use

### Option 1: Run Everything Together
```bash
npm start
```
This runs both the backend server (port 3100) and frontend (port 3002) simultaneously.

### Option 2: Run Separately
Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## Architecture

```
┌─────────────┐         HTTP Requests        ┌──────────────┐
│   Vue App   │  ────────────────────────>   │ Express API  │
│ (Frontend)  │                              │  (Backend)   │
│ Port 3002   │  <────────────────────────   │  Port 3100   │
└─────────────┘                              └──────────────┘
                                                     │
                                                     │ Read/Write
                                                     ▼
                                             ┌──────────────┐
                                             │ users.json   │
                                             │ (File Store) │
                                             └──────────────┘
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify` - Verify token
- `GET /api/users` - Get all users (debugging)

## Data Format

```json
{
  "users": [
    {
      "id": "user_john_1234567890",
      "username": "john",
      "email": "john@example.com",
      "name": "John Doe",
      "password": "password123",
      "createdAt": "2026-02-05T10:30:00.000Z"
    }
  ],
  "sessions": {
    "token_1234567890_abc123": {
      "userId": "user_john_1234567890",
      "username": "john",
      "createdAt": "2026-02-05T10:35:00.000Z"
    }
  }
}
```

## Benefits

✅ Data persists in a file (not just browser)
✅ Can be backed up, version controlled
✅ Can view/edit user data directly
✅ Multiple browsers can share same data
✅ More realistic web app architecture

## Important Notes

⚠️ **Security Warning**: This is for development/learning purposes only!
- Passwords are stored in plain text (should be hashed in production)
- No HTTPS encryption
- No input validation
- No rate limiting

For production, use proper authentication systems like:
- JWT with bcrypt password hashing
- OAuth (Google, Facebook login)
- Auth services (Auth0, Firebase Auth)
