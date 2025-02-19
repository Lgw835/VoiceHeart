const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '文章标题是必需的'],
    trim: true,
    minlength: [2, '标题至少需要2个字符'],
    maxlength: [100, '标题不能超过100个字符']
  },
  content: {
    type: String,
    required: [true, '文章内容是必需的'],
    minlength: [10, '内容至少需要10个字符']
  },
  summary: {
    type: String,
    required: [true, '文章摘要是必需的'],
    trim: true,
    maxlength: [200, '摘要不能超过200个字符']
  },
  coverUrl: {
    type: String,
    default: 'default-cover.jpg'
  },
  author: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatar: String
  },
  category: {
    type: String,
    required: [true, '文章分类是必需的'],
    enum: ['心理', '情感', '生活', '职场', '知识分享', '迷茫求助', '沪上青年', '活动', '技术', '其他']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft'
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {
    type: Date,
    default: Date.now
  },
  publishTime: Date,
  review: {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewTime: Date,
    comment: String
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    collections: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    }
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatar: String,
    content: {
      type: String,
      required: [true, '评论内容不能为空'],
      trim: true,
      maxlength: [500, '评论不能超过500个字符']
    },
    createTime: {
      type: Date,
      default: Date.now
    },
    likes: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true,
  collection: 'article'
});

// 更新文章时自动更新updateTime
articleSchema.pre('save', function(next) {
  this.updateTime = new Date();
  next();
});

// 更新统计信息的方法
articleSchema.methods.updateStats = async function() {
  this.stats.comments = this.comments.length;
  await this.save();
};

// 添加评论的方法
articleSchema.methods.addComment = async function(commentData) {
  this.comments.push(commentData);
  await this.updateStats();
  return this.save();
};

// 删除评论的方法
articleSchema.methods.removeComment = async function(commentId) {
  this.comments = this.comments.filter(comment => 
    comment._id.toString() !== commentId.toString()
  );
  await this.updateStats();
  return this.save();
};

const Article = mongoose.model('Article', articleSchema);

module.exports = Article; 