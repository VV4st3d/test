const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  getTask, 
  checkSolution, 
  createTask, 
  updateTask, 
  deleteTask,
  testCheckSolution,
  getFullTask,
  patchTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const Task = require('../models/task');
const NodeCache = require('node-cache');

// Import the cache instance
const { cache } = require('../controllers/taskController');

/**
 * @route GET /api/tasks/recommended
 * @desc Получить рекомендуемые задачи
 * @access Public
 */
router.get('/recommended', async (req, res) => {
  try {
    // Получаем язык из запроса или используем русский по умолчанию
    const lang = req.query.lang || 'ru';
    
    // Получаем 6 популярных задач в качестве рекомендуемых
    // Сначала пробуем сортировать по completionCount, но учитываем, что поле может ещё не использоваться
    const tasks = await Task.find({ isPublished: true })
      .sort({ createdAt: -1 })  // Сортируем просто по дате создания как запасной вариант
      .limit(6)
      .select('title description category difficulty translations')
      .lean();
    
    // Преобразуем задачи для поддержки выбранного языка
    const transformedTasks = tasks.map(task => {
      let title, description;
      
      // Обработка формата с переводами
      if (task.translations) {
        const translation = task.translations[lang] || task.translations.ru || {};
        
        title = translation.title || task.title;
        description = translation.description || task.description;
      } else {
        title = task.title;
        description = task.description;
      }
      
      // Возвращаем трансформированный объект без поля translations
      const { translations, ...rest } = task;
      
      return {
        ...rest,
        title,
        description
      };
    });
      
    res.json({ tasks: transformedTasks });
  } catch (error) {
    console.error('Error fetching recommended tasks:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * @route DELETE /api/tasks/clear-cache
 * @desc Очистить кэш задач (для отладки)
 * @access Public
 */
router.delete('/clear-cache', (req, res) => {
  try {
    // Очищаем кэш NodeCache для задач
    if (global.taskCache) {
      global.taskCache.flushAll();
      console.log('Task cache cleared');
    }
    
    // Очищаем любые кэши в памяти
    if (require('../controllers/taskController').clearTasksCache) {
      require('../controllers/taskController').clearTasksCache();
      console.log('Tasks cache cleared via controller');
    }
    
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ message: 'Ошибка при очистке кэша' });
  }
});

// Маршруты для задач
router.get('/', getTasks);
router.get('/:id', getTask);
router.get('/:id/full', protect, authorize('admin'), getFullTask);
router.post('/:id/check', protect, checkSolution);
router.post('/:id/test-check', testCheckSolution);
router.post('/', protect, authorize('admin'), (req, res, next) => {
  // Устанавливаем категорию JavaScript автоматически
  req.body.category = 'JavaScript';
  next();
}, createTask);
router.put('/:id', protect, authorize('admin'), (req, res, next) => {
  // Устанавливаем категорию JavaScript автоматически
  req.body.category = 'JavaScript';
  next();
}, updateTask);
// Добавляем PATCH метод для обновления отдельных полей (например, только статуса публикации)
router.patch('/:id', protect, authorize('admin'), patchTask);
router.delete('/:id', protect, authorize('admin'), deleteTask);

module.exports = router; 