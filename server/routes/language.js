const express = require('express');
const router = express.Router();
const { getTranslations, initializeTranslations } = require('../controllers/language');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/user');

/**
 * @route GET /api/language/:lang
 * @desc Получить все переводы для указанного языка
 * @access Public
 */
router.get('/:lang', getTranslations);

/**
 * @route GET /api/language
 * @desc Получить настройки языка пользователя
 * @access Public с опциональной аутентификацией
 */
router.get('/', async (req, res) => {
  try {
    // Получаем язык из пользователя, если он авторизован
    const language = req.user ? req.user.language || 'ru' : 'ru';
    
    res.json({
      success: true,
      language
    });
  } catch (error) {
    console.error('Error fetching user language:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении языка' 
    });
  }
});

/**
 * @route POST /api/language/initialize
 * @desc Инициализация базовых переводов
 * @access Public
 */
router.post('/initialize', async (req, res) => {
  try {
    await initializeTranslations();
    res.json({
      success: true,
      message: 'Переводы успешно инициализированы'
    });
  } catch (error) {
    console.error('Error initializing translations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при инициализации переводов' 
    });
  }
});

/**
 * @route PUT /api/language
 * @desc Обновить язык пользователя
 * @access Private
 */
router.put('/', protect, async (req, res) => {
  try {
    const { language } = req.body;
    
    // Проверка допустимости языка
    if (!['ru', 'en'].includes(language)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Неверное значение языка. Допустимые значения: ru, en' 
      });
    }
    
    // Обновляем язык в профиле пользователя
    await User.findByIdAndUpdate(req.user._id, { language });
    
    res.json({
      success: true,
      language
    });
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при обновлении языка' 
    });
  }
});

/**
 * @route POST /api/language/translations
 * @desc Добавить или обновить перевод
 * @access Admin only
 */
router.post('/translations', protect, authorize('admin'), async (req, res) => {
  try {
    const { key, language, value } = req.body;

    // Проверка обязательных полей
    if (!key || !language || !value) {
      return res.status(400).json({ 
        success: false, 
        message: 'Требуется указать key, language и value' 
      });
    }

    // Проверка допустимости языка
    if (!['ru', 'en'].includes(language)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Неверное значение языка. Допустимые значения: ru, en' 
      });
    }

    // Используем универсальный подход к хранению переводов
    const Language = require('../models/language');
    const translation = await Language.findOneAndUpdate(
      { code: language },
      { $set: { [`translations.${key}`]: value } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      translation
    });
  } catch (error) {
    console.error('Error updating translation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при обновлении перевода' 
    });
  }
});

module.exports = router; 