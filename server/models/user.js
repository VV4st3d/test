const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 0
  },
  completedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  colorScheme: {
    type: String,
    enum: ['blue', 'green', 'purple', 'red', 'orange'],
    default: 'blue'
  },
  completedTasks: [{
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    completedAt: Date,
    points: Number
  }],
  trustLevel: {
    type: Number,
    default: 1,
    min: 0,
    max: 5
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  readArticles: [
    {
      articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для проверки пароля
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Метод для обновления прогресса по темам
userSchema.methods.updateProgress = async function(articleId) {
  if (!this.completedTopics.includes(articleId)) {
    this.completedTopics.push(articleId);
    this.points += 10;
    this.level = Math.floor(Math.sqrt(this.points / 100)) + 1;
    await this.save();
  }
};

/**
 * Обновление прогресса по задачам с начислением баллов
 * @param {String} taskId - ID задачи
 * @param {Number} points - Баллы за задачу
 */
userSchema.methods.updateTaskProgress = async function(taskId, points) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new Error('Неверный ID задачи');
  }
  if (!Number.isInteger(points) || points < 0) {
    throw new Error('Баллы должны быть неотрицательным целым числом');
  }

  if (!this.completedTasks) {
    this.completedTasks = [];
  }

  if (this.completedTasks.some(task => task.taskId.toString() === taskId.toString())) {
    return;
  }

  this.completedTasks.push({
    taskId,
    completedAt: new Date(),
    points
  });

  this.points += points;
  // Расчет уровня: level = Math.floor(Math.sqrt(points / 100)) + 1
  // Это означает, что для уровня N требуется 100 * (N-1)^2 очков
  // Например: уровень 2 = 100 очков, уровень 3 = 400 очков, уровень 4 = 900 очков
  this.level = Math.floor(Math.sqrt(this.points / 100)) + 1;

  await this.save();

  return {
    points: this.points,
    level: this.level,
    newPoints: points
  };
};

/**
 * Обновление прогресса по прочитанным статьям
 * @param {String} articleId - ID статьи
 * @param {Number} points - Баллы за статью (по умолчанию 10)
 */
userSchema.methods.updateArticleProgress = async function(articleId, points = 10) {
  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new Error('Неверный ID статьи');
  }
  if (!Number.isInteger(points) || points < 0) {
    throw new Error('Баллы должны быть неотрицательным целым числом');
  }

  if (!this.readArticles) {
    this.readArticles = [];
  }

  if (this.readArticles.some(article => article.articleId.toString() === articleId.toString())) {
    return;
  }

  this.readArticles.push({
    articleId,
    readAt: new Date()
  });

  this.points += points;
  // Расчет уровня: level = Math.floor(Math.sqrt(points / 100)) + 1
  // Это означает, что для уровня N требуется 100 * (N-1)^2 очков
  // Например: уровень 2 = 100 очков, уровень 3 = 400 очков, уровень 4 = 900 очков
  this.level = Math.floor(Math.sqrt(this.points / 100)) + 1;

  await this.save();

  return {
    points: this.points,
    level: this.level,
    newPoints: points
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;