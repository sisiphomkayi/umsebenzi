const express = require('express')
const router = express.Router()
const { protect, restrictTo } = require('../middleware/auth')
const {
  createGigRequest,
  getOpenGigs,
  getGigById,
  acceptGig,
  createContract,
  signContract,
  updateJobStatus,
  getMyGigs,
} = require('../controllers/gig.controller')

router.get('/', getOpenGigs)
router.get('/my', protect, getMyGigs)
router.get('/:id', getGigById)
router.post('/', protect, restrictTo('CLIENT', 'COMPANY'), createGigRequest)
router.patch('/:id/accept', protect, restrictTo('JOB_SEEKER'), acceptGig)
router.post('/:id/contract', protect, createContract)
router.patch('/:id/sign', protect, signContract)
router.patch('/:id/status', protect, updateJobStatus)

module.exports = router
