<template>
  <div class="article-detail">
    <div class="article-container">
      <!-- 文章主体 -->
      <el-card class="article-content">
        <h1 class="article-title">{{ article.title }}</h1>
        
        <div class="article-meta">
          <el-avatar :size="32" :src="article.authorAvatar"></el-avatar>
          <span class="author-name">{{ article.author }}</span>
          <span class="publish-time">{{ article.publishTime }}</span>
          <div class="article-tags">
            <el-tag 
              v-for="tag in article.tags" 
              :key="tag"
              size="small"
              effect="plain"
            >{{ tag }}</el-tag>
          </div>
        </div>

        <div class="article-text" v-html="article.content"></div>

        <!-- 文章互动 -->
        <div class="article-actions">
          <el-button type="primary" :icon="Star" @click="handleLike">
            {{ article.likes }} 点赞
          </el-button>
          <el-button :icon="Collection" @click="handleCollect">
            {{ article.collections }} 收藏
          </el-button>
        </div>
      </el-card>

      <!-- 评论区 -->
      <el-card class="comment-section">
        <template #header>
          <div class="comment-header">
            <span>评论 ({{ article.comments.length }})</span>
          </div>
        </template>

        <!-- 评论输入框 -->
        <div class="comment-input" v-if="isLoggedIn">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
          />
          <el-button 
            type="primary" 
            @click="submitComment"
            :disabled="!commentContent.trim()"
          >
            发表评论
          </el-button>
        </div>
        <el-alert
          v-else
          title="请登录后发表评论"
          type="info"
          :closable="false"
          center
        />

        <!-- 评论列表 -->
        <div class="comment-list">
          <div 
            v-for="comment in article.comments" 
            :key="comment.id" 
            class="comment-item"
          >
            <div class="comment-user">
              <el-avatar :size="32" :src="comment.userAvatar"></el-avatar>
              <span class="username">{{ comment.username }}</span>
              <span class="comment-time">{{ comment.time }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Star, Collection } from '@element-plus/icons-vue'

const route = useRoute()
const isLoggedIn = ref(false)
const commentContent = ref('')

// 模拟文章数据
const article = ref({
  id: 1,
  title: '沪上青年的奋斗与梦想',
  author: '上海青年报',
  authorAvatar: 'https://example.com/avatar.jpg',
  publishTime: '2024-01-25 14:30',
  content: `
    <h2>引言</h2>
    <p>在这座充满活力的国际化大都市里,无数青年正在书写着属于自己的奋斗故事...</p>
    
    <h2>新时代青年的奋斗篇章</h2>
    <p>作为新时代的沪上青年,他们以实干笃定前行,用奋斗书写精彩人生。在各行各业中,都能看到他们拼搏向上的身影：</p>
    
    <h3>1. 科创先锋</h3>
    <p>在张江科学城,众多青年科技工作者正在为国家战略科技力量贡献智慧。他们扎根实验室、专注科研,在量子计算、生物医药等领域不断突破创新。</p>
    
    <h3>2. 匠心传承</h3>
    <p>在老字号企业中,新一代青年匠人传承着精湛技艺,让传统工艺焕发新的生机。他们用创新思维赋能传统产业,让"上海制造"继续闪耀。</p>
    
    <h3>3. 创业逐梦</h3>
    <p>在各大创业园区,青年创业者们正在打造新产业、新业态。他们以创新创业服务社会发展,用智慧和汗水实现人生价值。</p>
    
    <h2>青春力量</h2>
    <p>沪上青年用实际行动诠释着"青春由磨砺而出彩,人生因奋斗而升华"的真谛。他们是上海这座城市最有活力的群体,是推动城市发展的重要力量。</p>
  `,
  tags: ['上海青年', '奋斗故事', '城市发展'],
  likes: 328,
  collections: 156,
  comments: [
    {
      id: 1,
      username: '小陈',
      userAvatar: 'https://example.com/avatar1.jpg',
      content: '作为一名在张江工作的青年科技工作者,深有感触。我们这一代人要为国家科技发展贡献力量!',
      time: '2024-01-25 15:00'
    },
    {
      id: 2,
      username: '老王',
      userAvatar: 'https://example.com/avatar2.jpg',
      content: '看到这么多优秀的沪上青年故事,很受鼓舞。青年兴则国家兴,未来可期!',
      time: '2024-01-25 15:30'
    }
  ]
})

const handleLike = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  article.value.likes++
}

const handleCollect = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  article.value.collections++
}

const submitComment = () => {
  if (!commentContent.value.trim()) return
  
  // 这里应该调用API提交评论
  article.value.comments.unshift({
    id: Date.now(),
    username: '当前用户',
    userAvatar: 'https://example.com/current-user.jpg',
    content: commentContent.value,
    time: new Date().toLocaleString()
  })
  
  commentContent.value = ''
}

onMounted(() => {
  // 这里应该根据route.params.id获取文章详情
  console.log('文章ID:', route.params.id)
})
</script>

<style scoped>
.article-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.article-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-content {
  padding: 30px;
}

.article-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  color: #606266;
}

.article-tags {
  margin-left: auto;
}

.article-text {
  line-height: 1.8;
  color: #303133;
}

.article-actions {
  margin-top: 30px;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.comment-section {
  margin-top: 20px;
}

.comment-header {
  font-weight: bold;
}

.comment-input {
  margin-bottom: 20px;
}

.comment-input .el-button {
  margin-top: 10px;
  float: right;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.username {
  font-weight: bold;
}

.comment-time {
  color: #909399;
  font-size: 12px;
}

.comment-content {
  margin: 0;
  padding-left: 42px;
  color: #606266;
}
</style> 