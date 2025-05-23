# Документация API Web Dev Platform

## Содержание

- [Введение](#введение)
- [Аутентификация](#аутентификация)
- [Эндпоинты пользователей](#эндпоинты-пользователей)
- [Эндпоинты статей](#эндпоинты-статей)

## Введение

Этот документ содержит полное описание REST API платформы Web Dev Platform. API обеспечивает доступ к основным функциям платформы, включая управление пользователями, статьями, заданиями и другими данными.

### Базовый URL

```
https://api.example.com
```

Для локальной разработки:

```
http://localhost:5000
```

### Формат ответов

API возвращает данные в формате JSON. Типичный ответ имеет следующую структуру:

Успешный ответ:
```json
{
  "success": true,
  "data": { ... }
}
```

Ответ с ошибкой:
```json
{
  "success": false,
  "message": "Описание ошибки"
}
```

### Коды состояния HTTP

API использует стандартные HTTP-коды для индикации статуса запроса:

- `200 OK` - запрос выполнен успешно
- `201 Created` - ресурс успешно создан
- `400 Bad Request` - ошибка в запросе
- `401 Unauthorized` - требуется аутентификация
- `403 Forbidden` - доступ запрещен
- `404 Not Found` - ресурс не найден
- `500 Internal Server Error` - внутренняя ошибка сервера

## Аутентификация

API использует JWT (JSON Web Tokens) для аутентификации запросов. Для доступа к защищенным эндпоинтам включите полученный токен в заголовок Authorization:

```
Authorization: Bearer <ваш_токен>
```

### Регистрация пользователя

**Запрос:**

```
POST /api/auth/register
```

**Тело запроса:**

```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "secure_password"
}
```

**Ответ:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "5f8d0f...",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "user",
    "trustLevel": 1
  }
}
```

### Вход в систему

**Запрос:**

```
POST /api/auth/login
```

**Тело запроса:**

```json
{
  "email": "ivan@example.com",
  "password": "secure_password"
}
```

**Ответ:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "5f8d0f...",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "user",
    "trustLevel": 1
  }
}
```

### Получение данных текущего пользователя

**Запрос:**

```
GET /api/auth/me
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "user": {
    "id": "5f8d0f...",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "user",
    "trustLevel": 1,
    "completedTasks": 5,
    "favorites": 3,
    "createdAt": "2023-01-15T12:00:00Z"
  }
}
```

### Обновление профиля пользователя

**Запрос:**

```
PUT /api/auth/profile
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "name": "Иван Петров",
  "email": "ivan.petrov@example.com"
}
```

**Ответ:**

```json
{
  "success": true,
  "user": {
    "id": "5f8d0f...",
    "name": "Иван Петров",
    "email": "ivan.petrov@example.com",
    "role": "user",
    "trustLevel": 1
  }
}
```

### Обновление пароля

**Запрос:**

```
PUT /api/auth/password
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "currentPassword": "secure_password",
  "newPassword": "new_secure_password"
}
```

**Ответ:**

```json
{
  "success": true,
  "message": "Пароль успешно обновлен",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Эндпоинты пользователей

### Получение списка пользователей (только для админов)

**Запрос:**

```
GET /api/users
```

**Заголовки:**

```
Authorization: Bearer <токен_админа>
```

**Параметры запроса:**

```
page - номер страницы (по умолчанию 1)
limit - количество пользователей на странице (по умолчанию 10)
```

**Ответ:**

```json
{
  "success": true,
  "users": [
    {
      "id": "5f8d0f...",
      "name": "Иван Петров",
      "email": "ivan.petrov@example.com",
      "role": "user",
      "trustLevel": 1,
      "createdAt": "2023-01-15T12:00:00Z"
    },
    {
      "id": "5f8d1a...",
      "name": "Анна Сидорова",
      "email": "anna@example.com",
      "role": "admin",
      "trustLevel": 5,
      "createdAt": "2023-01-10T10:00:00Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalUsers": 42
}
```

### Получение пользователя по ID

**Запрос:**

```
GET /api/users/:id
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "user": {
    "id": "5f8d0f...",
    "name": "Иван Петров",
    "role": "user",
    "trustLevel": 1,
    "createdAt": "2023-01-15T12:00:00Z",
    "completedTasks": 5
  }
}
```

### Обновление роли пользователя (только для админов)

**Запрос:**

```
PUT /api/users/:id/role
```

**Заголовки:**

```
Authorization: Bearer <токен_админа>
```

**Тело запроса:**

```json
{
  "role": "moderator",
  "trustLevel": 3
}
```

**Ответ:**

```json
{
  "success": true,
  "user": {
    "id": "5f8d0f...",
    "name": "Иван Петров",
    "role": "moderator",
    "trustLevel": 3
  }
}
```

## Эндпоинты статей

### Получение списка статей

**Запрос:**

```
GET /api/articles
```

**Параметры запроса:**

```
category - фильтр по категории
difficulty - фильтр по сложности (Начальный, Средний, Продвинутый)
search - поисковый запрос
page - номер страницы (по умолчанию 1)
limit - количество статей на странице (по умолчанию 9)
```

**Ответ:**

```json
{
  "success": true,
  "articles": [
    {
      "id": "6a1b2c...",
      "title": "Введение в HTML",
      "description": "Основы HTML для начинающих",
      "category": "HTML",
      "difficulty": "Начальный",
      "author": {
        "id": "5f8d1a...",
        "name": "Анна Сидорова"
      },
      "views": 1250,
      "createdAt": "2023-02-10T14:30:00Z",
      "updatedAt": "2023-02-15T09:20:00Z"
    },
    {
      "id": "6a1b3d...",
      "title": "CSS Flexbox",
      "description": "Подробное руководство по CSS Flexbox",
      "category": "CSS",
      "difficulty": "Средний",
      "author": {
        "id": "5f8d1a...",
        "name": "Анна Сидорова"
      },
      "views": 980,
      "createdAt": "2023-02-12T11:15:00Z",
      "updatedAt": "2023-02-14T16:45:00Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 8,
  "totalArticles": 72
}
```

### Получение конкретной статьи

**Запрос:**

```
GET /api/articles/:id
```

**Ответ:**

```json
{
  "success": true,
  "article": {
    "id": "6a1b2c...",
    "title": "Введение в HTML",
    "description": "Основы HTML для начинающих",
    "content": "# Введение в HTML\n\nHTML (HyperText Markup Language) - это стандартный язык разметки для создания веб-страниц...",
    "category": "HTML",
    "difficulty": "Начальный",
    "author": {
      "id": "5f8d1a...",
      "name": "Анна Сидорова"
    },
    "views": 1251,
    "comments": [
      {
        "id": "7c1d2e...",
        "text": "Отличная статья для начинающих!",
        "author": {
          "id": "5f8d0f...",
          "name": "Иван Петров"
        },
        "createdAt": "2023-02-16T10:20:00Z"
      }
    ],
    "createdAt": "2023-02-10T14:30:00Z",
    "updatedAt": "2023-02-15T09:20:00Z",
    "isFavorite": false
  }
}
```

### Создание статьи

**Запрос:**

```
POST /api/articles
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "title": "JavaScript Promises",
  "description": "Полное руководство по работе с промисами в JavaScript",
  "content": "# JavaScript Promises\n\nPromises - это объекты, представляющие промежуточный результат асинхронной операции...",
  "category": "JavaScript",
  "difficulty": "Средний",
  "imageUrl": "https://example.com/images/js-promises.jpg"
}
```

**Ответ:**

```json
{
  "success": true,
  "article": {
    "id": "6a1b4e...",
    "title": "JavaScript Promises",
    "description": "Полное руководство по работе с промисами в JavaScript",
    "category": "JavaScript",
    "difficulty": "Средний",
    "author": {
      "id": "5f8d0f...",
      "name": "Иван Петров"
    },
    "views": 0,
    "createdAt": "2023-03-01T15:45:00Z",
    "updatedAt": "2023-03-01T15:45:00Z",
    "isPublished": false
  }
}
```

### Обновление статьи

**Запрос:**

```
PUT /api/articles/:id
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "title": "JavaScript Promises и Async/Await",
  "description": "Полное руководство по работе с промисами и async/await в JavaScript",
  "content": "# JavaScript Promises и Async/Await\n\nPromises - это объекты, представляющие промежуточный результат асинхронной операции...",
  "category": "JavaScript",
  "difficulty": "Средний",
  "imageUrl": "https://example.com/images/js-promises-update.jpg"
}
```

**Ответ:**

```json
{
  "success": true,
  "article": {
    "id": "6a1b4e...",
    "title": "JavaScript Promises и Async/Await",
    "description": "Полное руководство по работе с промисами и async/await в JavaScript",
    "category": "JavaScript",
    "difficulty": "Средний",
    "author": {
      "id": "5f8d0f...",
      "name": "Иван Петров"
    },
    "views": 0,
    "createdAt": "2023-03-01T15:45:00Z",
    "updatedAt": "2023-03-01T16:30:00Z",
    "isPublished": false
  }
}
```

### Удаление статьи

**Запрос:**

```
DELETE /api/articles/:id
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "message": "Статья успешно удалена"
}
```

### Добавление статьи в избранное

**Запрос:**

```
POST /api/articles/:id/favorite
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "message": "Статья добавлена в избранное",
  "isFavorite": true
}
```

### Удаление статьи из избранного

**Запрос:**

```
DELETE /api/articles/:id/favorite
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "message": "Статья удалена из избранного",
  "isFavorite": false
}
```

### Проверка статуса избранного

**Запрос:**

```
GET /api/articles/:id/favorite
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "isFavorite": true
}
```

### Получение списка избранных статей

**Запрос:**

```
GET /api/articles/favorites
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "favorites": [
    {
      "id": "6a1b2c...",
      "title": "Введение в HTML",
      "description": "Основы HTML для начинающих",
      "category": "HTML",
      "difficulty": "Начальный",
      "author": {
        "id": "5f8d1a...",
        "name": "Анна Сидорова"
      },
      "views": 1251,
      "updatedAt": "2023-02-15T09:20:00Z"
    },
    {
      "id": "6a1b3d...",
      "title": "CSS Flexbox",
      "description": "Подробное руководство по CSS Flexbox",
      "category": "CSS",
      "difficulty": "Средний",
      "author": {
        "id": "5f8d1a...",
        "name": "Анна Сидорова"
      },
      "views": 980,
      "updatedAt": "2023-02-14T16:45:00Z"
    }
  ]
} 