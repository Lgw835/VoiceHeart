<template>
  <div class="book-list">
    <h1>图书馆</h1>
    <el-row :gutter="20">
      <el-col :span="6" v-for="book in books" :key="book.id">
        <el-card class="book-card" @click="goToReader(book.path)">
          <div class="book-cover">
            <img :src="book.cover || '/default-book-cover.png'" alt="book cover">
          </div>
          <div class="book-info">
            <h3>{{ book.title }}</h3>
            <p>{{ book.author }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const books = ref([
  {
    id: 1,
    title: '苹果：贩卖高科技的美学体验',
    author: '彭剑锋主编 周禹 杨黎丽',
    path: './src/book/苹果：贩卖高科技的美学体验.epub',
    cover: 'https://cdn.weread.qq.com/weread/cover/51/YueWen_622034/t6_YueWen_622034.jpg'
  },
  {
    id: 2,
    title: '企业文化建设经典华夏基石方法',
    author: '华夏基石',
    path: './src/book/企业文化建设经典华夏基石方法·企业文化落地本土实践+企业文化的逻辑+企业文化激活沟通+在组织中绽放自我·从专业化到职业化(套装共5册).epub',
    cover: 'https://www.emex.top:8083/cover/18961/og?c=1639415112'
  },
  {
    id: 3,
    title: '自私的基因：40周年增订版',
    author: '理查德·道金斯',
    path: './src/book/自私的基因：40周年增订版 = The Extended Selfish Gene (理查德 · 道金斯 (Richard Dawkins) 著  卢允中, 张岱云, 陈复加 etc.) (Z-Library).epub',
    cover: 'https://cdn.weread.qq.com/weread/cover/60/YueWen_23665518/t6_YueWen_23665518.jpg'
  },
  // 可以在这里添加更多书籍
])

const goToReader = (path) => {
  // 使用相对路径
  const absolutePath = new URL(path, window.location.origin).pathname
  router.push({
    name: 'BookReader',
    query: { path: encodeURIComponent(absolutePath) }
  })
}

onMounted(() => {
  // 这里可以添加从后端获取书籍列表的逻辑
})
</script>

<style scoped>
.book-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.book-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.book-info {
  padding: 10px;
}

.book-info h3 {
  margin: 0;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-info p {
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
}
</style> 