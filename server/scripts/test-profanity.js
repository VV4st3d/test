require('dotenv').config();
const mongoose = require('mongoose');
const { profanityFilter, findProfanity, resetProfanityCache } = require('./utils/profanityFilter');
const ForbiddenWord = require('./models/forbiddenWord');

async function testProfanityFilter() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/web-dev-platform');
    console.log('Connected to MongoDB');

    // Сбрасываем кэш для получения свежих данных
    resetProfanityCache();

    // Получаем слова из базы данных для тестирования
    const dbWords = await ForbiddenWord.find({}).lean();
    console.log(`\nНайдено ${dbWords.length} запрещенных слов в базе данных`);

    console.log('\n========== Тест каждого слова из базы данных ==========');
    for (const wordObj of dbWords) {
      // Создаем тестовый текст, содержащий это слово
      let testText;
      if (wordObj.isRegex) {
        // Для регулярных выражений используем примеры, которые они должны находить
        if (wordObj.word.includes('к[оа]к[аеи]ин')) {
          testText = "Этот текст содержит слово кокаин.";
        } else if (wordObj.word.includes('@')) {
          testText = "Мой email: test@example.com";
        } else if (wordObj.word.includes('\\d{4}')) {
          testText = "Номер карты: 1234 5678 9012 3456";
        } else {
          testText = `Этот текст содержит слово, которое должно соответствовать регулярному выражению ${wordObj.word}`;
        }
      } else {
        // Для обычных слов вставляем их в середину предложения
        testText = `Этот текст содержит запрещенное слово ${wordObj.word} посередине.`;
      }
      
      console.log(`\nСлово: "${wordObj.word}" (${wordObj.category}, isRegex: ${wordObj.isRegex})`);
      console.log(`Тестовый текст: "${testText}"`);
      
      // Проверяем, обнаружит ли findProfanity это слово
      const found = await findProfanity(testText);
      console.log(`Найдено: ${found.length > 0 ? 'ДА' : 'НЕТ'}`);
      if (found.length > 0) {
        console.log(`  Найденные слова: ${found.join(', ')}`);
      }
      
      // Проверяем, заменит ли profanityFilter это слово
      const filtered = await profanityFilter(testText);
      console.log(`Фильтровано: ${filtered !== testText ? 'ДА' : 'НЕТ'}`);
      if (filtered !== testText) {
        console.log(`  Результат: "${filtered}"`);
      }
    }

    // Оригинальные тестовые примеры
    const testTexts = [
      "Это нормальный текст без запрещенных слов.",
      "В этом тексте есть запрещенное слово дурак.",
      "В этом тексте есть слово из встроенного списка: casino и gambling.",
      "Тут есть запрещенное слово придурок и слово из встроенного списка drugs.",
      "Тут есть тупой комментарий и спам про выигрыш.",
      "Пример с быстрые деньги и бесплатно получить.",
      "Текст с упоминанием наркотиков: марихуана и кокаин."
    ];

    console.log('\n========== Тест функции findProfanity на общих примерах ==========');
    for (const text of testTexts) {
      console.log('\nПроверяемый текст: ', text);
      const found = await findProfanity(text);
      console.log('Найдены запрещенные слова: ', found);
    }

    console.log('\n========== Тест функции profanityFilter на общих примерах ==========');
    for (const text of testTexts) {
      console.log('\nИсходный текст: ', text);
      const filtered = await profanityFilter(text);
      console.log('Фильтрованный текст: ', filtered);
    }

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    // Закрываем соединение с базой данных
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Запускаем тест
testProfanityFilter(); 