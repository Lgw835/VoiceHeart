const User = require('../models/User');
const { generateToken } = require('../middlewares/auth');

// @desc    注册新用户
// @route   POST /api/users/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    console.log('注册请求数据:', { username, email });

    // 检查用户是否已存在
    console.log('检查用户是否存在...');
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('用户已存在:', existingUser.email);
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被注册'
      });
    }

    // 创建新用户
    console.log('创建新用户...');
    const user = new User({
      username,
      email,
      password
    });

    // 保存用户
    console.log('保存用户到数据库...');
    await user.save();
    console.log('用户保存成功, ID:', user._id);

    // 生成token
    const token = generateToken(user);

    // 验证用户是否真的保存成功
    const savedUser = await User.findById(user._id);
    console.log('验证保存的用户:', savedUser ? '保存成功' : '保存失败');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    console.error('错误堆栈:', error.stack);
    next(error);
  }
};

// @desc    用户登录
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('登录请求数据:', { email });

    // 检查用户是否存在
    console.log('查找用户...');
    const user = await User.findOne({ email });
    console.log('查找到的用户:', user ? '用户存在' : '用户不存在');
    
    if (user) {
      console.log('用户信息:', {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    console.log('验证密码...');
    const isMatch = await user.comparePassword(password);
    console.log('密码验证结果:', isMatch ? '密码正确' : '密码错误');

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 更新最后登录时间
    console.log('更新最后登录时间...');
    await User.findByIdAndUpdate(user._id, 
      { lastLoginTime: new Date() },
      { new: true }
    );

    // 生成token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    console.error('错误堆栈:', error.stack);
    next(error);
  }
};

// @desc    获取当前用户信息
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      bio: req.user.bio,
      stats: req.user.stats,
      createTime: req.user.createTime,
      lastLoginTime: req.user.lastLoginTime
    }
  });
};

// @desc    更新用户信息
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = async (req, res, next) => {
  try {
    const { username, avatar, bio } = req.body;

    // 检查用户名是否已被使用
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已被使用'
        });
      }
    }

    // 更新用户信息
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        username: username || req.user.username,
        avatar: avatar || req.user.avatar,
        bio: bio || req.user.bio
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    获取用户文章列表
// @route   GET /api/users/:id/articles
// @access  Public
exports.getUserArticles = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'articles.articleId',
        select: 'title content summary coverUrl author category tags status createTime updateTime publishTime stats'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const articles = user.articles
      .filter(article => 
        article.articleId && (
          article.articleId.status === 'published' || 
          (req.user && (req.user._id.toString() === user._id.toString() || req.user.role === 'admin'))
        )
      )
      .map(article => {
        const articleObj = article.articleId.toObject();
        return {
          ...articleObj,
          _id: articleObj._id || article.articleId,
          author: articleObj.author || {
            userId: user._id,
            username: user.username,
            avatar: user.avatar
          },
          updateTime: article.updateTime
        };
      });

    res.json({
      success: true,
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error('获取用户文章列表错误:', error);
    next(error);
  }
};

// @desc    获取用户收藏列表
// @route   GET /api/users/me/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites.articleId',
        select: 'title summary coverUrl author createTime stats'
      });

    const favorites = user.favorites.filter(fav => fav.articleId !== null);

    res.json({
      success: true,
      count: favorites.length,
      favorites
    });
  } catch (error) {
    next(error);
  }
}; 