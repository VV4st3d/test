import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/auth/login', credentials)
        const { token, user } = response.data
        
        // Нормализация данных пользователя
        if (user.id && !user._id) {
          user._id = user.id
        }
        
        this.token = token
        this.user = user
        this.isAuthenticated = true
        
        localStorage.setItem('token', token)
        localStorage.setItem('userRole', user.role)
        
        return true
      } catch (error) {
        throw error.response?.data?.message || 'Ошибка при входе'
      }
    },

    async register(userData) {
      try {
        const response = await axios.post('/api/auth/register', userData)
        const { token, user } = response.data
        
        // Нормализация данных пользователя
        if (user.id && !user._id) {
          user._id = user.id
        }
        
        this.token = token
        this.user = user
        this.isAuthenticated = true
        
        localStorage.setItem('token', token)
        localStorage.setItem('userRole', user.role)
        
        return true
      } catch (error) {
        throw error.response?.data?.message || 'Ошибка при регистрации'
      }
    },

    async logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
    },

    async fetchUser() {
      try {
        const response = await axios.get('/api/auth/me')
        let userData;
        
        if (response.data && response.data.success) {
          userData = response.data.user
        } else if (response.data) {
          userData = response.data
        } else {
          throw new Error('Неверный формат ответа от сервера')
        }
        
        if (userData.id && !userData._id) {
          userData._id = userData.id;
        }
        
        this.user = userData;
        
        return this.user
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error)
        this.logout()
        throw error
      }
    },
    
    async initializeAuth() {
      if (this.isAuthenticated && !this.user) {
        try {
          await this.fetchUser()
          return true
        } catch (error) {
          console.error('Ошибка при получении данных пользователя:', error)
          this.logout()
          return false
        }
      }
      return this.isAuthenticated
    },
    
    async updateProfile(userData) {
      try {
        const response = await axios.put('/api/auth/profile', userData)
        
        if (response.data && response.data.success) {
          this.user = response.data.user
        } else if (response.data) {
          this.user = response.data
        }
        
        return true
      } catch (error) {
        throw error.response?.data?.message || 'Ошибка при обновлении профиля'
      }
    },
    
    clearAuth() {
      this.logout()
    }
  }
}) 