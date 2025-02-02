<template>
  <div class="user-profile">
    <!-- 用户基本信息卡片 -->
    <el-card class="profile-card">
      <div class="user-info">
        <div class="avatar-wrapper">
          <el-avatar :size="100" :src="userInfo.avatar" />
          <div v-if="isEditing" class="avatar-upload">
            <el-upload
              class="avatar-uploader"
              action="/api/upload/avatar"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :headers="{ Authorization: `Bearer ${userStore.token}` }"
            >
              <el-button size="small" type="primary">更换头像</el-button>
            </el-upload>
          </div>
        </div>
        <div class="info-content">
          <template v-if="!isEditing">
            <h2>{{ userInfo.username }}</h2>
            <p>{{ userInfo.bio || '这个人很懒，还没有写简介' }}</p>
            <el-button type="primary" @click="startEditing">编辑资料</el-button>
          </template>
          <template v-else>
            <el-form
              ref="formRef"
              :model="editForm"
              :rules="formRules"
              label-width="80px"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="editForm.username" maxlength="20" show-word-limit />
              </el-form-item>
              <el-form-item label="简介" prop="bio">
                <el-input
                  v-model="editForm.bio"
                  type="textarea"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                  placeholder="写点什么介绍自己吧..."
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveProfile" :loading="saving">保存</el-button>
                <el-button @click="cancelEdit">取消</el-button>
              </el-form-item>
            </el-form>
          </template>
        </div>
      </div>
    </el-card>

    <!-- 文章列表标签页 -->
    <el-tabs v-model="activeTab" class="profile-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="我的文章" name="myArticles">
        <article-list
          :articles="myArticles"
          :loading="loading"
          @load-more="loadMoreMyArticles"
        />
      </el-tab-pane>
      <el-tab-pane label="收藏的文章" name="favorites">
        <article-list
          :articles="favoriteArticles"
          :loading="loading"
          @load-more="loadMoreFavorites"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import ArticleList from '@/components/ArticleList.vue'

const userStore = useUserStore()
const formRef = ref(null)
const isEditing = ref(false)
const activeTab = ref('myArticles')
const loading = ref(false)
const saving = ref(false)

// 分页参数
const pageSize = 10
const currentPage = ref(1)

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '简介不能超过200个字符', trigger: 'blur' }
  ]
}

// 用户信息
const userInfo = reactive({
  username: userStore.user?.username || '',
  bio: userStore.user?.bio || '',
  avatar: userStore.user?.avatar || ''
})

// 编辑表单
const editForm = reactive({
  username: userInfo.username,
  bio: userInfo.bio
})

// 文章列表数据
const myArticles = ref([])
const favoriteArticles = ref([])
const hasMore = ref(true)

// 开始编辑
const startEditing = () => {
  editForm.username = userInfo.username
  editForm.bio = userInfo.bio
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  formRef.value?.resetFields()
  isEditing.value = false
}

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 头像上传成功的回调
const handleAvatarSuccess = (response) => {
  userInfo.avatar = response.url
  ElMessage.success('头像更新成功')
}

// 保存个人资料
const saveProfile = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    await userStore.updateProfile(editForm)
    Object.assign(userInfo, editForm)
    isEditing.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    if (error.message) {
      ElMessage.error('保存失败：' + error.message)
    }
  } finally {
    saving.value = false
  }
}

// 处理标签页切换
const handleTabClick = () => {
  currentPage.value = 1
  if (activeTab.value === 'myArticles') {
    myArticles.value = []
    loadMoreMyArticles()
  } else {
    favoriteArticles.value = []
    loadMoreFavorites()
  }
}

// 加载我的文章
const loadMoreMyArticles = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const response = await fetch(
      `/api/articles?userId=${userStore.user.id}&page=${currentPage.value}&pageSize=${pageSize}`
    )
    const data = await response.json()
    myArticles.value.push(...data.articles)
    hasMore.value = data.articles.length === pageSize
    currentPage.value++
  } catch (error) {
    ElMessage.error('加载文章失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 加载收藏的文章
const loadMoreFavorites = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const response = await fetch(
      `/api/favorites?userId=${userStore.user.id}&page=${currentPage.value}&pageSize=${pageSize}`
    )
    const data = await response.json()
    favoriteArticles.value.push(...data.articles)
    hasMore.value = data.articles.length === pageSize
    currentPage.value++
  } catch (error) {
    ElMessage.error('加载收藏失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 初始化数据
onMounted(() => {
  loadMoreMyArticles()
})
</script>

<style scoped>
.user-profile {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.avatar-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-upload {
  text-align: center;
}

.info-content {
  flex: 1;
}

.profile-tabs {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.el-form {
  max-width: 500px;
}
</style> 