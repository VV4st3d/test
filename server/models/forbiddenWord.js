const mongoose = require('mongoose');

const forbiddenWordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  englishWord: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['spam', 'abuse', 'adult', 'drugs', 'other'],
    default: 'other'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRegex: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Индекс для быстрого поиска по слову
forbiddenWordSchema.index({ word: 1 });

const ForbiddenWord = mongoose.model('ForbiddenWord', forbiddenWordSchema);

module.exports = ForbiddenWord; 