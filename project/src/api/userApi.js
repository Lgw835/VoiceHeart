import api from './index';

export const userApi = {
  // 用户注册
  register: async (userData) => {
    return await api.post('/users/register', userData);
  },

  // 用户登录
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      // response已经是response.data了（因为响应拦截器的处理）
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      console.error('登录API错误:', error);
      throw error;
    }
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return await api.get('/users/me');
  },

  // 更新用户信息
  updateProfile: async (userData) => {
    return await api.put('/users/me', userData);
  },

  // 获取用户文章列表
  getUserArticles: async (userId) => {
    return await api.get(`/users/${userId}/articles`);
  },

  // 获取用户收藏列表
  getFavorites: async () => {
    return await api.get('/users/me/favorites');
  },

  // 退出登录
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}; 