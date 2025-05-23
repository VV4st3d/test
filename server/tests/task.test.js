const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Task = require('../models/task');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

describe('Tasks API', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;
  let taskId;

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
    
    // Создаем тестовую задачу
    const task = await Task.create({
      title: 'Тестовая задача',
      description: 'Описание тестовой задачи',
      category: 'JavaScript',
      difficulty: 2,
      author: adminId,
      isPublished: true,
      template: 'function solution() { /* Ваш код здесь */ }',
      tests: [
        {
          description: 'Тест 1',
          testCode: 'return solution() === true;',
          expectedOutput: true
        }
      ],
      requirements: ['Решение должно использовать функцию solution']
    });
    taskId = task._id;
  });

  describe('GET /api/tasks', () => {
    it('должен вернуть список задач', async () => {
      const response = await request(app).get('/api/tasks');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('tasks');
      expect(Array.isArray(response.body.tasks)).toBeTruthy();
      expect(response.body.tasks.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage');
    });
    
    it('должен фильтровать задачи по категории', async () => {
      // Создаем задачу с другой категорией
      await Task.create({
        title: 'Задача по CSS',
        description: 'Описание задачи по CSS',
        category: 'CSS',
        difficulty: 1,
        author: adminId,
        isPublished: true,
        template: 'function solution() { }',
        tests: [{ 
          description: 'Тест 1', 
          testCode: 'return true;',
          expectedOutput: true
        }]
      });
      
      const response = await request(app)
        .get('/api/tasks')
        .query({ category: 'JavaScript' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.tasks.every(task => task.category === 'JavaScript')).toBeTruthy();
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('должен вернуть задачу по id', async () => {
      const response = await request(app).get(`/api/tasks/${taskId}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('_id', taskId.toString());
      expect(response.body).toHaveProperty('title', 'Тестовая задача');
      expect(response.body).toHaveProperty('description', 'Описание тестовой задачи');
      expect(response.body).toHaveProperty('template');
      
      // Проверяем, что ответы не отправляются клиенту
      expect(response.body.tests[0]).not.toHaveProperty('expectedOutput');
      expect(response.body.tests[0]).not.toHaveProperty('testCode');
    });
    
    it('должен вернуть ошибку при запросе несуществующей задачи', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/tasks/${fakeId}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/tasks/:id/check', () => {
    it('должен проверить правильное решение задачи', async () => {
      // Создаем задачу с простым тестом
      const simpleTask = await Task.create({
        title: 'Простая задача',
        description: 'Верните true из функции',
        category: 'JavaScript',
        difficulty: 1,
        author: adminId,
        isPublished: true,
        template: 'function solution() { }',
        tests: [
          {
            description: 'Функция должна возвращать true',
            testCode: 'return solution() === true;',
            expectedOutput: true
          }
        ]
      });
      
      const solution = `function solution() { return true; }`;
      
      const response = await request(app)
        .post(`/api/tasks/${simpleTask._id}/check`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ solution });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('points');
    });
    
    it('должен вернуть ошибки для неправильного решения', async () => {
      // Отправляем неправильное решение
      const wrongSolution = `function solution() { return false; }`;
      
      const response = await request(app)
        .post(`/api/tasks/${taskId}/check`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ solution: wrongSolution });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBeTruthy();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
    
    it('должен обновить прогресс пользователя при успешном решении', async () => {
      // Создаем задачу с простым тестом
      const simpleTask = await Task.create({
        title: 'Простая задача',
        description: 'Верните true из функции',
        category: 'JavaScript',
        difficulty: 1,
        author: adminId,
        isPublished: true,
        template: 'function solution() { }',
        tests: [
          {
            description: 'Функция должна возвращать true',
            testCode: 'return solution() === true;',
            expectedOutput: true
          }
        ]
      });
      
      const solution = `function solution() { return true; }`;
      
      // Проверяем, что у пользователя нет выполненных задач
      const userBefore = await User.findById(userId);
      expect(userBefore.completedTasks.length).toBe(0);
      
      // Отправляем решение
      await request(app)
        .post(`/api/tasks/${simpleTask._id}/check`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ solution });
      
      // Проверяем, что задача добавлена в список выполненных
      const userAfter = await User.findById(userId);
      expect(userAfter.completedTasks.length).toBe(1);
      expect(userAfter.completedTasks[0].taskId.toString()).toBe(simpleTask._id.toString());
      expect(userAfter.points).toBeGreaterThan(0);
    });
  });

  describe('POST /api/tasks (создание задачи)', () => {
    it('должен создать новую задачу (администратор)', async () => {
      const newTask = {
        title: 'Новая задача',
        description: 'Описание новой задачи',
        category: 'JavaScript',
        difficulty: 3,
        template: 'function newSolution() { }',
        tests: [
          {
            description: 'Тест для новой задачи',
            testCode: 'return newSolution() === "expected";',
            expectedOutput: 'expected'
          }
        ],
        requirements: ['Требование 1', 'Требование 2']
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newTask);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', 'Новая задача');
      
      // Проверяем, что задача создана в базе
      const createdTask = await Task.findById(response.body._id);
      expect(createdTask).toBeTruthy();
      expect(createdTask.author.toString()).toBe(adminId.toString());
    });
    
    it('должен запретить создание задачи обычному пользователю', async () => {
      const newTask = {
        title: 'Попытка создания задачи',
        description: 'Описание',
        category: 'JavaScript',
        difficulty: 1
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newTask);
      
      expect(response.statusCode).toBe(403);
    });
  });

  describe('PUT /api/tasks/:id (обновление задачи)', () => {
    it('должен обновить задачу (администратор)', async () => {
      const updates = {
        title: 'Обновленная задача',
        description: 'Обновленное описание'
      };
      
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('title', 'Обновленная задача');
      expect(response.body).toHaveProperty('description', 'Обновленное описание');
      
      // Проверяем обновление в базе
      const updatedTask = await Task.findById(taskId);
      expect(updatedTask.title).toBe('Обновленная задача');
    });
    
    it('должен запретить обновление задачи обычному пользователю', async () => {
      const updates = {
        title: 'Попытка обновления'
      };
      
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updates);
      
      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('должен удалить задачу (администратор)', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      
      // Проверяем, что задача удалена
      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });
    
    it('должен запретить удаление задачи обычному пользователю', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.statusCode).toBe(403);
      
      // Проверяем, что задача не удалена
      const task = await Task.findById(taskId);
      expect(task).toBeTruthy();
    });
  });
}); 