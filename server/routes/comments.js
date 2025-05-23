const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getComments,
  createComment,
  moderateComment,
  deleteComment,
  getPendingComments,
  reportComment
} = require('../controllers/commentController');

// Получение комментариев для статьи или задания
router.get('/', getComments);

// Получение комментариев, требующих модерации (для админов)
router.get('/pending', protect, getPendingComments);

// Создание комментария
router.post('/', protect, createComment);

// Модерация комментария (только для админов)
router.put('/:id/moderate', protect, moderateComment);

// Изменение статуса комментария (для совместимости с админ-панелью)
router.put('/:id/status', protect, (req, res) => {
  // Преобразование статуса из админ-панели в формат для модерации
  const { status } = req.body;
  let moderationStatus = status;
  
  if (status === 'active') moderationStatus = 'approved';
  if (status === 'moderation') moderationStatus = 'pending';
  if (status === 'deleted') moderationStatus = 'rejected';
  
  req.body.status = moderationStatus;
  return moderateComment(req, res);
});

// Жалоба на комментарий
router.post('/:id/report', protect, reportComment);

// Удаление комментария
router.delete('/:id', protect, deleteComment);

module.exports = router; 