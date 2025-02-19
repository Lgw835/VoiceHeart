<template>
  <div class="create-article">
    <div class="back-button">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回上一页
      </el-button>
    </div>
    <div class="editor-container">
      <el-card class="editor-card">
        <!-- 标题输入 -->
        <el-input
          v-model="articleTitle"
          placeholder="请输入文章标题"
          class="title-input"
          size="large"
          maxlength="100"
          show-word-limit
        />

        <!-- Vditor 编辑器 -->
        <div class="editor-main">
          <div id="vditor" class="vditor" ref="editorRef"></div>
        </div>

        <!-- 文章设置 -->
        <div class="article-settings">
          <el-form :model="articleSettings" label-width="80px">
            <el-form-item label="分类">
              <el-select 
                v-model="articleSettings.category" 
                placeholder="选择分类"
                filterable
                allow-create
              >
                <el-option
                  v-for="item in categories"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="标签">
              <el-select
                v-model="articleSettings.tags"
                multiple
                filterable
                allow-create
                placeholder="请选择或创建标签"
                :max="5"
              >
                <el-option
                  v-for="item in tags"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="封面">
              <el-upload
                class="cover-upload"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleCoverSuccess"
                :before-upload="beforeCoverUpload"
                accept="image/*"
              >
                <img v-if="articleSettings.coverUrl" :src="articleSettings.coverUrl" class="cover-image">
                <div v-else class="cover-uploader-icon">
                  <el-icon><Plus /></el-icon>
                  <div class="upload-text">点击上传封面</div>
                </div>
              </el-upload>
            </el-form-item>
            <el-form-item label="摘要">
              <el-input
                v-model="articleSettings.summary"
                type="textarea"
                :rows="3"
                placeholder="请输入文章摘要，如不填写将自动提取正文前200字"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 操作按钮 -->
        <div class="article-actions">
          <div class="draft-info" v-if="lastSaveTime">
            <el-icon><Timer /></el-icon>
            <span>上次保存：{{ lastSaveTime }}</span>
          </div>
          <div class="action-buttons">
            <el-button @click="saveDraft" :loading="savingDraft">保存草稿</el-button>
            <el-button type="primary" @click="publishArticle" :loading="publishing">发布文章</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Edit,
  CaretBottom,
  Delete,
  Sunny,
  TopLeft,
  Top,
  TopRight,
  List,
  Finished,
  Select,
  Link,
  Picture,
  Grid,
  Monitor,
  Upload,
  Plus,
  Timer,
  ArrowLeft
} from '@element-plus/icons-vue'
import { marked } from 'marked'
import { ElMessage, ElMessageBox } from 'element-plus'
import '../assets/styles/markdown.css'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import 'highlight.js/styles/github.css'
import { useArticleApi } from '../api/article'
import 'vditor/dist/index.css'
import Vditor from 'vditor'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const route = useRoute()
const { saveArticleDraft, publishArticle: publishArticleApi, getArticle } = useArticleApi()

// 文章标题
const articleTitle = ref('')

// Markdown内容
const markdownContent = ref('')
const editorRef = ref(null)
const { currentTheme } = useTheme()

// 注册常用的语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)

// 配置marked
marked.setOptions({
  gfm: true,
  breaks: true,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (e) {
        console.error(e)
        return code
      }
    }
    return hljs.highlightAuto(code).value
  }
})

// HTML预览内容
const htmlContent = computed(() => {
  return marked(markdownContent.value)
})

// 文章设置
const articleSettings = ref({
  category: '',
  tags: [],
  coverUrl: '',
  summary: ''
})

// 分类和标签数据
const categories = [
  { value: '心理', label: '心理' },
  { value: '情感', label: '情感' },
  { value: '生活', label: '生活' },
  { value: '职场', label: '职场' },
  { value: '知识分享', label: '知识分享' },
  { value: '迷茫求助', label: '迷茫求助' },
  { value: '沪上青年', label: '沪上青年' },
  { value: '活动', label: '活动' },
  { value: '技术', label: '技术' },
  { value: '其他', label: '其他' }
]

const tags = [
  { value: '心理咨询', label: '心理咨询' },
  { value: '情感困惑', label: '情感困惑' },
  { value: '职业规划', label: '职业规划' },
  { value: '学习方法', label: '学习方法' },
  { value: '生活经验', label: '生活经验' },
  { value: '兴趣爱好', label: '兴趣爱好' }
]

// 状态变量
const savingDraft = ref(false)
const publishing = ref(false)
const lastSaveTime = ref('')

// 编辑器实例
const vditor = ref(null)

// 是否是编辑模式
const isEdit = computed(() => Boolean(route.query.id))

// 文章数据
const articleData = ref(null)

// 返回上一页
const goBack = () => {
  router.back()
}

// 加载文章内容
const loadArticle = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await getArticle(route.query.id)
    if (response.success) {
      const { article } = response
      articleData.value = article
      articleTitle.value = article.title
      articleSettings.value = {
        category: article.category,
        tags: article.tags,
        coverUrl: article.coverUrl,
        summary: article.summary
      }
      // 如果编辑器已经初始化，则设置内容
      if (vditor.value) {
        vditor.value.setValue(article.content)
      }
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    ElMessage.error('加载文章失败')
  }
}

// 编辑器配置
const initVditor = () => {
  vditor.value = new Vditor('vditor', {
    height: '600px',
    mode: 'wysiwyg',
    theme: currentTheme.value === 'dark' ? 'dark' : 'classic',
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      '|',
      'link',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      '|',
      'upload',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'fullscreen',
      'edit-mode',
      {
        name: 'more',
        toolbar: [
          'both',
          'code-theme',
          'content-theme',
          'export',
          'outline',
          'preview',
        ],
      },
    ],
    after: () => {
      // 编辑器初始化完成后，如果已有文章数据则设置内容
      if (articleData.value) {
        vditor.value.setValue(articleData.value.content)
      }
    }
  })
}

// 在组件挂载时初始化编辑器并加载文章
onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  // 先加载文章数据
  await loadArticle()
  // 再初始化编辑器
  initVditor()
})

// 在组件卸载时销毁编辑器
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  if (vditor.value) {
    vditor.value.destroy()
  }
})

// 自动保存
let autoSaveTimer = null
const handleInput = () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    saveDraft(true)
  }, 30000) // 30秒自动保存一次
}

// 保存草稿
const saveDraft = async (isAuto = false) => {
  if (!articleTitle.value.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  try {
    savingDraft.value = true
    const articleData = {
      title: articleTitle.value,
      content: vditor.value.getValue(),
      ...articleSettings.value
    }
    
    if (isEdit.value) {
      articleData.id = route.query.id
    }

    const response = await saveArticleDraft(articleData)
    if (response.success) {
      ElMessage.success('保存成功')
      lastSaveTime.value = new Date().toLocaleTimeString()
      if (!isEdit.value) {
        // 如果是新建文章，保存后进入编辑模式
        router.replace({
          query: { id: response.article._id }
        })
      }
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    savingDraft.value = false
  }
}

// 发布文章
const publishArticle = async () => {
  if (!articleTitle.value.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  try {
    publishing.value = true
    const articleData = {
      title: articleTitle.value,
      content: vditor.value.getValue(),
      ...articleSettings.value
    }
    
    if (isEdit.value) {
      articleData.id = route.query.id
    }

    const response = await publishArticleApi(articleData)
    if (response.success) {
      ElMessage.success('发布成功')
      router.push(`/article/${response.article._id}`)
    }
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}

// 页面离开提示
const handleBeforeUnload = (e) => {
  if (articleTitle.value || markdownContent.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// 封面上传相关方法
const handleCoverSuccess = (res) => {
  articleSettings.value.coverUrl = res.url
  ElMessage.success('封面上传成功')
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }
  return isImage && isLt2M
}
</script>

<style scoped>
.create-article {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.editor-container {
  min-height: calc(100vh - 140px);
}

.editor-card {
  height: 100%;
}

.title-input {
  margin-bottom: 20px;
}

.title-input :deep(.el-input__inner) {
  font-size: 24px;
  font-weight: bold;
}

.editor-main {
  margin-bottom: 20px;
  height: 600px;
}

.vditor {
  height: 100%;
}

/* 美化 Vditor 样式 */
:deep(.vditor) {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.vditor-toolbar) {
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
  border-radius: 8px 8px 0 0;
  padding: 8px;
}

:deep(.vditor-toolbar__item) {
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.vditor-toolbar__item:hover) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

:deep(.vditor-toolbar__divider) {
  margin: 0 8px;
  background-color: var(--el-border-color-lighter);
}

:deep(.vditor-reset) {
  padding: 20px;
  font-size: 15px;
  line-height: 1.7;
}

:deep(.vditor-ir) {
  font-size: 15px;
  line-height: 1.7;
  padding: 20px;
}

:deep(.vditor-sv) {
  font-size: 15px;
  line-height: 1.7;
  padding: 20px;
}

:deep(.vditor-wysiwyg) {
  font-size: 15px;
  line-height: 1.7;
  padding: 20px;
}

/* 暗色主题适配 */
:deep(.vditor-dark) {
  border-color: var(--el-border-color-darker);
  background-color: var(--el-bg-color-darker);
}

:deep(.vditor-dark .vditor-toolbar) {
  background-color: var(--el-bg-color-darker);
  border-color: var(--el-border-color-darker);
}

:deep(.vditor-dark .vditor-toolbar__item:hover) {
  background-color: var(--el-color-primary-dark-2);
}

:deep(.vditor-dark .vditor-reset) {
  color: var(--el-text-color-primary);
}

:deep(.vditor-dark .vditor-ir) {
  color: var(--el-text-color-primary);
}

:deep(.vditor-dark .vditor-sv) {
  color: var(--el-text-color-primary);
}

:deep(.vditor-dark .vditor-wysiwyg) {
  color: var(--el-text-color-primary);
}

/* 代码块样式 */
:deep(.vditor-reset pre) {
  background-color: var(--el-bg-color-page);
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
}

:deep(.vditor-reset code) {
  font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 14px;
}

/* 表格样式 */
:deep(.vditor-reset table) {
  border-collapse: collapse;
  margin: 16px 0;
  width: 100%;
}

:deep(.vditor-reset th),
:deep(.vditor-reset td) {
  border: 1px solid var(--el-border-color);
  padding: 8px 12px;
}

:deep(.vditor-reset th) {
  background-color: var(--el-bg-color-page);
  font-weight: 600;
}

/* 引用样式 */
:deep(.vditor-reset blockquote) {
  border-left: 4px solid var(--el-color-primary-light-5);
  margin: 16px 0;
  padding: 0 16px;
  color: var(--el-text-color-regular);
}

/* 链接样式 */
:deep(.vditor-reset a) {
  color: var(--el-color-primary);
  text-decoration: none;
  transition: color 0.3s;
}

:deep(.vditor-reset a:hover) {
  color: var(--el-color-primary-light-3);
  text-decoration: underline;
}

.article-settings {
  margin: 20px 0;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.cover-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 360px;
  height: 200px;
}

.cover-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.cover-uploader-icon {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
}

.cover-uploader-icon .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.article-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.draft-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

/* Markdown样式覆盖 */
:deep(.markdown-body) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

:deep(.markdown-body pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
}

:deep(.markdown-body code) {
  font-family: 'Fira Code', monospace;
}

.color-tools {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 4px;
}

.color-picker-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color .2s;
}

.color-picker-wrapper:hover {
  border-color: #409eff;
}

.back-button {
  margin-bottom: 20px;
}

.back-button .el-button {
  font-size: 16px;
}
</style> 