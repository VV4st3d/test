require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const configureSecurity = require('./config/security');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');

// Инициализация экспресс-приложения
const app = express();

// Лог запросов для разработки
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Логирование в файл для продакшена
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs', 'access.log'), 
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// Настройка безопасности и оптимизации
configureSecurity(app);

// Парсинг тела запроса
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Подключение к базе данных
connectDB();

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const articleRoutes = require('./routes/articles');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');
const forbiddenWordRoutes = require('./routes/forbiddenWords');

// Регистрация маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/forbidden-words', forbiddenWordRoutes);

// Базовый маршрут API
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Web Dev Platform API' });
});

// Настройка статических файлов для продакшена
if (process.env.NODE_ENV === 'production') {
  // Папка для статических файлов (build фронтенда)
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Все неизвестные маршруты направляем на index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  // Базовый маршрут для разработки
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Web Dev Platform API' });
  });
}

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Внутренняя ошибка сервера' 
      : err.message 
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Корректная обработка остановки сервера
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
}); 