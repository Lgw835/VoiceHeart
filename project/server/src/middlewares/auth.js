const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

// 验证 JWT Token
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 从请求头或cookie中获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // 检查用户是否存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 将用户信息添加到请求对象中
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证失败'
    });
  }
};

// 角色授权
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '您没有权限执行此操作'
      });
    }
    next();
  };
};

// 文章作者验证
exports.isArticleAuthor = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }
    
    if (article.author.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '您没有权限修改此文章'
      });
    }
    
    req.article = article;
    next();
  } catch (error) {
    next(error);
  }
};

// 生成JWT Token
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}; 