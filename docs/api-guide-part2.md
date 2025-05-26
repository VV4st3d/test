# Документация API Web Dev Platform (Часть 2)

## Содержание

- [Эндпоинты заданий](#эндпоинты-заданий)
- [Эндпоинты комментариев](#эндпоинты-комментариев)
- [Эндпоинты прогресса](#эндпоинты-прогресса)
- [Эндпоинты тем](#эндпоинты-тем)
- [Обработка ошибок](#обработка-ошибок)
- [Ограничения и лимиты](#ограничения-и-лимиты)

## Эндпоинты заданий

### Получение списка заданий

**Запрос:**

```
GET /api/tasks
```

**Параметры запроса:**

```
category - фильтр по категории
difficulty - фильтр по сложности (Начальный, Средний, Продвинутый)
search - поисковый запрос
page - номер страницы (по умолчанию 1)
limit - количество заданий на странице (по умолчанию 9)
```

**Ответ:**

```json
{
  "success": true,
  "tasks": [
    {
      "id": "7b2c3d...",
      "title": "Создание простой HTML-страницы",
      "description": "Задание на создание базовой HTML-структуры",
      "category": "HTML",
      "difficulty": "Начальный",
      "author": {
        "id": "5f8d1a...",
        "name": "Анна Сидорова"
      },
      "createdAt": "2023-02-05T10:30:00Z",
      "updatedAt": "2023-02-06T14:20:00Z"
    },
    {
      "id": "7b2c4e...",
      "title": "Стилизация с CSS",
      "description": "Задание по базовой стилизации HTML-элементов",
      "category": "CSS",
      "difficulty": "Начальный",
      "author": {
        "id": "5f8d1a...",
        "name": "Анна Сидорова"
      },
      "createdAt": "2023-02-07T11:15:00Z",
      "updatedAt": "2023-02-08T09:40:00Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 6,
  "totalTasks": 50
}
```

### Получение конкретного задания

**Запрос:**

```
GET /api/tasks/:id
```

**Заголовки (опционально):**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "task": {
    "id": "7b2c3d...",
    "title": "Создание простой HTML-страницы",
    "description": "Задание на создание базовой HTML-структуры",
    "category": "HTML",
    "difficulty": "Начальный",
    "requirements": [
      "Создайте валидную HTML5 страницу",
      "Добавьте заголовок, параграф и список",
      "Используйте семантические теги"
    ],
    "author": {
      "id": "5f8d1a...",
      "name": "Анна Сидорова"
    },
    "template": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Моя страница</title>\n</head>\n<body>\n  <!-- Ваш код здесь -->\n</body>\n</html>",
    "examples": [
      {
        "input": "Пример входных данных",
        "output": "Пример ожидаемого результата"
      }
    ],
    "tests": [
      {
        "description": "Проверка наличия тега h1",
        "input": "Тестовые данные для проверки"
      }
    ],
    "comments": [
      {
        "id": "8c2d3e...",
        "text": "Отличное задание для новичков!",
        "author": {
          "id": "5f8d0f...",
          "name": "Иван Петров"
        },
        "createdAt": "2023-02-10T14:30:00Z"
      }
    ],
    "createdAt": "2023-02-05T10:30:00Z",
    "updatedAt": "2023-02-06T14:20:00Z",
    "isCompleted": false
  }
}
```

### Проверка решения задания

**Запрос:**

```
POST /api/tasks/:id/check
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "solution": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Моя страница</title>\n</head>\n<body>\n  <h1>Заголовок страницы</h1>\n  <p>Параграф с текстом</p>\n  <ul>\n    <li>Пункт 1</li>\n    <li>Пункт 2</li>\n  </ul>\n</body>\n</html>"
}
```

**Ответ (успешное решение):**

```json
{
  "success": true,
  "message": "Все тесты пройдены успешно!",
  "points": 10
}
```

**Ответ (с ошибками):**

```json
{
  "success": false,
  "errors": [
    "Тест не пройден: Проверка наличия тега h1",
    "Тест не пройден: Проверка наличия списка"
  ]
}
```

### Создание задания (только для админов)

**Запрос:**

```
POST /api/tasks
```

**Заголовки:**

```
Authorization: Bearer <токен_админа>
```

**Тело запроса:**

```json
{
  "title": "Сортировка массива",
  "description": "Задание на реализацию алгоритма сортировки",
  "category": "JavaScript",
  "difficulty": "Средний",
  "requirements": [
    "Реализуйте функцию сортировки массива чисел",
    "Алгоритм должен иметь сложность O(n log n)",
    "Не используйте встроенный метод sort()"
  ],
  "template": "function sortArray(arr) {\n  // Ваш код здесь\n}",
  "examples": [
    {
      "input": "[5, 3, 8, 1, 2]",
      "output": "[1, 2, 3, 5, 8]"
    }
  ],
  "tests": [
    {
      "description": "Сортировка массива с положительными числами",
      "input": "[5, 3, 8, 1, 2]",
      "expectedOutput": "[1, 2, 3, 5, 8]",
      "testCode": "return JSON.stringify(sortArray([5, 3, 8, 1, 2])) === JSON.stringify([1, 2, 3, 5, 8]);"
    },
    {
      "description": "Сортировка массива с отрицательными числами",
      "input": "[-5, -3, -8, -1, -2]",
      "expectedOutput": "[-8, -5, -3, -2, -1]",
      "testCode": "return JSON.stringify(sortArray([-5, -3, -8, -1, -2])) === JSON.stringify([-8, -5, -3, -2, -1]);"
    }
  ]
}
```

**Ответ:**

```json
{
  "success": true,
  "task": {
    "id": "7b2c5f...",
    "title": "Сортировка массива",
    "description": "Задание на реализацию алгоритма сортировки",
    "category": "JavaScript",
    "difficulty": "Средний",
    "author": {
      "id": "5f8d1a...",
      "name": "Анна Сидорова"
    },
    "createdAt": "2023-03-05T14:20:00Z",
    "updatedAt": "2023-03-05T14:20:00Z",
    "isPublished": false
  }
}
```

### Обновление задания (только для админов)

**Запрос:**

```
PUT /api/tasks/:id
```

**Заголовки:**

```
Authorization: Bearer <токен_админа>
```

**Тело запроса:**

```json
{
  "title": "Быстрая сортировка массива",
  "description": "Задание на реализацию алгоритма быстрой сортировки",
  "category": "JavaScript",
  "difficulty": "Средний",
  "requirements": [
    "Реализуйте функцию быстрой сортировки массива чисел",
    "Алгоритм должен иметь сложность O(n log n)",
    "Не используйте встроенный метод sort()"
  ],
  "isPublished": true
}
```

**Ответ:**

```json
{
  "success": true,
  "task": {
    "id": "7b2c5f...",
    "title": "Быстрая сортировка массива",
    "description": "Задание на реализацию алгоритма быстрой сортировки",
    "category": "JavaScript",
    "difficulty": "Средний",
    "author": {
      "id": "5f8d1a...",
      "name": "Анна Сидорова"
    },
    "createdAt": "2023-03-05T14:20:00Z",
    "updatedAt": "2023-03-05T15:10:00Z",
    "isPublished": true
  }
}
```

### Удаление задания (только для админов)

**Запрос:**

```
DELETE /api/tasks/:id
```

**Заголовки:**

```
Authorization: Bearer <токен_админа>
```

**Ответ:**

```json
{
  "success": true,
  "message": "Задание успешно удалено"
}
```

## Эндпоинты комментариев

### Добавление комментария к статье

**Запрос:**

```
POST /api/comments/article/:articleId
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "text": "Отличная статья! Очень подробно и понятно объяснено."
}
```

**Ответ:**

```json
{
  "success": true,
  "comment": {
    "id": "8c2d3e...",
    "text": "Отличная статья! Очень подробно и понятно объяснено.",
    "article": "6a1b2c...",
    "author": {
      "id": "5f8d0f...",
      "name": "Иван Петров"
    },
    "createdAt": "2023-03-10T11:45:00Z"
  }
}
```

### Ответ на комментарий

**Запрос:**

```
POST /api/comments/:commentId/reply
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "text": "Да, в этой статье очень хорошо объяснены основные концепции!"
}
```

**Ответ:**

```json
{
  "success": true,
  "comment": {
    "id": "8c2d5g...",
    "text": "Да, в этой статье очень хорошо объяснены основные концепции!",
    "parentComment": "8c2d4f...",
    "article": "6a1b4e...",
    "author": {
      "id": "5f8d1a...",
      "name": "Анна Сидорова"
    },
    "createdAt": "2023-03-10T13:05:00Z"
  }
}
```

### Редактирование комментария

**Запрос:**

```
PUT /api/comments/:id
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "text": "Очень интересная статья! Подскажите, где можно найти больше информации по этой теме?"
}
```

**Ответ:**

```json
{
  "success": true,
  "comment": {
    "id": "8c2d4f...",
    "text": "Очень интересная статья! Подскажите, где можно найти больше информации по этой теме?",
    "article": "6a1b4e...",
    "author": {
      "id": "5f8d0f...",
      "name": "Иван Петров"
    },
    "createdAt": "2023-03-10T12:15:00Z",
    "updatedAt": "2023-03-10T12:25:00Z"
  }
}
```

### Удаление комментария

**Запрос:**

```
DELETE /api/comments/:id
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "message": "Комментарий успешно удален"
}
```

## Эндпоинты прогресса

### Получение статистики прогресса пользователя

**Запрос:**

```
GET /api/progress
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "progress": {
    "totalPoints": 180,
    "level": 5,
    "completedTasks": 15,
    "completionByCategory": {
      "HTML": 5,
      "CSS": 4,
      "JavaScript": 6
    },
    "completionByDifficulty": {
      "Начальный": 8,
      "Средний": 5,
      "Продвинутый": 2
    },
    "recentActivities": [
      {
        "type": "task_completed",
        "task": {
          "id": "7b2c5f...",
          "title": "Быстрая сортировка массива",
          "category": "JavaScript"
        },
        "points": 20,
        "date": "2023-03-10T10:30:00Z"
      },
      {
        "type": "article_read",
        "article": {
          "id": "6a1b4e...",
          "title": "JavaScript Promises и Async/Await",
          "category": "JavaScript"
        },
        "date": "2023-03-09T14:45:00Z"
      }
    ]
  }
}
```

### Получение списка выполненных заданий

**Запрос:**

```
GET /api/progress/completed-tasks
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Параметры запроса:**

```
page - номер страницы (по умолчанию 1)
limit - количество заданий на странице (по умолчанию 10)
```

**Ответ:**

```json
{
  "success": true,
  "completedTasks": [
    {
      "taskId": "7b2c5f...",
      "title": "Быстрая сортировка массива",
      "category": "JavaScript",
      "difficulty": "Средний",
      "points": 20,
      "completedAt": "2023-03-10T10:30:00Z"
    },
    {
      "taskId": "7b2c4e...",
      "title": "Стилизация с CSS",
      "category": "CSS",
      "difficulty": "Начальный",
      "points": 10,
      "completedAt": "2023-03-08T16:20:00Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 2,
  "totalCompletedTasks": 15
}
```

### Получение рейтинга пользователей

**Запрос:**

```
GET /api/progress/leaderboard
```

**Параметры запроса:**

```
period - период рейтинга (week, month, all) - по умолчанию all
limit - количество пользователей в рейтинге (по умолчанию 10)
```

**Ответ:**

```json
{
  "success": true,
  "leaderboard": [
    {
      "userId": "5f8d1a...",
      "name": "Анна Сидорова",
      "points": 520,
      "level": 12,
      "completedTasks": 42,
      "rank": 1
    },
    {
      "userId": "5f8d0f...",
      "name": "Иван Петров",
      "points": 320,
      "level": 8,
      "completedTasks": 28,
      "rank": 2
    },
    {
      "userId": "5f8d2b...",
      "name": "Дмитрий Козлов",
      "points": 280,
      "level": 7,
      "completedTasks": 24,
      "rank": 3
    }
  ],
  "yourRank": 2
}
```

## Эндпоинты тем

### Получение текущей темы пользователя

**Запрос:**

```
GET /api/theme
```

**Заголовки (опционально):**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "theme": "light",
  "isSystemDefault": false
}
```

### Обновление темы пользователя

**Запрос:**

```
PUT /api/theme
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "theme": "dark",
  "isSystemDefault": false
}
```

**Ответ:**

```json
{
  "success": true,
  "theme": "dark",
  "isSystemDefault": false
}
```

### Получение настроек языка пользователя

**Запрос:**

```
GET /api/language
```

**Заголовки (опционально):**

```
Authorization: Bearer <ваш_токен>
```

**Ответ:**

```json
{
  "success": true,
  "language": "ru"
}
```

### Обновление языка пользователя

**Запрос:**

```
PUT /api/language
```

**Заголовки:**

```
Authorization: Bearer <ваш_токен>
```

**Тело запроса:**

```json
{
  "language": "en"
}
```

**Ответ:**

```json
{
  "success": true,
  "language": "en"
}
```

## Обработка ошибок

API возвращает стандартизированные сообщения об ошибках в следующем формате:

```json
{
  "success": false,
  "message": "Описание ошибки",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

### Общие коды ошибок

- `INVALID_CREDENTIALS` - неверные учетные данные
- `UNAUTHORIZED` - требуется авторизация
- `FORBIDDEN` - доступ запрещен
- `NOT_FOUND` - ресурс не найден
- `VALIDATION_ERROR` - ошибка валидации данных
- `SERVER_ERROR` - внутренняя ошибка сервера

### Примеры ошибок

**Ошибка аутентификации:**

```json
{
  "success": false,
  "message": "Неверный email или пароль",
  "error": {
    "code": "INVALID_CREDENTIALS"
  }
}
```

**Ошибка валидации:**

```json
{
  "success": false,
  "message": "Ошибка валидации данных",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Некорректный формат email",
      "password": "Пароль должен содержать минимум 8 символов"
    }
  }
}
```

## Ограничения и лимиты

- **Лимит запросов**: 100 запросов в минуту для обычных эндпоинтов, 10 запросов в минуту для эндпоинтов аутентификации
- **Размер запроса**: максимальный размер JSON-тела запроса - 10МБ
- **Кэширование**: GET-запросы кэшируются на 60 секунд, если не указано иное
- **Пагинация**: максимальное значение limit для пагинации - 100 элементов 