import { ref, watch } from 'vue'

const currentTheme = ref(localStorage.getItem('theme') || 'light')

export function useTheme() {
  // 切换主题
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', currentTheme.value)
  }

  // 设置特定主题
  const setTheme = (theme) => {
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
  }

  // 监听主题变化
  watch(currentTheme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  }, { immediate: true })

  return {
    currentTheme,
    toggleTheme,
    setTheme
  }
} 