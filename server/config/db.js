const mongoose = require('mongoose');

/**
 * Создание индексов для оптимизации часто используемых запросов
 */
const createIndexes = async () => {
  try {
    // Индексы для Article
    const Article = mongoose.model('Article');
    await Article.collection.createIndex({ category: 1 }); // Для фильтрации по категории
    await Article.collection.createIndex({ difficulty: 1 }); // Для фильтрации по сложности
    await Article.collection.createIndex({ isPublished: 1 }); // Для фильтрации по статусу публикации
    await Article.collection.createIndex({ author: 1 }); // Для фильтрации по автору
    await Article.collection.createIndex({ 
      title: "text", 
      content: "text", 
      description: "text" 
    }); // Для полнотекстового поиска
    
    // Индексы для Task
    const Task = mongoose.model('Task');
    await Task.collection.createIndex({ category: 1 });
    await Task.collection.createIndex({ difficulty: 1 });
    await Task.collection.createIndex({ isPublished: 1 });
    
    // Индексы для User
    const User = mongoose.model('User');
    await User.collection.createIndex({ email: 1 }, { unique: true }); // Уникальный индекс по email
    await User.collection.createIndex({ role: 1 }); // Для фильтрации по роли
    await User.collection.createIndex({ 'completedTasks.taskId': 1 }); // Для быстрого поиска по выполненным задачам
    
    // Индексы для Comment
    const Comment = mongoose.model('Comment');
    await Comment.collection.createIndex({ article: 1, status: 1 }); // Для отображения комментариев к статье
    await Comment.collection.createIndex({ task: 1, status: 1 }); // Для отображения комментариев к задаче
    await Comment.collection.createIndex({ author: 1 }); // Для фильтрации по автору
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

/**
 * Подключение к MongoDB и настройка соединения
 */
const connectDB = async () => {
  try {
    // Настройка опций подключения
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ больше не требует эти опции, они установлены по умолчанию,
      // но оставляем здесь для ясности и обратной совместимости
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Оптимизация работы Mongoose
    mongoose.set('maxTimeMS', 10000); // Таймаут для запросов
    mongoose.set('debug', process.env.NODE_ENV === 'development'); // Логирование запросов в режиме разработки
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Обработка событий соединения
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, attempting to reconnect...');
    });
    
    // Корректное закрытие соединения при остановке приложения
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    // Создаем индексы после подключения к базе данных
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 