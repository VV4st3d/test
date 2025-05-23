const mongoose = require('mongoose');

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
  content: {
    type: String,
    required: true
  }
}, { _id: false });

const articleSchema = new mongoose.Schema({
  translations: {
    ru: {
      type: translationSchema,
      required: true
    },
    en: {
      type: translationSchema,
      required: true
    }
  },
  category: {
    type: String,
    enum: ['HTML', 'CSS', 'JavaScript', 'Vue', 'React', 'Node.js', 'MongoDB'],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual fields for backward compatibility (avoid using in new code)
articleSchema.virtual('title').get(function() {
  return this.translations?.ru?.title || '';
});
articleSchema.virtual('description').get(function() {
  return this.translations?.ru?.description || '';
});
articleSchema.virtual('content').get(function() {
  return this.translations?.ru?.content || '';
});
articleSchema.virtual('titleEn').get(function() {
  return this.translations?.en?.title || '';
});
articleSchema.virtual('descriptionEn').get(function() {
  return this.translations?.en?.description || '';
});
articleSchema.virtual('contentEn').get(function() {
  return this.translations?.en?.content || '';
});

// Text index for search optimization
articleSchema.index({
  'translations.ru.title': 'text',
  'translations.en.title': 'text',
  'translations.ru.description': 'text',
  'translations.en.description': 'text'
});

articleSchema.set('toJSON', { virtuals: true });
articleSchema.set('toObject', { virtuals: true });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;