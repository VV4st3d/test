import axios from 'axios';
import { cacheService } from './cacheService';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 секунд таймаут
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Добавляем интерцептор запросов
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Добавляем интерцептор ответов для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    // Если токен устарел (401), разлогиниваем пользователя
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Если не находимся на странице логина, перенаправляем
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * API Сервис для работы с бэкендом
 */
export const apiService = {
  /**
   * GET запрос с возможностью кэширования
   * @param {string} url - URL эндпоинта
   * @param {Object} params - Параметры запроса
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<any>} - Результат запроса
   */
  async get(url, params = {}, options = {}) {
    const { useCache = true, cacheTTL = 60000 } = options;
    
    // Формируем ключ кэша на основе URL и параметров
    const cacheKey = `${url}?${JSON.stringify(params)}`;
    
    // Если кэширование включено, пытаемся получить данные из кэша
    if (useCache) {
      return cacheService.remember(
        cacheKey,
        async () => {
          const response = await api.get(url, { params });
          return response.data;
        },
        cacheTTL
      );
    }
    
    // Если кэширование отключено, делаем обычный запрос
    const response = await api.get(url, { params });
    return response.data;
  },
  
  /**
   * POST запрос (без кэширования)
   * @param {string} url - URL эндпоинта
   * @param {Object} data - Данные для отправки
   * @returns {Promise<any>} - Результат запроса
   */
  async post(url, data = {}) {
    // Очищаем кэш, связанный с этим URL
    cacheService.deleteByPattern(url);
    
    const response = await api.post(url, data);
    return response.data;
  },
  
  /**
   * PUT запрос (без кэширования)
   * @param {string} url - URL эндпоинта
   * @param {Object} data - Данные для отправки
   * @returns {Promise<any>} - Результат запроса
   */
  async put(url, data = {}) {
    // Очищаем кэш, связанный с этим URL
    cacheService.deleteByPattern(url);
    
    const response = await api.put(url, data);
    return response.data;
  },
  
  /**
   * DELETE запрос (без кэширования)
   * @param {string} url - URL эндпоинта
   * @returns {Promise<any>} - Результат запроса
   */
  async delete(url) {
    // Очищаем кэш, связанный с этим URL
    cacheService.deleteByPattern(url);
    
    const response = await api.delete(url);
    return response.data;
  },
  
  /**
   * Очистка всего кэша API
   */
  clearCache() {
    cacheService.clear();
  },
  
  /**
   * Очистка кэша по паттерну URL
   * @param {string} urlPattern - Паттерн URL для очистки кэша
   */
  clearCacheByPattern(urlPattern) {
    cacheService.deleteByPattern(urlPattern);
  }
};

// Экспортируем API сервис и исходный экземпляр axios для более сложных случаев
export default { apiService, api }; 