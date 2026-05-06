const express = require('express');
const router = express.Router();
const { createJob, applyForJob, getNoticeboardJobs, getJobsBySkill, getJobById, getNearbyWorkers, requestWorker, respondToJobRequest, getMyJobRequests } = require('../controllers/jobsController');
const { protect } = require('../middleware/auth');

router.get('/noticeboard', getNoticeboardJobs);
router.get('/workers/nearby', protect, getNearbyWorkers);
router.get('/my-requests', protect, getMyJobRequests);
router.get('/skill/:skill_category', protect, getJobsBySkill);
router.get('/:id', protect, getJobById);
router.post('/', protect, createJob);
router.post('/request-worker', protect, requestWorker);
router.put('/requests/:id/respond', protect, respondToJobRequest);

module.exports = router;router.post('/apply', protect, applyForJob);
