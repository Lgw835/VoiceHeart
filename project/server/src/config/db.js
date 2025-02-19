const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    console.log('正在连接到 MongoDB...');
    console.log('数据库 URI:', config.mongoURI);
    console.log('数据库名称:', config.dbName);

    const conn = await mongoose.connect(config.mongoURI, {
      dbName: config.dbName,
      serverSelectionTimeoutMS: 5000, // 超时时间
      socketTimeoutMS: 45000, // Socket 超时
      family: 4 // 强制使用 IPv4
    });

    console.log('MongoDB连接成功');
    console.log('连接的数据库:', conn.connection.db.databaseName);
    console.log('MongoDB版本:', conn.version);
    
    // 列出所有集合
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('现有集合:', collections.map(c => c.name));

  } catch (err) {
    console.error('MongoDB连接失败:', err.message);
    console.error('错误详情:', err);
    process.exit(1);
  }
};

// 监听数据库连接事件
mongoose.connection.on('error', err => {
  console.error('MongoDB错误:', err);
  console.error('错误详情:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB连接断开');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB重新连接成功');
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB连接已安全关闭');
    process.exit(0);
  } catch (err) {
    console.error('关闭MongoDB连接时出错:', err);
    process.exit(1);
  }
});

module.exports = connectDB;