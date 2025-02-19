const Article = require('../models/Article');
const User = require('../models/User');

// @desc    创建文章
// @route   POST /api/articles
// @access  Private (creator, admin)
exports.createArticle = async (req, res, next) => {
  try {
    const { title, content, summary, category, tags, status = 'published' } = req.body;

    const article = await Article.create({
      title,
      content,
      summary,
      category,
      tags,
      status,
      author: {
        userId: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar
      },
      publishTime: status === 'published' ? new Date() : null
    });

    // 更新用户的文章列表
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        articles: {
          articleId: article._id,
          title: article.title,
          coverUrl: article.coverUrl,
          updateTime: article.updateTime
        }
      }
    });

    // 如果是已发布状态，更新用户的文章统计
    if (status === 'published') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.articles': 1 }
      });
    }

    res.status(201).json({
      success: true,
      article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取文章列表
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, tag, status = 'published' } = req.query;
    
    const query = { status };
    if (category) query.category = category;
    if (tag) query.tags = tag;

    const articles = await Article.find(query)
      .sort({ createTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      count: articles.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取文章详情
// @route   GET /api/articles/:id
// @access  Public/Private
exports.getArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 检查文章状态权限
    if (article.status !== 'published' && 
        (!req.user || (req.user._id.toString() !== article.author.userId.toString() && 
        req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: '您没有权限查看此文章'
      });
    }

    // 如果是作者本人查看，不增加浏览量
    if (!req.user || req.user._id.toString() !== article.author.userId.toString()) {
      article.stats.views += 1;
      await article.save();
    }

    res.json({
      success: true,
      article,
      isAuthor: req.user && req.user._id.toString() === article.author.userId.toString()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新文章
// @route   PUT /api/articles/:id
// @access  Private (author, admin)
exports.updateArticle = async (req, res, next) => {
  try {
    const { title, content, summary, category, tags, status } = req.body;

    let article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 检查更新权限
    if (article.author.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '您没有权限修改此文章'
      });
    }

    // 更新文章
    article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        summary,
        category,
        tags,
        status,
        updateTime: new Date()
      },
      { new: true, runValidators: true }
    );

    // 更新用户的文章列表
    await User.updateOne(
      { 
        _id: article.author.userId,
        'articles.articleId': article._id
      },
      {
        $set: {
          'articles.$.title': article.title,
          'articles.$.status': article.status,
          'articles.$.updateTime': article.updateTime
        }
      }
    );

    res.json({
      success: true,
      article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    删除文章
// @route   DELETE /api/articles/:id
// @access  Private (author, admin)
exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 检查删除权限
    if (article.author.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '您没有权限删除此文章'
      });
    }

    // 使用新版本的删除方法
    await Article.deleteOne({ _id: article._id });

    // 从用户的文章列表中移除
    await User.updateOne(
      { _id: article.author.userId },
      { $pull: { articles: { articleId: article._id } } }
    );

    // 从所有用户的收藏列表中移除
    await User.updateMany(
      { 'favorites.articleId': article._id },
      { $pull: { favorites: { articleId: article._id } } }
    );

    res.json({
      success: true,
      message: '文章已删除'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    点赞文章
// @route   POST /api/articles/:id/like
// @access  Private
exports.likeArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    article.stats.likes += 1;
    await article.save();

    res.json({
      success: true,
      likes: article.stats.likes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    收藏文章
// @route   POST /api/articles/:id/favorite
// @access  Private
exports.favoriteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 检查是否已收藏
    const user = await User.findById(req.user._id);
    const isAlreadyFavorited = user.favorites.some(
      fav => fav.articleId.toString() === article._id.toString()
    );

    if (isAlreadyFavorited) {
      return res.status(400).json({
        success: false,
        message: '您已收藏过此文章'
      });
    }

    // 添加到收藏
    user.favorites.push({
      articleId: article._id,
      createTime: new Date()
    });
    await user.save();

    // 更新文章收藏数
    article.stats.collections += 1;
    await article.save();

    res.json({
      success: true,
      message: '收藏成功'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    取消收藏文章
// @route   DELETE /api/articles/:id/favorite
// @access  Private
exports.unfavoriteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 从收藏列表中移除
    const user = await User.findById(req.user._id);
    const favoriteExists = user.favorites.some(
      fav => fav.articleId.toString() === article._id.toString()
    );

    if (!favoriteExists) {
      return res.status(400).json({
        success: false,
        message: '您未收藏此文章'
      });
    }

    user.favorites = user.favorites.filter(
      fav => fav.articleId.toString() !== article._id.toString()
    );
    await user.save();

    // 更新文章收藏数
    article.stats.collections -= 1;
    await article.save();

    res.json({
      success: true,
      message: '已取消收藏'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    保存文章草稿
// @route   POST /api/articles/draft
// @access  Private
exports.saveArticleDraft = async (req, res, next) => {
  try {
    const { title, content, summary, category, tags } = req.body;

    const article = await Article.create({
      title,
      content,
      summary,
      category,
      tags,
      status: 'draft',
      author: {
        userId: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar
      }
    });

    // 更新用户的文章列表
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        articles: {
          articleId: article._id,
          title: article.title,
          coverUrl: article.coverUrl,
          updateTime: article.updateTime
        }
      }
    });

    res.status(201).json({
      success: true,
      article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取用户的草稿列表
// @route   GET /api/articles/drafts
// @access  Private
exports.getUserDrafts = async (req, res, next) => {
  try {
    const drafts = await Article.find({
      'author.userId': req.user._id,
      status: 'draft'
    }).sort({ updateTime: -1 });

    res.json({
      success: true,
      count: drafts.length,
      drafts
    });
  } catch (error) {
    next(error);
  }
}; 