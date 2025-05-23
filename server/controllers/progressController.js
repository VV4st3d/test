const User = require('../models/user');

/**
 * Получение прогресса пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не аутентифицирован' });
    }

    const user = await User.findById(userId)
      .populate({
        path: 'completedTasks.taskId',
        select: 'difficulty'
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const basePoints = 100;
    const currentLevel = user.level || 1;
    const nextLevelThreshold = 100 * Math.pow(currentLevel, 2);
    const prevLevelThreshold = currentLevel > 1
      ? 100 * Math.pow(currentLevel - 1, 2)
      : 0;

    const completedTasks = user.completedTasks || [];
    const tasksByDifficulty = { easy: 0, medium: 0, hard: 0 };
    let totalPoints = 0;

    completedTasks.forEach(task => {
      if (task.taskId && task.taskId.difficulty) {
        tasksByDifficulty[task.taskId.difficulty]++;
        totalPoints += task.points || 0;
      }
    });

    const progress = {
      points: user.points || 0,
      level: currentLevel,
      tasksByDifficulty,
      totalTasks: completedTasks.length,
      totalArticles: user.readArticles?.length || 0, // Добавлено
      nextLevelThreshold,
      prevLevelThreshold,
      averagePoints: completedTasks.length > 0
        ? Math.round(totalPoints / completedTasks.length)
        : 0
    };

    res.json({ success: true, ...progress });
  } catch (error) {
    console.error('Ошибка в getProgress:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ success: false, message: 'Ошибка при получении прогресса' });
  }
};

/**
 * Получение списка выполненных заданий пользователя
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getCompletedTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не аутентифицирован' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const lang = req.query.lang || 'ru';

    const user = await User.findById(userId)
      .populate({
        path: 'completedTasks.taskId',
        select: 'translations difficulty'
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const completedTasks = user.completedTasks || [];
    
    // Если запрошен большой лимит (например, 1000), возвращаем все задачи без пагинации
    const allTasks = limit >= 1000;
    
    const paginatedTasks = completedTasks
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(allTasks ? 0 : skip, allTasks ? completedTasks.length : skip + limit)
      .map(task => {
        if (!task.taskId || !task.taskId.translations || Object.keys(task.taskId.translations).length === 0) {
          return {
            id: task.taskId?._id || 'unknown',
            title: 'Задача недоступна',
            description: '',
            difficulty: 'easy',
            completedAt: task.completedAt,
            points: task.points
          };
        }

        const translation = task.taskId.translations[lang] ||
                          task.taskId.translations.ru ||
                          task.taskId.translations.en ||
                          { title: 'Название недоступно', description: '' };

        return {
          id: task.taskId._id,
          title: translation.title,
          description: translation.description,
          difficulty: task.taskId.difficulty,
          completedAt: task.completedAt,
          points: task.points
        };
      });

    res.json({
      success: true,
      tasks: paginatedTasks,
      total: completedTasks.length,
      page,
      limit,
      totalPages: Math.ceil(completedTasks.length / limit)
    });
  } catch (error) {
    console.error('Ошибка в getCompletedTasks:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ success: false, message: 'Ошибка при получении выполненных заданий' });
  }
};

/**
 * Получение списка лидеров по прогрессу
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не аутентифицирован' });
    }

    const period = req.query.period || 'all';
    const limit = parseInt(req.query.limit) || 10;

    let dateFilter = {};
    if (period === 'month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateFilter = { updatedAt: { $gte: lastMonth } };
    } else if (period === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateFilter = { updatedAt: { $gte: lastWeek } };
    }

    const leaderboard = await User.find(dateFilter)
      .sort({ points: -1, level: -1 })
      .limit(limit)
      .select('name points level completedTasks');

    const leaderboardData = leaderboard.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name,
      points: user.points || 0,
      level: user.level || 1,
      completedTasks: user.completedTasks?.length || 0
    }));

    let userRank = null;
    if (userId) {
      const allUsers = await User.find(dateFilter)
        .sort({ points: -1, level: -1 })
        .select('_id');
      const userIndex = allUsers.findIndex(user => user._id.toString() === userId);
      if (userIndex !== -1) {
        userRank = userIndex + 1;
      }
    }

    res.json({
      success: true,
      leaderboard: leaderboardData,
      yourRank: userRank,
      period
    });
  } catch (error) {
    console.error('Ошибка в getLeaderboard:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ success: false, message: 'Ошибка при получении таблицы лидеров' });
  }
};

/**
 * Получение активности пользователя за последние 30 дней
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getActivity = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не аутентифицирован' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    // Создаем массивы для хранения активности за последние 30 дней
    const taskActivity = Array(30).fill(0);
    const articleActivity = Array(30).fill(0);

    // Получаем текущую дату и дату 30 дней назад
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);

    // Обрабатываем выполненные задачи
    if (user.completedTasks && user.completedTasks.length > 0) {
      user.completedTasks.forEach(task => {
        if (task.completedAt && task.completedAt >= thirtyDaysAgo) {
          const dayIndex = 29 - Math.floor((today - task.completedAt) / (1000 * 60 * 60 * 24));
          if (dayIndex >= 0 && dayIndex < 30) {
            taskActivity[dayIndex]++;
          }
        }
      });
    }

    // Обрабатываем прочитанные статьи
    if (user.readArticles && user.readArticles.length > 0) {
      user.readArticles.forEach(article => {
        if (article.readAt && article.readAt >= thirtyDaysAgo) {
          const dayIndex = 29 - Math.floor((today - article.readAt) / (1000 * 60 * 60 * 24));
          if (dayIndex >= 0 && dayIndex < 30) {
            articleActivity[dayIndex]++;
          }
        }
      });
    }

    res.json({
      success: true,
      tasks: taskActivity,
      articles: articleActivity
    });
  } catch (error) {
    console.error('Ошибка в getActivity:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ success: false, message: 'Ошибка при получении активности' });
  }
};