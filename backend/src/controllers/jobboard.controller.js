const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ─── CREATE JOB POST (ADMIN ONLY) ────────────────────────
const createJobPost = async (req, res) => {
  try {
    const {
      title, company, location, description,
      requirements, salary, jobType, openDate, closeDate
    } = req.body

    if (!title || !company || !location || !description || !jobType || !openDate || !closeDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields.'
      })
    }

    if (new Date(closeDate) <= new Date(openDate)) {
      return res.status(400).json({
        status: 'error',
        message: 'Closing date must be after opening date.'
      })
    }

    const jobPost = await prisma.jobPost.create({
      data: {
        title, company, location, description,
        requirements, salary, jobType,
        postedById: req.user.id,
        openDate: new Date(openDate),
        closeDate: new Date(closeDate),
        isActive: true,
      }
    })

    res.status(201).json({
      status: 'success',
      message: 'Job post created successfully!',
      data: { jobPost }
    })
  } catch (error) {
    console.error('Create job post error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to create job post.' })
  }
}

// ─── GET ALL JOB POSTS (PUBLIC) ───────────────────────────
const getAllJobPosts = async (req, res) => {
  try {
    const {
      search, location, jobType,
      page = 1, limit = 20
    } = req.query

    const skip = (page - 1) * limit
    const now = new Date()

    const where = {
      isActive: true,
      closeDate: { gte: now },
      openDate: { lte: now },
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (location) where.location = { contains: location, mode: 'insensitive' }
    if (jobType) where.jobType = jobType

    const [jobPosts, total] = await Promise.all([
      prisma.jobPost.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobPost.count({ where })
    ])

    res.status(200).json({
      status: 'success',
      data: {
        jobPosts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get job posts error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get job posts.' })
  }
}

// ─── GET SINGLE JOB POST ──────────────────────────────────
const getJobPostById = async (req, res) => {
  try {
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: req.params.id }
    })

    if (!jobPost) {
      return res.status(404).json({ status: 'error', message: 'Job post not found.' })
    }

    res.status(200).json({ status: 'success', data: { jobPost } })
  } catch (error) {
    console.error('Get job post error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get job post.' })
  }
}

// ─── UPDATE JOB POST (ADMIN ONLY) ────────────────────────
const updateJobPost = async (req, res) => {
  try {
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: req.params.id }
    })

    if (!jobPost) {
      return res.status(404).json({ status: 'error', message: 'Job post not found.' })
    }

    const updated = await prisma.jobPost.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        openDate: req.body.openDate ? new Date(req.body.openDate) : undefined,
        closeDate: req.body.closeDate ? new Date(req.body.closeDate) : undefined,
      }
    })

    res.status(200).json({
      status: 'success',
      message: 'Job post updated successfully!',
      data: { jobPost: updated }
    })
  } catch (error) {
    console.error('Update job post error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to update job post.' })
  }
}

// ─── DELETE JOB POST (ADMIN ONLY) ────────────────────────
const deleteJobPost = async (req, res) => {
  try {
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: req.params.id }
    })

    if (!jobPost) {
      return res.status(404).json({ status: 'error', message: 'Job post not found.' })
    }

    await prisma.jobPost.delete({ where: { id: req.params.id } })

    res.status(200).json({
      status: 'success',
      message: 'Job post deleted successfully.'
    })
  } catch (error) {
    console.error('Delete job post error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to delete job post.' })
  }
}

// ─── DEACTIVATE EXPIRED POSTS (AUTO) ─────────────────────
const deactivateExpiredPosts = async () => {
  try {
    const result = await prisma.jobPost.updateMany({
      where: {
        isActive: true,
        closeDate: { lt: new Date() }
      },
      data: { isActive: false }
    })
    console.log(`✅ Deactivated ${result.count} expired job posts`)
  } catch (error) {
    console.error('Deactivate expired posts error:', error)
  }
}

// ─── GET ADMIN JOB POSTS (ALL INCLUDING EXPIRED) ─────────
const getAdminJobPosts = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit
    const where = {}
    if (isActive !== undefined) where.isActive = isActive === 'true'

    const [jobPosts, total] = await Promise.all([
      prisma.jobPost.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobPost.count({ where })
    ])

    res.status(200).json({
      status: 'success',
      data: {
        jobPosts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get admin job posts error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get job posts.' })
  }
}

module.exports = {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  deactivateExpiredPosts,
  getAdminJobPosts,
}
