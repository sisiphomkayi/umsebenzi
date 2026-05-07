const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { createReview, getUserReviews, reportUser } = require('../controllers/review.controller')

router.get('/user/:userId', getUserReviews)
router.post('/job/:jobId', protect, createReview)
router.post('/report/:userId', protect, reportUser)

module.exports = router
