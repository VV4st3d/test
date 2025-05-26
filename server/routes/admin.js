const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Article = require('../models/article');
const Task = require('../models/task');
const User = require('../models/user');
const Comment = require('../models/comment');

/**
 * @route GET /api/admin/articles
 * @desc Получить все статьи для админ-панели
 * @access Private/Admin
 */
router.get('/articles', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    
    // Собираем фильтры
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      if (status === 'published') {
        filter.isPublished = true;
      } else if (status === 'draft') {
        filter.isPublished = false;
      }
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Выполняем запрос к базе данных
    const total = await Article.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    const articles = await Article.find(filter)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('title description category author createdAt updatedAt isPublished translations');
    
    // Преобразуем поле isPublished в поле status для UI
    const formattedArticles = articles.map(article => {
      const { _id, title, description, category, author, createdAt, updatedAt, isPublished, translations } = article;
      return {
        _id,
        title,
        description,
        category,
        author,
        createdAt,
        updatedAt,
        translations,
        status: isPublished ? 'published' : 'draft'
      };
    });
    
    res.json({
      articles: formattedArticles,
      total,
      totalPages,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching articles for admin:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении статей' });
  }
});

/**
 * @route GET /api/admin/tasks
 * @desc Получить все задачи для админ-панели
 * @access Private/Admin
 */
router.get('/tasks', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, search, status, sortBy, sortOrder } = req.query;
    
    // Собираем фильтры
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      if (status === 'published') {
        filter.isPublished = true;
      } else if (status === 'draft') {
        filter.isPublished = false;
      }
    }
    
    // Выполняем запрос к базе данных
    const total = await Task.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    // Настройка сортировки
    let sortOptions = { createdAt: -1 }; // По умолчанию сортировка по дате создания (новые вначале)
    
    if (sortBy) {
      sortOptions = {};
      // Особый случай для сортировки по статусу
      if (sortBy === 'isPublished') {
        sortOptions.isPublished = sortOrder === 'desc' ? -1 : 1;
      } 
      // Особый случай для сортировки по сложности
      else if (sortBy === 'difficulty') {
        // Создаем пользовательский порядок сортировки: hard (3) > medium (2) > easy (1)
        sortOptions.$addFields = {
          difficultyOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$difficulty", "hard"] }, then: 3 },
                { case: { $eq: ["$difficulty", "medium"] }, then: 2 },
                { case: { $eq: ["$difficulty", "easy"] }, then: 1 }
              ],
              default: 0
            }
          }
        };
        // Сортируем по нашему пользовательскому полю
        sortOptions.difficultyOrder = sortOrder === 'desc' ? -1 : 1;
      } else {
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }
    }
    
    // Установка пайплайна агрегации для корректной сортировки
    let tasksQuery;
    if (sortBy === 'difficulty') {
      const aggregationPipeline = [
        { $match: filter },
        { 
          $addFields: {
            difficultyOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$difficulty", "hard"] }, then: 3 },
                  { case: { $eq: ["$difficulty", "medium"] }, then: 2 },
                  { case: { $eq: ["$difficulty", "easy"] }, then: 1 }
                ],
                default: 0
              }
            }
          }
        },
        { $sort: { difficultyOrder: sortOrder === 'desc' ? -1 : 1 } },
        { $skip: (page - 1) * limit },
        { $limit: Number(limit) },
        { 
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            category: 1,
            difficulty: 1,
            isPublished: 1,
            createdAt: 1,
            updatedAt: 1,
            difficultyOrder: 1,
            translations: 1
          }
        }
      ];
      
      tasks = await Task.aggregate(aggregationPipeline);
    } else {
      tasks = await Task.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('title description category difficulty isPublished createdAt updatedAt translations');
    }
    
    // Преобразуем поле isPublished в поле status для UI
    const formattedTasks = tasks.map(task => {
      const { _id, title, description, category, difficulty, createdAt, updatedAt, isPublished, translations } = task;
      return {
        _id,
        title,
        description,
        category,
        difficulty,
        createdAt,
        updatedAt,
        translations,
        status: isPublished ? 'published' : 'draft'
      };
    });
    
    res.json({
      tasks: formattedTasks,
      total,
      totalPages,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching tasks for admin:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении задач' });
  }
});

/**
 * @route GET /api/admin/users
 * @desc Получить всех пользователей для админ-панели
 * @access Private/Admin
 */
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    // Собираем фильтры
    const filter = {};
    
    if (role && ['user', 'admin'].includes(role)) {
      filter.role = role;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Выполняем запрос к базе данных
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('name email role level points createdAt');
    
    res.json({
      users,
      total,
      totalPages,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении пользователей' });
  }
});

/**
 * @route PUT /api/admin/users/:id/role
 * @desc Изменить роль пользователя
 * @access Private/Admin
 */
router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    // Проверяем валидность роли
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Неверная роль. Допустимые значения: user, admin' });
    }
    
    // Запрещаем администратору изменять свою роль
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Невозможно изменить свою роль' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении роли пользователя' });
  }
});

/**
 * @route GET /api/admin/comments
 * @desc Получить все комментарии для модерации
 * @access Private/Admin
 */
router.get('/comments', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Собираем фильтры
    const filter = {};
    
    if (status && ['active', 'moderation', 'deleted'].includes(status)) {
      filter.status = status;
    }
    
    if (search) {
      filter.content = { $regex: search, $options: 'i' };
    }
    
    // Выполняем запрос к базе данных
    const total = await Comment.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    const comments = await Comment.find(filter)
      .populate('author', 'name')
      .populate('article', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    res.json({
      comments,
      total,
      totalPages,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching comments for admin:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении комментариев' });
  }
});

/**
 * @route PUT /api/admin/comments/:id/status
 * @desc Изменить статус комментария (модерация)
 * @access Private/Admin
 */
router.put('/comments/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Проверяем валидность статуса
    if (!['active', 'moderation', 'deleted'].includes(status)) {
      return res.status(400).json({ message: 'Неверный статус. Допустимые значения: active, moderation, deleted' });
    }
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }
    
    comment.status = status;
    await comment.save();
    
    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении статуса комментария' });
  }
});

/**
 * @route PUT /api/admin/articles/:id/publish
 * @desc Опубликовать статью
 * @access Private/Admin
 */
router.put('/articles/:id/publish', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }
    
    article.isPublished = true;
    await article.save();
    
    res.json({
      success: true,
      article: {
        _id: article._id,
        title: article.title,
        isPublished: article.isPublished
      }
    });
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({ message: 'Ошибка сервера при публикации статьи' });
  }
});

/**
 * @route PUT /api/admin/tasks/:id/publish
 * @desc Опубликовать задачу
 * @access Private/Admin
 */
router.put('/tasks/:id/publish', protect, authorize('admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }
    
    task.isPublished = true;
    await task.save();
    
    res.json({
      success: true,
      task: {
        _id: task._id,
        title: task.title,
        isPublished: task.isPublished
      }
    });
  } catch (error) {
    console.error('Error publishing task:', error);
    res.status(500).json({ message: 'Ошибка сервера при публикации задачи' });
  }
});

/**
 * @route PUT /api/admin/tasks/:id/toggle-publish
 * @desc Переключить статус публикации задачи
 * @access Private/Admin
 */
router.put('/tasks/:id/toggle-publish', protect, authorize('admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }
    
    task.isPublished = !task.isPublished;
    await task.save();
    
    res.json({
      success: true,
      task: {
        _id: task._id,
        title: task.title,
        isPublished: task.isPublished,
        status: task.isPublished ? 'published' : 'draft'
      }
    });
  } catch (error) {
    console.error('Error toggling task publication status:', error);
    res.status(500).json({ message: 'Ошибка сервера при изменении статуса публикации задачи' });
  }
});

module.exports = router; 