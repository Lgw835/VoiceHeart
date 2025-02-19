import { defineStore } from 'pinia'
import { userApi } from '../api/userApi'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    loading: false
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    isCreator: (state) => state.user.role === 'creator',
    isAdmin: (state) => state.user.role === 'admin',
    userRole: (state) => state.user.role || 'guest'
  },
  
  actions: {
    async login(credentials) {
      try {
        this.loading = true
        const response = await userApi.login(credentials)
        this.setUserData(response)
        return response
      } finally {
        this.loading = false
      }
    },
    
    async register(userData) {
      try {
        this.loading = true
        const response = await userApi.register(userData)
        return response
      } finally {
        this.loading = false
      }
    },
    
    async updateProfile(userData) {
      try {
        this.loading = true
        const response = await userApi.updateProfile(userData)
        if (response.success) {
          this.user = response.user
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        return response
      } finally {
        this.loading = false
      }
    },
    
    async fetchCurrentUser() {
      try {
        this.loading = true
        const response = await userApi.getCurrentUser()
        if (response.success) {
          this.user = response.user
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        return response
      } finally {
        this.loading = false
      }
    },
    
    setUserData(data) {
      if (data.success) {
        this.token = data.token
        this.user = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    },
    
    logout() {
      this.token = ''
      this.user = {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      userApi.logout()
    },
    
    clearError() {
      this.error = null
    }
  }
}) 