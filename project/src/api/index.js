import axios from 'axios';
import { useUserStore } from '../store/user';
import router from '../router';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 允许跨域请求携带凭证
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          const userStore = useUserStore();
          userStore.logout();
          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
          break;
        case 403:
          // 权限不足
          console.error('没有权限执行此操作');
          break;
        case 404:
          // 资源不存在
          console.error('请求的资源不存在');
          break;
        case 429:
          // 请求过于频繁，等待一段时间后重试
          const retryAfter = error.response.headers['retry-after'] || 1;
          console.warn(`请求过于频繁，${retryAfter}秒后重试`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return api(error.config);
        default:
          console.error('服务器错误:', error.response.data?.message || '未知错误');
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('无法连接到服务器，请检查网络连接');
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 