const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  bulkImportAssets
} = require('../controllers/assetController');

router.get('/', authMiddleware, getAssets);
router.get('/:id', authMiddleware, getAssetById);
router.post('/', authMiddleware, createAsset);
router.put('/:id', authMiddleware, updateAsset);
router.delete('/:id', authMiddleware, deleteAsset);
router.post('/bulk/import', authMiddleware, bulkImportAssets);

module.exports = router;
