const express = require('express')
const router = express.Router()
const { protect, restrictTo } = require('../middleware/auth')
const {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  getAdminJobPosts,
} = require('../controllers/jobboard.controller')

router.get('/', getAllJobPosts)
router.get('/:id', getJobPostById)
router.use(protect)
router.post('/', restrictTo('ADMIN', 'SUPER_ADMIN'), createJobPost)
router.put('/:id', restrictTo('ADMIN', 'SUPER_ADMIN'), updateJobPost)
router.delete('/:id', restrictTo('ADMIN', 'SUPER_ADMIN'), deleteJobPost)
router.get('/admin/all', restrictTo('ADMIN', 'SUPER_ADMIN'), getAdminJobPosts)

module.exports = router
