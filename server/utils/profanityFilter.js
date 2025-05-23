/**
 * Набор нецензурных слов для фильтрации 
 * Здесь представлен абстрактный набор, без реальных нецензурных слов
 * В реальном приложении лучше использовать специализированные библиотеки или API
 */
const profanityList = [
  
  // Слова, часто используемые в спаме
  'casino', 'gambling', 'betting', 'lottery', 'prize', 'winner',
  'free money', 'earn money', 'make money', 'fast cash', 'quick cash',
  'easy money', 'get rich', 'rich quick', 'instant cash', 'cash bonus',
  
  // Запрещенные темы
  'drugs', 'illegal', 'hack', 'crack', 'pirate', 'warez',
  'phishing', 'scam', 'fraud', 'malware', 'ransomware', 'spyware',
  
  // Дополнительные спам-индикаторы
  'click here', 'limited time', 'act now', 'exclusive offer', 'best deal',
  'discount code', 'special promotion', 'guaranteed', '100% free',
  'no risk', 'no obligation', 'satisfaction guaranteed', 'no credit check'
];

// Импорт модели запрещенных слов
const ForbiddenWord = require('../models/forbiddenWord');

// Кэширование запрещенных слов для оптимизации
let cachedProfanityList = null;
let lastCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 минута в миллисекундах

/**
 * Получение актуального списка запрещенных слов из базы данных
 * с использованием кэширования
 * 
 * @returns {Promise<Array>} - Массив объектов запрещенных слов
 */
const getProfanityList = async () => {
  const now = Date.now();
  
  // Используем новый кэш при старте или если прошло CACHE_TTL времени
  if (!cachedProfanityList || now - lastCacheTime >= CACHE_TTL) {
    try {
      console.log('Загрузка запрещенных слов из базы данных...');
      
      // Получаем список запрещенных слов из базы данных
      const dbWords = await ForbiddenWord.find({}).lean();
      
      console.log(`Загружено ${dbWords.length} запрещенных слов из БД`);
      
      // Вывод всех слов из БД для отладки
      console.log('Слова из БД:');
      dbWords.forEach((word, index) => {
        console.log(`${index + 1}. "${word.word}" (${word.category}, isRegex: ${word.isRegex})`);
      });
      
      // Формируем список запрещенных слов
      const dbWordsList = dbWords.map(word => ({
        word: word.word,
        isRegex: word.isRegex,
        category: word.category
      }));
      
      // Представляем встроенные слова как объекты для единообразия
      const formattedProfanityList = profanityList.map(word => ({
        word: word,
        isRegex: false,
        category: 'other'
      }));
      
      // Обновляем кэш (комбинируем встроенный список и слова из БД)
      cachedProfanityList = [...formattedProfanityList, ...dbWordsList];
      lastCacheTime = now;
      
      return cachedProfanityList;
    } catch (error) {
      console.error('Error loading forbidden words from database:', error);
      
      // Если не удалось загрузить из базы, возвращаем встроенный список в формате объектов
      return profanityList.map(word => ({
        word: word,
        isRegex: false,
        category: 'other'
      }));
    }
  }
  
  return cachedProfanityList;
};

/**
 * Функция для замены нецензурных слов на звездочки
 * 
 * @param {string} text - Исходный текст
 * @returns {Promise<string>} - Текст с замененными нецензурными словами
 */
const profanityFilter = async (text) => {
  if (!text) return '';
  
  // Получаем актуальный список запрещенных слов
  const profanityListData = await getProfanityList();
  
  let filteredText = text;
  
  // Заменяем каждое нецензурное слово звездочками
  for (const wordObj of profanityListData) {
    try {
      // Нормализуем слово для поиска (приводим к нижнему регистру)
      const wordLower = wordObj.word.toLowerCase();
      
      if (wordObj.isRegex) {
        // Для регулярных выражений
        try {
          // Исправляем экранирование обратных слешей если необходимо
          let regexPattern = wordObj.word;
          // Заменяем одинарные слеши на двойные если они не являются экранированными
          if (regexPattern.includes('\\b') || regexPattern.includes('\\d') || 
              regexPattern.includes('\\w') || regexPattern.includes('\\s')) {
            // Регулярное выражение уже содержит корректные экранированные последовательности
          } else {
            regexPattern = regexPattern.replace(/\\/g, '\\\\');
          }
          
          const regex = new RegExp(regexPattern, 'gi');
          filteredText = filteredText.replace(regex, match => '*'.repeat(match.length));
        } catch (e) {
          console.error(`Ошибка в регулярном выражении: ${wordObj.word}`, e);
        }
      } else {
        // Проверяем отдельное слово или фразу
        if (wordObj.word.includes(' ')) {
          // Для фраз используем точное совпадение без учета регистра
          const phrasePattern = new RegExp(escapeRegExp(wordObj.word), 'gi');
          filteredText = filteredText.replace(phrasePattern, match => '*'.repeat(match.length));
        } else {
          // Для одиночных слов используем границы слов
          const wordPattern = new RegExp(`\\b${escapeRegExp(wordLower)}\\b`, 'gi');
          filteredText = filteredText.replace(wordPattern, match => '*'.repeat(match.length));
          
          // Также заменяем слово если оно окружено знаками препинания
          // Разбиваем текст на слова
          let parts = filteredText.split(/\s+/);
          parts = parts.map(part => {
            // Если слово совпадает с запрещенным (без учета знаков препинания)
            const cleanPart = part.toLowerCase().replace(/[.,!?;:"'()]/g, '');
            if (cleanPart === wordLower) {
              return part.replace(new RegExp(escapeRegExp(cleanPart), 'gi'), 
                                 match => '*'.repeat(match.length));
            }
            return part;
          });
          filteredText = parts.join(' ');
        }
      }
    } catch (e) {
      console.error(`Ошибка при фильтрации запрещенного слова: ${wordObj.word}`, e);
    }
  }
  
  return filteredText;
};

/**
 * Экранирование специальных символов в строке для использования в регулярном выражении
 * @param {string} string - Строка для экранирования
 * @returns {string} - Экранированная строка
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Функция для проверки, содержит ли текст нецензурные слова
 * 
 * @param {string} text - Текст для проверки
 * @returns {Promise<boolean>} - true, если текст содержит нецензурные слова
 */
const containsProfanity = async (text) => {
  if (!text) return false;
  
  // Получаем актуальный список запрещенных слов
  const profanityListData = await getProfanityList();
  
  // Проверяем, содержит ли текст какое-либо нецензурное слово
  for (const wordObj of profanityListData) {
    try {
      if (wordObj.isRegex) {
        const regex = new RegExp(wordObj.word, 'i');
        if (regex.test(text)) return true;
      } else {
        const regex = new RegExp(`\\b${escapeRegExp(wordObj.word)}\\b`, 'i');
        if (regex.test(text)) return true;
      }
    } catch (e) {
      console.error(`Error checking forbidden word: ${wordObj.word}`, e);
    }
  }
  
  return false;
};

/**
 * Проверка текста на наличие запрещенных слов
 * @param {string} text - Текст для проверки
 * @returns {Promise<string[]>} - Список найденных запрещенных слов
 */
const findProfanity = async (text) => {
  if (!text) return [];
  
  try {
    // Получаем список запрещенных слов из базы данных или кеша
    const forbiddenWords = await getProfanityList();
    const foundWords = [];
    
    // Проверка каждого запрещенного слова
    for (const wordObj of forbiddenWords) {
      try {
        if (wordObj.isRegex) {
          // Для регулярных выражений
          try {
            const regex = new RegExp(wordObj.word, 'i');
            if (regex.test(text)) {
              foundWords.push(wordObj.word);
            }
          } catch (error) {
            console.error(`Invalid regex pattern: ${wordObj.word}`, error);
          }
        } else {
          // Для обычных слов - проверка с учетом границ слова
          const regex = new RegExp(`\\b${escapeRegExp(wordObj.word)}\\b`, 'i');
          if (regex.test(text)) {
            foundWords.push(wordObj.word);
          }
          
          // Если есть английский вариант, проверяем и его
          if (wordObj.englishWord && wordObj.englishWord.trim()) {
            const engRegex = new RegExp(`\\b${escapeRegExp(wordObj.englishWord)}\\b`, 'i');
            if (engRegex.test(text) && !foundWords.includes(wordObj.word)) {
              foundWords.push(wordObj.word); // Используем основное слово в списке найденных
            }
          }
        }
      } catch (e) {
        console.error(`Error checking word: ${wordObj.word}`, e);
      }
    }
    
    return foundWords;
  } catch (error) {
    console.error('Error finding profanity:', error);
    return [];
  }
};

// Сброс кэша запрещенных слов
const resetProfanityCache = () => {
  cachedProfanityList = null;
  lastCacheTime = 0;
  console.log('Profanity cache has been reset');
};

module.exports = {
  profanityFilter,
  containsProfanity,
  findProfanity,
  resetProfanityCache
};