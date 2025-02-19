<template>
  <div class="article-detail">
    <div class="back-button">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回上一页
      </el-button>
    </div>
    <div class="article-container" v-loading="loading">
      <!-- 文章头部 -->
      <div class="article-header">
        <h1 class="title">{{ article.title }}</h1>
        <div class="meta">
          <div class="author">
            <el-avatar :size="40" :src="article.author?.avatar" />
            <div class="author-info">
              <div class="name">{{ article.author?.username }}</div>
              <div class="time">{{ formatDate(article.publishTime || article.updateTime) }}</div>
            </div>
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
      </div>

      <!-- 文章内容 -->
      <div class="article-content markdown-body" v-html="renderedContent"></div>

      <!-- 文章操作 -->
      <div class="article-actions">
        <el-button 
          type="primary" 
          :icon="Star" 
          circle 
          :class="{ active: isFavorited }"
          @click="handleFavorite"
        />
        <el-button 
          type="primary" 
          :icon="ChatLineRound" 
          circle
          @click="scrollToComments"
        />
      </div>

      <!-- 评论区 -->
      <div class="comments-section" ref="commentsRef">
        <h2>评论 ({{ article.stats?.comments || 0 }})</h2>
        
        <!-- 评论输入框 -->
        <div class="comment-input" v-if="isLoggedIn">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
          />
          <el-button 
            type="primary" 
            @click="submitComment"
            :loading="submittingComment"
          >
            发表评论
          </el-button>
        </div>
        <div v-else class="login-to-comment">
          <el-link type="primary" @click="goToLogin">登录后发表评论</el-link>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <div 
            v-for="comment in comments" 
            :key="comment._id" 
            class="comment-item"
          >
            <div class="comment-header">
              <el-avatar :size="32" :src="comment.avatar" />
              <div class="comment-info">
                <span class="username">{{ comment.username }}</span>
                <span class="time">{{ formatDate(comment.createTime) }}</span>
              </div>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-actions">
              <el-button 
                text 
                size="small" 
                @click="likeComment(comment._id)"
              >
                <el-icon><Pointer /></el-icon>
                {{ comment.likes || 0 }}
              </el-button>
            </div>
          </div>

          <!-- 加载更多评论 -->
          <div class="load-more" v-if="hasMoreComments">
            <el-button 
              text 
              @click="loadMoreComments"
              :loading="loadingComments"
            >
              加载更多评论
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import { View, Star, ChatLineRound, Pointer, ArrowLeft } from '@element-plus/icons-vue'
import { articleApi } from '../api/articleApi'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const article = ref({})
const comments = ref([])
const loading = ref(true)
const newComment = ref('')
const submittingComment = ref(false)
const loadingComments = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const hasMoreComments = ref(true)
const commentsRef = ref(null)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isFavorited = computed(() => {
  // 检查当前文章是否在用户的收藏列表中
  return userStore.user.favorites?.some(fav => fav.articleId === article.value._id)
})

const isAuthor = computed(() => {
  return article.value?.author?.userId === userStore.user?.id
})

const renderedContent = computed(() => {
  if (!article.value.content) return ''
  const rawHtml = marked(article.value.content)
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img'],
    ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'class', 'id']
  })
})

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}

// 格式化日期
const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  if (diff < 2592000000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
  
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取文章详情
const fetchArticle = async () => {
  try {
    loading.value = true
    const response = await articleApi.getArticle(route.params.id)
    if (response.success) {
      article.value = response.article
      // 确保文章内容存在
      if (!article.value.content) {
        article.value.content = '暂无内容'
      }
      // 确保统计数据存在
      if (!article.value.stats) {
        article.value.stats = {
          views: 0,
          collections: 0,
          comments: 0
        }
      }
      
      // 如果是作者，并且是从"我的文章"页面点击进来的
      if (response.isAuthor && route.query.from === 'my-articles') {
        router.replace({
          path: '/create-article',
          query: { 
            id: article.value._id,
            mode: 'edit'
          }
        })
        return
      }
    } else {
      ElMessage.error('文章不存在或已被删除')
      router.push('/404')
    }
  } catch (error) {
    console.error('获取文章错误:', error)
    if (error.response?.status === 400) {
      ElMessage.error('文章格式有误，请联系管理员')
    } else if (error.response?.status === 404) {
      ElMessage.error('文章不存在或已被删除')
      router.push('/404')
    } else {
      ElMessage.error('获取文章失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 获取评论
const fetchComments = async () => {
  try {
    loadingComments.value = true
    const response = await articleApi.getComments(route.params.id, {
      page: currentPage.value,
      limit: pageSize.value
    })
    
    if (response.success) {
      if (currentPage.value === 1) {
        comments.value = response.comments || []
      } else {
        comments.value.push(...(response.comments || []))
      }
      hasMoreComments.value = (response.comments || []).length === pageSize.value
    } else {
      if (currentPage.value === 1) {
        comments.value = []
      }
      hasMoreComments.value = false
    }
  } catch (error) {
    console.error('获取评论错误:', error)
    // 如果是404错误，说明文章不存在或评论功能未启用
    if (error.response?.status === 404) {
      comments.value = []
      hasMoreComments.value = false
      // 不显示错误提示，因为这可能是正常情况
    } else {
      ElMessage.warning('评论加载失败，请稍后重试')
    }
  } finally {
    loadingComments.value = false
  }
}

// 加载更多评论
const loadMoreComments = () => {
  currentPage.value++
  fetchComments()
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    submittingComment.value = true
    const response = await articleApi.addComment(route.params.id, newComment.value)
    
    if (response.success) {
      ElMessage.success('评论发表成功')
      newComment.value = ''
      // 重新加载评论
      currentPage.value = 1
      await fetchComments()
    } else {
      ElMessage.error(response.message || '评论发表失败')
    }
  } catch (error) {
    console.error('发表评论错误:', error)
    ElMessage.error('评论发表失败')
  } finally {
    submittingComment.value = false
  }
}

// 点赞评论
const likeComment = async (commentId) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const response = await articleApi.likeComment(route.params.id, commentId)
    if (response.success) {
      // 更新评论点赞数
      const comment = comments.value.find(c => c._id === commentId)
      if (comment) {
        comment.likes = (comment.likes || 0) + 1
      }
    }
  } catch (error) {
    console.error('点赞评论错误:', error)
    ElMessage.error('点赞失败')
  }
}

// 收藏文章
const handleFavorite = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const response = await (isFavorited.value
      ? articleApi.unfavoriteArticle(article.value._id)
      : articleApi.favoriteArticle(article.value._id))
    
    if (response.success) {
      ElMessage.success(isFavorited.value ? '取消收藏成功' : '收藏成功')
      // 更新文章收藏数
      article.value.stats.collections += isFavorited.value ? -1 : 1
      // 更新用户收藏状态
      await userStore.fetchCurrentUser()
    }
  } catch (error) {
    console.error('收藏操作错误:', error)
    ElMessage.error('操作失败')
  }
}

// 滚动到评论区
const scrollToComments = () => {
  commentsRef.value?.scrollIntoView({ behavior: 'smooth' })
}

// 跳转到登录页
const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchArticle()
  fetchComments()
})
</script>

<style scoped>
.article-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.article-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.article-header {
  margin-bottom: 40px;
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.time {
  font-size: 14px;
  color: #909399;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.article-content {
  margin-bottom: 40px;
  line-height: 1.8;
}

.article-actions {
  position: fixed;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-actions .active {
  background-color: #409eff;
  color: #fff;
}

.comments-section {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e4e7ed;
}

.comments-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.comment-input {
  margin-bottom: 40px;
}

.comment-input .el-button {
  margin-top: 16px;
}

.login-to-comment {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 40px;
}

.comment-item {
  padding: 20px 0;
  border-bottom: 1px solid #e4e7ed;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.comment-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}

:deep(.markdown-body) {
  font-size: 16px;
  line-height: 1.8;
}

:deep(.markdown-body h1) {
  font-size: 28px;
  margin-top: 40px;
  margin-bottom: 20px;
}

:deep(.markdown-body h2) {
  font-size: 24px;
  margin-top: 36px;
  margin-bottom: 18px;
}

:deep(.markdown-body h3) {
  font-size: 20px;
  margin-top: 32px;
  margin-bottom: 16px;
}

:deep(.markdown-body p) {
  margin-bottom: 16px;
}

:deep(.markdown-body img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 20px 0;
}

:deep(.markdown-body code) {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

:deep(.markdown-body pre) {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 20px 0;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  color: #606266;
  margin: 20px 0;
}

.back-button {
  margin-bottom: 20px;
}

.back-button .el-button {
  font-size: 16px;
}
</style> 