require('dotenv').config();

module.exports = {
  // MongoDB配置
  mongoURI: "mongodb+srv://mongodb1:Lgw12345678@mongo.fj2k4.mongodb.net/?retryWrites=true&w=majority&appName=mongo",
  dbName: "heart",
  
  // JWT配置
  jwtSecret: "heart-platform-secret-key",
  jwtExpiresIn: "7d",
  
  // 服务器配置
  port: process.env.PORT || 3000,
  
  // 文件上传配置
  uploadPath: "uploads",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  
  // 允许的文件类型
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
  
  // 跨域配置
  corsOptions: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com' 
      : ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 预检请求的有效期，单位秒
  }
}; 