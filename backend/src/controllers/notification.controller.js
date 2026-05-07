const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ─── CREATE NOTIFICATION (INTERNAL HELPER) ───────────────
const createNotification = async (userId, title, message, type) => {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type }
    })
  } catch (error) {
    console.error('Create notification error:', error)
  }
}

// ─── GET MY NOTIFICATIONS ─────────────────────────────────
const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ])

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get notifications.' })
  }
}

// ─── MARK AS READ ─────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      data: { isRead: true }
    })

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read.'
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to mark notification as read.' })
  }
}

// ─── MARK ALL AS READ ─────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    })

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.'
    })
  } catch (error) {
    console.error('Mark all as read error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to mark all as read.' })
  }
}

// ─── DELETE NOTIFICATION ──────────────────────────────────
const deleteNotification = async (req, res) => {
  try {
    await prisma.notification.delete({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    })

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted.'
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to delete notification.' })
  }
}

// ─── ADMIN SEND ANNOUNCEMENT ──────────────────────────────
const sendAnnouncement = async (req, res) => {
  try {
    const { title, message, type = 'ANNOUNCEMENT', role } = req.body

    if (!title || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide title and message.'
      })
    }

    const where = {}
    if (role) where.role = role

    const users = await prisma.user.findMany({
      where,
      select: { id: true }
    })

    await prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        title,
        message,
        type,
      }))
    })

    res.status(200).json({
      status: 'success',
      message: `Announcement sent to ${users.length} users.`
    })
  } catch (error) {
    console.error('Send announcement error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to send announcement.' })
  }
}

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendAnnouncement,
}
