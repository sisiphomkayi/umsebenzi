const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getMyProfile,
  upsertProfile,
  addEducation,
  addQualification,
  submitDeclaration,
  getProfileStrength,
} = require('../controllers/profile.controller')

router.use(protect)
router.get('/', getMyProfile)
router.put('/', upsertProfile)
router.post('/education', addEducation)
router.post('/qualification', addQualification)
router.post('/declaration', submitDeclaration)
router.get('/strength', getProfileStrength)

module.exports = router
