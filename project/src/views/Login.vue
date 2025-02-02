<template>
  <div class="login-page">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <el-radio-group v-model="activeTab">
            <el-radio-button label="login">登录</el-radio-button>
            <el-radio-button label="register">注册</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 登录表单 -->
      <el-form
        v-if="activeTab === 'login'"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名/邮箱"
            :prefix-icon="UserFilled"
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
        <div class="form-actions">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>
        <el-button type="primary" class="submit-btn" @click="handleLogin">
          登录
        </el-button>
      </el-form>

      <!-- 注册表单 -->
      <el-form
        v-else
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="0"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            :prefix-icon="UserFilled"
          />
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱"
            :prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-button type="primary" class="submit-btn" @click="handleRegister">
          注册
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  UserFilled,
  Lock,
  Message,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import testAccounts from '@/config/accounts.json'

const router = useRouter()
const route = useRoute()
const activeTab = ref('login')
const rememberMe = ref(false)
const userStore = useUserStore()

onMounted(() => {
  // 从URL参数中获取tab
  const tab = route.query.tab
  if (tab === 'register') {
    activeTab.value = 'register'
  }
})

// 登录表单
const loginFormRef = ref()
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

// 注册表单
const registerFormRef = ref()
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 从测试账号配置中查找用户
        const { accounts } = testAccounts
        let foundUser = null
        
        // 遍历所有角色查找用户
        for (const role in accounts) {
          const user = accounts[role].find(
            account => account.username === loginForm.username && 
                      account.password === loginForm.password
          )
          if (user) {
            foundUser = user
            break
          }
        }

        if (!foundUser) {
          ElMessage.error('用户名或密码错误')
          return
        }

        // 设置用户信息
        const userInfo = {
          id: Date.now(),
          username: foundUser.username,
          role: foundUser.role,
          avatar: 'https://example.com/avatar.jpg',
          description: foundUser.description
        }
        const token = 'mock_token_' + Date.now()
        
        userStore.setToken(token)
        userStore.setUserInfo(userInfo)
        
        ElMessage.success('登录成功')
        
        // 如果有重定向地址，则跳转到重定向地址
        const redirect = route.query.redirect
        router.push(redirect || '/')
      } catch (error) {
        ElMessage.error('登录失败：' + error.message)
      }
    }
  })
}

// 注册处理
const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 这里应该调用注册API
        ElMessage.success('注册成功')
        activeTab.value = 'login'
        // 清空注册表单
        registerForm.username = ''
        registerForm.email = ''
        registerForm.password = ''
        registerForm.confirmPassword = ''
      } catch (error) {
        ElMessage.error('注册失败')
      }
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  padding: 20px;
  min-width: 1200px;
}

.login-card {
  width: 400px;
  min-width: 400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  --el-input-height: 40px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

/* 覆盖Element Plus的响应式样式 */
:deep(.el-card) {
  width: 400px !important;
  min-width: 400px !important;
}
</style> 