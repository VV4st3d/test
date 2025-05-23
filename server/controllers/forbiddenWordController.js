const ForbiddenWord = require('../models/forbiddenWord');
const { resetProfanityCache } = require('../utils/profanityFilter');

/**
 * Получение всех запрещенных слов с пагинацией и фильтрацией
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getForbiddenWords = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const query = {};

    // Фильтр по категории
    if (category) {
      query.category = category;
    }

    // Поиск по слову
    if (search) {
      query.word = { $regex: search, $options: 'i' };
    }

    // Общее количество запрещенных слов
    const totalWords = await ForbiddenWord.countDocuments(query);
    const totalPages = Math.ceil(totalWords / limit);

    // Получение запрещенных слов с пагинацией
    const forbiddenWords = await ForbiddenWord.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      forbiddenWords,
      currentPage: parseInt(page),
      totalPages,
      totalWords
    });
  } catch (error) {
    console.error('Error fetching forbidden words:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Добавление нового запрещенного слова
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.addForbiddenWord = async (req, res) => {
  try {
    const { word, englishWord = '', category, isRegex = false, description = '' } = req.body;

    if (!word || word.trim().length === 0) {
      return res.status(400).json({ message: 'Слово не может быть пустым' });
    }

    // Проверка на уникальность слова
    const existingWord = await ForbiddenWord.findOne({ word: word.trim() });
    if (existingWord) {
      return res.status(400).json({ message: 'Такое слово уже добавлено в список запрещенных' });
    }

    // Если это регулярное выражение, проверяем его валидность
    if (isRegex) {
      try {
        new RegExp(word);
      } catch (e) {
        return res.status(400).json({ message: 'Недопустимое регулярное выражение' });
      }
    }

    // Создание нового запрещенного слова
    const forbiddenWord = await ForbiddenWord.create({
      word: word.trim(),
      englishWord: englishWord.trim(),
      category,
      isRegex,
      description,
      addedBy: req.user.id
    });

    // Сбрасываем кеш запрещенных слов
    resetProfanityCache();

    res.status(201).json({
      message: 'Слово успешно добавлено в список запрещенных',
      forbiddenWord
    });
  } catch (error) {
    console.error('Error adding forbidden word:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Обновление запрещенного слова
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.updateForbiddenWord = async (req, res) => {
  try {
    const { category, englishWord, isRegex, description } = req.body;
    const wordId = req.params.id;

    // Найти слово по ID
    const forbiddenWord = await ForbiddenWord.findById(wordId);
    if (!forbiddenWord) {
      return res.status(404).json({ message: 'Запрещенное слово не найдено' });
    }

    // Обновление полей
    if (category) forbiddenWord.category = category;
    if (englishWord !== undefined) forbiddenWord.englishWord = englishWord.trim();
    if (isRegex !== undefined) forbiddenWord.isRegex = isRegex;
    if (description !== undefined) forbiddenWord.description = description;

    // Сохранение изменений
    await forbiddenWord.save();
    
    // Сбрасываем кеш запрещенных слов
    resetProfanityCache();

    res.json({
      message: 'Запрещенное слово успешно обновлено',
      forbiddenWord
    });
  } catch (error) {
    console.error('Error updating forbidden word:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Удаление запрещенного слова
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.deleteForbiddenWord = async (req, res) => {
  try {
    const wordId = req.params.id;

    // Найти и удалить слово
    const forbiddenWord = await ForbiddenWord.findByIdAndDelete(wordId);
    if (!forbiddenWord) {
      return res.status(404).json({ message: 'Запрещенное слово не найдено' });
    }
    
    // Сбрасываем кеш запрещенных слов
    resetProfanityCache();

    res.json({
      message: 'Запрещенное слово успешно удалено',
      forbiddenWord
    });
  } catch (error) {
    console.error('Error deleting forbidden word:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Получение списка всех запрещенных слов (для внутреннего использования)
 * @returns {Promise<Array>} Массив запрещенных слов
 */
exports.getAllForbiddenWordsInternal = async () => {
  try {
    const forbiddenWords = await ForbiddenWord.find({});
    return forbiddenWords.map(word => ({
      word: word.word,
      isRegex: word.isRegex,
      category: word.category
    }));
  } catch (error) {
    console.error('Error getting all forbidden words:', error);
    return [];
  }
};

/**
 * Получение списка запрещенных слов для клиентской проверки
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getForbiddenWordsForClient = async (req, res) => {
  try {
    const forbiddenWords = await ForbiddenWord.find({}).select('word englishWord isRegex category');
    res.json({
      forbiddenWords: forbiddenWords.map(word => ({
        word: word.word,
        englishWord: word.englishWord || '',
        isRegex: word.isRegex,
        category: word.category
      }))
    });
  } catch (error) {
    console.error('Error fetching forbidden words for client:', error);
    res.status(500).json({ message: 'Server error' });
  }
};