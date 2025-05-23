const Theme = require('../models/theme');

// Получение всех тем
exports.getThemes = async (req, res) => {
  try {
    const themes = await Theme.find()
      .sort({ name: 1 });

    res.json(themes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение темы по ID
exports.getTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({ message: 'Тема не найдена' });
    }

    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Создание новой темы
exports.createTheme = async (req, res) => {
  try {
    const theme = await Theme.create({
      name: req.body.name,
      description: req.body.description,
      difficulty: req.body.difficulty,
      category: req.body.category
    });

    res.status(201).json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Обновление темы
exports.updateTheme = async (req, res) => {
  try {
    const theme = await Theme.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        difficulty: req.body.difficulty,
        category: req.body.category
      },
      { new: true }
    );

    if (!theme) {
      return res.status(404).json({ message: 'Тема не найдена' });
    }

    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Удаление темы
exports.deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findByIdAndDelete(req.params.id);

    if (!theme) {
      return res.status(404).json({ message: 'Тема не найдена' });
    }

    res.json({ message: 'Тема успешно удалена' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 