const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route GET /api/users
 * @desc Получить список пользователей (только для админов)
 * @access Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      users,
      currentPage: page,
      totalPages,
      totalUsers: total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении списка пользователей' 
    });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Получить пользователя по ID
 * @access Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    // Проверяем, запрашивает ли пользователь свой профиль или админ запрашивает другого пользователя
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Доступ запрещен' 
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении данных пользователя' 
    });
  }
});

/**
 * @route PUT /api/users/:id/role
 * @desc Обновить роль пользователя (только для админов)
 * @access Admin
 */
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, trustLevel } = req.body;

    // Проверка валидности роли
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Неверное значение роли. Допустимые значения: user, moderator, admin' 
      });
    }

    // Проверка валидности уровня доверия
    if (trustLevel && (trustLevel < 1 || trustLevel > 5)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Уровень доверия должен быть от 1 до 5' 
      });
    }

    // Не позволяем админу изменить свою роль
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Вы не можете изменить свою роль' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        role,
        ...(trustLevel && { trustLevel })
      },
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
      user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при обновлении роли пользователя' 
    });
  }
});

module.exports = router; 