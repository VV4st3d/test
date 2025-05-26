const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationNote: {
    type: String,
    default: ''
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'abuse', 'inappropriate', 'other'],
      required: true
    },
    details: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Виртуальное поле: количество репортов
commentSchema.virtual('reportCount').get(function() {
  return this.reports ? this.reports.length : 0;
});

// Метод проверки, пожаловался ли пользователь на этот комментарий
commentSchema.methods.isReportedBy = function(userId) {
  return this.reports.some(report => report.user.toString() === userId.toString());
};

// Индексы для быстрого поиска
commentSchema.index({ article: 1, status: 1 });
commentSchema.index({ status: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ moderationNote: 'text' });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment; 