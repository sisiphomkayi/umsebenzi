const express = require('express')
const router = express.Router()
const { protect, restrictTo } = require('../middleware/auth')
const {
  getDashboard,
  getAllUsers,
  getUserById,
  approveUser,
  declineUser,
  suspendUser,
  blockUser,
  reactivateUser,
  getAllReports,
  resolveReport,
  createAdminUser,
} = require('../controllers/admin.controller')

router.use(protect)
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'))

router.get('/dashboard', getDashboard)
router.get('/users', getAllUsers)
router.get('/users/:id', getUserById)
router.patch('/users/:id/approve', approveUser)
router.patch('/users/:id/decline', declineUser)
router.patch('/users/:id/suspend', suspendUser)
router.patch('/users/:id/block', blockUser)
router.patch('/users/:id/reactivate', reactivateUser)
router.get('/reports', getAllReports)
router.patch('/reports/:id/resolve', resolveReport)
router.post('/create-admin', restrictTo('SUPER_ADMIN'), createAdminUser)

module.exports = router
