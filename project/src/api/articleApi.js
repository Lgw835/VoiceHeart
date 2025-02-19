import api from './index';

export const articleApi = {
  // 获取文章列表
  getArticles: async (params) => {
    const { category, tag, page = 1, limit = 10, status = 'published' } = params;
    const query = new URLSearchParams({
      page,
      limit,
      status
    });
    
    if (category) query.append('category', category);
    if (tag) query.append('tag', tag);
    
    return await api.get(`/articles?${query.toString()}`);
  },

  // 获取文章详情
  getArticle: async (id) => {
    return await api.get(`/articles/${id}`);
  },

  // 创建文章
  createArticle: async (articleData) => {
    return await api.post('/articles', articleData);
  },

  // 更新文章
  updateArticle: async (id, articleData) => {
    return await api.put(`/articles/${id}`, articleData);
  },

  // 删除文章
  deleteArticle: async (id) => {
    return await api.delete(`/articles/${id}`);
  },

  // 点赞文章
  likeArticle: async (id) => {
    return await api.post(`/articles/${id}/like`);
  },

  // 收藏文章
  favoriteArticle: async (id) => {
    return await api.post(`/articles/${id}/favorite`);
  },

  // 取消收藏文章
  unfavoriteArticle: async (id) => {
    return await api.delete(`/articles/${id}/favorite`);
  },

  // 获取文章评论
  getComments: async (articleId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    return await api.get(`/articles/${articleId}/comments?page=${page}&limit=${limit}`);
  },

  // 添加评论
  addComment: async (articleId, content) => {
    return await api.post(`/articles/${articleId}/comments`, { content });
  },

  // 点赞评论
  likeComment: async (articleId, commentId) => {
    return await api.post(`/articles/${articleId}/comments/${commentId}/like`);
  }
}; 