const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Функция для подключения к тестовой in-memory базе данных
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

// Очистка коллекций после каждого теста
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// Закрытие соединения и остановка сервера после всех тестов
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Глобальный таймаут для всех тестов
jest.setTimeout(30000);

// Подавление предупреждений о неперехваченных промисах
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
}); 