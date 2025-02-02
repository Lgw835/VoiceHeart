<template>
  <el-card class="article-card" shadow="hover">
    <!-- 文章封面图 -->
    <div class="article-cover">
      <el-image 
        :src="article.coverUrl" 
        fit="cover"
        lazy
        loading="lazy"
        :preview-src-list="[article.coverUrl]"
      >
        <template #error>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
    </div>

    <!-- 文章内容 -->
    <div class="article-content">
      <h2 class="article-title" @click="goToDetail(article.id)">
        {{ article.title }}
      </h2>
      
      <p class="article-desc">{{ article.description }}</p>
      
      <!-- 文章元信息 -->
      <div class="article-meta">
        <div class="tags">
          <el-tag 
            v-for="tag in article.tags" 
            :key="tag"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>
        
        <div class="interaction-data">
          <span class="data-item">
            <el-icon><View /></el-icon>
            {{ article.views }}
          </span>
          <span class="data-item">
            <el-icon><Star /></el-icon>
            {{ article.likes }}
          </span>
          <span class="data-item">
            <el-icon><ChatLineRound /></el-icon>
            {{ article.comments }}
          </span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { Picture, View, Star, ChatLineRound } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义props
const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const goToDetail = (id) => {
  router.push(`/article/${id}`)
}
</script>

<style scoped>
.article-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
}

.article-cover {
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
}

.article-cover .el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.article-content {
  padding: 15px 0;
}

.article-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  cursor: pointer;
}

.article-title:hover {
  color: #409EFF;
}

.article-desc {
  margin: 10px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.tags {
  display: flex;
  gap: 8px;
}

.interaction-data {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 14px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-icon {
  font-size: 16px;
}
</style> 