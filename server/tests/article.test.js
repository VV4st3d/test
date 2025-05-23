const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Article = require('../models/article');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

describe('Articles API', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;
  let articleId;

  beforeEach(async () => {
    // Создаем тестового админа
    const admin = await User.create({
      name: 'Админ',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminId = admin._id;
    
    // Создаем обычного пользователя
    const user = await User.create({
      name: 'Пользователь',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });
    userId = user._id;
    
    // Создаем токены для обоих пользователей
    adminToken = jwt.sign(
      { id: adminId },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
    
    userToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
    
    // Создаем тестовую статью
    const article = await Article.create({
      title: 'Тестовая статья',
      description: 'Краткое описание тестовой статьи',
      content: 'Содержание тестовой статьи',
      category: 'JavaScript',
      difficulty: 2,
      author: adminId,
      isPublished: true
    });
    articleId = article._id;
  });

  describe('GET /api/articles', () => {
    it('должен вернуть список опубликованных статей', async () => {
      const response = await request(app).get('/api/articles');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('articles');
      expect(Array.isArray(response.body.articles)).toBeTruthy();
      expect(response.body.articles.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage');
    });
    
    it('должен фильтровать статьи по категории', async () => {
      // Создаем статью с другой категорией
      await Article.create({
        title: 'Статья про CSS',
        description: 'Описание статьи про CSS',
        content: 'Содержание статьи про CSS',
        category: 'CSS',
        difficulty: 1,
        author: adminId,
        isPublished: true
      });
      
      const response = await request(app)
        .get('/api/articles')
        .query({ category: 'JavaScript' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.articles.every(article => article.category === 'JavaScript')).toBeTruthy();
    });
    
    it('должен искать статьи по поисковому запросу', async () => {
      // Создаем статью с другим заголовком
      await Article.create({
        title: 'Уникальный заголовок',
        description: 'Описание статьи с уникальным заголовком',
        content: 'Содержание статьи с уникальным заголовком',
        category: 'JavaScript',
        difficulty: 1,
        author: adminId,
        isPublished: true
      });
      
      const response = await request(app)
        .get('/api/articles')
        .query({ search: 'уникальный' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.articles.some(article => article.title.includes('Уникальный'))).toBeTruthy();
    });
  });

  describe('GET /api/articles/:id', () => {
    it('должен вернуть статью по id', async () => {
      const response = await request(app).get(`/api/articles/${articleId}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('_id', articleId.toString());
      expect(response.body).toHaveProperty('title', 'Тестовая статья');
      expect(response.body).toHaveProperty('content', 'Содержание тестовой статьи');
    });
    
    it('должен вернуть ошибку при запросе несуществующей статьи', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/articles/${fakeId}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/articles', () => {
    it('должен создать новую статью (администратор)', async () => {
      const newArticle = {
        title: 'Новая статья',
        description: 'Описание новой статьи',
        content: 'Содержание новой статьи',
        category: 'React',
        difficulty: 3
      };
      
      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newArticle);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', 'Новая статья');
      expect(response.body).toHaveProperty('isPublished', true); // Для админа должна быть сразу опубликована
      
      // Проверяем, что статья создана в базе
      const createdArticle = await Article.findById(response.body._id);
      expect(createdArticle).toBeTruthy();
      expect(createdArticle.author.toString()).toBe(adminId.toString());
    });
    
    it('должен запретить создание статьи неавторизованному пользователю', async () => {
      const newArticle = {
        title: 'Новая статья',
        description: 'Описание новой статьи',
        content: 'Содержание новой статьи',
        category: 'React',
        difficulty: 3
      };
      
      const response = await request(app)
        .post('/api/articles')
        .send(newArticle);
      
      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/articles/:id', () => {
    it('должен обновить статью (автор)', async () => {
      const updates = {
        title: 'Обновленный заголовок',
        description: 'Обновленное описание'
      };
      
      const response = await request(app)
        .put(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${adminToken}`) // adminId - автор статьи
        .send(updates);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('title', 'Обновленный заголовок');
      expect(response.body).toHaveProperty('description', 'Обновленное описание');
      
      // Проверяем обновление в базе
      const updatedArticle = await Article.findById(articleId);
      expect(updatedArticle.title).toBe('Обновленный заголовок');
    });
    
    it('должен запретить обновление статьи не автору', async () => {
      const updates = {
        title: 'Попытка обновления'
      };
      
      const response = await request(app)
        .put(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${userToken}`) // userToken - не автор статьи
        .send(updates);
      
      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/articles/:id', () => {
    it('должен удалить статью (администратор)', async () => {
      const response = await request(app)
        .delete(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      
      // Проверяем, что статья удалена
      const deletedArticle = await Article.findById(articleId);
      expect(deletedArticle).toBeNull();
    });
    
    it('должен запретить удаление статьи обычному пользователю', async () => {
      const response = await request(app)
        .delete(`/api/articles/${articleId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.statusCode).toBe(403);
      
      // Проверяем, что статья не удалена
      const article = await Article.findById(articleId);
      expect(article).toBeTruthy();
    });
  });

  describe('POST /api/articles/:id/favorite', () => {
    it('должен добавить статью в избранное', async () => {
      const response = await request(app)
        .post(`/api/articles/${articleId}/favorite`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('isFavorite', true);
      
      // Проверяем, что статья добавлена в избранное у пользователя
      const user = await User.findById(userId);
      expect(user.favorites.some(id => id.toString() === articleId.toString())).toBeTruthy();
    });
    
    it('должен удалить статью из избранного, если она уже там есть', async () => {
      // Сначала добавляем в избранное
      await User.findByIdAndUpdate(userId, {
        $push: { favorites: articleId }
      });
      
      const response = await request(app)
        .post(`/api/articles/${articleId}/favorite`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('isFavorite', false);
      
      // Проверяем, что статья удалена из избранного
      const user = await User.findById(userId);
      expect(user.favorites.some(id => id.toString() === articleId.toString())).toBeFalsy();
    });
  });
}); 