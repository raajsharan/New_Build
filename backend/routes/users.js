const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  getUsers,
  updateUserPermission,
  updateUserPageVisibility
} = require('../controllers/userController');

router.get('/', authMiddleware, adminMiddleware, getUsers);
router.put('/:id/permission', authMiddleware, adminMiddleware, updateUserPermission);
router.put('/:id/page-visibility', authMiddleware, adminMiddleware, updateUserPageVisibility);

module.exports = router;
