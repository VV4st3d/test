const mongoose = require('mongoose');
const Language = require('../models/language');
require('dotenv').config();

// Переводы для русского языка
const ruTranslations = {
  home: {
    title: 'Главная',
    welcome: 'Добро пожаловать на платформу обучения веб-разработке!',
    startLearning: 'Начать обучение',
    recommendedArticles: 'Рекомендуемые статьи',
    recommendedTasks: 'Рекомендуемые задания',
    yourProgress: 'Ваш прогресс'
  },
  auth: {
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Выход',
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    name: 'Имя',
    submit: 'Отправить',
    dontHaveAccount: 'Нет аккаунта?',
    alreadyHaveAccount: 'Уже есть аккаунт?'
  },
  articles: {
    title: 'Статьи',
    readMore: 'Читать далее',
    category: 'Категория',
    difficulty: 'Сложность',
    search: 'Поиск статей',
    noArticles: 'Статьи не найдены',
    addToFavorites: 'Добавить в избранное',
    removeFromFavorites: 'Удалить из избранного'
  },
  tasks: {
    title: 'Задания',
    solve: 'Решить',
    solution: 'Решение',
    submit: 'Отправить решение',
    check: 'Проверить',
    category: 'Категория',
    difficulty: 'Сложность',
    search: 'Поиск заданий',
    noTasks: 'Задания не найдены',
    result: 'Результат',
    passed: 'Тесты пройдены',
    failed: 'Тесты не пройдены'
  },
  profile: {
    title: 'Профиль',
    level: 'Уровень',
    points: 'очков',
    pointsToNextLevel: 'очков до следующего уровня',
    completedTasks: 'Решенные задания',
    favoriteArticles: 'Избранные статьи'
  },
  admin: {
    title: 'Панель администратора',
    users: 'Пользователи',
    manageArticles: 'Управление статьями',
    manageTasks: 'Управление заданиями',
    moderateComments: 'Модерация комментариев'
  },
  comments: {
    title: 'Комментарии',
    write: 'Написать комментарий',
    send: 'Отправить',
    placeholder: 'Напишите ваш комментарий...',
    noComments: 'Комментариев пока нет',
    pending: 'Ожидает модерации',
    approved: 'Одобрен',
    rejected: 'Отклонен'
  },
  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    categories: {
      html: 'HTML',
      css: 'CSS',
      javascript: 'JavaScript'
    },
    difficulties: {
      beginner: 'Начинающий',
      intermediate: 'Средний',
      advanced: 'Продвинутый'
    }
  },
  editor: {
    reset: 'Сбросить',
    copy: 'Копировать',
    copied: 'Скопировано!'
  }
};

// Переводы для английского языка
const enTranslations = {
  home: {
    title: 'Home',
    welcome: 'Welcome to the Web Development Learning Platform!',
    startLearning: 'Start Learning',
    recommendedArticles: 'Recommended Articles',
    recommendedTasks: 'Recommended Tasks',
    yourProgress: 'Your Progress'
  },
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    submit: 'Submit',
    dontHaveAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?'
  },
  articles: {
    title: 'Articles',
    readMore: 'Read More',
    category: 'Category',
    difficulty: 'Difficulty',
    search: 'Search articles',
    noArticles: 'No articles found',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites'
  },
  tasks: {
    title: 'Tasks',
    solve: 'Solve',
    solution: 'Solution',
    submit: 'Submit Solution',
    check: 'Check',
    category: 'Category',
    difficulty: 'Difficulty',
    search: 'Search tasks',
    noTasks: 'No tasks found',
    result: 'Result',
    passed: 'Tests passed',
    failed: 'Tests failed'
  },
  profile: {
    title: 'Profile',
    level: 'Level',
    points: 'points',
    pointsToNextLevel: 'points to next level',
    completedTasks: 'Completed Tasks',
    favoriteArticles: 'Favorite Articles'
  },
  admin: {
    title: 'Admin Panel',
    users: 'Users',
    manageArticles: 'Manage Articles',
    manageTasks: 'Manage Tasks',
    moderateComments: 'Moderate Comments'
  },
  comments: {
    title: 'Comments',
    write: 'Write a comment',
    send: 'Send',
    placeholder: 'Write your comment...',
    noComments: 'No comments yet',
    pending: 'Pending moderation',
    approved: 'Approved',
    rejected: 'Rejected'
  },
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    categories: {
      html: 'HTML',
      css: 'CSS',
      javascript: 'JavaScript'
    },
    difficulties: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    }
  },
  editor: {
    reset: 'Reset',
    copy: 'Copy',
    copied: 'Copied!'
  }
};

// Функция для инициализации языков в базе данных
async function seedLanguages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webdev');
    console.log('Connected to MongoDB...');

    // Удаление существующих записей о языках
    await Language.deleteMany({});

    // Создание языковых записей
    const languages = [
      {
        code: 'ru',
        name: 'Русский',
        translations: ruTranslations
      },
      {
        code: 'en',
        name: 'English',
        translations: enTranslations
      }
    ];

    await Language.insertMany(languages);
    console.log('Languages seeded successfully!');
  } catch (error) {
    console.error('Error seeding languages:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Запуск функции для добавления языков
seedLanguages(); 