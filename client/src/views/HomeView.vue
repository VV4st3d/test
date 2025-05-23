<template>
  <div class="max-w-7xl mx-auto px-4">
    <!-- Приветственный блок -->
    <section
      class="relative min-h-[60vh] md:min-h-[80vh] bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-800 dark:to-gray-900 flex items-center rounded-lg overflow-hidden mb-12"
    >
      <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div class="text-center md:text-left z-10">
          <h1 class="text-3xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
            {{ $t('home.title') }}
          </h1>
          <p class="text-lg md:text-xl text-white/80 mb-6 animate-fade-in animation-delay-200">
            {{ $t('home.subtitle') }}
          </p>
          <router-link
            :to="isAuthenticated ? '/articles' : '/auth'"
            class="inline-block bg-white text-blue-600 dark:bg-gray-200 dark:text-gray-900 px-6 py-3 rounded-md font-semibold hover:bg-blue-100 dark:hover:bg-gray-300 transition-colors animate-fade-in animation-delay-400"
          >
            {{ $t('home.startLearning') }}
          </router-link>
        </div>
        <div class="hidden md:block animate-slide-in-right">
          <img
            :src="codingIllustration"
            alt="Coding Illustration"
            class="max-w-md w-full"
          />
        </div>
      </div>
    </section>

    <!-- Рекомендуемый контент -->
    <section class="recommended-content">
      <h2 class="section-title">{{ $t('home.recommendedArticles') }}</h2>
      
      <div v-if="loadingContent" class="loading-spinner">
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>
      
      <div v-else>
        <!-- Рекомендуемые статьи -->
        <Carousel v-if="recommendedArticles.length > 0" :items-to-show="getItemsToShow" :wrap-around="true" :autoplay="5000" class="content-carousel">
          <Slide v-for="article in recommendedArticles" :key="article.id || article._id" class="carousel-slide">
            <router-link 
              v-if="article.id !== 'placeholder'" 
              :to="{ name: 'article', params: { id: article.slug || article.id } }" 
              class="content-card"
              :class="article.difficulty && article.difficulty.toLowerCase()"
            >
              <div class="card-header">
                <span class="category-badge">{{ $t(`common.categories.${article.category}`) }}</span>
                <span v-if="article.difficulty" class="difficulty-badge" :class="article.difficulty.toLowerCase()">
                  {{ $t(`common.difficulties.${article.difficulty.toLowerCase()}`) }}
                </span>
              </div>
              <h3 class="card-title">{{ article.title && !article.title.startsWith('common.') ? article.title : $t(article.title) }}</h3>
              <p class="card-description">{{ article.description && !article.description.startsWith('articles.') ? article.description : $t(article.description) }}</p>
            </router-link>
            <div v-else class="content-card placeholder-card">
              <h3 class="card-title">{{ $t(article.title) }}</h3>
              <p class="card-description">{{ $t(article.description) }}</p>
            </div>
          </Slide>
          
          <template #addons>
            <Navigation />
            <Pagination />
          </template>
        </Carousel>
        
        <!-- Рекомендуемые задачи -->
        <h2 class="section-title mt-5">{{ $t('home.popularTasks') }}</h2>
        <Carousel v-if="recommendedTasks.length > 0" :items-to-show="getItemsToShow" :wrap-around="true" :autoplay="5000" class="content-carousel">
          <Slide v-for="task in recommendedTasks" :key="task.id || task._id" class="carousel-slide">
            <router-link 
              v-if="task.id !== 'placeholder'" 
              :to="{ name: 'task', params: { id: task.slug || task.id } }" 
              class="content-card"
              :class="task.difficulty && task.difficulty.toLowerCase()"
            >
              <div class="card-header">
                <span class="category-badge">{{ $t(`common.categories.${task.category}`) }}</span>
                <span v-if="task.difficulty" class="difficulty-badge" :class="task.difficulty.toLowerCase()">
                  {{ $t(`common.difficulties.${task.difficulty.toLowerCase()}`) }}
                </span>
              </div>
              <h3 class="card-title">{{ task.title && !task.title.startsWith('common.') ? task.title : $t(task.title) }}</h3>
              <p class="card-description">{{ task.description && !task.description.startsWith('tasks.') ? task.description : $t(task.description) }}</p>
            </router-link>
            <div v-else class="content-card placeholder-card">
              <h3 class="card-title">{{ $t(task.title) }}</h3>
              <p class="card-description">{{ $t(task.description) }}</p>
            </div>
          </Slide>
          
          <template #addons>
            <Navigation />
            <Pagination />
          </template>
        </Carousel>
        
        <div class="buttons-container mt-4">
          <router-link :to="{ name: 'articles' }" class="btn btn-primary">
            {{ $t('home.browseArticles') }}
          </router-link>
          <router-link :to="{ name: 'tasks' }" class="btn btn-secondary ml-4">
            {{ $t('home.browseTasks') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Прогресс и статистика -->
    <section class="py-12 bg-white dark:bg-gray-800 rounded-lg">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {{ $t('home.yourProgress') }}
        </h2>
        <div v-if="progressStore.loading || !isDataLoaded" class="flex justify-center items-center h-40">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <div v-else-if="isAuthenticated" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {{ $t('profile.level') }} {{ progress.userLevel }}
            </h3>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                class="bg-green-500 h-4 rounded-full transition-all duration-1000"
                :style="{ width: `${progress.progressPercentage}%` }"
              ></div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {{ pointsToNextLevelText }}
            </p>
          </div>
          <div class="card p-6 flex flex-col items-center">
            <div class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {{ progress.completedTasksCount }}
            </div>
            <div class="text-gray-600 dark:text-gray-300">
              {{ $t('profile.completedTasks') }}
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 mt-4">
              {{ progress.completedArticlesCount }}
            </div>
            <div class="text-gray-600 dark:text-gray-300">
              {{ $t('profile.readArticles') }}
            </div>
          </div>
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {{ $t('profile.activity') }}
            </h3>
            <div v-if="isChartDataReady" class="h-40">
              <LineChart
                :data="activityChartData"
                :options="chartOptions"
                class="h-40"
              />
            </div>
            <div v-else class="flex justify-center items-center h-40 text-gray-500">
              {{ $t('profile.activityNotAvailable') }}
            </div>
          </div>
        </div>
        <div v-else class="text-center">
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-4">
            {{ $t('home.registerPrompt') }}
          </p>
          <router-link
            to="/auth"
            class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            {{ $t('auth.register') }}
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../store/progress';
import { useAuthStore } from '../store/auth';
import { useLanguageStore } from '../store/language';
import { useToastStore } from '../store/toast';
import axios from 'axios';
import { Carousel, Slide, Navigation, Pagination } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';
import { Line as LineChart } from 'vue-chartjs';
import codingIllustration from '../assets/coding-illustration.svg';
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

const router = useRouter();
const languageStore = useLanguageStore();
const authStore = useAuthStore();
const progressStore = useProgressStore();
const toast = useToastStore();

const $t = (key) => languageStore.t(key);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isDataLoaded = ref(false);
const isChartDataReady = ref(false);

// Данные для карусели
const recommendedArticles = ref([]);
const recommendedTasks = ref([]);
const itemsToShow = ref(window.innerWidth < 768 ? 1 : 3);
const loadingContent = ref(false);

// Вычисляемое свойство для получения количества отображаемых элементов
const getItemsToShow = computed(() => itemsToShow.value);

// Вычисляемое свойство для локализованного текста о баллах до следующего уровня
const pointsToNextLevelText = computed(() => {
  if (!progress.value || typeof progress.value.pointsToNextLevel === 'undefined') {
    return languageStore.t('profile.pointsToNextLevel', { points: 0 });
  }
  return languageStore.t('profile.pointsToNextLevel', { points: progress.value.pointsToNextLevel });
});

// Данные для прогресса
const progress = computed(() => {
  const points = progressStore.getPoints;
  const level = progressStore.getLevel;
  const nextLevelThreshold = progressStore.progress.nextLevelThreshold || 100;
  const prevLevelThreshold = progressStore.progress.prevLevelThreshold || 0;
  const pointsToNextLevel = nextLevelThreshold - points;
  
  // Исправляем расчет процента прогресса
  // Вычисляем прогресс на основе разницы между текущим и предыдущим порогом уровня
  const levelRange = nextLevelThreshold - prevLevelThreshold;
  const pointsInCurrentLevel = points - prevLevelThreshold;
  const progressPercentage = levelRange > 0 ? (pointsInCurrentLevel / levelRange) * 100 : 0;
  
  return {
    userLevel: level,
    userPoints: points,
    completedTasksCount: progressStore.progress.totalTasks || 0,
    completedArticlesCount: progressStore.progress.totalArticles || 0,
    pointsToNextLevel,
    progressPercentage
  };
});

// Данные для графика активности
const activityChartData = computed(() => {
  const labels = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 29 + i);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  });
  const chartData = {
    labels,
    datasets: [
      {
        label: $t('profile.tasksCompleted'),
        data: progressStore.activity?.tasks || Array(30).fill(0),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        fill: true
      },
      {
        label: $t('profile.articlesRead'),
        data: progressStore.activity?.articles || Array(30).fill(0),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true
      }
    ]
  };
  console.log('activityChartData:', chartData); // Отладка
  return chartData;
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
};

const fetchRecommendedContent = async () => {
  loadingContent.value = true;
  
  try {
    const headers = {};
    if (authStore.isAuthenticated) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }

    // Получаем текущий язык из хранилища
    const currentLang = languageStore.currentLanguage;

    // Используем Promise.all для одновременного выполнения запросов с параметром языка
    const [articlesResponse, tasksResponse] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/articles?recommended=true&lang=${currentLang}`, { headers }),
      axios.get(`${import.meta.env.VITE_API_URL}/api/tasks?recommended=true&lang=${currentLang}`, { headers })
    ]);

    console.log('Received articles:', articlesResponse.data);
    console.log('Received tasks:', tasksResponse.data);

    // Обработка статей - API возвращает объект {articles: [...], currentPage, totalPages, totalArticles}
    if (articlesResponse.data && articlesResponse.data.articles && Array.isArray(articlesResponse.data.articles)) {
      if (articlesResponse.data.articles.length > 0) {
        // Добавляем slug из _id, если его нет
        const articlesWithSlug = articlesResponse.data.articles.map(article => {
          return {
            ...article,
            slug: article.slug || article._id
          };
        });
        
        recommendedArticles.value = articlesWithSlug.map(article => {
          // Используем title и description, которые уже должны быть на нужном языке из API
          return {
            id: article._id,
            title: article.title || 'common.untitled',
            description: article.description || 'articles.noDescription',
            category: article.category || 'common.notSpecified',
            slug: article.slug || article._id,
            image: article.image || '',
            difficulty: article.difficulty || 'common.notSpecified'
          };
        });
      } else {
        console.error('Unexpected articles response format:', articlesResponse.data);
        recommendedArticles.value = [{
          id: 'placeholder',
          title: 'home.noArticles',
          description: 'home.noArticles',
          category: 'common.notSpecified',
          slug: '',
          difficulty: 'common.notSpecified'
        }];
      }
    } else {
      console.error('Unexpected articles response format:', articlesResponse.data);
      recommendedArticles.value = [{
        id: 'placeholder',
        title: 'home.noArticles',
        description: 'home.noArticles',
        category: 'common.notSpecified',
        slug: '',
        difficulty: 'common.notSpecified'
      }];
    }

    // Обработка задач - API возвращает объект {tasks: [...], currentPage, totalPages, totalTasks}
    if (tasksResponse.data && tasksResponse.data.tasks && Array.isArray(tasksResponse.data.tasks)) {
      if (tasksResponse.data.tasks.length > 0) {
        // Добавляем slug из _id, если его нет
        const tasksWithSlug = tasksResponse.data.tasks.map(task => {
          return {
            ...task,
            slug: task.slug || task._id
          };
        });
        
        recommendedTasks.value = tasksWithSlug.map(task => {
          // Используем title и description, которые уже должны быть на нужном языке из API
          return {
            id: task._id,
            title: task.title || 'common.untitled',
            description: task.description || 'tasks.noDescription',
            category: task.category || 'common.notSpecified',
            slug: task.slug || task._id,
            difficulty: task.difficulty || 'common.notSpecified'
          };
        });
      } else {
        console.error('Unexpected tasks response format:', tasksResponse.data);
        recommendedTasks.value = [{
          id: 'placeholder',
          title: 'home.noTasks',
          description: 'home.noTasks',
          category: 'common.notSpecified',
          slug: '',
          difficulty: 'common.notSpecified'
        }];
      }
    } else {
      console.error('Unexpected tasks response format:', tasksResponse.data);
      recommendedTasks.value = [{
        id: 'placeholder',
        title: 'home.noTasks',
        description: 'home.noTasks',
        category: 'common.notSpecified',
        slug: '',
        difficulty: 'common.notSpecified'
      }];
    }
  } catch (error) {
    console.error('Error fetching recommended content:', error);
    toast.error($t('home.contentLoadError'));
    
    // Устанавливаем заглушки в случае ошибки
    recommendedArticles.value = [{
      id: 'placeholder',
      title: 'home.noArticles',
      description: 'home.contentLoadError',
      category: 'common.notSpecified',
      slug: '',
      difficulty: 'common.notSpecified'
    }];
    
    recommendedTasks.value = [{
      id: 'placeholder',
      title: 'home.noTasks',
      description: 'home.contentLoadError',
      category: 'common.notSpecified',
      slug: '',
      difficulty: 'common.notSpecified'
    }];
  } finally {
    loadingContent.value = false;
  }
};

const updateItemsToShow = () => {
  itemsToShow.value = window.innerWidth < 768 ? 1 : 3;
};

onMounted(async () => {
  window.addEventListener('resize', updateItemsToShow);
  if (isAuthenticated.value) {
    try {
      await Promise.all([
        progressStore.loadProgress(),
        progressStore.loadActivity()
      ]);
      isDataLoaded.value = true;
      // Проверяем, что данные для графика готовы
      if (activityChartData.value?.labels?.length && progressStore.activity) {
        isChartDataReady.value = true;
      }
    } catch (error) {
      console.error('Ошибка загрузки данных прогресса:', error);
      toast.error($t('home.progressLoadError'));
      isDataLoaded.value = true;
    }
  } else {
    isDataLoaded.value = true;
  }
  await fetchRecommendedContent();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateItemsToShow);
});

// Добавляем наблюдатель за изменением языка для обновления контента
watch(() => languageStore.currentLanguage, async () => {
  // При изменении языка перезагружаем контент
  await fetchRecommendedContent();
  
  // Если пользователь авторизован, обновляем данные графика активности
  if (isAuthenticated.value) {
    isChartDataReady.value = false;
    await Promise.all([
      progressStore.loadProgress(),
      progressStore.loadActivity()
    ]);
    
    if (activityChartData.value?.labels?.length && progressStore.activity) {
      isChartDataReady.value = true;
    }
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in forwards;
}
.animate-slide-in-right {
  animation: slideInRight 0.5s ease-in forwards;
}
.animation-delay-200 {
  animation-delay: 200ms;
}
.animation-delay-400 {
  animation-delay: 400ms;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
.carousel {
  @apply -mx-2;
}
.card {
  @apply transition-all duration-200;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommended-content {
  padding: 2rem;
  margin-bottom: 2rem;
  background-color: var(--color-bg-secondary);
  border-radius: 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.dark .recommended-content {
  background-color: #1f2a44; /* Темно-синий фон для темной темы */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(var(--color-primary-rgb), 0.3);
}

.dark .section-title {
  color: #e2e8f0; /* Светло-серый для заголовков */
  border-bottom: 2px solid rgba(59, 130, 246, 0.4); /* Голубая граница */
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.content-carousel {
  margin-bottom: 1.5rem;
  padding-bottom: 2rem;
}

.carousel-slide {
  padding: 0.5rem;
  height: 100%;
}

.content-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  border-radius: 0.75rem; /* Более мягкие углы */
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.dark .content-card {
  background-color: #2d3748; /* Темно-серый фон для карточек */
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4), 0 0 8px rgba(59, 130, 246, 0.1); /* Легкое голубое свечение */
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), transparent); /* Градиентная полоса */
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.content-card:hover::before {
  opacity: 1;
}

.content-card.easy::before {
  background: linear-gradient(90deg, #10b981, transparent);
}

.content-card.medium::before {
  background: linear-gradient(90deg, #f59e0b, transparent);
}

.content-card.hard::before {
  background: linear-gradient(90deg, #ef4444, transparent);
}

.content-card:hover {
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
  transform: translateY(-4px);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.dark .content-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

.placeholder-card {
  background-color: var(--color-bg-primary);
  opacity: 0.6;
  cursor: default;
}

.dark .placeholder-card {
  background-color: #374151; /* Чуть светлее для заглушек */
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.card-header {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.category-badge, .difficulty-badge {
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, background-color 0.3s ease;
}

.category-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  font-size: 0.75rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.15), rgba(var(--color-primary-rgb), 0.3));
  color: var(--color-primary);
  font-weight: 600;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  letter-spacing: 0.5px;
}

.category-badge:hover {
  transform: scale(1.05);
}

.dark .category-badge {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.5));
  color: #bfdbfe; /* Светло-голубой текст */
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.difficulty-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  font-size: 0.75rem;
  border-radius: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.difficulty-badge.easy {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.3));
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.difficulty-badge.medium {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.3));
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.difficulty-badge.hard {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.3));
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.dark .difficulty-badge.easy {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.5));
  color: #6ee7b7;
  border: 1px solid rgba(52, 211, 153, 0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.dark .difficulty-badge.medium {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.5));
  color: #fcd34d;
  border: 1px solid rgba(251, 191, 36, 0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.dark .difficulty-badge.hard {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.5));
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.difficulty-badge:hover {
  transform: scale(1.05);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.dark .card-title {
  color: #e2e8f0; /* Светло-серый для заголовков */
}

.card-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.dark .card-description {
  color: #94a3b8; /* Мягкий серый для описания */
}

.buttons-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--color-secondary-dark);
}

.mt-4 {
  margin-top: 1rem;
}

.mt-5 {
  margin-top: 1.25rem;
}

.ml-4 {
  margin-left: 1rem;
}

/* Стили для карусели */
.content-carousel {
  margin-bottom: 1.5rem;
  padding-bottom: 2rem;
}

:deep(.carousel__pagination) {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}

:deep(.carousel__pagination-button) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-border);
  margin: 0 4px;
  transition: all 0.3s ease;
}

:deep(.carousel__pagination-button--active) {
  background-color: var(--color-primary);
  transform: scale(1.2);
}

:deep(.carousel__prev),
:deep(.carousel__next) {
  background-color: var(--color-bg-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.dark :deep(.carousel__prev),
.dark :deep(.carousel__next) {
  background-color: #2d3748;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

:deep(.carousel__prev:hover),
:deep(.carousel__next:hover) {
  background-color: var(--color-primary);
  color: white;
}

.dark :deep(.carousel__prev:hover),
.dark :deep(.carousel__next:hover) {
  background-color: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}
</style>