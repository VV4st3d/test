const mongoose = require('mongoose');

// Схема для подсказок (не изменяется)
const hintSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
}, { _id: false });

// Схема для переводов
const translationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    default: []
  },
  template: {
    type: String,
    default: ''
  },
  hints: {
    type: [hintSchema], // Используем структуру hintSchema вместо [String]
    default: []
  },
  testDescriptions: {
    type: Map, // Храним переводы описаний тестов по _id теста
    of: String,
    default: {}
  }
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  testCode: {
    type: String
  },
  description: {
    type: String // Базовое описание на русском (для обратной совместимости)
  }
});

const taskSchema = new mongoose.Schema({
  translations: {
    ru: {
      type: translationSchema,
      required: true
    },
    en: {
      type: translationSchema,
      required: false
    }
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'JavaScript',
    immutable: true // Делаем поле неизменяемым
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  requirements: {
    type: [String],
    default: []
  },
  tests: [testCaseSchema],
  hints: [hintSchema],
  template: {
    type: String,
    default: ''
  },
  solution: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  completionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Создаем индекс для поиска
taskSchema.index({
  'translations.ru.title': 'text',
  'translations.en.title': 'text',
  'translations.ru.description': 'text',
  'translations.en.description': 'text',
  'title': 'text',
  'description': 'text'
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;