<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-8">{{ t('profile.title') }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Левая колонка - информация о профиле -->
      <div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div class="flex items-center">
            <div class="bg-primary bg-opacity-20 text-primary rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mr-4">
              {{ userInitials }}
            </div>
            <div>
              <h2 class="text-xl font-bold">{{ user?.name || t('common.loading') }}</h2>
              <p class="text-gray-600 dark:text-gray-400">{{ user?.email }}</p>
            </div>
          </div>
          
          <div class="mt-6">
            <div class="mb-2 flex justify-between">
              <span>{{ t('profile.level') }} {{ userProgress.level || 1 }}</span>
              <span>{{ userProgress.points || 0 }} {{ t('profile.points') }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div class="bg-primary h-2.5 rounded-full" :style="{ width: `${progressPercentage}%` }"></div>
            </div>
            <div class="text-sm text-gray-600">
              {{ $t('profile.pointsToNextLevel', { points: userProgress.nextLevelThreshold - userProgress.points }) }}
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">{{ t('profile.statistics') }}</h3>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span>{{ t('tasks.difficulty') }}: {{ t('tasks.difficultyLevels.easy') }}</span>
              <span>{{ userProgress.tasksByDifficulty?.easy || 0 }} {{ t('tasks.title').toLowerCase() }}</span>
            </div>
            <div class="flex justify-between">
              <span>{{ t('tasks.difficulty') }}: {{ t('tasks.difficultyLevels.medium') }}</span>
              <span>{{ userProgress.tasksByDifficulty?.medium || 0 }} {{ t('tasks.title').toLowerCase() }}</span>
            </div>
            <div class="flex justify-between">
              <span>{{ t('tasks.difficulty') }}: {{ t('tasks.difficultyLevels.hard') }}</span>
              <span>{{ userProgress.tasksByDifficulty?.hard || 0 }} {{ t('tasks.title').toLowerCase() }}</span>
            </div>
            <div class="flex justify-between font-bold border-t pt-2 border-gray-200 dark:border-gray-700">
              <span>{{ t('profile.total') }}</span>
              <span>{{ userProgress.totalTasks || 0 }} {{ t('tasks.title').toLowerCase() }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{{ t('profile.averagePoints') }}</span>
              <span>{{ userProgress.averagePoints || 0 }} {{ t('profile.points') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая колонка - вкладки -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div class="flex border-b border-gray-200 dark:border-gray-700">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-6 py-3 text-center flex-1"
              :class="{ 
                'border-b-2 border-primary text-primary font-medium': activeTab === tab.id,
                'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200': activeTab !== tab.id
              }"
            >
              {{ tab.label }}
            </button>
          </div>
          
          <div class="p-6">
            <!-- Вкладка настроек -->
            <ProfileSettings v-if="activeTab === 'settings'" />
            
            <!-- Вкладка выполненных заданий -->
            <div v-else-if="activeTab === 'completed'">
              <h3 class="text-xl font-bold mb-4">
                {{ t('profile.completedTasks') }}
                <span v-if="tasksTotal > 0" class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({{ completedTasks.length }} {{ t('profile.of') }} {{ tasksTotal }})
                </span>
              </h3>
              
              <div 
                v-if="completedTasks.length > 0" 
                class="space-y-4 completed-container overflow-y-auto max-h-[600px] pr-2"
                @scroll="handleScroll('completed')"
              >
                <div
                  v-for="task in completedTasks"
                  :key="task.id"
                  class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/20 dark:hover:border-primary/20 hover:-translate-y-1"
                >
                  <div class="flex justify-between items-center">
                    <h4 class="font-medium group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">{{ task.title }}</h4>
                    <span class="badge badge-success group-hover:scale-105 transition-transform duration-300">{{ task.points }} {{ t('profile.points') }}</span>
                  </div>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">{{ task.category }}</p>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(task.completedAt) }}</span>
                    <router-link :to="`/tasks/${task.id}`" class="text-primary text-sm hover:underline transition-colors duration-300">
                      {{ t('tasks.solve') }}
                    </router-link>
                  </div>
                </div>
                
                <!-- Индикатор загрузки -->
                <div v-if="tasksLoading" class="flex justify-center py-4">
                  <div class="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
                </div>
                
                <!-- Сообщение о конце списка -->
                <div v-if="!tasksHasMore && !tasksLoading && completedTasks.length > 0" class="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                  {{ t('profile.endOfList') }}
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                <p>{{ t('profile.noCompletedTasks') }}</p>
              </div>
            </div>
            
            <!-- Вкладка избранных статей -->
            <div v-else-if="activeTab === 'favorites'">
              <h3 class="text-xl font-bold mb-4">
                {{ t('profile.favoriteArticles') }}
                <span v-if="articlesTotal > 0" class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({{ favoriteArticles.length }} {{ t('profile.of') }} {{ articlesTotal }})
                </span>
              </h3>
              
              <div 
                v-if="favoriteArticles.length > 0" 
                class="space-y-4 favorites-container overflow-y-auto max-h-[600px] pr-2"
                @scroll="handleScroll('favorites')"
              >
                <div
                  v-for="article in favoriteArticles"
                  :key="article._id"
                  class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/20 dark:hover:border-primary/20 hover:-translate-y-1 group"
                >
                  <div class="flex justify-between items-center">
                    <h4 class="font-medium group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">{{ article.title }}</h4>
                    <span class="badge badge-primary group-hover:scale-105 transition-transform duration-300">{{ t(`tasks.difficultyLevels.${article.difficulty}`) }}</span>
                  </div>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{{ article.description }}</p>
                  <div class="flex flex-wrap gap-2 my-2" v-if="article.tags && article.tags.length">
                    <span 
                      v-for="tag in article.tags" 
                      :key="tag" 
                      class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-2 py-1 text-xs"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center mt-2">
                    <div class="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-500">
                      <span>{{ t(`common.categories.${article.category}`) }}</span>
                      <span>•</span>
                      <span>{{ formatDate(article.updatedAt || article.createdAt) }}</span>
                    </div>
                    <router-link :to="`/articles/${article._id}`" class="text-primary text-sm hover:underline transition-colors duration-300">
                      {{ t('articles.readMore') }}
                    </router-link>
                  </div>
                </div>
                
                <!-- Индикатор загрузки -->
                <div v-if="articlesLoading" class="flex justify-center py-4">
                  <div class="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
                </div>
                
                <!-- Сообщение о конце списка -->
                <div v-if="!articlesHasMore && !articlesLoading && favoriteArticles.length > 0" class="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                  {{ t('profile.endOfList') }}
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <p>{{ t('profile.noFavoriteArticles') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../store/auth'
import { useLanguageStore } from '../store/language'
import { useProgressStore } from '../store/progress'
import ProfileSettings from '../components/ProfileSettings.vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const progressStore = useProgressStore()
const t = (key, params) => languageStore.t(key, params)
const user = computed(() => authStore.user)
const userProgress = computed(() => progressStore.progress)
const completedTasks = ref([])
const favoriteArticles = ref([])

// Параметры для пагинации
const tasksPage = ref(1)
const articlesPage = ref(1)
const tasksLimit = 10
const articlesLimit = 10
const tasksLoading = ref(false)
const articlesLoading = ref(false)
const tasksHasMore = ref(true)
const articlesHasMore = ref(true)
const tasksTotal = ref(0)
const articlesTotal = ref(0)

// Вычисляем инициалы пользователя
const userInitials = computed(() => {
  if (!user.value?.name) return '';
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
})

// Вычисляем процент выполнения текущего уровня
const progressPercentage = computed(() => {
  const current = userProgress.value?.points || 0;
  const nextLevel = userProgress.value?.nextLevelThreshold || 100;
  const prevLevel = userProgress.value?.prevLevelThreshold || 0;
  const range = nextLevel - prevLevel;
  const progress = current - prevLevel;
  
  return Math.floor((progress / range) * 100);
})

// Определяем кол-во баллов до следующего уровня
const pointsToNextLevel = computed(() => {
  const current = userProgress.value?.points || 0;
  const nextLevel = userProgress.value?.nextLevelThreshold || 100;
  return nextLevel - current;
})

// Активная вкладка
const activeTab = ref('settings')

// Вкладки
const tabs = [
  { id: 'settings', label: t('profile.settings') },
  { id: 'completed', label: t('profile.completedTasks') },
  { id: 'favorites', label: t('profile.favoriteArticles') }
]

// Форматируем дату
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(languageStore.currentLanguage, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

// Функция для загрузки избранных статей
const loadFavoriteArticles = async (reset = false) => {
  if (reset) {
    articlesPage.value = 1;
    favoriteArticles.value = [];
    articlesHasMore.value = true;
  }

  if (!articlesHasMore.value || articlesLoading.value) return;
  
  articlesLoading.value = true;
  try {
    const response = await axios.get(`/api/articles/favorites`, {
      params: {
        lang: languageStore.currentLanguage,
        page: articlesPage.value,
        limit: articlesLimit
      }
    });
    
    // Проверяем, есть ли данные в ответе
    if (response.data && Array.isArray(response.data.articles)) {
      // Обрабатываем объект с пагинацией
      const { articles, total, totalPages } = response.data;
      favoriteArticles.value = [...favoriteArticles.value, ...articles];
      articlesTotal.value = total || 0;
      articlesHasMore.value = articlesPage.value < totalPages;
      articlesPage.value++;
    } else if (response.data && Array.isArray(response.data)) {
      // Для обратной совместимости: если API возвращает просто массив статей
      const newArticles = response.data;
      favoriteArticles.value = [...favoriteArticles.value, ...newArticles];
      articlesHasMore.value = newArticles.length === articlesLimit;
      articlesPage.value++;
    } else {
      articlesHasMore.value = false;
    }
  } catch (error) {
    console.error('Error loading favorite articles:', error.message);
    articlesHasMore.value = false;
  } finally {
    articlesLoading.value = false;
  }
}

// Функция для загрузки выполненных заданий
const loadCompletedTasksData = async (reset = false) => {
  if (reset) {
    tasksPage.value = 1;
    completedTasks.value = [];
    tasksHasMore.value = true;
  }

  if (!tasksHasMore.value || tasksLoading.value) return;
  
  tasksLoading.value = true;
  try {
    const response = await axios.get(`/api/progress/completed-tasks`, {
      params: {
        page: tasksPage.value,
        limit: tasksLimit,
        lang: languageStore.currentLanguage
      }
    });
    
    if (response.data && response.data.success) {
      const { tasks, total, totalPages } = response.data;
      completedTasks.value = [...completedTasks.value, ...tasks];
      tasksTotal.value = total || 0;
      tasksHasMore.value = tasksPage.value < totalPages;
      tasksPage.value++;
    } else {
      tasksHasMore.value = false;
    }
  } catch (error) {
    console.error('Error loading completed tasks:', error.message);
    tasksHasMore.value = false;
  } finally {
    tasksLoading.value = false;
  }
}

// Функция для проверки необходимости загрузки дополнительных данных при скролле
const handleScroll = async (tab) => {
  // Проверяем, находится ли пользователь внизу страницы
  const scrollContainer = document.querySelector(`.${tab}-container`);
  if (!scrollContainer) return;
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
  // Если пользователь прокрутил до конца с небольшим запасом (100px)
  if (scrollHeight - scrollTop - clientHeight < 100) {
    if (tab === 'favorites' && articlesHasMore.value && !articlesLoading.value) {
      await loadFavoriteArticles();
    } else if (tab === 'completed' && tasksHasMore.value && !tasksLoading.value) {
      await loadCompletedTasksData();
    }
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    // Загружаем прогресс пользователя
    await progressStore.loadProgress();
    
    // Загружаем первую страницу данных
    if (activeTab.value === 'completed') {
      await loadCompletedTasksData(true);
    } else if (activeTab.value === 'favorites') {
      await loadFavoriteArticles(true);
    }
  }
})

// Следим за изменением языка и перезагружаем статьи при необходимости
watch(() => languageStore.currentLanguage, async (newLang) => {
  if (authStore.isAuthenticated) {
    if (activeTab.value === 'favorites') {
      await loadFavoriteArticles(true);
    } else if (activeTab.value === 'completed') {
      await loadCompletedTasksData(true);
    }
  }
});

// Следим за изменением активной вкладки и загружаем соответствующие данные
watch(activeTab, async (newTab) => {
  if (authStore.isAuthenticated) {
    if (newTab === 'favorites') {
      await loadFavoriteArticles(true);
    } else if (newTab === 'completed' && completedTasks.value.length === 0) {
      await loadCompletedTasksData(true);
    }
  }
});
</script>

<style scoped>
/* Стили для контейнеров с прокруткой */
.completed-container,
.favorites-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

/* Стили для скроллбара в WebKit браузерах (Chrome, Safari) */
.completed-container::-webkit-scrollbar,
.favorites-container::-webkit-scrollbar {
  width: 6px;
}

.completed-container::-webkit-scrollbar-track,
.favorites-container::-webkit-scrollbar-track {
  background: transparent;
}

.completed-container::-webkit-scrollbar-thumb,
.favorites-container::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}

/* Стили для темной темы */
.dark .completed-container::-webkit-scrollbar-thumb,
.dark .favorites-container::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

/* Анимация для индикатора загрузки */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Стиль для плавного появления новых элементов */
.completed-container > div,
.favorites-container > div {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 