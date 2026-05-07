const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ─── CREATE GIG REQUEST (CLIENT) ─────────────────────────
const createGigRequest = async (req, res) => {
  try {
    const {
      title, description, category,
      location, budget, requiresTransport,
      startDate, endDate
    } = req.body

    if (!title || !description || !category || !location || !budget) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide title, description, category, location and budget.'
      })
    }

    const job = await prisma.job.create({
      data: {
        title, description, category,
        location, budget: parseFloat(budget),
        clientId: req.user.id,
        requiresTransport: requiresTransport || false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'OPEN',
      }
    })

    res.status(201).json({
      status: 'success',
      message: 'Gig request created successfully!',
      data: { job }
    })
  } catch (error) {
    console.error('Create gig error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to create gig request.' })
  }
}

// ─── GET ALL OPEN GIGS (JOB SEEKERS BROWSE) ──────────────
const getOpenGigs = async (req, res) => {
  try {
    const { category, location, page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const where = { status: 'OPEN' }
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (location) where.location = { contains: location, mode: 'insensitive' }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              username: true,
              profile: {
                select: { firstName: true, lastName: true, city: true }
              }
            }
          }
        }
      }),
      prisma.job.count({ where })
    ])

    res.status(200).json({
      status: 'success',
      data: {
        jobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get open gigs error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get gigs.' })
  }
}

// ─── GET SINGLE GIG ───────────────────────────────────────
const getGigById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        client: {
          select: {
            username: true,
            profile: { select: { firstName: true, lastName: true, city: true } }
          }
        },
        seeker: {
          select: {
            username: true,
            profile: { select: { firstName: true, lastName: true } }
          }
        },
        contract: true,
        transport: true,
      }
    })

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Gig not found.' })
    }

    res.status(200).json({ status: 'success', data: { job } })
  } catch (error) {
    console.error('Get gig error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get gig.' })
  }
}

// ─── ACCEPT GIG (JOB SEEKER) ──────────────────────────────
const acceptGig = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } })

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Gig not found.' })
    }

    if (job.status !== 'OPEN') {
      return res.status(400).json({ status: 'error', message: 'This gig is no longer available.' })
    }

    if (job.clientId === req.user.id) {
      return res.status(400).json({ status: 'error', message: 'You cannot accept your own gig.' })
    }

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        seekerId: req.user.id,
        status: 'ASSIGNED',
      }
    })

    res.status(200).json({
      status: 'success',
      message: 'Gig accepted! Please proceed to create a contract.',
      data: { job: updated }
    })
  } catch (error) {
    console.error('Accept gig error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to accept gig.' })
  }
}

// ─── CREATE CONTRACT ──────────────────────────────────────
const createContract = async (req, res) => {
  try {
    const { terms, duration, amount } = req.body

    if (!terms || !duration || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide terms, duration and amount.'
      })
    }

    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { contract: true }
    })

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Gig not found.' })
    }

    if (job.contract) {
      return res.status(400).json({ status: 'error', message: 'Contract already exists for this gig.' })
    }

    if (job.clientId !== req.user.id && job.seekerId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized for this gig.' })
    }

    const contract = await prisma.contract.create({
      data: {
        jobId: job.id,
        terms, duration,
        amount: parseFloat(amount),
        clientSigned: job.clientId === req.user.id,
        seekerSigned: job.seekerId === req.user.id,
      }
    })

    res.status(201).json({
      status: 'success',
      message: 'Contract created! Waiting for other party to sign.',
      data: { contract }
    })
  } catch (error) {
    console.error('Create contract error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to create contract.' })
  }
}

// ─── SIGN CONTRACT ────────────────────────────────────────
const signContract = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { contract: true }
    })

    if (!job || !job.contract) {
      return res.status(404).json({ status: 'error', message: 'Contract not found.' })
    }

    if (job.clientId !== req.user.id && job.seekerId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized for this contract.' })
    }

    const isClient = job.clientId === req.user.id
    const updateData = isClient
      ? { clientSigned: true }
      : { seekerSigned: true }

    const contract = await prisma.contract.findUnique({ where: { jobId: job.id } })
    const bothSigned = isClient ? contract.seekerSigned : contract.clientSigned

    if (bothSigned) {
      updateData.signedAt = new Date()
    }

    const updated = await prisma.contract.update({
      where: { jobId: job.id },
      data: updateData
    })

    if (updated.clientSigned && updated.seekerSigned) {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'IN_PROGRESS' }
      })

      if (job.requiresTransport) {
        await prisma.transport.create({
          data: {
            jobId: job.id,
            fee: job.transportFee || 0,
            status: 'PENDING',
          }
        })
      }
    }

    res.status(200).json({
      status: 'success',
      message: updated.clientSigned && updated.seekerSigned
        ? 'Contract fully signed! Job is now in progress.'
        : 'Contract signed! Waiting for other party.',
      data: { contract: updated }
    })
  } catch (error) {
    console.error('Sign contract error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to sign contract.' })
  }
}

// ─── UPDATE JOB STATUS ────────────────────────────────────
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['IN_PROGRESS', 'AWAITING_CONFIRMATION', 'COMPLETED', 'CANCELLED']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status.' })
    }

    const job = await prisma.job.findUnique({ where: { id: req.params.id } })

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Gig not found.' })
    }

    if (job.clientId !== req.user.id && job.seekerId !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized.' })
    }

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: { status }
    })

    res.status(200).json({
      status: 'success',
      message: `Job status updated to ${status}.`,
      data: { job: updated }
    })
  } catch (error) {
    console.error('Update job status error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to update job status.' })
  }
}

// ─── GET MY GIGS ──────────────────────────────────────────
const getMyGigs = async (req, res) => {
  try {
    const isSeeker = req.user.role === 'JOB_SEEKER'

    const jobs = await prisma.job.findMany({
      where: isSeeker
        ? { seekerId: req.user.id }
        : { clientId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        contract: true,
        transport: true,
        client: {
          select: {
            username: true,
            profile: { select: { firstName: true, lastName: true } }
          }
        },
        seeker: {
          select: {
            username: true,
            profile: { select: { firstName: true, lastName: true } }
          }
        },
      }
    })

    res.status(200).json({ status: 'success', data: { jobs } })
  } catch (error) {
    console.error('Get my gigs error:', error)
    res.status(500).json({ status: 'error', message: 'Failed to get your gigs.' })
  }
}

module.exports = {
  createGigRequest,
  getOpenGigs,
  getGigById,
  acceptGig,
  createContract,
  signContract,
  updateJobStatus,
  getMyGigs,
}
