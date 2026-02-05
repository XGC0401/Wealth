import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3100
const USERS_FILE = path.join(__dirname, 'data', 'users.json')

app.use(cors())
app.use(express.json())

// Helper function to read users data
async function readUsersData() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { users: [], sessions: {} }
  }
}

// Helper function to write users data
async function writeUsersData(data) {
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, name, password } = req.body
    const data = await readUsersData()

    // Check if username already exists
    const existingUser = data.users.find(u => u.username === username)
    if (existingUser) {
      return res.status(400).json({ success: false, message: '使用者名稱已存在' })
    }

    // Create new user
    const newUser = {
      id: `user_${username}_${Date.now()}`,
      username,
      email,
      name,
      password, // In production, this should be hashed!
      createdAt: new Date().toISOString()
    }

    data.users.push(newUser)
    
    // Create session token
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    data.sessions[token] = {
      userId: newUser.id,
      username: newUser.username,
      createdAt: new Date().toISOString()
    }

    await writeUsersData(data)

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    res.json({ 
      success: true, 
      user: userWithoutPassword,
      token 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const data = await readUsersData()

    // Find user
    const user = data.users.find(u => u.username === username && u.password === password)
    if (!user) {
      return res.status(401).json({ success: false, message: '使用者名稱或密碼錯誤' })
    }

    // Create session token
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    data.sessions[token] = {
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString()
    }

    await writeUsersData(data)

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    res.json({ 
      success: true, 
      user: userWithoutPassword,
      token 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { token } = req.body
    const data = await readUsersData()

    // Remove session
    if (data.sessions[token]) {
      delete data.sessions[token]
      await writeUsersData(data)
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Verify token
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body
    const data = await readUsersData()

    const session = data.sessions[token]
    if (!session) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    const user = data.users.find(u => u.id === session.userId)
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get all users (for debugging)
app.get('/api/users', async (req, res) => {
  try {
    const data = await readUsersData()
    const usersWithoutPasswords = data.users.map(({ password, ...user }) => user)
    res.json({ success: true, users: usersWithoutPasswords })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📁 Storing user data in: ${USERS_FILE}`)
})
