# Этап сборки (build stage)
FROM node:18-alpine as build-stage

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Создаем .env.production с переменными окружения для сборки
RUN echo "VITE_API_URL=${VITE_API_URL:-http://localhost:5000}" > .env.production

# Собираем приложение для продакшена
RUN npm run build

# Этап продакшена (production stage)
FROM nginx:stable-alpine as production-stage

# Копируем собранные файлы из этапа сборки
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем nginx с правильной обработкой сигналов для контейнера
CMD ["nginx", "-g", "daemon off;"] 