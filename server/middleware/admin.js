exports.admin = async (req, res, next) => {
  try {
    // Проверяем, что пользователь авторизован
    if (!req.user) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем роль пользователя
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 