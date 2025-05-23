require('dotenv').config();
const mongoose = require('mongoose');
const Language = require('../models/language');

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

async function main() {
  try {
    // Подключение к базе данных
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');

    // Проверяем существование английского языка
    const enLanguage = await Language.findOne({ code: 'en' });
    if (enLanguage) {
      console.log('English translations already exist, updating...');
      await Language.findOneAndUpdate(
        { code: 'en' },
        { translations: defaultEnglishTranslations }
      );
    } else {
      console.log('Creating English translations...');
      await Language.create({
        code: 'en',
        name: 'English',
        translations: defaultEnglishTranslations
      });
    }

    console.log('English translations added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 