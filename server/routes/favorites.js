const express = require('express');
const router = express.Router();
const Favorite = require('../models/favorite');
const { protect } = require('../middleware/auth');

// Получение избранных статей пользователя
router.get('/', protect, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: 'article',
        populate: {
          path: 'author',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.json(favorites.map(fav => fav.article));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Добавление статьи в избранное
router.post('/:articleId', protect, async (req, res) => {
  try {
    const favorite = await Favorite.create({
      user: req.user.id,
      article: req.params.articleId
    });

    const populatedFavorite = await Favorite.findById(favorite._id)
      .populate({
        path: 'article',
        populate: {
          path: 'author',
          select: 'name'
        }
      });

    res.status(201).json(populatedFavorite.article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Удаление статьи из избранного
router.delete('/:articleId', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      article: req.params.articleId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Статья не найдена в избранном' });
    }

    res.json({ message: 'Статья удалена из избранного' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 