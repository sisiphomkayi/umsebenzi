const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const { generateOTP, generateReferralCode, generateReference, isOTPExpired } = require('../utils/otp')
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/email')

const prisma = new PrismaClient()

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

// ─── REGISTER ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body

    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username, email, password and role.'
      })
    }

    // Validate role
    const validRoles = ['JOB_SEEKER', 'CLIENT', 'COMPANY', 'LOGISTICS']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be JOB_SEEKER, CLIENT, COMPANY or LOGISTICS.'
      })
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character.'
      })
    }

    // Check if username contains name-like pattern (at least 3 chars, no numbers only)
    if (username.length < 3 || /^\d+$/.test(username)) {
      return res.status(400).json({
        status: 'error',
        message: 'Username must be at least 3 characters and cannot be numbers only.'
      })
    }

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    })

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: existingUser.email === email
          ? 'Email already registered.'
          : 'Username already taken.'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Generate referral code
    const referralCode = generateReferralCode(username)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        phone,
        password: hashedPassword,
        role,
        referralCode,
        otpCode: otp,
        otpExpiry,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        referralCode: true,
        createdAt: true,
      }
    })

    // Send OTP email
    await sendOTPEmail(email, otp, username)

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Please check your email for the OTP to verify your account.',
      data: { user }
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Registration failed. Please try again.'
    })
  }
}

// ─── VERIFY OTP ───────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and OTP.'
      })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.'
      })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already verified.'
      })
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP.'
      })
    }

    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired. Please request a new one.'
      })
    }

    // Generate reference number
    const refNumber = generateReference()

    // Update user
    await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        status: 'PENDING_FINGERPRINT',
        otpCode: null,
        otpExpiry: null,
        referralCode: refNumber,
      }
    })

    // Send welcome email with PostNet instructions
    await sendWelcomeEmail(email, user.username)

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully! Please visit PostNet to complete your verification.',
      data: { referenceNumber: refNumber }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({
      status: 'error',
      message: 'OTP verification failed. Please try again.'
    })
  }
}

// ─── RESEND OTP ───────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.'
      })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already verified.'
      })
    }

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: { otpCode: otp, otpExpiry }
    })

    await sendOTPEmail(email, otp, user.username)

    res.status(200).json({
      status: 'success',
      message: 'New OTP sent to your email.'
    })

  } catch (error) {
    console.error('Resend OTP error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend OTP.'
    })
  }
}

// ─── LOGIN ────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username and password.'
      })
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password.'
      })
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        status: 'error',
        message: 'Please verify your email first.'
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

    const token = signToken(user.id)

    res.status(200).json({
      status: 'success',
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
        }
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Login failed. Please try again.'
    })
  }
}

// ─── FORGOT PASSWORD ──────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'If that email exists, an OTP has been sent.'
      })
    }

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: { otpCode: otp, otpExpiry }
    })

    await sendOTPEmail(email, otp, user.username)

    res.status(200).json({
      status: 'success',
      message: 'If that email exists, an OTP has been sent.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to process request.'
    })
  }
}

// ─── RESET PASSWORD ───────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.'
      })
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP.'
      })
    }

    if (isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired. Please request a new one.'
      })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character.'
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpiry: null,
      }
    })

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful! Please login with your new password.'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Password reset failed.'
    })
  }
}

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
}
