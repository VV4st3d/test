const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cors = require('cors');
const compression = require('compression');

/**
 * Конфигурация настроек безопасности и оптимизации сервера
 * @param {Object} app - Express приложение
 */
const configureSecurity = (app) => {
  // Настройка CORS
  app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Настройки Helmet для безопасности заголовков
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
        connectSrc: ["'self'", 'api.github.com']
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  // Защита от XSS атак
  app.use(xss());

  // Лимит запросов для защиты от DoS
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // Максимум 100 запросов с одного IP за 15 минут
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много запросов, попробуйте позже' }
  });
  
  // Применяем лимит запросов ко всем маршрутам API
  app.use('/api/', apiLimiter);

  // Более строгий лимит для маршрутов аутентификации
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 10, // Максимум 10 запросов с одного IP за 1 час
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много попыток входа, попробуйте позже' }
  });
  
  // Применяем строгий лимит к маршрутам аутентификации
  app.use('/api/auth/', authLimiter);

  // Компрессия данных для ускорения передачи
  app.use(compression({
    level: 6, // Уровень сжатия (1-9, где 9 - максимальный)
    threshold: 1024, // Минимальный размер в байтах для сжатия (1KB)
    filter: (req, res) => {
      // Не сжимаем уже сжатые форматы
      if (req.headers['content-type']) {
        return !/^(image|video|audio)/i.test(req.headers['content-type']);
      }
      return true;
    }
  }));

  // NOSNIFF заголовок для предотвращения MIME-sniffing
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  // Отключение информации о сервере из заголовков
  app.disable('x-powered-by');
};

module.exports = configureSecurity; 