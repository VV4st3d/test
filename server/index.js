const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { initializeTranslations } = require('./controllers/language');

// Загрузка переменных окружения
dotenv.config();

// Создание экземпляра Express
const app = express();

// Подключение к базе данных MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/web-dev-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected:', mongoose.connection.host);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Настройка CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev')); // Логирование запросов

// Маршруты API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/language', require('./routes/language'));
app.use('/api/theme', require('./routes/theme'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/forbidden-words', require('./routes/forbiddenWords'));

// Маршрут для проверки работоспособности API
app.get('/', (req, res) => {
  res.json({ message: 'API работает' });
});

// Тестовый маршрут для отладки
app.get('/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Ошибка сервера', 
    error: err.message, // Всегда показываем сообщение об ошибке для отладки
    stack: err.stack // Добавляем стек ошибки для отладки
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  
  // Инициализируем базовые переводы при запуске сервера
  await initializeTranslations();
});

// Обработка непойманных исключений
process.on('unhandledRejection', (err) => {
  console.error('Непойманное отклонение обещания:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Непойманное исключение:', err);
  process.exit(1);
}); 