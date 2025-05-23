const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Middleware для обязательной проверки аутентификации
 */
exports.protect = async (req, res, next) => {
  // Получаем токен из заголовка Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  try {
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Получаем информацию о пользователе из базы данных
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Добавляем пользователя в запрос
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен истек, пожалуйста, войдите снова' });
    }
    return res.status(401).json({ message: 'Недействительный токен авторизации' });
  }
};

/**
 * Middleware для опциональной проверки аутентификации
 * Не возвращает ошибку, если токен не предоставлен или недействителен
 */
exports.optional = async (req, res, next) => {
  // Получаем токен из заголовка Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Получаем информацию о пользователе из базы данных
    const user = await User.findById(decoded.id).select('-password');
    
    if (user) {
      // Добавляем пользователя в запрос
      req.user = user;
    }
  } catch (error) {
    // Игнорируем ошибку, просто не добавляем пользователя в запрос
  }

  next();
};

/**
 * Middleware для проверки роли пользователя
 * @param {...string} roles - Массив разрешенных ролей
 * @returns {Function} - Middleware функция
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Проверяем, что пользователь авторизован
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    // Проверяем, что роль пользователя входит в список разрешенных
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Доступ запрещен. Требуется роль: ${roles.join(' или ')}`
      });
    }

    next();
  };
};

/**
 * Middleware для проверки уровня доверия пользователя
 * @param {number} minLevel - Минимальный необходимый уровень доверия
 * @returns {Function} - Middleware функция
 */
exports.checkTrustLevel = (minLevel) => {
  return (req, res, next) => {
    // Проверяем, что пользователь авторизован
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    // Админам разрешено всё
    if (req.user.role === 'admin') {
      return next();
    }

    // Проверяем уровень доверия
    if (!req.user.trustLevel || req.user.trustLevel < minLevel) {
      return res.status(403).json({ 
        message: `Доступ запрещен. Требуется уровень доверия не ниже ${minLevel}`
      });
    }

    next();
  };
}; 