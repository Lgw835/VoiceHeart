import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/profile',
      name: 'UserProfile',
      component: () => import('../views/UserProfile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/create-article',
      name: 'CreateArticle',
      component: () => import('../views/CreateArticle.vue'),
      meta: { requiresAuth: true, roles: ['creator', 'admin'] }
    },
    {
      path: '/article/:id',
      name: 'ArticleDetail',
      component: () => import('../views/ArticleDetail.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/admin/review',
      name: 'Review',
      component: () => import('../views/admin/Review.vue'),
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/category/:id',
      name: 'Category',
      component: () => import('../views/Category.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/books',
      name: 'Books',
      component: () => import('../views/Books.vue'),
      meta: { requiresAuth: false }
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (to.meta.requiresAuth && !token) {
    // 需要登录但未登录，重定向到登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    // 需要特定角色但没有权限，重定向到首页
    next({ path: '/' })
  } else {
    next()
  }
})

export default router 