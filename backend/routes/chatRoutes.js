const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getUnreadCount } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/send', protect, sendMessage);
router.get('/unread', protect, getUnreadCount);
router.get('/:job_request_id', protect, getMessages);

module.exports = router;