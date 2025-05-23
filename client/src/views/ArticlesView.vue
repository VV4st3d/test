<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Заголовок -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 class="text-3xl font-bold">{{ t('articles.title') }}</h1>
    </div>

    <!-- Панель фильтров -->
    <div class="card mb-8 p-6 shadow-md">
      <h2 class="text-lg font-semibold mb-4">{{ t('articles.filters') }}</h2>
      
      <!-- Основные фильтры в сетке -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="relative">
          <label for="search" class="block text-sm font-medium mb-2">{{ t('articles.search') }}</label>
          <div class="relative">
            <input
              id="search"
              v-model="filters.search"
              type="text"
              class="input pr-10 w-full"
              :placeholder="t('articles.searchPlaceholder')"
              aria-label="Search articles"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label for="category" class="block text-sm font-medium mb-2">{{ t('articles.category') }}</label>
          <select id="category" v-model="filters.category" class="input w-full" aria-label="Select category">
            <option value="">{{ t('articles.allCategories') }}</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="difficulty" class="block text-sm font-medium mb-2">{{ t('articles.difficulty') }}</label>
          <select id="difficulty" v-model="filters.difficulty" class="input w-full" aria-label="Select difficulty">
            <option value="">{{ t('articles.allLevels') }}</option>
            <option v-for="level in difficultyLevels" :key="level" :value="level">
              {{ t(`articles.${level}`) }}
            </option>
          </select>
        </div>
      </div>

      <!-- Фильтр по тегам -->
      <div>
        <h3 class="text-md font-medium mb-3">{{ t('articles.tags') }}</h3>
        <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <button
            v-for="tag in availableTags"
            :key="tag"
            @click="toggleTagFilter(tag)"
            :class="[
              'px-3 py-1 rounded-full text-sm transition-colors duration-200',
              filters.tags.includes(tag)
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            ]"
            :aria-pressed="filters.tags.includes(tag)"
          >
            {{ tag }}
          </button>
          <div v-if="availableTags.length === 0" class="text-gray-500 p-2 text-sm">
            {{ t('articles.noTags') }}
          </div>
        </div>
      </div>
      
      <!-- Кнопка сброса фильтров -->
      <div class="mt-6 flex justify-end">
        <button @click="resetFilters" class="btn btn-secondary">
          {{ t('common.reset') }}
        </button>
      </div>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto"
        :style="{ borderColor: themeStore.currentColorScheme.primary }"></div>
      <p class="mt-2 text-gray-500">{{ t('articles.loading') }}</p>
    </div>

    <!-- Сообщение об отсутствии статей -->
    <div v-else-if="articles.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">{{ t('articles.noArticles') }}</p>
      <button @click="resetFilters" class="btn btn-primary mt-4">
        {{ t('articles.clearFilters') }}
      </button>
    </div>

    <!-- Сетка карточек -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="article in articles"
        :key="article._id"
        class="card relative overflow-hidden transition-all duration-300 hover:scale-102 hover:shadow-xl group"
      >
        <!-- Изображение-заглушка -->
        <div class="relative h-48 w-full overflow-hidden">
          <img
            :src="getCategoryImage(article.category)"
            :alt="`Image for ${article.category}`"
            class="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
          <span
            class="absolute bottom-2 right-2 px-2 py-1 bg-[var(--color-primary)] text-white text-xs rounded-full transform group-hover:translate-y-[-2px] transition-transform duration-300"
          >
            {{ t(`articles.${article.difficulty}`) }}
          </span>
        </div>

        <!-- Контент карточки -->
        <div class="p-5">
          <h2 class="text-xl font-semibold mb-2 line-clamp-2">{{ article.title }}</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{{ article.description }}</p>
          
          <!-- Теги статьи -->
          <div class="flex flex-wrap gap-2 mb-4" v-if="article.tags && article.tags.length">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ tag }}
            </span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">{{ article.category }}</span>
            <button
              class="btn btn-primary"
              @click="$router.push(`/articles/${article._id}`)"
              aria-label="Read more about this article"
            >
              {{ t('articles.readMore') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Пагинация (аналогичная Tasks.vue) -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-10">
      <button
        :disabled="currentPage === 1"
        class="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        :class="currentPage === 1 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'"
        @click="currentPage--"
        aria-label="Go to previous page"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-for="page in paginationRange"
        :key="page"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="currentPage === page ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
        :style="currentPage === page ? { backgroundColor: themeStore.currentColorScheme.primary } : {}"
        @click="currentPage = page"
        :aria-current="currentPage === page ? 'page' : undefined"
      >
        {{ page }}
      </button>
      <button
        :disabled="currentPage === totalPages"
        class="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        :class="currentPage === totalPages ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'"
        @click="currentPage++"
        aria-label="Go to next page"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useLanguageStore } from '../store/language';
import { useThemeStore } from '../store/theme'; // Добавляем themeStore
import axios from 'axios';
import { debounce } from 'lodash';

const languageStore = useLanguageStore();
const t = (key, params) => languageStore.t(key, params);
const themeStore = useThemeStore(); // Инициализируем themeStore

const articles = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const totalArticles = ref(0);
const pageSize = 12;
const categories = ['HTML', 'CSS', 'JavaScript', 'Vue', 'React', 'Node.js', 'MongoDB', 'TypeScript'];
const difficultyLevels = ['beginner', 'intermediate', 'advanced'];
const availableTags = ref([]);

// Фильтры
const filters = ref({
  category: '',
  difficulty: '',
  search: '',
  tags: []
});

// Получение изображения для категории
const getCategoryImage = (category) => {
  const images = {
    HTML: '/images/categories/html-code.jpg',
    CSS: '/images/categories/css-design.jpg',
    JavaScript: '/images/categories/javascript-code.jpg',
    Vue: '/images/categories/vue-framework.jpg',
    React: '/images/categories/react-components.jpg',
    'Node.js': '/images/categories/nodejs-backend.jpg',
    MongoDB: '/images/categories/database.jpg',
    TypeScript: '/images/categories/typescript-code.jpg',
    default: '/images/categories/web-development.jpg'
  };
  return images[category] || images.default;
};

// Пагинация: динамический диапазон страниц
const paginationRange = computed(() => {
  const maxPagesToShow = 5;
  const range = [];
  const start = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2));
  const end = Math.min(totalPages.value, start + maxPagesToShow - 1);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
});

// Переключение тегов
const toggleTagFilter = (tag) => {
  if (filters.value.tags.includes(tag)) {
    filters.value.tags = filters.value.tags.filter((t) => t !== tag);
  } else {
    filters.value.tags.push(tag);
  }
  currentPage.value = 1;
};

// Сброс фильтров
const resetFilters = () => {
  filters.value = {
    category: '',
    difficulty: '',
    search: '',
    tags: []
  };
  currentPage.value = 1;
};

// Функция загрузки статей
const fetchArticles = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize,
      lang: languageStore.currentLanguage
    };

    if (filters.value.category && filters.value.category.trim() !== '') 
      params.category = filters.value.category;
    
    if (filters.value.difficulty && filters.value.difficulty.trim() !== '') 
      params.difficulty = filters.value.difficulty;
    
    if (filters.value.search && filters.value.search.trim() !== '') 
      params.search = filters.value.search.trim();
    
    if (filters.value.tags && filters.value.tags.length > 0) {
      params.tags = filters.value.tags.join(',');
    }

    const response = await axios.get('/api/articles', { params });
    articles.value = response.data.articles || [];
    totalPages.value = response.data.totalPages || 1;
    totalArticles.value = response.data.totalArticles || 0;
  } catch (error) {
    console.error('Error loading articles:', error);
    articles.value = [];
    totalPages.value = 1;
    totalArticles.value = 0;
  } finally {
    loading.value = false;
  }
};

// Загрузка всех доступных тегов
const fetchAllTags = async () => {
  try {
    const response = await axios.get('/api/articles/tags');
    if (response.data && Array.isArray(response.data.tags)) {
      availableTags.value = response.data.tags;
    }
  } catch (error) {
    console.error('Error loading tags:', error);
  }
};

// Дебаунсинг для поиска
const debouncedFetchArticles = debounce(fetchArticles, 300);

// Наблюдение за фильтрами и языком
watch(
  [filters, () => languageStore.currentLanguage],
  () => {
    currentPage.value = 1;
    debouncedFetchArticles();
  },
  { deep: true }
);

// Наблюдение за текущей страницей
watch(currentPage, () => {
  fetchArticles();
});

onMounted(() => {
  fetchAllTags();
  fetchArticles();
});
</script>

<style scoped>
/* Стилизация карточек */
.card {
  @apply bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-300;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Hover-эффекты для карточек */
.card:hover {
  box-shadow: 0 15px 25px -4px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-3px);
}

/* Стилизация скроллбара для тегов */
.max-h-32::-webkit-scrollbar {
  width: 6px;
}

.max-h-32::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.max-h-32::-webkit-scrollbar-thumb {
  background: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.4);
  border-radius: 10px;
}

.max-h-32::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.6);
}

/* Адаптивность для маленьких экранов */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>