const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必需的'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [20, '用户名不能超过20个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱是必需的'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '密码是必需的'],
    minlength: [6, '密码至少需要6个字符']
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: [200, '个人简介不能超过200个字符']
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  articles: [{
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    },
    title: String,
    coverUrl: String,
    updateTime: {
      type: Date,
      default: Date.now
    }
  }],
  favorites: [{
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    },
    createTime: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    articles: {
      type: Number,
      default: 0
    },
    followers: {
      type: Number,
      default: 0
    },
    following: {
      type: Number,
      default: 0
    }
  },
  lastLoginTime: Date
}, {
  timestamps: true,
  collection: 'user' // 指定集合名称为 user
});

// 验证密码方法（不加密，直接比较）
userSchema.methods.comparePassword = async function(candidatePassword) {
  return this.password === candidatePassword;
};

// 更新统计信息的方法
userSchema.methods.updateStats = async function() {
  this.stats.articles = this.articles.filter(article => 
    article.status === 'published'
  ).length;
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 