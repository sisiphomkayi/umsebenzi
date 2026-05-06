const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Please login.'
      })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        isEmailVerified: true,
      }
    })
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists.'
      })
    }
    if (user.status === 'BLOCKED') {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been blocked. Contact support.'
      })
    }
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been suspended. Contact support.'
      })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please login again.'
    })
  }
}

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      })
    }
    next()
  }
}

module.exports = { protect, restrictTo }
