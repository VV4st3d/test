const Translation = require('../models/translation');

// Получение всех переводов
exports.getTranslations = async (req, res) => {
  try {
    const translations = await Translation.find()
      .populate('language')
      .sort({ createdAt: -1 });

    res.json(translations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение перевода по ID
exports.getTranslation = async (req, res) => {
  try {
    const translation = await Translation.findById(req.params.id)
      .populate('language');

    if (!translation) {
      return res.status(404).json({ message: 'Перевод не найден' });
    }

    res.json(translation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Создание нового перевода
exports.createTranslation = async (req, res) => {
  try {
    const translation = await Translation.create({
      key: req.body.key,
      value: req.body.value,
      language: req.body.languageId
    });

    const populatedTranslation = await Translation.findById(translation._id)
      .populate('language');

    res.status(201).json(populatedTranslation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Обновление перевода
exports.updateTranslation = async (req, res) => {
  try {
    const translation = await Translation.findByIdAndUpdate(
      req.params.id,
      {
        value: req.body.value,
        language: req.body.languageId
      },
      { new: true }
    ).populate('language');

    if (!translation) {
      return res.status(404).json({ message: 'Перевод не найден' });
    }

    res.json(translation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Удаление перевода
exports.deleteTranslation = async (req, res) => {
  try {
    const translation = await Translation.findByIdAndDelete(req.params.id);

    if (!translation) {
      return res.status(404).json({ message: 'Перевод не найден' });
    }

    res.json({ message: 'Перевод успешно удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 