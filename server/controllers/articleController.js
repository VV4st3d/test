const Article = require('../models/article');
const User = require('../models/user');
const NodeCache = require('node-cache');

const cache = new NodeCache({ 
  stdTTL: 60,
  checkperiod: 120
});

/**
 * Get all articles with pagination, filtering, and search
 */
exports.getArticles = async (req, res) => {
  try {
    const { category, difficulty, search, tags, page = 1, limit = 9, lang = 'en' } = req.query;
    console.log('Article search params:', JSON.stringify({ category, difficulty, search, tags, page, limit, lang }));
    
    const cacheKey = `articles_${category || 'all'}_${difficulty || 'all'}_${search || 'none'}_${tags || 'all'}_${page}_${limit}_${lang}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Returned cached articles data');
      return res.json(cachedData);
    }
    
    const query = { isPublished: true };
    
    // Логирование исходных значений
    console.log('Query params:', { 
      category: typeof category, 
      difficulty: typeof difficulty, 
      search: typeof search, 
      tags: typeof tags 
    });
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    // Фильтрация по тегам
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // НОВЫЙ ПОДХОД К ПОИСКУ
    // Простой регулярный поиск по всем полям, без использования текстового индекса
    if (search && typeof search === 'string' && search.trim() !== '') {
      const trimmedSearch = search.trim();
      console.log('Search term:', trimmedSearch);
      
      // Построим простые регулярные выражения для поиска
      const searchRegex = new RegExp(trimmedSearch, 'i');
      
      // Добавляем условия поиска для всех релевантных полей
      query.$or = [
        // Поиск в заголовках на обоих языках
        { 'translations.ru.title': searchRegex },
        { 'translations.en.title': searchRegex },
        
        // Поиск в описаниях
        { 'translations.ru.description': searchRegex },
        { 'translations.en.description': searchRegex },
        
        // Поиск в содержимом
        { 'translations.ru.content': searchRegex },
        { 'translations.en.content': searchRegex },
        
        // Поиск в категории и тегах
        { category: searchRegex },
        { tags: searchRegex },
        
        // Для обратной совместимости
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex }
      ];
    }

    console.log('MongoDB query:', JSON.stringify(query));

    const [totalArticles, articles] = await Promise.all([
      Article.countDocuments(query),
      Article.find(query)
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean()
    ]);

    console.log(`Found ${articles.length} articles out of ${totalArticles} total`);
    
    if (articles.length > 0) {
      // Выведем первые найденные статьи для отладки
      console.log('First article:', {
        id: articles[0]._id,
        title: articles[0].translations?.ru?.title || articles[0].title || articles[0].translations?.en?.title,
        category: articles[0].category,
        tags: articles[0].tags
      });
    }

    // Transform articles to include only the requested language
    const transformedArticles = articles.map(article => {
      let title, description, content;
      
      // Обработка нового формата с переводами
      if (article.translations) {
        if (lang === 'en' && article.translations.en) {
          title = article.translations.en.title;
          description = article.translations.en.description;
          content = article.translations.en.content;
        } else if (lang === 'ru' && article.translations.ru) {
          title = article.translations.ru.title;
          description = article.translations.ru.description;
          content = article.translations.ru.content;
        } else {
          // Если нет перевода на запрошенный язык, используем первый доступный
          const availableLang = article.translations.ru ? 'ru' : 'en';
          title = article.translations[availableLang].title;
          description = article.translations[availableLang].description;
          content = article.translations[availableLang].content;
        }
      } else {
        // Для обратной совместимости со старым форматом
        if (lang === 'en') {
          title = article.titleEn || article.title;
          description = article.descriptionEn || article.description;
          content = article.contentEn || article.content;
        } else {
          title = article.title;
          description = article.description;
          content = article.content;
        }
      }
      
      // Создаем новый объект без translations
      const { translations, ...rest } = article;
      return {
        ...rest,
        title,
        description,
        content
      };
    });

    const result = {
      articles: transformedArticles,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalArticles / limit),
      totalArticles
    };
    
    // Отключаем кэширование результата поиска для отладки
    // cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get article by ID
 */
exports.getArticle = async (req, res) => {
  try {
    console.log("Getting article with ID:", req.params.id);
    
    // Очищаем ID от обратных слешей
    const articleId = req.params.id.replace(/\\/g, '');
    console.log("Cleaned article ID:", articleId);
    
    const userId = req.user ? req.user.id : null;
    const lang = req.query.lang || 'en';
    const cacheKey = `article_${articleId}_user_${userId || 'guest'}_${lang}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log("Returning cached article");
      return res.json(cachedData);
    }
    
    console.log("Fetching article from database");
    const article = await Article.findById(articleId)
      .populate('author', 'name')
      .lean();
    
    console.log("Article found:", article ? "yes" : "no");

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    console.log("Incrementing view count");
    Article.updateOne({ _id: articleId }, { $inc: { views: 1 } }).exec();

    let isFavorite = false;
    let isRead = false;
    
    if (userId) {
      console.log("Checking favorite status for user:", userId);
      const user = await User.findById(userId, 'favorites readArticles').lean();
      if (user && user.favorites) {
        isFavorite = user.favorites.some(favId => favId.toString() === articleId);
      }
      
      // Проверяем, прочитана ли статья пользователем
      isRead = user && user.readArticles && 
              user.readArticles.some(article => article.articleId.toString() === articleId);
    }

    console.log("Preparing result");
    // Создаем копию статьи для результата
    let result = { ...article, isFavorite, isRead };
    
    // Для редактирования статьи нам нужно сохранить поле translations
    // Не удаляем translations из результата, чтобы формы редактирования работали корректно
    
    console.log("Caching result");
    cache.set(cacheKey, result, 30);
    
    console.log("Sending response");
    res.json(result);
  } catch (error) {
    console.error('Error fetching article - Details:', {
      id: req.params.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

/**
 * Create a new article (admin only)
 */
exports.createArticle = async (req, res) => {
  try {
    console.log('Creating new article, request body:', JSON.stringify(req.body, null, 2));
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create articles' });
    }

    const { translations, category, difficulty, tags } = req.body;
    
    if (!translations || !translations.ru || !translations.en || 
        !translations.ru.title || !translations.ru.content || 
        !translations.en.title || !translations.en.content) {
      console.log('Invalid translations structure:', translations);
      return res.status(400).json({
        message: 'Title and content are required for both languages',
        details: 'Translations must include title and content for both ru and en languages'
      });
    }

    if (!category) {
      console.log('Category is required');
      return res.status(400).json({ message: 'Category is required' });
    }
    
    // Проверяем, что difficulty имеет допустимое значение
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      console.log('Invalid difficulty:', difficulty);
      return res.status(400).json({ 
        message: 'Invalid difficulty level',
        details: 'Difficulty must be one of: beginner, intermediate, advanced'
      });
    }
    
    // Проверяем и нормализуем теги
    let normalizedTags = [];
    if (Array.isArray(tags)) {
      normalizedTags = tags
        .filter(tag => typeof tag === 'string' && tag.trim() !== '')
        .map(tag => tag.trim());
    }
    
    console.log('Normalized tags:', normalizedTags);
    
    // Подготавливаем данные для создания
    const articleData = {
      ...req.body,
      tags: normalizedTags,
      author: req.user.id,
      isPublished: req.body.isPublished !== false
    };

    const article = await Article.create(articleData);
    
    console.log('Article created successfully, ID:', article._id);
    console.log('Created with tags:', article.tags);
    
    clearArticlesCache();
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ 
      message: 'Server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Update an article (admin only)
 */
exports.updateArticle = async (req, res) => {
  try {
    console.log('Updating article, request body:', JSON.stringify(req.body, null, 2));
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update articles' });
    }

    const articleId = req.params.id;
    console.log('Article ID to update:', articleId);
    
    const article = await Article.findById(articleId).lean();

    if (!article) {
      console.log('Article not found');
      return res.status(404).json({ message: 'Article not found' });
    }

    const { translations, category, difficulty, tags } = req.body;
    
    // Проверка структуры translations
    if (!translations || 
        !translations.ru || !translations.en || 
        !translations.ru.title || !translations.ru.content || 
        !translations.en.title || !translations.en.content) {
      console.log('Invalid translations structure:', translations);
      return res.status(400).json({
        message: 'Title and content are required for both languages',
        details: 'Translations must include title and content for both ru and en languages'
      });
    }

    if (!category) {
      console.log('Category is required');
      return res.status(400).json({ message: 'Category is required' });
    }
    
    // Проверяем, что difficulty имеет допустимое значение
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      console.log('Invalid difficulty:', difficulty);
      return res.status(400).json({ 
        message: 'Invalid difficulty level',
        details: 'Difficulty must be one of: beginner, intermediate, advanced'
      });
    }
    
    // Проверяем и нормализуем теги
    let normalizedTags = [];
    if (Array.isArray(tags)) {
      normalizedTags = tags
        .filter(tag => typeof tag === 'string' && tag.trim() !== '')
        .map(tag => tag.trim());
    }
    
    console.log('Normalized tags:', normalizedTags);
    
    // Подготавливаем данные для обновления
    const updateData = {
      ...req.body,
      tags: normalizedTags
    };

    console.log('Updating article with data:', {
      category,
      difficulty,
      tagsCount: normalizedTags.length,
      hasRuTranslation: !!translations.ru,
      hasEnTranslation: !!translations.en
    });

    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Article updated successfully, ID:', updatedArticle._id);
    console.log('Updated tags:', updatedArticle.tags);
    
    clearArticleCache(articleId);
    clearArticlesCache();
    res.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ 
      message: 'Server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Delete an article (admin only)
 */
exports.deleteArticle = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete articles' });
    }

    const articleId = req.params.id;
    const article = await Article.findById(articleId, 'author').lean();

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    await Article.deleteOne({ _id: articleId });
    
    clearArticleCache(articleId);
    clearArticlesCache();
    
    User.updateMany(
      { favorites: articleId },
      { $pull: { favorites: articleId } }
    ).exec();
    
    res.json({ message: 'Article deleted' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Toggle favorite status
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user.id;
    
    const articleExists = await Article.exists({ _id: articleId });
    if (!articleExists) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const user = await User.findById(userId, 'favorites');
    
    if (!user.favorites) {
      user.favorites = [];
    }

    const index = user.favorites.findIndex(favId => favId.toString() === articleId);
    let isFavorite;
    if (index === -1) {
      user.favorites.push(articleId);
      isFavorite = true;
    } else {
      user.favorites.splice(index, 1);
      isFavorite = false;
    }
    
    await user.save();
    
    clearUserFavoritesCache(userId);
    res.json({ 
      isFavorite, 
      message: isFavorite ? 'Added to favorites' : 'Removed from favorites' 
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Check favorite status
 */
exports.checkFavorite = async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user.id;
    
    const user = await User.findById(userId, 'favorites').lean();
    
    const isFavorite = user.favorites && user.favorites.some(
      favId => favId.toString() === articleId
    );
    
    res.json({ isFavorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user's favorite articles
 */
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const lang = req.query.lang || 'ru'; // Получаем предпочитаемый язык из запроса или используем русский по умолчанию
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Создаем ключ кеша с учетом пагинации
    const cacheKey = `user_favorites_${userId}_${lang}_${page}_${limit}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const userFavorites = await User.findById(userId, 'favorites')
      .populate({
        path: 'favorites',
        select: 'translations category difficulty views updatedAt author tags',
        populate: { path: 'author', select: 'name' }
      })
      .lean();
    
    const favorites = userFavorites.favorites || [];
    const transformedFavorites = favorites.map(article => {
      // Получаем переводы в соответствии с запрошенным языком, с фолбэком на другие языки
      const title = article.translations[lang]?.title 
        || article.translations.en?.title 
        || article.translations.ru?.title;
      
      const description = article.translations[lang]?.description 
        || article.translations.en?.description 
        || article.translations.ru?.description;
      
      const content = article.translations[lang]?.content 
        || article.translations.en?.content 
        || article.translations.ru?.content;
      
      return {
        ...article,
        title,
        description,
        content,
        translations: undefined // Удаляем исходные переводы из ответа
      };
    });
    
    // Сортируем статьи по дате обновления (от новых к старым)
    transformedFavorites.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // Применяем пагинацию
    const total = transformedFavorites.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFavorites = transformedFavorites.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);
    
    // Формируем ответ с пагинацией
    const response = {
      articles: paginatedFavorites,
      total,
      totalPages,
      page,
      limit
    };
    
    cache.set(cacheKey, response, 60);
    res.json(response);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Получение всех уникальных тегов статей
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getAllTags = async (req, res) => {
  try {
    // Агрегация для получения всех уникальных тегов
    const result = await Article.aggregate([
      { $match: { isPublished: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags" } },
      { $sort: { _id: 1 } }
    ]);
    
    // Преобразуем результат в массив строк
    const tags = result.map(tag => tag._id);
    
    res.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Отметить статью как прочитанную
 */
exports.markArticleAsRead = async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const articleExists = await Article.exists({ _id: articleId });
    if (!articleExists) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Проверяем, не отмечена ли уже статья как прочитанная
    const user = await User.findById(userId, 'readArticles');
    const isAlreadyRead = user.readArticles && 
                          user.readArticles.some(article => article.articleId.toString() === articleId);
    
    if (!isAlreadyRead) {
      // Отмечаем статью как прочитанную
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          readArticles: {
            articleId: articleId,
            readAt: new Date()
          }
        }
      });
      
      // Обновляем прогресс пользователя (начисляем баллы)
      const userModel = await User.findById(userId);
      const progressResult = await userModel.updateArticleProgress(articleId);
      
      // Очищаем кеш прогресса пользователя
      clearUserProgressCache(userId);
      clearArticleCache(articleId);
      
      return res.json({ 
        success: true, 
        message: 'Article marked as read',
        progress: progressResult
      });
    }
    
    res.json({ success: true, message: 'Article was already read' });
  } catch (error) {
    console.error('Error marking article as read:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

function clearArticleCache(articleId) {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.includes(`article_${articleId}`)) {
      cache.del(key);
    }
  });
}

function clearArticlesCache() {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.startsWith('articles_')) {
      cache.del(key);
    }
  });
}

function clearUserFavoritesCache(userId) {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.startsWith(`user_favorites_${userId}`)) {
      cache.del(key);
    }
  });
}

function clearUserProgressCache(userId) {
  cache.del(`user_progress_${userId}`);
}