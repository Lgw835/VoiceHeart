import axios from 'axios'

export function useArticleApi() {
  // 保存草稿
  const saveArticleDraft = async (articleData) => {
    try {
      const response = await axios.post('/api/articles/draft', articleData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '保存草稿失败')
    }
  }

  // 发布文章
  const publishArticle = async (articleData) => {
    try {
      const response = await axios.post('/api/articles', articleData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '发布文章失败')
    }
  }

  // 获取文章详情
  const getArticle = async (id) => {
    try {
      const response = await axios.get(`/api/articles/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取文章失败')
    }
  }

  // 更新文章
  const updateArticle = async (id, articleData) => {
    try {
      const response = await axios.put(`/api/articles/${id}`, articleData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新文章失败')
    }
  }

  // 删除文章
  const deleteArticle = async (id) => {
    try {
      const response = await axios.delete(`/api/articles/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除文章失败')
    }
  }

  // 获取用户的文章列表
  const getUserArticles = async (params) => {
    try {
      const response = await axios.get('/api/articles/user', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取文章列表失败')
    }
  }

  // 获取用户的草稿列表
  const getUserDrafts = async (params) => {
    try {
      const response = await axios.get('/api/articles/drafts', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取草稿列表失败')
    }
  }

  return {
    saveArticleDraft,
    publishArticle,
    getArticle,
    updateArticle,
    deleteArticle,
    getUserArticles,
    getUserDrafts
  }
} 