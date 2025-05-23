const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Генерация JWT токена
 * @param {Object} user - Объект пользователя
 * @returns {string} - JWT токен
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }  // Токен действителен 7 дней
  );
};

/**
 * Регистрация нового пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Проверка обязательных полей
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Пожалуйста, заполните все обязательные поля' 
      });
    }

    // Проверка существования пользователя
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Создание нового пользователя
    const user = await User.create({
      name,
      email,
      password,  // Пароль будет хэширован в pre-save hook модели
      role: 'user',
      trustLevel: 1  // Базовый уровень доверия
    });

    // Генерация токена
    const token = generateToken(user);

    // Формирование ответа без конфиденциальных данных
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustLevel: user.trustLevel,
        points: user.points || 0,
        level: user.level || 1
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    
    // Обработка ошибок валидации MongoDB
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: 'Ошибка сервера при регистрации пользователя' 
    });
  }
};

/**
 * Авторизация пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка обязательных полей
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Пожалуйста, введите email и пароль' 
      });
    }

    // Поиск пользователя и получение только необходимых полей
    const user = await User.findOne({ email }).select('+password');
    
    // Проверка существования пользователя и пароля
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        message: 'Неверный email или пароль' 
      });
    }

    // Генерация токена
    const token = generateToken(user);

    // Удаление пароля из объекта пользователя
    user.password = undefined;

    // Формирование ответа
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustLevel: user.trustLevel,
        points: user.points || 0,
        level: user.level || 1,
        completedTasks: user.completedTasks?.length || 0,
        favorites: user.favorites?.length || 0
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при авторизации' 
    });
  }
};

/**
 * Получение информации о текущем пользователе
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getMe = async (req, res) => {
  try {
    // Пользователь уже доступен из middleware protect
    const user = req.user;
    
    // Формирование ответа
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustLevel: user.trustLevel,
        points: user.points || 0,
        level: user.level || 1,
        completedTasks: user.completedTasks?.length || 0,
        favorites: user.favorites?.length || 0,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при получении данных пользователя' 
    });
  }
};

/**
 * Обновление профиля пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    // Проверка, не занят ли email другим пользователем
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Пользователь с таким email уже существует' 
        });
      }
    }

    // Обновление профиля
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(name && { name }),
        ...(email && { email })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    
    // Обработка ошибок валидации
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: 'Ошибка сервера при обновлении профиля' 
    });
  }
};

/**
 * Обновление пароля пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Проверка наличия всех необходимых полей
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Пожалуйста, предоставьте текущий и новый пароль' 
      });
    }

    // Получение пользователя с паролем
    const user = await User.findById(userId).select('+password');
    
    // Проверка текущего пароля
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Неверный текущий пароль' });
    }

    // Обновление пароля
    user.password = newPassword;
    await user.save();

    // Генерация нового токена
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Пароль успешно обновлен',
      token
    });
  } catch (error) {
    console.error('Error in updatePassword:', error);
    
    // Обработка ошибок валидации
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: 'Ошибка сервера при обновлении пароля' 
    });
  }
}; 