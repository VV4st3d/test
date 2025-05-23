const User = require('../models/user');

/**
 * Получение текущей темы пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
const getTheme = async (req, res) => {
  try {
    // Если нет аутентифицированного пользователя, возвращаем дефолтную тему
    if (!req.user) {
      return res.json({ 
        success: true,
        theme: 'light',
        colorScheme: 'blue'
      });
    }

    // Получаем пользователя из базы данных
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Пользователь не найден' 
      });
    }

    // Возвращаем тему и цветовую схему пользователя или дефолтные, если не установлены
    res.json({ 
      success: true,
      theme: user.theme || 'light',
      colorScheme: user.colorScheme || 'blue'
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера при получении настроек темы' 
    });
  }
};

/**
 * Обновление темы пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
const updateTheme = async (req, res) => {
  try {
    // Проверка наличия аутентифицированного пользователя
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Необходима авторизация' 
      });
    }

    const { theme, colorScheme } = req.body;
    const updateData = {};
    
    // Проверка валидности темы, если она указана
    if (theme !== undefined) {
      if (!['light', 'dark'].includes(theme)) {
        return res.status(400).json({ 
          success: false,
          message: 'Неверное значение темы. Допустимые значения: light, dark' 
        });
      }
      updateData.theme = theme;
    }
    
    // Проверка валидности цветовой схемы, если она указана
    if (colorScheme !== undefined) {
      const validColorSchemes = ['blue', 'green', 'purple', 'red', 'orange'];
      if (!validColorSchemes.includes(colorScheme)) {
        return res.status(400).json({ 
          success: false,
          message: `Неверное значение цветовой схемы. Допустимые значения: ${validColorSchemes.join(', ')}` 
        });
      }
      updateData.colorScheme = colorScheme;
    }
    
    // Если нет данных для обновления, возвращаем ошибку
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Не указаны данные для обновления' 
      });
    }

    // Обновляем настройки пользователя
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Пользователь не найден' 
      });
    }

    res.json({ 
      success: true,
      theme: user.theme || 'light',
      colorScheme: user.colorScheme || 'blue'
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера при обновлении настроек темы' 
    });
  }
};

module.exports = {
  getTheme,
  updateTheme
}; 