const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ─── CREATE REVIEW ────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const { jobId } = req.params

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5.'
      })
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } })

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found.' })
    }

    if (job.status !== 'COMPLETED') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only review completed jobs.'
      })
    }

    if (job.clientId !== req.user.id && job.seekerId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized.' })
    }

    const revieweeId = job.clientId === req.user.id ? job.seekerId : job.clientId

    const existing = await prisma.review.findFirst({
      where: { jobId, reviewerId: req.user.id }
    })

    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this job.'
      })
    }

    const review = await prisma.review.create({
      data: {
        jobId,
        reviewerId: req.user.id,
        revieweeId,
        rating: parseFloat(rating),
        comment,
      }
    })

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully!',
      data: { review }
    })
  } catch (error) {
    console.error('Create review error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to submit review.' })
  }
}

// ─── GET USER REVIEWS ─────────────────────────────────────
const getUserReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: req.params.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            username: true,
            profile: { select: { firstName: true, lastName: true, profilePhoto: true } }
          }
        }
      }
    })

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        totalReviews: reviews.length,
        averageRating: Math.round(avgRating * 10) / 10
      }
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get reviews.' })
  }
}

// ─── REPORT USER ──────────────────────────────────────────
const reportUser = async (req, res) => {
  try {
    const { reason, details } = req.body

    if (!reason) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a reason for reporting.'
      })
    }

    if (req.params.userId === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot report yourself.'
      })
    }

    const reportedUser = await prisma.user.findUnique({
      where: { id: req.params.userId }
    })

    if (!reportedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found.' })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        reportedId: req.params.userId,
        reason,
        details,
        status: 'PENDING',
      }
    })

    res.status(201).json({
      status: 'success',
      message: 'Report submitted. Our team will review it shortly.',
      data: { report }
    })
  } catch (error) {
    console.error('Report user error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to submit report.' })
  }
}

module.exports = { createReview, getUserReviews, reportUser }
