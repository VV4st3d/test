/**
 * Сервис для кэширования API запросов на клиенте
 */

class CacheService {
  constructor() {
    this.cache = {};
    this.defaultTTL = 60 * 1000; // 1 минута в миллисекундах
  }

  /**
   * Получение данных из кэша
   * @param {string} key - Ключ кэша
   * @returns {any|null} - Данные из кэша или null, если их нет или они устарели
   */
  get(key) {
    const cachedData = this.cache[key];
    
    // Данных нет в кэше
    if (!cachedData) {
      return null;
    }
    
    // Проверяем не истек ли срок жизни данных
    if (Date.now() > cachedData.expiresAt) {
      // Удаляем устаревшие данные
      delete this.cache[key];
      return null;
    }
    
    return cachedData.data;
  }

  /**
   * Сохранение данных в кэше
   * @param {string} key - Ключ кэша
   * @param {any} data - Данные для кэширования
   * @param {number} ttl - Время жизни кэша в миллисекундах (опционально)
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache[key] = {
      data,
      expiresAt: Date.now() + ttl
    };
  }

  /**
   * Удаление данных из кэша
   * @param {string} key - Ключ кэша
   */
  delete(key) {
    delete this.cache[key];
  }

  /**
   * Удаление данных из кэша по паттерну (строка, которую содержит ключ)
   * @param {string} pattern - Паттерн для поиска в ключах кэша
   */
  deleteByPattern(pattern) {
    for (const key in this.cache) {
      if (key.includes(pattern)) {
        delete this.cache[key];
      }
    }
  }

  /**
   * Полная очистка кэша
   */
  clear() {
    this.cache = {};
  }

  /**
   * Обертка для кэширования асинхронных функций
   * @param {string} key - Ключ кэша
   * @param {Function} asyncFn - Асинхронная функция, результат которой нужно кэшировать
   * @param {number} ttl - Время жизни кэша в миллисекундах (опционально)
   * @returns {Promise<any>} - Результат выполнения функции (из кэша или свежий)
   */
  async remember(key, asyncFn, ttl = this.defaultTTL) {
    // Проверяем наличие данных в кэше
    const cachedData = this.get(key);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // Если данных нет или они устарели, выполняем функцию
    const result = await asyncFn();
    
    // Сохраняем результат в кэше
    this.set(key, result, ttl);
    
    return result;
  }
}

// Создаем и экспортируем экземпляр сервиса для использования во всем приложении
export const cacheService = new CacheService();

// Экспортируем класс для использования в тестах
export default CacheService; 