const express = require('express');
const router = express.Router();
const {
  getProgress,
  getCompletedTasks,
  getLeaderboard,
  getActivity
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

/**
 * @route GET /api/progress
 * @desc Получение прогресса пользователя
 * @access Private
 */
router.get('/', protect, getProgress);

/**
 * @route GET /api/progress/completed-tasks
 * @desc Получение списка выполненных заданий
 * @access Private
 */
router.get('/completed-tasks', protect, getCompletedTasks);

/**
 * @route GET /api/progress/leaderboard
 * @desc Получение таблицы лидеров
 * @access Private
 */
router.get('/leaderboard', protect, getLeaderboard);

/**
 * @route GET /api/progress/activity
 * @desc Получение активности пользователя за 30 дней
 * @access Private
 */
router.get('/activity', protect, getActivity);

module.exports = router;