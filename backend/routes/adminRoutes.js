const express = require('express');
const router = express.Router();
const {
  adminLogin, createSuperAdmin, getDashboardStats,
  getAllUsers, updateUserStatus, getPendingApprovals, getAllCompanies
} = require('../controllers/adminController');
const { adminProtect, roleRequired } = require('../middleware/adminAuth');

// Public
router.post('/login', adminLogin);
router.post('/create', createSuperAdmin);

// Protected
router.get('/dashboard', adminProtect, getDashboardStats);
router.get('/users', adminProtect, getAllUsers);
router.get('/users/pending', adminProtect, getPendingApprovals);
router.put('/users/:id/status', adminProtect, updateUserStatus);
router.get('/companies', adminProtect, getAllCompanies);

module.exports = router;