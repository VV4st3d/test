const express = require('express');
const router = express.Router();
const { 
  getForbiddenWords, 
  addForbiddenWord, 
  updateForbiddenWord, 
  deleteForbiddenWord,
  getForbiddenWordsForClient // Новый контроллер
} = require('../controllers/forbiddenWordController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Маршрут для получения списка запрещенных слов для клиентской проверки
router.get('/client', getForbiddenWordsForClient); // Публичный доступ

// Все маршруты ниже защищены аутентификацией и доступны только админам
router.use(protect);
router.use(admin);

// GET /api/forbidden-words - получение списка запрещенных слов
router.get('/', getForbiddenWords);

// POST /api/forbidden-words - добавление нового запрещенного слова
router.post('/', addForbiddenWord);

// PUT /api/forbidden-words/:id - обновление запрещенного слова
router.put('/:id', updateForbiddenWord);

// DELETE /api/forbidden-words/:id - удаление запрещенного слова
router.delete('/:id', deleteForbiddenWord);

module.exports = router;