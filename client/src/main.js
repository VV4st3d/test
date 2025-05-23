import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import './assets/styles.css';
import i18n from './plugins/i18n';
import { useLanguageStore } from './store/language';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Регистрация компонентов Chart.js глобально
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Настройка базового URL для API
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
axios.defaults.withCredentials = true;

// Настройка перехватчика для добавления токена к запросам
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Настройка перехватчика для обработки ошибок
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      const { useAuthStore } = await import('./store/auth');
      const authStore = useAuthStore();
      authStore.clearAuth();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

// Создание экземпляра приложения и подключения хранилищ
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

// Инициализация языка перед монтированием приложения
const languageStore = useLanguageStore(pinia);
languageStore.initializeLanguage();

app.mount('#app');