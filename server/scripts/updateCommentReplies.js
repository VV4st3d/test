/**
 * Скрипт для обновления структуры комментариев
 * Добавляет связи replies на основе поля parentComment
 */

const mongoose = require('mongoose');
const Comment = require('../models/comment');
const dotenv = require('dotenv');
const path = require('path');

// Загрузка переменных окружения
dotenv.config({ path: path.join(__dirname, '../../.env') });

const updateCommentReplies = async () => {
  try {
    // Подключение к базе данных
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/web-dev-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected...');

    // Находим все комментарии, у которых есть поле parentComment
    const childComments = await Comment.find({ parentComment: { $ne: null } });
    console.log(`Найдено ${childComments.length} дочерних комментариев`);

    let updatedCount = 0;
    
    // Для каждого дочернего комментария обновляем родительский комментарий
    for (const comment of childComments) {
      try {
        // Обновляем родительский комментарий, добавляя ID текущего комментария в массив replies
        const result = await Comment.updateOne(
          { _id: comment.parentComment, replies: { $ne: comment._id } },
          { $addToSet: { replies: comment._id } }
        );
        
        if (result.modifiedCount > 0) {
          updatedCount++;
        }
      } catch (err) {
        console.error(`Ошибка при обновлении родительского комментария для ${comment._id}:`, err);
      }
    }

    console.log(`Обновлено ${updatedCount} родительских комментариев`);
    console.log('Миграция завершена');
  } catch (err) {
    console.error('Ошибка при выполнении миграции:', err);
  } finally {
    // Отключение от базы данных
    await mongoose.disconnect();
    console.log('MongoDB отключен');
  }
};

// Запуск скрипта
updateCommentReplies(); 