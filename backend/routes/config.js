const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  getTables,
  getConfigData,
  addConfigData,
  updateConfigData,
  deleteConfigData
} = require('../controllers/configController');

router.get('/', authMiddleware, getTables);
router.get('/:table', authMiddleware, getConfigData);
router.post('/:table', authMiddleware, adminMiddleware, addConfigData);
router.put('/:table/:id', authMiddleware, adminMiddleware, updateConfigData);
router.delete('/:table/:id', authMiddleware, adminMiddleware, deleteConfigData);

module.exports = router;
