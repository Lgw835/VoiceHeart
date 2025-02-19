<template>
  <el-card class="article-card" :body-style="{ padding: '0px' }" @click="handleClick">
    <!-- 删除按钮 -->
    <div v-if="isFromMyArticles" class="delete-button">
      <el-button
        type="danger"
        :icon="Delete"
        circle
        size="small"
        @click.stop="handleDelete"
      />
    </div>
    <div class="cover-image">
      <img :src="article.coverUrl" :alt="article.title">
    </div>
    <div class="content">
      <h3 class="title">{{ article.title }}</h3>
      <p class="summary">{{ article.summary }}</p>
      <div class="meta">
        <div class="author">
          <el-avatar :size="24" :src="article.author?.avatar" />
          <span>{{ article.author?.username }}</span>
        </div>
        <div class="stats">
          <span class="stat-item">
            <el-icon><View /></el-icon>
            {{ formatNumber(article.stats?.views || 0) }}
          </span>
          <span class="stat-item">
            <el-icon><Star /></el-icon>
            {{ formatNumber(article.stats?.collections || 0) }}
          </span>
          <span class="stat-item">
            <el-icon><ChatLineRound /></el-icon>
            {{ formatNumber(article.stats?.comments || 0) }}
          </span>
        </div>
      </div>
      <div class="tags">
        <el-tag 
          v-for="tag in article.tags" 
          :key="tag"
          size="small"
          effect="plain"
          class="tag"
        >
          {{ tag }}
        </el-tag>
      </div>
      <div class="footer">
        <span class="time">{{ formatDate(article.publishTime || article.updateTime) }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { View, Star, ChatLineRound, Delete } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { articleApi } from '../api/articleApi'

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  // 是否来自"我的文章"列表
  isFromMyArticles: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const handleClick = () => {
  if (props.isFromMyArticles) {
    // 如果是从"我的文章"点击，添加from参数
    router.push({
      path: `/article/${props.article._id}`,
      query: { from: 'my-articles' }
    })
  } else {
    // 普通文章点击
    router.push(`/article/${props.article._id}`)
  }
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  
  // 一小时内
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  // 24小时内
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  // 30天内
  if (diff < 2592000000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
  
  // 超过30天
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 处理删除文章
const handleDelete = async (event) => {
  event.stopPropagation() // 阻止事件冒泡
  
  try {
    await ElMessageBox.confirm(
      '确定要删除这篇文章吗？此操作不可恢复',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await articleApi.deleteArticle(props.article._id)
    if (response.success) {
      ElMessage.success('文章已删除')
      // 触发父组件更新列表
      emit('article-deleted', props.article._id)
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章错误:', error)
      ElMessage.error('删除文章失败')
    }
  }
}

// 定义emit
const emit = defineEmits(['article-deleted'])
</script>

<style scoped>
.article-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cover-image {
  height: 200px;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .cover-image img {
  transform: scale(1.05);
}

.content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.summary {
  color: #606266;
  font-size: 14px;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.tags {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  margin-right: 0;
}

.footer {
  margin-top: auto;
  font-size: 13px;
  color: #909399;
}

.time {
  font-size: 13px;
  color: #909399;
}

.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}

.delete-button .el-button {
  opacity: 0.8;
  transition: opacity 0.3s;
}

.delete-button .el-button:hover {
  opacity: 1;
}
</style> 