const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  favoriteArticle,
  unfavoriteArticle,
  saveArticleDraft,
  getUserDrafts
} = require('../controllers/articleController');

const {
  getComments,
  addComment,
  likeComment,
  deleteComment
} = require('../controllers/commentController');

// 公开路由
router.get('/', getArticles);
router.get('/:id', getArticle);

// 草稿相关路由（需要登录）
router.post('/draft', protect, saveArticleDraft);
router.get('/drafts', protect, getUserDrafts);

// 创建文章（仅创作者和管理员）
router.post('/', protect, authorize('creator', 'admin'), createArticle);

// 更新和删除文章（作者和管理员）
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

// 文章互动
router.post('/:id/like', protect, likeArticle);
router.post('/:id/favorite', protect, favoriteArticle);
router.delete('/:id/favorite', protect, unfavoriteArticle);

// 评论相关路由
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);
router.post('/:id/comments/:commentId/like', protect, likeComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router; 