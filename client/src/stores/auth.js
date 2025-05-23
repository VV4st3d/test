import { defineStore } from 'pinia';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user && state.user.role === 'admin',
    isModerator: (state) => state.user && (state.user.role === 'moderator' || state.user.role === 'admin'),
    currentUser: (state) => state.user
  },
  
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post(`${apiUrl}/api/auth/login`, credentials);
        
        if (response.data.success) {
          const { token, user } = response.data;
          
          // Сохраняем данные пользователя и токен
          this.user = user;
          this.token = token;
          
          // Сохраняем в localStorage
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);
          
          // Добавляем токен в заголовки запросов
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return true;
        } else {
          this.error = response.data.message || 'Ошибка входа в систему';
          return false;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Произошла ошибка при входе в систему';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post(`${apiUrl}/api/auth/register`, userData);
        
        if (response.data.success) {
          const { token, user } = response.data;
          
          // Сохраняем данные пользователя и токен
          this.user = user;
          this.token = token;
          
          // Сохраняем в localStorage
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);
          
          // Добавляем токен в заголовки запросов
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return true;
        } else {
          this.error = response.data.message || 'Ошибка регистрации';
          return false;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Произошла ошибка при регистрации';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      // Удаляем данные из состояния
      this.user = null;
      this.token = null;
      
      // Удаляем данные из localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Удаляем токен из заголовков запросов
      delete axios.defaults.headers.common['Authorization'];
    },
    
    async fetchUserProfile() {
      if (!this.token) return;
      
      this.loading = true;
      
      try {
        const response = await axios.get(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        
        if (response.data.success) {
          // Обновляем данные пользователя
          this.user = response.data.user;
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        if (error.response?.status === 401) {
          // Если токен недействителен, выходим из аккаунта
          this.logout();
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Устанавливаем токен в заголовки axios при инициализации приложения
    initializeAuth() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    }
  }
}); 