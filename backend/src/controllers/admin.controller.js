const { PrismaClient } = require('@prisma/client')
const { sendApprovalEmail, sendDeclineEmail } = require('../utils/email')

const prisma = new PrismaClient()

const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers, pendingApprovals, approvedUsers,
      declinedUsers, totalJobs, activeJobs,
      openReports, totalCompanies
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'PENDING_FINGERPRINT' } }),
      prisma.user.count({ where: { status: 'APPROVED' } }),
      prisma.user.count({ where: { status: 'DECLINED' } }),
      prisma.jobPost.count(),
      prisma.jobPost.count({ where: { isActive: true } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.company.count(),
    ])
    res.status(200).json({
      status: 'success',
      data: { totalUsers, pendingApprovals, approvedUsers, declinedUsers, totalJobs, activeJobs, openReports, totalCompanies }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get dashboard.' })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit
    const where = {}
    if (status) where.status = status
    if (role) where.role = role
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, email: true, phone: true,
          role: true, status: true, isEmailVerified: true,
          referralCode: true, createdAt: true,
          profile: {
            select: { firstName: true, lastName: true, idNumber: true, city: true, province: true, idDocumentUrl: true }
          },
          declaration: true,
        }
      }),
      prisma.user.count({ where })
    ])
    res.status(200).json({
      status: 'success',
      data: { users, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get users.' })
  }
}

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: { include: { education: true, qualifications: true } },
        declaration: true,
      }
    })
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' })
    res.status(200).json({ status: 'success', data: { user } })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get user.' })
  }
}

const approveUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' })
    if (user.status === 'APPROVED') return res.status(400).json({ status: 'error', message: 'User already approved.' })

    await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' }
    })

    try { await sendApprovalEmail(user.email, user.username) } catch (e) { console.error('Email failed:', e.message) }

    res.status(200).json({ status: 'success', message: `User ${user.username} approved successfully.` })
  } catch (error) {
    console.error('Approve user error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to approve user.' })
  }
}

const declineUser = async (req, res) => {
  try {
    const { reason } = req.body
    if (!reason) return res.status(400).json({ status: 'error', message: 'Please provide a reason.' })
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' })

    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'DECLINED' } })

    try { await sendDeclineEmail(user.email, user.username, reason) } catch (e) { console.error('Email failed:', e.message) }

    res.status(200).json({ status: 'success', message: `User ${user.username} declined.` })
  } catch (error) {
    console.error('Decline user error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to decline user.' })
  }
}

const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body
    if (!reason) return res.status(400).json({ status: 'error', message: 'Please provide a reason.' })
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' })
    if (['SUPER_ADMIN', 'ADMIN'].includes(user.role)) return res.status(403).json({ status: 'error', message: 'Cannot suspend admin accounts.' })

    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'SUSPENDED' } })
    res.status(200).json({ status: 'success', message: `User ${user.username} suspended.` })
  } catch (error) {
    console.error('Suspend user error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to suspend user.' })
  }
}

const blockUser = async (req, res) => {
  try {
    const { reason } = req.body
    if (!reason) return res.status(400).json({ status: 'error', message: 'Please provide a reason.' })
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' })
    if (['SUPER_ADMIN', 'ADMIN'].includes(user.role)) return res.status(403).json({ status: 'error', message: 'Cannot block admin accounts.' })

    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'BLOCKED' } })
    res.status(200).json({ status: 'success', message: `User ${user.username} blocked.` })
  } catch (error) {
    console.error('Block user error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to block user.' })
  }
}

const reactivateUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' })
    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'APPROVED' } })
    res.status(200).json({ status: 'success', message: `User ${user.username} reactivated.` })
  } catch (error) {
    console.error('Reactivate user error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to reactivate user.' })
  }
}

const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit
    const where = {}
    if (status) where.status = status
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where, skip: parseInt(skip), take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { reporter: { select: { username: true, email: true } } }
      }),
      prisma.report.count({ where })
    ])
    res.status(200).json({
      status: 'success',
      data: { reports, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } }
    })
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get reports.' })
  }
}

const resolveReport = async (req, res) => {
  try {
    const { actionTaken } = req.body
    if (!actionTaken) return res.status(400).json({ status: 'error', message: 'Please provide action taken.' })
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status: 'RESOLVED', actionTaken }
    })
    res.status(200).json({ status: 'success', message: 'Report resolved.', data: { report } })
  } catch (error) {
    console.error('Resolve report error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to resolve report.' })
  }
}

const createAdminUser = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs')
    const { username, email, password, role } = req.body
    const validAdminRoles = ['ADMIN', 'FINANCE', 'LOGISTICS']
    if (!validAdminRoles.includes(role)) return res.status(400).json({ status: 'error', message: 'Invalid admin role.' })
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (existing) return res.status(400).json({ status: 'error', message: 'Username or email already exists.' })
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, role, status: 'APPROVED', isEmailVerified: true },
      select: { id: true, username: true, email: true, role: true, status: true }
    })
    res.status(201).json({ status: 'success', message: `${role} account created successfully.`, data: { user } })
  } catch (error) {
    console.error('Create admin error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to create admin user.' })
  }
}

module.exports = {
  getDashboard, getAllUsers, getUserById, approveUser, declineUser,
  suspendUser, blockUser, reactivateUser, getAllReports, resolveReport, createAdminUser,
}
