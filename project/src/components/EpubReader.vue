<template>
  <div class="epub-reader">
    <div class="reader-header">
      <div class="left-controls">
        <el-button @click="toggleToc" v-if="navigation">
          <el-icon><Menu /></el-icon>
          目录
        </el-button>
      </div>
      
      <div class="center-controls">
        <el-button @click="prevPage" :disabled="!canPrevPage">
          <el-icon><ArrowLeft /></el-icon>
          上一页
        </el-button>
        <span class="progress">{{ currentPage }}/{{ totalPages }}</span>
        <el-button @click="nextPage" :disabled="!canNextPage">
          下一页
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="right-controls">
        <el-dropdown trigger="click" @command="handleCommand">
          <el-button>
            <el-icon><Setting /></el-icon>
            设置
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="theme-light">浅色主题</el-dropdown-item>
              <el-dropdown-item command="theme-dark">深色主题</el-dropdown-item>
              <el-dropdown-item command="theme-sepia">护眼模式</el-dropdown-item>
              <el-dropdown-item divided>
                <div class="font-size-control">
                  <span>字体大小</span>
                  <el-slider
                    v-model="fontSize"
                    :min="12"
                    :max="24"
                    :step="1"
                    @change="updateFontSize"
                    style="width: 120px; margin: 0 10px;"
                  />
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 目录抽屉 -->
    <el-drawer
      v-model="showToc"
      title="目录"
      direction="ltr"
      size="300px"
    >
      <div class="toc-list">
        <div
          v-for="item in toc"
          :key="item.href"
          class="toc-item"
          :style="{ paddingLeft: item.level * 20 + 'px' }"
          @click="navigateToChapter(item.href)"
        >
          {{ item.label }}
        </div>
      </div>
    </el-drawer>

    <div class="reader-content" ref="readerContent"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ePub from 'epubjs'
import { Menu, Setting, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  bookPath: {
    type: String,
    required: true
  }
})

const readerContent = ref(null)
const book = ref(null)
const rendition = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const fontSize = ref(16)
const canPrevPage = ref(false)
const canNextPage = ref(false)
const showToc = ref(false)
const toc = ref([])
const navigation = ref(null)

const initReader = async () => {
  try {
    book.value = ePub(props.bookPath)
    
    // 获取目录
    navigation.value = await book.value.loaded.navigation
    toc.value = await book.value.navigation.toc
    
    rendition.value = book.value.renderTo(readerContent.value, {
      width: '100%',
      height: '100%',
      spread: 'always', // 设置为双页显示
      flow: 'paginated',
      minSpreadWidth: 800 // 当宽度小于800px时自动切换到单页
    })

    await rendition.value.display()
    
    // 设置默认字体大小和主题
    updateFontSize(fontSize.value)
    setTheme('light')
    
    // 监听键盘事件
    document.addEventListener('keyup', handleKeyPress)
    
    // 监听页面变化
    rendition.value.on('relocated', (location) => {
      currentPage.value = location.start.displayed.page
      totalPages.value = location.total
      canPrevPage.value = location.atStart !== true
      canNextPage.value = location.atEnd !== true
    })

  } catch (error) {
    console.error('Error initializing reader:', error)
  }
}

const handleCommand = (command) => {
  if (command.startsWith('theme-')) {
    setTheme(command.replace('theme-', ''))
  }
}

const setTheme = (theme) => {
  if (!rendition.value) return
  
  const themes = {
    light: {
      body: {
        color: '#000',
        background: '#fff'
      }
    },
    dark: {
      body: {
        color: '#fff',
        background: '#333'
      }
    },
    sepia: {
      body: {
        color: '#5b4636',
        background: '#f4ecd8'
      }
    }
  }

  rendition.value.themes.default(themes[theme])
}

const toggleToc = () => {
  showToc.value = !showToc.value
}

const navigateToChapter = (href) => {
  if (rendition.value) {
    rendition.value.display(href)
    showToc.value = false
  }
}

const prevPage = () => {
  if (rendition.value) {
    rendition.value.prev()
  }
}

const nextPage = () => {
  if (rendition.value) {
    rendition.value.next()
  }
}

const handleKeyPress = (e) => {
  if (e.key === 'ArrowLeft') {
    prevPage()
  } else if (e.key === 'ArrowRight') {
    nextPage()
  }
}

const updateFontSize = (size) => {
  if (rendition.value) {
    rendition.value.themes.fontSize(`${size}px`)
  }
}

onMounted(() => {
  initReader()
})

onUnmounted(() => {
  document.removeEventListener('keyup', handleKeyPress)
  if (book.value) {
    book.value.destroy()
  }
})
</script>

<style scoped>
.epub-reader {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.reader-header {
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left-controls,
.center-controls,
.right-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.center-controls {
  flex: 1;
  justify-content: center;
}

.reader-content {
  flex: 1;
  overflow: hidden;
  margin: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.progress {
  font-size: 14px;
  color: #666;
  margin: 0 15px;
}

.toc-list {
  padding: 10px;
}

.toc-item {
  padding: 8px 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toc-item:hover {
  background-color: #f5f5f5;
}

.font-size-control {
  display: flex;
  align-items: center;
  padding: 5px 15px;
  white-space: nowrap;
}

:deep(.el-dropdown-menu__item) {
  padding: 5px 12px;
}

:deep(.el-button .el-icon) {
  margin-right: 4px;
}
</style> 