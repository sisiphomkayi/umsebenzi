const crypto = require('crypto')

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const generateReferralCode = (username) => {
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `${username.toUpperCase().slice(0, 4)}${suffix}`
}

const generateReference = () => {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `UMS-${year}-${random}`
}

const isOTPExpired = (expiry) => {
  return new Date() > new Date(expiry)
}

module.exports = {
  generateOTP,
  generateReferralCode,
  generateReference,
  isOTPExpired,
}
