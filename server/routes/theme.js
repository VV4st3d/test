const express = require('express');
const router = express.Router();
const { protect, optional } = require('../middleware/auth');

/**
 * Временная реализация контроллера темы
 */
const themeController = {
  getTheme: (req, res) => {
    // Получаем тему из пользователя, если он авторизован
    const theme = req.user ? req.user.theme || 'light' : 'light';
    const isSystemDefault = req.user ? req.user.isSystemTheme || false : true;
    
    res.json({
      success: true,
      theme,
      isSystemDefault
    });
  },
  
  updateTheme: async (req, res) => {
    try {
      const { theme, isSystemDefault } = req.body;
      
      // Проверяем, что тема указана правильно
      if (theme && !['light', 'dark'].includes(theme)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Неверное значение темы. Допустимые значения: light, dark' 
        });
      }
      
      // Обновляем тему в профиле пользователя, если он авторизован
      if (req.user) {
        const User = require('../models/user');
        await User.findByIdAndUpdate(req.user._id, { 
          theme, 
          isSystemTheme: isSystemDefault || false 
        });
      }
      
      res.json({
        success: true,
        theme,
        isSystemDefault: isSystemDefault || false
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Ошибка при обновлении темы' 
      });
    }
  }
};

/**
 * @route GET /api/theme
 * @desc Получить текущую тему пользователя
 * @access Public (для неавторизованных) / Private (для авторизованных)
 */
router.get('/', optional, themeController.getTheme);

/**
 * @route PUT /api/theme
 * @desc Обновить тему пользователя
 * @access Private
 */
router.put('/', protect, themeController.updateTheme);

module.exports = router; 