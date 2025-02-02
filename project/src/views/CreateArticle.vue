<template>
  <div class="create-article">
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
import { useRouter } from 'vue-router'
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
  Timer
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
const { saveArticleDraft, publishArticle: publishArticleApi } = useArticleApi()

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
  { value: 'tech', label: '技术' },
  { value: 'life', label: '生活' },
  { value: 'thoughts', label: '随想' },
  { value: 'other', label: '其他' }
]

const tags = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' }
]

// 状态变量
const savingDraft = ref(false)
const publishing = ref(false)
const lastSaveTime = ref('')

// 编辑器实例
const vditor = ref(null)

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
          'devtools',
          'help',
        ],
      },
    ],
    options: {
    },
    counter: {
      enable: true,
      type: 'text',
    },
    preview: {
      delay: 500,
      maxWidth: 1000,
      mode: 'both',
      hljs: {
        enable: true,
        style: 'github',
        lineNumber: true,
      },
      math: {
        enable: true,
        engine: 'KaTeX',
      },
      markdown: {
        toc: true,
        mark: true,
        footnotes: true,
        autoSpace: true,
        paragraphBeginningSpace: true,
        fixTermTypo: true,
      },
    },
    hint: {
      emoji: {
        '+1': '👍',
        '-1': '👎',
        'smile': '😄',
        'heart': '❤️',
        'ok_hand': '👌',
      },
    },
    upload: {
      url: '/api/upload',
      max: 5 * 1024 * 1024,
      accept: 'image/*',
      handler: (files) => {
        return new Promise((resolve, reject) => {
          const formData = new FormData()
          files.forEach((file) => {
            formData.append('file', file)
          })
          
          fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
            .then((response) => response.json())
            .then((json) => {
              resolve(json.data)
            })
            .catch((error) => {
              reject(error)
            })
        })
      },
    },
    after: () => {
      if (markdownContent.value) {
        vditor.value.setValue(markdownContent.value)
      }
    },
    input: (value) => {
      markdownContent.value = value
      handleInput()
    },
    focus: (value) => {
      // 获得焦点时的回调
    },
    blur: (value) => {
      // 失去焦点时的回调
    },
    esc: (value) => {
      // 按下 ESC 键时的回调
    },
    ctrlEnter: (value) => {
      // 按下 Ctrl+Enter 时的回调
    },
    select: (value) => {
      // 选中文本时的回调
    },
  })
}

// 在组件挂载时初始化编辑器
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
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
  if (!articleTitle.value.trim() && !markdownContent.value.trim()) {
    return
  }

  try {
    savingDraft.value = true
    // 这里应该调用API保存草稿
    const response = await saveArticleDraft({
      title: articleTitle.value,
      content: markdownContent.value,
      ...articleSettings.value
    })
    
    lastSaveTime.value = new Date().toLocaleString()
    if (!isAuto) {
      ElMessage.success('草稿已保存')
    }
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    savingDraft.value = false
  }
}

// 发布文章
const publishArticle = async () => {
  // 表单验证
  if (!articleTitle.value.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (!markdownContent.value.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }
  if (!articleSettings.value.category) {
    ElMessage.warning('请选择文章分类')
    return
  }
  if (articleSettings.value.tags.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return
  }

  try {
    const confirmResult = await ElMessageBox.confirm(
      '确定要发布这篇文章吗？发布后将进入审核流程。',
      '发布确认'
    )
    
    publishing.value = true
    // 这里应该调用API发布文章
    const response = await publishArticleApi({
      title: articleTitle.value,
      content: markdownContent.value,
      ...articleSettings.value
    })
    
    ElMessage.success('文章已提交审核')
    router.push('/my-articles')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败：' + error.message)
    }
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
</style> 