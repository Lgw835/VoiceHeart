// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let error = { ...err };
  error.message = err.message;

  // Mongoose错误处理
  if (err.name === 'CastError') {
    error.message = '无效的ID格式';
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', ');
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (err.code === 11000) {
    error.message = '该字段值已存在，请使用其他值';
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // JWT错误处理
  if (err.name === 'JsonWebTokenError') {
    error.message = '无效的token';
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'token已过期';
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }

  // 默认错误响应
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || '服务器内部错误'
  });
};

module.exports = errorHandler; 