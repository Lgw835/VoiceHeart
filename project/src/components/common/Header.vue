<template>
  <el-header class="header">
    <div class="header-container">
      <!-- Logo区域 -->
      <div class="logo">
        <router-link to="/">
          <h1>溯说心声</h1>
        </router-link>
      </div>
      
      <!-- 导航分类 -->
      <div class="nav-categories">
        <el-menu 
          mode="horizontal" 
          :router="true" 
          :default-active="activeMenu"
          :ellipsis="false"
        >
          <el-menu-item 
            v-for="category in categories" 
            :key="category.id" 
            :index="'/category/' + category.id"
          >
            {{ category.name }}
          </el-menu-item>
          <el-menu-item index="/books">
            图书馆
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章..."
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- 用户操作区 -->
      <div class="user-actions">
        <template v-if="!isLoggedIn">
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button @click="handleRegister">注册</el-button>
        </template>
        <template v-else>
          <el-dropdown>
            <span class="user-profile">
              <el-avatar :size="32" :src="userInfo?.avatar"></el-avatar>
              <span>{{ userInfo?.username }}</span>
              <el-badge v-if="isAdmin && pendingCount > 0" :value="pendingCount" class="review-badge" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/user/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="router.push('/create')">写文章</el-dropdown-item>
                <el-dropdown-item v-if="isAdmin" @click="router.push('/admin/review')" class="review-item">
                  审核
                  <el-badge v-if="pendingCount > 0" :value="pendingCount" class="menu-badge" />
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { Search } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)

// 模拟数据
const categories = ref([
  { id: 1, name: '迷茫求助' },
  { id: 2, name: '知识分享' },
  { id: 3, name: '沪上青年' },
  { id: 4, name: '活动' }
])

// 模拟待审核数量
const pendingCount = ref(2)

const searchKeyword = ref('')
const router = useRouter()
const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(userStore)
const { userInfo } = storeToRefs(userStore)

// 判断是否为管理员
const isAdmin = computed(() => {
  return userInfo.value?.role === 'admin'
})

const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
}

const handleLogin = () => {
  router.push('/login')
}

const handleRegister = () => {
  router.push('/login?tab=register')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 1200px;
}

.header-container {
  max-width: 1200px;
  min-width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  flex: none;
  margin-right: 40px;
}

.logo a {
  text-decoration: none;
}

.logo h1 {
  color: #000;
  margin: 0;
  font-size: 24px;
}

.nav-categories {
  flex: 1;
  min-width: 400px;
}

.search-box {
  flex: none;
  width: 300px;
  margin: 0 20px;
}

.user-actions {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
}

.review-badge {
  position: absolute;
  top: -6px;
  right: -12px;
}

.review-item {
  position: relative;
}

.menu-badge {
  margin-left: 8px;
}

:deep(.el-badge__content) {
  z-index: 1;
}

:deep(.el-dropdown-menu__item.review-item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 覆盖Element Plus的响应式样式 */
:deep(.el-menu--horizontal) {
  border-bottom: none !important;
}

:deep(.el-menu-item) {
  height: 60px !important;
  line-height: 60px !important;
}
</style> 