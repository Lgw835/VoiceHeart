<template>
  <div class="book-reader">
    <EpubReader :book-path="bookPath" v-if="bookPath" />
    <div v-else class="error-message">
      <el-result
        icon="error"
        title="无法加载图书"
        sub-title="请确保图书路径正确且文件存在"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回图书列表</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EpubReader from '@/components/EpubReader.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const bookPath = ref('')

onMounted(() => {
  const path = route.query.path
  if (!path) {
    ElMessage.error('未指定图书路径')
    goBack()
    return
  }
  bookPath.value = decodeURIComponent(path)
})

const goBack = () => {
  router.push({ name: 'BookList' })
}
</script>

<style scoped>
.book-reader {
  height: 100vh;
  background-color: #f5f5f5;
}

.error-message {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 