<template>
  <div class="article-list">
    <el-empty v-if="!articles.length && !loading" description="暂无文章" />
    
    <el-card v-for="article in articles" :key="article.id" class="article-item">
      <div class="article-header">
        <h3 class="article-title" @click="goToDetail(article.id)">
          {{ article.title }}
        </h3>
        <span class="article-date">{{ formatDate(article.createTime) }}</span>
      </div>
      <p class="article-summary">{{ article.summary }}</p>
      <div class="article-footer">
        <div class="article-stats">
          <el-icon><View /></el-icon>
          <span>{{ article.views || 0 }}</span>
          <el-icon><Star /></el-icon>
          <span>{{ article.favorites || 0 }}</span>
        </div>
      </div>
    </el-card>

    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-if="articles.length > 0" class="load-more">
      <el-button :loading="loading" @click="$emit('load-more')">加载更多</el-button>
    </div>
  </div>
</template>

<script setup>
import { View, Star } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义组件属性
const props = defineProps({
  articles: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义事件
defineEmits(['load-more'])

// 跳转到文章详情
const goToDetail = (articleId) => {
  router.push(`/article/${articleId}`)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.article-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.article-date {
  font-size: 14px;
  color: #909399;
}

.article-summary {
  color: #606266;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #909399;
}

.article-stats .el-icon {
  margin-right: 4px;
}

.loading-wrapper {
  padding: 20px 0;
}

.load-more {
  text-align: center;
  margin-top: 16px;
}
</style> 