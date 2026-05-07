const express = require('express')
const router = express.Router()
const { protect, restrictTo } = require('../middleware/auth')
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendAnnouncement,
} = require('../controllers/notification.controller')

router.use(protect)
router.get('/', getMyNotifications)
router.patch('/:id/read', markAsRead)
router.patch('/read-all', markAllAsRead)
router.delete('/:id', deleteNotification)
router.post('/announce', restrictTo('ADMIN', 'SUPER_ADMIN'), sendAnnouncement)

module.exports = router
