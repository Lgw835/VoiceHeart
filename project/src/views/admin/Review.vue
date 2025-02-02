<template>
  <div class="review-page">
    <h2>文章审核</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待审核" name="pending">
        <div class="article-list">
          <div v-for="article in articles" :key="article.id" class="article-item">
            <div class="article-header">
              <h3>{{ article.title }}</h3>
              <span class="author">作者：{{ article.author }}</span>
              <span class="date">提交时间：{{ formatDate(article.createTime) }}</span>
            </div>
            <div class="article-content">
              <p>{{ article.summary }}</p>
            </div>
            <div class="article-actions">
              <el-button type="info" @click="viewArticle(article.id)">查看全文</el-button>
              <el-popconfirm
                title="确定通过这篇文章吗？"
                @confirm="approveArticle(article.id)"
              >
                <template #reference>
                  <el-button type="success">通过</el-button>
                </template>
              </el-popconfirm>
              <el-popconfirm
                title="确定拒绝这篇文章吗？"
                @confirm="rejectArticle(article.id)"
              >
                <template #reference>
                  <el-button type="danger">拒绝</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="审核历史" name="history">
        <div class="article-list">
          <div v-for="article in historyArticles" :key="article.id" class="article-item">
            <div class="article-header">
              <h3>{{ article.title }}</h3>
              <div class="article-info">
                <span class="author">作者：{{ article.author }}</span>
                <span class="date">审核时间：{{ formatDate(article.reviewTime) }}</span>
                <el-tag :type="article.status === 'approved' ? 'success' : 'danger'">
                  {{ article.status === 'approved' ? '已通过' : '已拒绝' }}
                </el-tag>
              </div>
            </div>
            <div class="article-content">
              <p>{{ article.summary }}</p>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('pending')
const articles = ref([])
const historyArticles = ref([])

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// 获取待审核文章列表
const fetchArticles = async () => {
  // 模拟API调用
  articles.value = [
    {
      id: 1,
      title: '创业青年的逐梦之路',
      author: '张明',
      createTime: new Date(),
      summary: '本文记录了几位90后创业青年的创业历程，他们在互联网、新能源、人工智能等领域开拓进取，用智慧和汗水实现着自己的创业梦想...'
    },
    {
      id: 2,
      title: '乡村振兴中的青春力量',
      author: '李华',
      createTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      summary: '在乡村振兴的大潮中，越来越多的年轻人选择返乡创业，他们带着新理念、新技术，为家乡发展注入新的活力...'
    }
  ]
}

// 获取审核历史
const fetchHistoryArticles = async () => {
  // 模拟API调用
  historyArticles.value = [
    {
      id: 3,
      title: '科技创新路上的追梦人',
      author: '王研',
      reviewTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'approved',
      summary: '走进上海张江科学城，探访年轻科研工作者们的日常，记录他们在量子计算、生物医药等领域的创新突破...'
    },
    {
      id: 4,
      title: '传统文化的青年守护者',
      author: '陈工',
      reviewTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'approved',
      summary: '探访传统工艺传承人，记录新一代青年匠人如何用创新思维让传统技艺焕发新生，让"中国制造"继续闪耀...'
    }
  ]
}

// 查看文章详情
const viewArticle = (id) => {
  router.push(`/article/${id}`)
}

// 通过文章
const approveArticle = async (id) => {
  try {
    // TODO: 调用API通过文章
    console.log('通过文章:', id)
    ElMessage.success('文章审核通过')
    // 从列表中移除
    articles.value = articles.value.filter(article => article.id !== id)
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

// 拒绝文章
const rejectArticle = async (id) => {
  try {
    // TODO: 调用API拒绝文章
    console.log('拒绝文章:', id)
    ElMessage.success('已拒绝该文章')
    // 从列表中移除
    articles.value = articles.value.filter(article => article.id !== id)
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

onMounted(() => {
  fetchArticles()
  fetchHistoryArticles()
})
</script>

<style scoped>
.review-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.article-list {
  margin-top: 20px;
}

.article-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.article-header {
  margin-bottom: 15px;
}

.article-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.article-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author, .date {
  color: #666;
  font-size: 14px;
}

.article-content {
  margin: 15px 0;
  color: #666;
  line-height: 1.6;
}

.article-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
}

:deep(.el-tag) {
  font-weight: 500;
}
</style> 