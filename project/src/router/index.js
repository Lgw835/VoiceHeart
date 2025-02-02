import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { useUserStore } from '@/store/user'
import TestAccountInit from '@/views/admin/TestAccountInit.vue'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: Home
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetail.vue')
  },
  {
    path: '/create',
    name: 'CreateArticle',
    component: () => import('../views/CreateArticle.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/test-accounts',
    name: 'TestAccountInit',
    component: TestAccountInit,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/review',
    name: 'Review',
    component: () => import('../views/admin/Review.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/books',
    name: 'BookList',
    component: () => import('../views/BookList.vue')
  },
  {
    path: '/books/read',
    name: 'BookReader',
    component: () => import('../views/BookReader.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    // 检查是否需要管理员权限
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      const isAdmin = userStore.userInfo?.role === 'admin'
      
      if (!isAdmin) {
        ElMessage.error('需要管理员权限')
        next('/')
        return
      }
    }
    next()
  }
})

export default router 