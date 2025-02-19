<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录</h2>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        label-width="0"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="邮箱"
            :prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <div class="remember-forgot">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>
        <el-button 
          type="primary" 
          class="submit-btn" 
          @click="handleLogin" 
          :loading="loading"
        >
          登录
        </el-button>
        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Message } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loginForm = ref({
  email: '',
  password: ''
})
const loading = ref(false)
const rememberMe = ref(false)

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    console.log('发送登录请求:', loginForm.value)
    
    const response = await userStore.login(loginForm.value)
    console.log('登录响应:', response)
    
    if (response && response.success) {
      ElMessage.success('登录成功')
      const user = userStore.user
      console.log('当前用户信息:', user)
      
      // 根据用户角色决定跳转页面
      let redirectPath = '/'
      if (user.role === 'admin') {
        redirectPath = '/admin/review'
      } else if (user.role === 'creator') {
        redirectPath = '/profile'
      }
      
      // 如果有重定向地址，优先使用重定向地址
      const redirect = route.query.redirect
      router.push(redirect || redirectPath)
    } else {
      ElMessage.error(response?.message || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    if (error.response) {
      console.error('错误响应:', error.response)
      ElMessage.error(error.response.data?.message || '登录失败')
    } else if (error.request) {
      console.error('请求错误:', error.request)
      ElMessage.error('无法连接到服务器，请检查网络连接')
    } else {
      console.error('其他错误:', error.message)
      ElMessage.error(error.message || '登录失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.login-form {
  margin-top: 20px;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  margin-bottom: 20px;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style> 