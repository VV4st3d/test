const Comment = require('../models/comment');
const User = require('../models/user');
const { profanityFilter, findProfanity } = require('../utils/profanityFilter');
const { getAllForbiddenWordsInternal } = require('./forbiddenWordController');




/**
 * Модерация контента (проверка на запрещенные слова и другие признаки нежелательного контента)
 * @param {string} text - Текст для проверки
 */
const contentModeration = async (text) => {
  if (!text) {
    return {
      hasForbiddenWords: false,
      hasExcessiveLinks: false,
      hasSpamPatterns: false,
      sanitizedText: '',
      forbiddenWordsFound: []
    };
  }
  
  const result = {
    hasForbiddenWords: false,
    hasExcessiveLinks: false,
    hasSpamPatterns: false,
    sanitizedText: text,
    forbiddenWordsFound: []
  };

  // Проверка на запрещенные слова
  try {
    const foundProfanity = await findProfanity(text);
    if (foundProfanity && foundProfanity.length > 0) {
      result.hasForbiddenWords = true;
      result.forbiddenWordsFound = foundProfanity;
      console.log('Запрещенные слова найдены:', foundProfanity);
    }
  } catch (error) {
    console.error('Ошибка при проверке запрещенных слов:', error);
  }

  // Проверка на большое количество ссылок
  const linkPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9._-]+\.(com|org|net|ru|io|xyz|me|info))/gi;
  const links = text.match(linkPattern) || [];
  result.hasExcessiveLinks = links.length > 2;

  // Расширенные спам-паттерны
  const spamPatterns = [
    text.length > 10 && text === text.toUpperCase(), // Текст длиннее 10 символов и весь в верхнем регистре
    text.includes('!!!') || text.includes('???'), // Наличие "!!!" или "???"
    /(.)\1{5,}/.test(text), // Повторение одного символа 5 или более раз
    text.length > 10 && (text.replace(/[^0-9]/g, '').length / text.length) > 0.7, // Более 70% цифр в тексте длиннее 10 символов
    /[а-я][a-z]|[a-z][а-я]/i.test(text), // Смешивание кириллицы и латиницы
    /(^|\s)(\w+)(\s+\2){2,}/i.test(text), // Повторение слова 3 или более раз
    text.length > 20 && (text.replace(/[^A-ZА-Я]/g, '').length / text.length) > 0.5 // Более 50% заглавных букв в длинном тексте
  ];
  
  result.hasSpamPatterns = spamPatterns.some(pattern => pattern === true);

  // Замена ругательств звездочками - теперь всегда происходит фильтрация
  try {
    result.sanitizedText = await profanityFilter(text);
  } catch (error) {
    console.error('Ошибка при фильтрации запрещенных слов:', error);
    result.sanitizedText = text; // Используем исходный текст в случае ошибки
  }

  return result;
};

/**
 * Получение комментариев с фильтрацией и пагинацией
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};

    // Получение ID статьи из параметров URL или из query
    const articleId = req.params.id || req.query.articleId;
    if (articleId) query.article = articleId;
    
    // Получение ID задачи из query
    const taskId = req.query.taskId;
    if (taskId) query.task = taskId;
    
    // Фильтр по статусу (только для админов)
    if (req.user && req.user.role === 'admin' && status) {
      query.status = status;
    } else {
      query.status = 'approved'; // По умолчанию только одобренные комментарии
    }

    // Получаем только корневые комментарии (без parentComment)
    query.parentComment = null;

    // Общее количество корневых комментариев
    const totalComments = await Comment.countDocuments(query);
    const totalPages = Math.ceil(totalComments / limit);

    // Получение корневых комментариев с пагинацией и популированием ответов до 3го уровня
    const comments = await Comment.find(query)
      .populate('author', 'name avatar')
      .populate({
        path: 'replies', // Первый уровень вложенности
        populate: [
          { path: 'author', select: 'name avatar' },
          { 
            path: 'replies', // Второй уровень вложенности
            populate: [
              { path: 'author', select: 'name avatar' },
              { 
                path: 'replies', // Третий уровень вложенности
                populate: {
                  path: 'author',
                  select: 'name avatar'
                },
                match: { status: 'approved' }
              }
            ],
            match: { status: 'approved' }
          }
        ],
        match: { status: 'approved' }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      comments,
      currentPage: parseInt(page),
      totalPages,
      totalComments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * Создание нового комментария
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.createComment = async (req, res) => {
  try {
    const { content, task, parentComment } = req.body;
    
    // Получение ID статьи из параметров URL или из тела запроса
    const article = req.params.id || req.body.article;

    // Проверка на пустой текст
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Текст комментария не может быть пустым' });
    }

    // Проверка наличия статьи или задачи
    if (!article && !task) {
      return res.status(400).json({ message: 'Необходимо указать статью или задачу' });
    }

    // Проверка уровня вложенности
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(400).json({ message: 'Родительский комментарий не найден' });
      }
      
      // Проверяем, что не превышен максимальный уровень вложенности (3 уровня)
      if (parent.parentComment) {
        const grandParent = await Comment.findById(parent.parentComment);
        if (grandParent && grandParent.parentComment) {
          return res.status(400).json({ message: 'Максимальная вложенность комментариев — 3 уровня' });
        }
      }
    }

    // Проверка на запрещенный контент
    const moderationResult = await contentModeration(content);
    
    // Определяем статус комментария
    let status = 'approved'; // По умолчанию одобряем комментарий
    let moderationNote = '';

    // Если найдены запрещенные слова, отправляем на модерацию
    if (moderationResult.hasForbiddenWords) {
      status = 'pending';
      moderationNote = `Найдены запрещенные слова: ${moderationResult.forbiddenWordsFound.join(', ')}`;
      console.log('Комментарий с запрещенными словами отправлен на модерацию:', moderationResult.forbiddenWordsFound);
    }

    // Проверка на другие проблемы, которые приводят к отклонению комментария
    if (moderationResult.hasExcessiveLinks) {
      return res.status(400).json({ 
        message: 'Комментарий содержит слишком много ссылок'
      });
    }

    if (moderationResult.hasSpamPatterns) {
      return res.status(400).json({ 
        message: 'Комментарий похож на спам'
      });
    }

    // Создание комментария с очищенным текстом
    const comment = await Comment.create({
      content: moderationResult.sanitizedText,
      article,
      task,
      parentComment,
      author: req.user.id,
      status,
      moderationNote
    });

    // Если это ответ на комментарий, обновляем информацию о родительском комментарии
    if (parentComment) {
      await Comment.findByIdAndUpdate(
        parentComment,
        { $push: { replies: comment._id } },
        { new: true, upsert: false }
      );
    }

    // Возвращаем комментарий с данными автора
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar')
      .populate({
        path: 'parentComment',
        populate: {
          path: 'author',
          select: 'name avatar'
        }
      });

    res.status(201).json({
      comment: populatedComment,
      message: status === 'approved' 
        ? 'Комментарий опубликован' 
        : 'Комментарий ожидает модерации'
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Модерация комментария (для администраторов)
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.moderateComment = async (req, res) => {
  try {
    // Проверка прав администратора
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для модерации' });
    }

    const { status, moderationNote } = req.body;
    
    // Проверка валидности статуса
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус модерации' });
    }

    // Обновление комментария
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        moderatedBy: req.user.id,
        moderatedAt: new Date(),
        moderationNote: moderationNote || ''
      },
      { new: true }
    ).populate('author', 'name email');

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Обновление уровня доверия пользователя, если комментарий отклонен
    if (status === 'rejected') {
      const user = await User.findById(comment.author._id);
      if (user && user.trustLevel > 0) {
        user.trustLevel -= 1;
        await user.save();
      }
    }

    res.json({
      comment,
      message: `Комментарий ${status === 'approved' ? 'одобрен' : (status === 'rejected' ? 'отклонен' : 'ожидает модерации')}`
    });
  } catch (error) {
    console.error('Error moderating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Получение комментариев, требующих модерации (для админов)
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.getPendingComments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для просмотра' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    console.log('Fetching comments with query:', query);

    const totalComments = await Comment.countDocuments(query);
    const totalPages = Math.ceil(totalComments / limit);

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('article', 'translations') // Изменено: запрашиваем translations
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const processedComments = comments.map(comment => {
      const result = comment.toObject();
      if (comment.article && comment.article.translations?.ru?.title) {
        result.contentTitle = `Статья: ${comment.article.translations.ru.title}`; // Используем translations.ru.title
      } else if (comment.task && comment.task.title) {
        result.contentTitle = `Задача: ${comment.task.title}`;
      } else {
        result.contentTitle = 'Контент удален';
      }
      return result;
    });

    res.json({
      comments: processedComments,
      currentPage: parseInt(page),
      totalPages,
      totalComments,
      totalPending: await Comment.countDocuments({ status: 'pending' })
    });
  } catch (error) {
    console.error('Error fetching pending comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Удаление комментария (автором или администратором)
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId || req.params.id;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }
    
    // Проверка прав на удаление
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для удаления' });
    }
    
    // Если у комментария есть родительский комментарий, удаляем ссылку из него
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $pull: { replies: comment._id } }
      );
    }
    
    // Удаляем комментарий
    await Comment.findByIdAndDelete(commentId);
    
    res.json({ message: 'Комментарий успешно удален' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Отправка жалобы на комментарий
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.reportComment = async (req, res) => {
  try {
    const { reason, details } = req.body;
    
    if (!reason || !['spam', 'abuse', 'inappropriate', 'other'].includes(reason)) {
      return res.status(400).json({ message: 'Необходимо указать корректную причину жалобы' });
    }
    
    // Используем commentId из параметров URL, если он есть, иначе используем id
    const commentId = req.params.commentId || req.params.id;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }
    
    // Проверка, не отправлял ли пользователь уже жалобу на этот комментарий
    if (comment.isReportedBy(req.user.id)) {
      return res.status(400).json({ message: 'Вы уже отправляли жалобу на этот комментарий' });
    }
    
    // Добавление жалобы
    comment.reports.push({
      user: req.user.id,
      reason,
      details: details || ''
    });
    
    // Если количество жалоб достигло порога (например, 3), автоматически отправляем на модерацию
    if (comment.reports.length >= 3 && comment.status === 'approved') {
      comment.status = 'pending';
      comment.moderationNote = 'Автоматическая модерация из-за количества жалоб';
    }
    
    await comment.save();
    
    res.json({ 
      message: 'Жалоба отправлена',
      reportCount: comment.reports.length
    });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Обновление комментария
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    // Проверка на пустой текст
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Текст комментария не может быть пустым' });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Проверка авторства или прав администратора
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для редактирования' });
    }

    // Проверка на запрещенный контент
    const moderationResult = await contentModeration(content);
    
    if (moderationResult.hasForbiddenWords) {
      return res.status(400).json({ 
        message: 'Комментарий содержит запрещенные слова',
        details: { forbiddenWords: moderationResult.forbiddenWordsFound }
      });
    }

    if (moderationResult.hasExcessiveLinks) {
      return res.status(400).json({ 
        message: 'Комментарий содержит слишком много ссылок'
      });
    }

    if (moderationResult.hasSpamPatterns) {
      return res.status(400).json({ 
        message: 'Комментарий похож на спам'
      });
    }

    // Автоматическая модерация для админов или доверенных пользователей
    let status = 'pending';
    if (req.user.role === 'admin' || req.user.trustLevel > 2) {
      status = 'approved';
    }

    // Обновление комментария с очищенным текстом
    comment.content = moderationResult.sanitizedText;
    comment.status = status;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    // Возвращаем обновленный комментарий с данными автора
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar')
      .populate({
        path: 'parentComment',
        populate: {
          path: 'author',
          select: 'name avatar'
        }
      })
      .populate({
        path: 'replies',
        populate: [
          { path: 'author', select: 'name avatar' },
          {
            path: 'replies',
            populate: [
              { path: 'author', select: 'name avatar' },
              {
                path: 'replies',
                populate: {
                  path: 'author',
                  select: 'name avatar'
                },
                match: { status: 'approved' }
              }
            ],
            match: { status: 'approved' }
          }
        ],
        match: { status: 'approved' }
      });

    res.json({
      comment: populatedComment,
      message: status === 'approved' 
        ? 'Комментарий обновлен' 
        : 'Обновленный комментарий ожидает модерации'
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
