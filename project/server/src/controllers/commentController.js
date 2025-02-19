const Article = require('../models/Article');

// @desc    获取文章评论
// @route   GET /api/articles/:id/comments
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 计算分页
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = article.comments.length;

    // 获取当前页的评论
    const comments = article.comments
      .sort((a, b) => b.createTime - a.createTime)
      .slice(startIndex, endIndex);

    res.json({
      success: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    添加评论
// @route   POST /api/articles/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const comment = {
      userId: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      content: req.body.content,
      createTime: new Date()
    };

    await article.addComment(comment);

    res.status(201).json({
      success: true,
      message: '评论发表成功',
      comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    点赞评论
// @route   POST /api/articles/:id/comments/:commentId/like
// @access  Private
exports.likeComment = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const comment = article.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    comment.likes = (comment.likes || 0) + 1;
    await article.save();

    res.json({
      success: true,
      message: '点赞成功',
      likes: comment.likes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    删除评论
// @route   DELETE /api/articles/:id/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const comment = article.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 检查删除权限（评论作者或文章作者或管理员）
    if (comment.userId.toString() !== req.user._id.toString() && 
        article.author.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '您没有权限删除此评论'
      });
    }

    await article.removeComment(req.params.commentId);

    res.json({
      success: true,
      message: '评论已删除'
    });
  } catch (error) {
    next(error);
  }
}; 