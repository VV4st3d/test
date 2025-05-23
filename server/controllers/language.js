const Language = require('../models/language');

// Базовые переводы для русского языка
const defaultRussianTranslations = {
  'app.title': 'Web Dev Platform',
  'app.tagline': 'Учитесь, практикуйтесь, станьте профессионалом',
  'nav.home': 'Главная',
  'nav.articles': 'Статьи',
  'nav.tasks': 'Задания',
  'nav.profile': 'Профиль',
  'nav.admin': 'Админ-панель',
  'nav.login': 'Войти',
  'nav.register': 'Регистрация',
  'nav.logout': 'Выйти',
  'auth.login': 'Вход в систему',
  'auth.register': 'Регистрация',
  'auth.username': 'Имя пользователя',
  'auth.email': 'Email',
  'auth.password': 'Пароль',
  'auth.confirmPassword': 'Подтвердите пароль',
  'auth.forgotPassword': 'Забыли пароль?',
  'auth.noAccount': 'Нет аккаунта?',
  'auth.haveAccount': 'Уже есть аккаунт?',
  'auth.resetPassword': 'Сбросить пароль',
  'home.welcome': 'Добро пожаловать в Web Dev Platform',
  'home.featuredArticles': 'Рекомендуемые статьи',
  'home.popularTasks': 'Популярные задания',
  'articles.title': 'Статьи',
  'articles.filter': 'Фильтр статей',
  'articles.all': 'Все статьи',
  'articles.category': 'Категория',
  'articles.difficulty': 'Сложность',
  'articles.search': 'Поиск статей',
  'articles.noArticles': 'Статьи не найдены',
  'articles.readMore': 'Читать далее',
  'tasks.title': 'Задания',
  'tasks.filter': 'Фильтр заданий',
  'tasks.all': 'Все задания',
  'tasks.category': 'Категория',
  'tasks.difficulty': 'Сложность',
  'tasks.search': 'Поиск заданий',
  'tasks.noTasks': 'Задания не найдены',
  'tasks.solve': 'Решить',
  'profile.title': 'Профиль',
  'profile.stats': 'Статистика',
  'profile.completedTasks': 'Выполненные задания',
  'profile.points': 'Баллы',
  'profile.level': 'Уровень',
  'profile.settings': 'Настройки',
  'profile.theme': 'Тема',
  'profile.language': 'Язык',
  'profile.dark': 'Темная',
  'profile.light': 'Светлая',
  'profile.system': 'Системная',
  'admin.title': 'Панель администратора',
  'admin.users': 'Пользователи',
  'admin.articles': 'Статьи',
  'admin.tasks': 'Задания',
  'admin.comments': 'Комментарии',
  'common.save': 'Сохранить',
  'common.cancel': 'Отмена',
  'common.delete': 'Удалить',
  'common.edit': 'Редактировать',
  'common.create': 'Создать',
  'common.submit': 'Отправить',
  'common.search': 'Поиск',
  'common.filter': 'Фильтр',
  'common.sort': 'Сортировка',
  'common.loading': 'Загрузка...',
  'common.error': 'Ошибка',
  'common.success': 'Успешно',
  'common.viewAll': 'Посмотреть все',
  'common.readMore': 'Читать далее',
  'common.back': 'Назад',
  'common.next': 'Далее',
  'common.previous': 'Предыдущий',
  'common.dateCreated': 'Дата создания',
  'common.dateUpdated': 'Дата обновления',
  'error.404': 'Страница не найдена',
  'error.403': 'Доступ запрещен',
  'error.500': 'Внутренняя ошибка сервера',
  'error.goBack': 'Вернуться назад'
};

// Базовые переводы для английского языка
const defaultEnglishTranslations = {
  'app.title': 'Web Dev Platform',
  'app.tagline': 'Learn, practice, become a professional',
  'nav.home': 'Home',
  'nav.articles': 'Articles',
  'nav.tasks': 'Tasks',
  'nav.profile': 'Profile',
  'nav.admin': 'Admin Panel',
  'nav.login': 'Login',
  'nav.register': 'Register',
  'nav.logout': 'Logout',
  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.username': 'Username',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm Password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.noAccount': 'Don\'t have an account?',
  'auth.haveAccount': 'Already have an account?',
  'auth.resetPassword': 'Reset Password',
  'home.welcome': 'Welcome to Web Dev Platform',
  'home.featuredArticles': 'Featured Articles',
  'home.popularTasks': 'Popular Tasks',
  'articles.title': 'Articles',
  'articles.filter': 'Filter Articles',
  'articles.all': 'All Articles',
  'articles.category': 'Category',
  'articles.difficulty': 'Difficulty',
  'articles.search': 'Search Articles',
  'articles.noArticles': 'No articles found',
  'articles.readMore': 'Read More',
  'tasks.title': 'Tasks',
  'tasks.filter': 'Filter Tasks',
  'tasks.all': 'All Tasks',
  'tasks.category': 'Category',
  'tasks.difficulty': 'Difficulty',
  'tasks.search': 'Search Tasks',
  'tasks.noTasks': 'No tasks found',
  'tasks.solve': 'Solve',
  'profile.title': 'Profile',
  'profile.stats': 'Statistics',
  'profile.completedTasks': 'Completed Tasks',
  'profile.points': 'Points',
  'profile.level': 'Level',
  'profile.settings': 'Settings',
  'profile.theme': 'Theme',
  'profile.language': 'Language',
  'profile.dark': 'Dark',
  'profile.light': 'Light',
  'profile.system': 'System',
  'admin.title': 'Admin Panel',
  'admin.users': 'Users',
  'admin.articles': 'Articles',
  'admin.tasks': 'Tasks',
  'admin.comments': 'Comments',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.submit': 'Submit',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.viewAll': 'View All',
  'common.readMore': 'Read More',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.dateCreated': 'Date Created',
  'common.dateUpdated': 'Date Updated',
  'error.404': 'Page Not Found',
  'error.403': 'Forbidden',
  'error.500': 'Internal Server Error',
  'error.goBack': 'Go Back'
};

/**
 * Инициализация языковых переводов
 * Создает записи для ru и en языков, если они не существуют
 */
const initializeTranslations = async () => {
  try {
    // Проверяем существование русского языка
    const ruLanguage = await Language.findOne({ code: 'ru' });
    if (!ruLanguage) {
      await Language.create({
        code: 'ru',
        name: 'Русский',
        translations: defaultRussianTranslations
      });
      console.log('Созданы базовые переводы для русского языка');
    }

    // Проверяем существование английского языка
    const enLanguage = await Language.findOne({ code: 'en' });
    if (!enLanguage) {
      await Language.create({
        code: 'en',
        name: 'English',
        translations: defaultEnglishTranslations
      });
      console.log('Created default translations for English language');
    }
  } catch (error) {
    console.error('Error initializing translations:', error);
  }
};

/**
 * Получение переводов для указанного языка
 * @param {Object} req - HTTP запрос
 * @param {Object} res - HTTP ответ
 */
const getTranslations = async (req, res) => {
  try {
    const { lang } = req.params;
    
    // Проверка доступности языка (в данном случае только ru и en)
    if (!['ru', 'en'].includes(lang)) {
      return res.status(400).json({ 
        success: false,
        message: 'Unsupported language' 
      });
    }

    // Получение переводов из базы данных
    let language = await Language.findOne({ code: lang });
    
    // Если переводы не найдены, инициализируем базовые переводы
    if (!language) {
      await initializeTranslations();
      language = await Language.findOne({ code: lang });
      
      if (!language) {
        return res.status(404).json({ 
          success: false,
          message: 'Translations not found' 
        });
      }
    }

    res.json({
      success: true,
      translations: language.translations
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

module.exports = {
  getTranslations,
  initializeTranslations
}; 