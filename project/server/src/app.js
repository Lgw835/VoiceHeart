const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middlewares/error');

// 路由
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// 连接数据库
connectDB();

const app = express();

// 中间件
app.use(helmet({
  crossOriginResourcePolicy: false // 允许跨域资源访问
})); // 安全头

// CORS 中间件配置
app.use(cors(config.corsOptions));

// 预检请求处理
app.options('*', cors(config.corsOptions));

app.use(morgan('dev')); // 日志
app.use(express.json()); // 解析JSON
app.use(express.urlencoded({ extended: true })); // 解析URL编码

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 路由
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/upload', uploadRoutes);

// API 404处理
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API接口不存在'
  });
});

// 其他所有请求都返回 200
app.use('*', (req, res) => {
  res.status(200).send('OK');
});

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 处理未捕获的异常
process.on('uncaughtException', err => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (err) => {
  console.error('未处理的Promise拒绝:', err);
  process.exit(1);
});

module.exports = app; 