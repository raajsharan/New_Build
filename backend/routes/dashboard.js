const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getDashboardSummary } = require('../controllers/dashboardController');

router.get('/summary', authMiddleware, getDashboardSummary);

module.exports = router;
