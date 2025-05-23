const express = require('express');
const router = express.Router();
const { 
  getArticles, 
  getArticle, 
  createArticle, 
  updateArticle, 
  deleteArticle,
  toggleFavorite,
  checkFavorite,
  getFavorites,
  getAllTags,
  markArticleAsRead
} = require('../controllers/articleController');
// Assuming a commentController exists
const { getComments, createComment, updateComment, deleteComment, reportComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const Article = require('../models/article');

// Add test route at the beginning of the file
router.get('/test', (req, res) => {
  res.json({ message: 'Articles API is working!' });
});

/**
 * Get recommended articles
 */
router.get('/recommended', async (req, res) => {
  try {
    // Получаем язык из запроса или используем русский по умолчанию
    const lang = req.query.lang || 'ru';
    
    const articles = await Article.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('author', 'name')
      .select('translations category difficulty createdAt')
      .lean();
    
    // Преобразуем статьи для поддержки выбранного языка
    const transformedArticles = articles.map(article => {
      let title, description;
      
      // Обработка формата с переводами
      if (article.translations) {
        const translation = article.translations[lang] || article.translations.ru || article.translations.en || {};
        
        title = translation.title || '';
        description = translation.description || '';
      } else {
        title = article.title || '';
        description = article.description || '';
      }
      
      // Возвращаем трансформированный объект без поля translations
      const { translations, ...rest } = article;
      
      return {
        ...rest,
        title,
        description
      };
    });
      
    res.json({ articles: transformedArticles });
  } catch (error) {
    console.error('Error fetching recommended articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Получение всех уникальных тегов
router.get('/tags', getAllTags);

// Article routes
router.get('/', getArticles);
router.get('/favorites', protect, getFavorites);
router.get('/:id', getArticle);
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

// Favorite routes
router.post('/:id/favorite', protect, toggleFavorite);
router.delete('/:id/favorite', protect, toggleFavorite);
router.get('/:id/favorite', protect, checkFavorite);

// Маршрут для отметки статьи как прочитанной
router.post('/:id/read', protect, markArticleAsRead);

// Comment routes
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, createComment);
router.put('/:id/comments/:commentId', protect, updateComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.post('/:id/comments/:commentId/report', protect, reportComment);

module.exports = router;