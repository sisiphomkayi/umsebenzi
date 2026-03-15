const express = require('express');
const router = express.Router();
const { getWalletBalance, getTransactions, completeJobAndPay, rateUser } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.get('/balance', protect, getWalletBalance);
router.get('/transactions', protect, getTransactions);
router.put('/complete/:job_request_id', protect, completeJobAndPay);
router.post('/rate', protect, rateUser);

module.exports = router;