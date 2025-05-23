const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server'); // Предполагаем, что сервер экспортирует app
const User = require('../models/user');
const jwt = require('jsonwebtoken');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('должен зарегистрировать нового пользователя', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Тестовый Пользователь',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe('Тестовый Пользователь');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');

      // Проверка сохранения в базе данных
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('Тестовый Пользователь');
    });

    it('должен вернуть ошибку при отсутствии обязательных полей', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Тестовый Пользователь',
          email: 'test@example.com'
          // Не отправляем пароль
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('должен вернуть ошибку при использовании уже зарегистрированного email', async () => {
      // Создаем пользователя
      await User.create({
        name: 'Существующий Пользователь',
        email: 'existing@example.com',
        password: 'password123'
      });

      // Пытаемся создать пользователя с тем же email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Новый Пользователь',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('уже существует');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Создаем тестового пользователя перед каждым тестом
      const password = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Тестовый Пользователь',
        email: 'test@example.com',
        password
      });
    });

    it('должен авторизовать пользователя с правильными учетными данными', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('должен вернуть ошибку при неверном email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('должен вернуть ошибку при неверном пароле', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Создаем пользователя
      const user = await User.create({
        name: 'Тестовый Пользователь',
        email: 'test@example.com',
        password: 'password123'
      });
      
      userId = user._id;
      
      // Создаем токен для авторизации
      token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
      );
    });

    it('должен вернуть данные авторизованного пользователя', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user._id).toBe(userId.toString());
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('должен вернуть ошибку при отсутствии токена', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('должен вернуть ошибку при недействительном токене', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });
}); 