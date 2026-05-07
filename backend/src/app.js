const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { deactivateExpiredPosts } = require('./controllers/jobboard.controller')

const authRoutes = require('./routes/auth.routes')
const profileRoutes = require('./routes/profile.routes')
const adminRoutes = require('./routes/admin.routes')
const jobboardRoutes = require('./routes/jobboard.routes')

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

setInterval(deactivateExpiredPosts, 60 * 60 * 1000)

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Umsebenzi API is running',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/jobs', jobboardRoutes)

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  })
})

module.exports = app
