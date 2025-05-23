import { defineStore } from 'pinia'
import axios from 'axios'

// Цветовые схемы
const colorSchemes = {
  blue: {
    primary: '#3b82f6', // Синий
    secondary: '#60a5fa',
    accent: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  green: {
    primary: '#10b981', // Зеленый
    secondary: '#34d399',
    accent: '#059669',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  purple: {
    primary: '#8b5cf6', // Пурпурный
    secondary: '#a78bfa',
    accent: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  red: {
    primary: '#ef4444', // Красный
    secondary: '#f87171',
    accent: '#dc2626',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  orange: {
    primary: '#f97316', // Оранжевый
    secondary: '#fb923c',
    accent: '#ea580c',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: localStorage.getItem('theme') === 'dark',
    colorScheme: localStorage.getItem('colorScheme') || 'blue',
    loading: false,
    error: null
  }),

  getters: {
    currentTheme: (state) => state.isDark ? 'dark' : 'light',
    currentColorScheme: (state) => colorSchemes[state.colorScheme] || colorSchemes.blue,
    availableColorSchemes: () => Object.keys(colorSchemes)
  },

  actions: {
    async initialize() {
      return this.initializeTheme();
    },
    
    async toggleTheme() {
      try {
        this.isDark = !this.isDark
        const theme = this.isDark ? 'dark' : 'light'
        
        localStorage.setItem('theme', theme)
        
        if (this.isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        
        this.applyColorScheme()
        
        if (localStorage.getItem('token')) {
          await axios.put('/api/theme', { theme, colorScheme: this.colorScheme })
        }
      } catch (error) {
        this.error = error.message || 'Ошибка при переключении темы'
        console.error('Error toggling theme:', error)
      }
    },
    
    async setTheme(theme) {
      try {
        if (!['light', 'dark'].includes(theme)) {
          throw new Error('Invalid theme value. Use "light" or "dark".')
        }
        
        this.isDark = theme === 'dark'
        
        localStorage.setItem('theme', theme)
        
        if (this.isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        
        this.applyColorScheme()
        
        if (localStorage.getItem('token')) {
          await axios.put('/api/theme', { theme, colorScheme: this.colorScheme })
        }
      } catch (error) {
        this.error = error.message || 'Ошибка при установке темы'
        console.error('Error setting theme:', error)
      }
    },
    
    async setColorScheme(colorScheme) {
      try {
        if (!colorSchemes[colorScheme]) {
          throw new Error('Invalid color scheme')
        }
        
        this.colorScheme = colorScheme
        localStorage.setItem('colorScheme', colorScheme)
        
        this.applyColorScheme()
        
        if (localStorage.getItem('token')) {
          await axios.put('/api/theme', { theme: this.currentTheme, colorScheme })
        }
      } catch (error) {
        this.error = error.message || 'Ошибка при изменении цветовой схемы'
        console.error('Error setting color scheme:', error)
      }
    },
    
    applyColorScheme(colorSchemeName) {
      const scheme = colorSchemeName 
        ? colorSchemes[colorSchemeName] 
        : colorSchemes[this.colorScheme] || colorSchemes.blue;
      
      document.documentElement.style.setProperty('--color-primary', scheme.primary);
      document.documentElement.style.setProperty('--color-secondary', scheme.secondary);
      document.documentElement.style.setProperty('--color-accent', scheme.accent);
      document.documentElement.style.setProperty('--color-success', scheme.success);
      document.documentElement.style.setProperty('--color-warning', scheme.warning);
      document.documentElement.style.setProperty('--color-error', scheme.error);
    },
    
    async initializeTheme() {
      try {
        this.loading = true
        
        const localTheme = localStorage.getItem('theme')
        const localColorScheme = localStorage.getItem('colorScheme')
        
        if (localTheme) {
          this.isDark = localTheme === 'dark'
        } else {
          // Проверка системных предпочтений
          this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
        }
        
        if (localColorScheme && colorSchemes[localColorScheme]) {
          this.colorScheme = localColorScheme
        }
        
        // Применяем темную тему если нужно
        if (this.isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        
        // Применяем цветовую схему
        this.applyColorScheme()
        
        // Если пользователь авторизован, запрашиваем настройки с сервера
        if (localStorage.getItem('token')) {
          try {
            const response = await axios.get('/api/theme')
            if (response.data && response.data.theme) {
              // Устанавливаем тему без повторного запроса на сервер
              this.isDark = response.data.theme === 'dark'
              localStorage.setItem('theme', response.data.theme)
              
              if (this.isDark) {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            }
            if (response.data && response.data.colorScheme && colorSchemes[response.data.colorScheme]) {
              // Устанавливаем цветовую схему без повторного запроса на сервер
              this.colorScheme = response.data.colorScheme
              localStorage.setItem('colorScheme', response.data.colorScheme)
              this.applyColorScheme()
            }
          } catch (error) {
            console.error('Error fetching theme from server:', error)
            // Используем локальные настройки при ошибке
          }
        }
      } catch (error) {
        this.error = error.message || 'Ошибка при инициализации темы'
        console.error('Error initializing theme:', error)
      } finally {
        this.loading = false
      }
    }
  }
}) 