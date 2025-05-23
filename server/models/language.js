const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    enum: ['ru', 'en'] // Поддерживаемые языки
  },
  name: {
    type: String,
    required: true
  },
  translations: {
    type: Object,
    required: true,
    default: {}
  }
}, {
  timestamps: true
});

const Language = mongoose.model('Language', languageSchema);

module.exports = Language; 