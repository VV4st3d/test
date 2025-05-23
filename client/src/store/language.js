import { defineStore } from 'pinia'
import axios from 'axios'
import ruTranslations from '../locales/ru.json'
import enTranslations from '../locales/en.json'

const apiUrl = import.meta.env.VITE_API_URL

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: localStorage.getItem('language') || 'ru',
    translations: {},
    isLoaded: false,
    lastLoadedLanguage: null
  }),

  getters: {
    getCurrentLanguage: (state) => state.currentLanguage,
    availableLanguages: () => ['ru', 'en']
  },

  actions: {
    async initialize() {
      if (!this.isLoaded || this.lastLoadedLanguage !== this.currentLanguage) {
        await this.loadTranslations(this.currentLanguage)
      }
    },

    async initializeLanguage() {
      await this.initialize()
    },

    async changeLanguage(lang) {
      if (lang === this.currentLanguage) return
      
      this.currentLanguage = lang
      localStorage.setItem('language', lang)
      
      // Принудительно сбрасываем флаг загрузки, чтобы гарантировать перезагрузку переводов
      this.isLoaded = false
      
      // Загружаем переводы для нового языка
      await this.loadTranslations(lang)
      
      // Обновляем настройки пользователя, если он авторизован
      if (localStorage.getItem('token')) {
        try {
          await axios.put(`${apiUrl}/api/language`, { language: lang })
        } catch (error) {
          console.error('Error updating language setting:', error)
        }
      }
    },

    async loadTranslations(lang) {
      try {
        // Загружаем переводы из локальных файлов в зависимости от выбранного языка
        let translations = {};
        
        if (lang === 'ru') {
          translations = ruTranslations;
        } else if (lang === 'en') {
          translations = enTranslations;
        } else {
          // Фолбэк на русский язык, если передан неизвестный язык
          translations = ruTranslations;
        }
        
        this.translations = translations;
        this.isLoaded = true;
        this.lastLoadedLanguage = lang;
        
      } catch (error) {
        // Fallback к пустому объекту переводов
        this.translations = {}
      }
    },

    t(key, params) {
      if (!this.isLoaded || !key) {
        return key;
      }
      
      // Разбиваем ключ на части, например, 'admin.users.title'
      const parts = key.split('.');
      let translation = this.translations;
      
      // Проходим по всем частям ключа
      for (const part of parts) {
        if (translation && typeof translation === 'object' && part in translation) {
          translation = translation[part];
        } else {
          // Если ключ не найден, возвращаем сам ключ
          return key;
        }
      }
      
      if (typeof translation !== 'string') {
        return key;
      }
      
      // Заменяем параметры, если они есть
      if (params) {
        return Object.keys(params).reduce((str, paramKey) => {
          return str.replace(`{${paramKey}}`, params[paramKey]);
        }, translation);
      }
      
      return translation;
    }
  }
}) 