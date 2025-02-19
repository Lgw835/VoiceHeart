const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  register,
  login,
  getMe,
  updateMe,
  getUserArticles,
  getFavorites
} = require('../controllers/userController');

// 公开路由
router.post('/register', register);
router.post('/login', login);
router.get('/:id/articles', getUserArticles);

// 需要登录的路由
router.use(protect);
router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/me/favorites', getFavorites);

module.exports = router; 