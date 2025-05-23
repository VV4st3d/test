const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Загрузка переменных окружения из .env файла
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Путь к файлу с данными для импорта
const IMPORT_FILE = path.join(__dirname, 'articles-to-import.json');

// Проверка, что MONGO_URI определен
if (!process.env.MONGO_URI) {
  console.error('Ошибка: отсутствует MONGO_URI в файле .env');
  process.exit(1);
}

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB подключена'))
.catch(err => {
  console.error('Ошибка подключения к MongoDB:', err.message);
  process.exit(1);
});

// Импортируем модели напрямую
const userSchema = require('../../server/models/user').schema;
const articleSchema = require('../../server/models/article').schema;

// Регистрируем модели
const User = mongoose.model('User', userSchema);
const Article = mongoose.model('Article', articleSchema);

// Функция импорта статей
async function importArticles() {
  try {
    // Чтение данных из файла
    const articlesData = JSON.parse(fs.readFileSync(IMPORT_FILE, 'utf8'));
    
    console.log(`Прочитано ${articlesData.length} статей из файла ${IMPORT_FILE}`);
    
    // Валидация данных
    for (const article of articlesData) {
      if (!article.translations?.ru?.title || !article.translations?.ru?.content ||
          !article.translations?.en?.title || !article.translations?.en?.content) {
        console.error('Ошибка: отсутствуют обязательные поля в статье:', 
          article.translations?.ru?.title || article.translations?.en?.title || 'Без названия');
        return;
      }
      
      if (!article.category) {
        console.error('Ошибка: отсутствует категория в статье:', 
          article.translations.ru.title || article.translations.en.title);
        return;
      }
      
      if (!['beginner', 'intermediate', 'advanced'].includes(article.difficulty)) {
        console.error('Ошибка: некорректное значение сложности в статье:', 
          article.translations.ru.title, '(должно быть beginner, intermediate или advanced)');
        return;
      }
    }
    
    // Получаем администратора по email
    const adminUser = await User.findOne({ email: 'admin@webdev.ru' });
    
    if (!adminUser) {
      console.error('Ошибка: не найден пользователь с email admin@webdev.ru');
      return;
    }
    
    return importArticlesWithAdmin(articlesData, adminUser);
  } catch (err) {
    console.error('Ошибка при чтении файла или импорте данных:', err);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.connection.close();
    console.log('Соединение с MongoDB закрыто');
  }
}

// Вспомогательная функция для импорта с указанным админом
async function importArticlesWithAdmin(articlesData, adminUser) {
  console.log(`Используем администратора: ${adminUser.name} (ID: ${adminUser._id})`);
    
  // Импорт статей
  let successCount = 0;
  
  for (const articleData of articlesData) {
    try {
      // Добавляем ID автора (администратора)
      const data = {
        ...articleData,
        author: adminUser._id
      };
      
      // Проверяем, существует ли статья с таким же заголовком
      const existingArticle = await Article.findOne({
        $or: [
          { 'translations.ru.title': data.translations.ru.title },
          { 'translations.en.title': data.translations.en.title }
        ]
      });
      
      if (existingArticle) {
        console.log(`Статья "${data.translations.ru.title}" уже существует, пропускаем`);
        continue;
      }
      
      // Создаем новую статью
      const newArticle = await Article.create(data);
      
      console.log(`Статья "${newArticle.translations.ru.title}" успешно добавлена (ID: ${newArticle._id})`);
      successCount++;
    } catch (err) {
      console.error(`Ошибка при импорте статьи: ${err.message}`);
      if (articleData.translations?.ru?.title) {
        console.error(`  Название статьи: ${articleData.translations.ru.title}`);
      }
    }
  }
  
  console.log(`Импорт завершен. Успешно импортировано ${successCount} из ${articlesData.length} статей`);
}

// Запускаем импорт
importArticles().catch(err => {
  console.error('Необработанная ошибка:', err);
  process.exit(1);
}); 