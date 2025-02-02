<template>
  <div class="home">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 文章列表 -->
      <div class="article-list">
        <article-card
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 侧边栏 -->
    <div class="sidebar">
      <!-- 热门文章 -->
      <el-card class="hot-articles">
        <template #header>
          <div class="card-header">
            <span>热门文章</span>
          </div>
        </template>
        <ul class="hot-list">
          <li v-for="item in hotArticles" :key="item.id">
            <span class="hot-rank">{{ item.rank }}</span>
            <span class="hot-title">{{ item.title }}</span>
          </li>
        </ul>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ArticleCard from '../components/article/ArticleCard.vue'

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 模拟文章数据
const articles = ref([
  {
    id: 1,
    title: '沪上青年的奋斗与梦想',
    description: '在这座充满活力的国际化大都市里,无数青年正在书写着属于自己的奋斗故事,用实干笃定前行,以奋斗书写精彩人生...',
    coverUrl: 'https://test-1317709113.cos-website.ap-shanghai.myqcloud.com/fad8e4d8-c10e-438d-9c29-8f0af543143a.jpg',
    tags: ['上海青年', '奋斗故事'],
    views: 1234,
    likes: 328,
    comments: 23
  },
  {
    id: 2,
    title: '创新路上的追梦人',
    description: '在张江科学城，众多青年科技工作者正在为国家战略科技力量贡献智慧。他们扎根实验室、专注科研，在量子计算、生物医药等领域不断突破创新...',
    coverUrl: 'https://test-1317709113.cos-website.ap-shanghai.myqcloud.com/be20b49e-5d94-4216-a3dc-9d5f33e0509f.jpg',
    tags: ['科技创新', '青年力量'],
    views: 986,
    likes: 245,
    comments: 18
  },
  {
    id: 3,
    title: '匠心传承：非遗文化的青春守护者',
    description: '在老字号企业中，新一代青年匠人传承着精湛技艺，让传统工艺焕发新的生机。他们用创新思维赋能传统产业，让"中国制造"继续闪耀...',
    coverUrl: 'https://example.com/image3.jpg',
    tags: ['传统文化', '匠心精神'],
    views: 876,
    likes: 198,
    comments: 15
  }
])

// 热门文章数据
const hotArticles = ref([
  { id: 1, rank: 1, title: '青春力量：新时代奋斗者的故事' },
  { id: 2, rank: 2, title: '创业青年说：在逐梦路上砥砺前行' },
  { id: 3, rank: 3, title: '传统与创新的碰撞：青年匠人的坚守' },
  { id: 4, rank: 4, title: '科技创新最前沿：青年科研工作者访谈' },
  { id: 5, rank: 5, title: '乡村振兴中的青春力量' }
])

const handleSizeChange = (val) => {
  console.log(`每页 ${val} 条`)
}

const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`)
}

onMounted(() => {
  // 在这里可以调用API获取文章列表数据
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 20px auto;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding: 0 20px;
}

.main-content {
  min-height: 800px;
}

.article-list {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.hot-articles {
  position: sticky;
  top: 20px;
}

.card-header {
  font-weight: bold;
}

.hot-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.hot-list li {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
}

.hot-list li:hover .hot-title {
  color: #409EFF;
}

.hot-rank {
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background: #f4f4f5;
  border-radius: 4px;
  margin-right: 12px;
  font-size: 12px;
}

.hot-list li:nth-child(1) .hot-rank {
  background: #f56c6c;
  color: white;
}

.hot-list li:nth-child(2) .hot-rank {
  background: #e6a23c;
  color: white;
}

.hot-list li:nth-child(3) .hot-rank {
  background: #409eff;
  color: white;
}

.hot-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #606266;
}
</style> 