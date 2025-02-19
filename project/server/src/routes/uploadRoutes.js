const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { uploadFile, handleUpload } = require('../controllers/uploadController');

// 文件上传路由（需要登录）
router.post('/', protect, uploadFile, handleUpload);

module.exports = router; 