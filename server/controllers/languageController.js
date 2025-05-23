const Language = require('../models/language');

// Получение всех языков
exports.getLanguages = async (req, res) => {
  try {
    const languages = await Language.find()
      .sort({ name: 1 });

    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение языка по ID
exports.getLanguage = async (req, res) => {
  try {
    const language = await Language.findById(req.params.id);

    if (!language) {
      return res.status(404).json({ message: 'Язык не найден' });
    }

    res.json(language);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Создание нового языка
exports.createLanguage = async (req, res) => {
  try {
    const language = await Language.create({
      name: req.body.name,
      code: req.body.code,
      isActive: req.body.isActive
    });

    res.status(201).json(language);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Обновление языка
exports.updateLanguage = async (req, res) => {
  try {
    const language = await Language.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        code: req.body.code,
        isActive: req.body.isActive
      },
      { new: true }
    );

    if (!language) {
      return res.status(404).json({ message: 'Язык не найден' });
    }

    res.json(language);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Удаление языка
exports.deleteLanguage = async (req, res) => {
  try {
    const language = await Language.findByIdAndDelete(req.params.id);

    if (!language) {
      return res.status(404).json({ message: 'Язык не найден' });
    }

    res.json({ message: 'Язык успешно удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};