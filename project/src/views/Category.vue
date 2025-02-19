<template>
  <div class="category-container">
    <div class="category-header">
      <h1>{{ categoryName }}</h1>
      <p class="description">{{ categoryDescription }}</p>
    </div>
    
    <div class="article-list">
      <el-empty v-if="articles.length === 0" description="暂无文章" />
      <div v-else class="articles-grid">
        <article-card
          v-for="article in articles"
          :key="article._id"
          :article="article"
        />
      </div>
      
      <div class="pagination-container" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ArticleCard from '../components/ArticleCard.vue'
import { articleApi } from '../api/articleApi'

const route = useRoute()
const categoryId = computed(() => route.params.id)

// 分类数据
const categories = {
  1: { name: '迷茫求助', description: '在这里寻找答案和帮助' },
  2: { name: '知识分享', description: '分享你的知识和经验' },
  3: { name: '沪上青年', description: '关于上海青年的故事' },
  4: { name: '活动', description: '线上线下活动信息' }
}

const categoryName = computed(() => categories[categoryId.value]?.name || '未知分类')
const categoryDescription = computed(() => categories[categoryId.value]?.description || '')

const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const loading = ref(false)

const fetchArticles = async () => {
  try {
    loading.value = true
    const response = await articleApi.getArticles({
      category: categoryId.value,
      page: currentPage.value,
      limit: pageSize.value
    })
    
    if (response.success) {
      articles.value = response.articles
      total.value = response.total
    } else {
      ElMessage.error('获取文章列表失败')
    }
  } catch (error) {
    console.error('获取文章列表错误:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchArticles()
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.category-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.category-header {
  text-align: center;
  margin-bottom: 40px;
}

.category-header h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 10px;
}

.description {
  color: #606266;
  font-size: 16px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 