<template>
  <div class="app">
    <el-config-provider :locale="zhCn">
      <Header />
      <router-view />
    </el-config-provider>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './store/user'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import Header from './components/common/Header.vue'

const userStore = useUserStore()

onMounted(async () => {
  if (userStore.isLoggedIn) {
    try {
      await userStore.fetchCurrentUser()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      userStore.logout()
    }
  }
})
</script>

<style>
.app {
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style>
