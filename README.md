# Web Dev Platform

Платформа для обучения веб-разработке с статьями, задачами и прогрессом пользователей.

## Содержание

- [Технологии](#технологии)
- [Функциональность](#функциональность)
- [Установка и запуск](#установка-и-запуск)
- [Развертывание](#развертывание)
- [Использование API](#использование-api)
- [Настройка интерфейса](#настройка-интерфейса)
- [Документация](#документация)
- [CI/CD Пайплайн](#cicd-пайплайн)
- [Лицензия](#лицензия)

## Технологии

### Фронтенд
- Vue.js 3
- Vue Router
- Pinia (хранилище)
- Tailwind CSS
- Vite (сборка)
- CodeMirror (редактор кода)

### Бэкенд
- Node.js
- Express
- MongoDB / Mongoose
- JWT аутентификация
- VM2 (для выполнения кода в изолированной среде)

## Функциональность

- **Авторизация и регистрация:** регистрация пользователей, вход в систему, восстановление пароля
- **Статьи:** просмотр, создание, редактирование, поиск и фильтрация
- **Задачи:** выполнение практических задач с автоматической проверкой кода
- **Прогресс обучения:** отслеживание выполненных задач и общего прогресса
- **Комментарии:** возможность обсуждения статей и задач
- **Мультиязычность:** поддержка русского и английского языков
- **Темы оформления:** светлая и темная темы

## Установка и запуск

### Требования
- Node.js 16+ и npm
- MongoDB 4.4+
- Docker и Docker Compose (опционально)

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/web-dev-platform.git
cd web-dev-platform
```

2. Настройте переменные окружения:
```bash
# Для бэкенда
cp server/.env.example server/.env
# Для фронтенда
cp client/.env.example client/.env
```

3. Запустите приложение с помощью Docker Compose:
```bash
docker-compose up
```

4. Или запустите каждый сервис отдельно:

```bash
# Запуск MongoDB
mongod --dbpath=./data/db

# Запуск бэкенда
cd server
npm install
npm run dev

# Запуск фронтенда
cd client
npm install
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Запуск тестов

```bash
# Тесты бэкенда
cd server
npm test

# Тесты фронтенда
cd client
npm test
```

## Развертывание

### Деплой с использованием Docker Compose

1. Настройте переменные окружения:
```bash
cp .env.example .env
```

2. Соберите и запустите контейнеры:
```bash
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d
```

3. Для остановки:
```bash
docker-compose -f docker-compose.yml down
```

### Деплой на Heroku

1. Создайте две Heroku приложения (для бэкенда и фронтенда):
```bash
heroku create your-app-name-api  # Бэкенд API
heroku create your-app-name      # Фронтенд
```

2. Настройте переменные окружения для бэкенда:
```bash
heroku config:set NODE_ENV=production JWT_SECRET=your_jwt_secret CLIENT_URL=https://your-app-name.herokuapp.com --app your-app-name-api
```

3. Настройте базу данных MongoDB Atlas и добавьте URI в переменные окружения:
```bash
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname --app your-app-name-api
```

4. Настройте автоматический деплой из GitHub:
   - Подключите репозиторий в Heroku Dashboard
   - Включите автоматический деплой из ветки main/master

5. Или выполните деплой вручную:
```bash
# Деплой бэкенда
cd server
heroku container:push web --app your-app-name-api
heroku container:release web --app your-app-name-api

# Деплой фронтенда
cd client
npm run build
heroku static:deploy --app your-app-name
```

### Деплой на Vercel (только фронтенд)

1. Установите CLI Vercel:
```bash
npm install -g vercel
```

2. Выполните деплой:
```bash
cd client
vercel login
vercel
```

3. Настройте переменные окружения:
```bash
vercel env add VITE_API_URL https://your-backend-api.com
```

4. Для продакшена:
```bash
vercel --prod
```

## Использование API

### Авторизация

API использует JWT токены для авторизации. Токен необходимо передавать в заголовке `Authorization` с префиксом `Bearer`:

```
Authorization: Bearer <ваш_токен>
```

Для получения токена используйте эндпоинты `/api/auth/register` или `/api/auth/login`.

### Основные эндпоинты

```
# Авторизация
POST /api/auth/register - Регистрация пользователя
POST /api/auth/login - Вход в систему
GET /api/auth/me - Получение данных авторизованного пользователя

# Статьи
GET /api/articles - Получение списка статей
GET /api/articles/:id - Получение конкретной статьи
POST /api/articles - Создание новой статьи
PUT /api/articles/:id - Обновление статьи
DELETE /api/articles/:id - Удаление статьи

# Задания
GET /api/tasks - Получение списка заданий
GET /api/tasks/:id - Получение конкретного задания
POST /api/tasks/:id/check - Проверка решения
```

Полную документацию API см. в [docs/api-guide.md](docs/api-guide.md).

## Настройка интерфейса

### Смена языка

Платформа поддерживает мультиязычность. Для смены языка:

1. Войдите в систему или зарегистрируйтесь.
2. Нажмите на иконку пользователя в правом верхнем углу.
3. Выберите пункт "Настройки" в выпадающем меню.
4. В разделе "Язык" выберите нужный язык (Русский/English).
5. Нажмите "Сохранить".

Язык также можно сменить с помощью переключателя в нижней части меню пользователя.

### Смена темы

Для переключения между светлой и темной темой:

1. Нажмите на иконку смены темы в правом верхнем углу (рядом с меню пользователя).
2. Или в настройках пользователя выберите раздел "Внешний вид" и выберите предпочитаемую тему.

Платформа также поддерживает автоматическое переключение темы в зависимости от системных настроек.

## Документация

Полная документация доступна в директории [docs/](docs/):

- [docs/user-guide.md](docs/user-guide.md) - Руководство пользователя
- [docs/api-guide.md](docs/api-guide.md) - Документация по API

## CI/CD Пайплайн

Проект настроен для автоматического тестирования и деплоя при каждом push в основную ветку.

- GitHub Actions выполняют тесты
- При успешном прохождении всех тестов, приложение автоматически деплоится на Heroku/Vercel

## Лицензия

MIT 