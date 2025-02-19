<template>
  <div class="profile-container">
    <!-- 用户信息卡片 -->
    <el-card class="user-card">
      <div class="user-info">
        <el-avatar :size="80" :src="userInfo.avatar" />
        <div class="info-content">
          <h2>{{ userInfo.username }}</h2>
          <p class="bio">{{ userInfo.bio || '这个人很懒，什么都没写~' }}</p>
          <div class="stats">
            <div class="stat-item">
              <div class="number">{{ userInfo.stats?.articles || 0 }}</div>
              <div class="label">文章</div>
            </div>
            <div class="stat-item">
              <div class="number">{{ userInfo.stats?.followers || 0 }}</div>
              <div class="label">关注者</div>
            </div>
            <div class="stat-item">
              <div class="number">{{ userInfo.stats?.following || 0 }}</div>
              <div class="label">关注</div>
            </div>
          </div>
        </div>
        <el-button v-if="isCurrentUser" @click="handleEdit">编辑资料</el-button>
      </div>
    </el-card>

    <!-- 内容区域 -->
    <div class="content-area">
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="我的文章" name="articles">
          <div v-loading="loading.articles" class="articles-grid">
            <article-card
              v-for="article in articles"
              :key="article._id"
              :article="article"
              :is-from-my-articles="true"
              @article-deleted="handleArticleDeleted"
            />
            <div v-if="articles.length === 0" class="empty-state">
              <el-empty description="暂无文章" />
              <el-button type="primary" @click="router.push('/create-article')">
                写文章
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="收藏的文章" name="favorites">
          <div v-loading="loading.favorites" class="articles-grid">
            <article-card
              v-for="article in favorites"
              :key="article._id"
              :article="article"
              :is-from-my-articles="false"
            />
            <el-empty v-if="favorites.length === 0" description="暂无收藏" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人资料"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="loading.edit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const { Plus } = ElementPlusIconsVue
import ArticleCard from '../components/ArticleCard.vue'
import { userApi } from '../api/userApi'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('articles')
const editDialogVisible = ref(false)
const editFormRef = ref(null)

const loading = ref({
  articles: false,
  favorites: false,
  edit: false
})

const articles = ref([])
const favorites = ref([])

const userInfo = computed(() => userStore.user)
const isCurrentUser = computed(() => true) // 暂时只显示当前用户的个人中心

const editForm = ref({
  username: '',
  avatar: '',
  bio: ''
})

const editRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '不能超过200个字符', trigger: 'blur' }
  ]
}

// 获取用户文章列表
const fetchUserArticles = async () => {
  try {
    loading.value.articles = true
    const response = await userApi.getUserArticles(userInfo.value.id)
    if (response.success) {
      articles.value = response.articles
    } else {
      ElMessage.error(response.message || '获取文章列表失败')
    }
  } catch (error) {
    console.error('获取文章列表错误:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value.articles = false
  }
}

// 获取收藏列表
const fetchFavorites = async () => {
  try {
    loading.value.favorites = true
    const response = await userApi.getFavorites()
    if (response.success) {
      favorites.value = response.favorites.map(fav => fav.articleId)
    } else {
      ElMessage.error('获取收藏列表失败')
    }
  } catch (error) {
    console.error('获取收藏列表错误:', error)
    ElMessage.error('获取收藏列表失败')
  } finally {
    loading.value.favorites = false
  }
}

// 打开编辑对话框
const handleEdit = () => {
  editForm.value = {
    username: userInfo.value.username,
    avatar: userInfo.value.avatar,
    bio: userInfo.value.bio
  }
  editDialogVisible.value = true
}

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 头像上传成功的回调
const handleAvatarSuccess = (response) => {
  if (response.success) {
    editForm.value.avatar = response.url
  } else {
    ElMessage.error('头像上传失败')
  }
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return

    loading.value.edit = true
    const response = await userApi.updateProfile(editForm.value)
    
    if (response.success) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      // 更新用户信息
      await userStore.fetchCurrentUser()
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新个人资料错误:', error)
    ElMessage.error('更新失败')
  } finally {
    loading.value.edit = false
  }
}

// 处理文章删除
const handleArticleDeleted = (articleId) => {
  articles.value = articles.value.filter(article => article._id !== articleId)
}

onMounted(() => {
  fetchUserArticles()
  fetchFavorites()
})
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.info-content {
  flex: 1;
}

.info-content h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}

.bio {
  color: #606266;
  margin: 0 0 16px;
}

.stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.number {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.label {
  font-size: 14px;
  color: #909399;
}

.content-area {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 500px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-state .el-button {
  margin-top: 20px;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}
</style> 