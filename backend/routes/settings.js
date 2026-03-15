const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  getSettings,
  updateSetting,
  updateDatabaseConfig,
  updateCompanyLogo,
  getPasswordVisibility,
  updatePasswordVisibility
} = require('../controllers/settingsController');

router.get('/', authMiddleware, getSettings);
router.post('/update', authMiddleware, adminMiddleware, updateSetting);
router.post('/database', authMiddleware, adminMiddleware, updateDatabaseConfig);
router.post('/company', authMiddleware, adminMiddleware, updateCompanyLogo);
router.get('/password-visibility', authMiddleware, getPasswordVisibility);
router.post('/password-visibility', authMiddleware, adminMiddleware, updatePasswordVisibility);

module.exports = router;
