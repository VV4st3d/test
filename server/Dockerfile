# Используем официальный образ Node.js LTS как базовый
FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
# Используем --production флаг для установки только production зависимостей
# Используем npm ci для более чистой и быстрой установки
RUN npm ci --only=production

# Копируем исходный код приложения
COPY . .

# Создаем директорию для логов
RUN mkdir -p logs

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=5000

# Открываем порт, на котором работает приложение
EXPOSE 5000

# Устанавливаем healthcheck для проверки работоспособности приложения
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api || exit 1

# Запускаем приложение
CMD ["node", "server.js"]

# Лучшие практики Docker для Node.js приложений:
# 1. Используем alpine образ для минимального размера
# 2. Устанавливаем только production зависимости
# 3. Используем правильную strategy для управления процессами - node обрабатывает сигналы SIGTERM/SIGINT корректно
# 4. Имеем healthcheck для отслеживания здоровья контейнера
# 5. Запускаем node напрямую, без оболочки, чтобы корректно обрабатывать сигналы 