const Article = require('../models/article');
const Task = require('../models/task');
const User = require('../models/user');
const Comment = require('../models/comment');

/**
 * Создание индексов в базе данных для оптимизации запросов
 */
const createIndexes = async () => {
  try {
    console.log('Создание индексов в базе данных...');
    
    // Индексы для модели Article
    await Article.collection.createIndexes([
      { key: { category: 1 }, name: 'category_index' },
      { key: { difficulty: 1 }, name: 'difficulty_index' },
      { key: { isPublished: 1 }, name: 'isPublished_index' },
      { key: { author: 1 }, name: 'author_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' },
      { 
        key: { title: 'text', content: 'text', description: 'text' }, 
        name: 'text_search_index',
        weights: { title: 10, description: 5, content: 1 }
      }
    ]);
    
    // Индексы для модели Task
    await Task.collection.createIndexes([
      { key: { category: 1 }, name: 'category_index' },
      { key: { difficulty: 1 }, name: 'difficulty_index' },
      { key: { isPublished: 1 }, name: 'isPublished_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' },
      { 
        key: { title: 'text', description: 'text', requirements: 'text' }, 
        name: 'text_search_index',
        weights: { title: 10, description: 5, requirements: 3 }
      }
    ]);
    
    // Индексы для модели User
    await User.collection.createIndexes([
      { key: { email: 1 }, name: 'email_index', unique: true },
      { key: { role: 1 }, name: 'role_index' },
      { key: { 'completedTasks.taskId': 1 }, name: 'completedTasks_index' }
    ]);
    
    // Индексы для модели Comment
    await Comment.collection.createIndexes([
      { key: { article: 1 }, name: 'article_index' },
      { key: { task: 1 }, name: 'task_index' },
      { key: { author: 1 }, name: 'author_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' }
    ]);
    
    console.log('Все индексы успешно созданы');
  } catch (error) {
    console.error('Ошибка при создании индексов:', error);
  }
};

module.exports = createIndexes; 