<template>
  <div class="container mx-auto px-4 py-12">
    <!-- Заголовок и кнопка создания задачи -->
    <div class="flex justify-between items-center mb-10">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
        {{ t('tasks.title') }}
      </h1>
      <div v-if="isAdmin" class="flex gap-4">
        <router-link
          to="/admin/tasks/new"
          class="flex items-center text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
          :style="{ backgroundColor: themeStore.currentColorScheme.primary, borderColor: themeStore.currentColorScheme.accent }"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ t('tasks.createTask') }}
        </router-link>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 bg-gray-50 dark:bg-gray-800/30 p-5 rounded-2xl shadow-sm backdrop-blur-sm dark:backdrop-blur-md">
      <div class="flex-1">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="t('tasks.searchPlaceholder')"
            class="w-full bg-white dark:bg-gray-700/80 text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 transition-all duration-300"
            :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
          />
          <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tasks.filterDifficulty') }}</label>
        <select
          v-model="filters.difficulty"
          class="bg-white dark:bg-gray-700/80 text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 transition-all duration-300"
          :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
        >
          <option value="">{{ t('tasks.anyDifficulty') }}</option>
          <option v-for="level in difficultyLevels" :key="level.value" :value="level.value">
            {{ level.label }}
          </option>
        </select>
      </div>
      <label class="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id="hideSolved"
          v-model="hideSolved"
          class="sr-only peer"
        />
        <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500"
          :style="{ 'background-color': hideSolved ? themeStore.currentColorScheme.primary : '' }"></div>
        <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('tasks.hideSolved') }}
        </span>
      </label>
    </div>

    <!-- Сортировка -->
    <div class="mb-6">
      <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{{ t('tasks.sortBy') }}:</span>
        <button
          @click="changeSort('difficulty')"
          class="flex items-center gap-1 px-3 py-1 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          :style="{ color: filters.sortBy === 'difficulty' ? themeStore.currentColorScheme.primary : '' }"
        >
          {{ t('tasks.difficulty') }}
          <span v-if="filters.sortBy === 'difficulty'" class="ml-1">{{ sortIcon }}</span>
        </button>
      </div>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto"
        :style="{ borderColor: themeStore.currentColorScheme.primary }"></div>
    </div>

    <!-- Сообщение об отсутствии задач -->
    <div v-else-if="filteredTasks.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
      </svg>
      <p class="text-lg text-gray-500 dark:text-gray-400">
        <template v-if="hideSolved && authStore.isAuthenticated && tasks.length > 0">
          {{ t('tasks.allTasksSolved') }}
        </template>
        <template v-else-if="searchQuery.trim()">
          {{ t('tasks.noTasksMatchSearch', { search: searchQuery.trim() }) }}
        </template>
        <template v-else-if="filters.difficulty">
          {{ t('tasks.noTasksMatchFilter', { filter: filters.difficulty }) }}
        </template>
        <template v-else>
          {{ t('tasks.noTasks') }}
        </template>
      </p>
    </div>

    <!-- Сетка карточек задач -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="task in filteredTasks"
        :key="task._id"
        class="bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-md border border-gray-100 dark:border-gray-700/50 animate-fade-in flex flex-col min-h-[240px]"
      >
        <div class="p-6 flex flex-col flex-1">
          <!-- Заголовок и сложность с фиксированным расстоянием -->
          <div class="flex justify-between items-start mb-4 gap-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
              {{ task.title }}
            </h2>
            <span
              class="text-xs font-medium capitalize px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0"
              :class="{
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300': task.difficulty === 'easy',
                'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300': task.difficulty === 'medium',
                'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300': task.difficulty === 'hard'
              }"
            >
              <svg v-if="task.difficulty === 'easy'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="task.difficulty === 'medium'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
              </svg>
              {{ task.difficulty }}
            </span>
          </div>

          <!-- Описание с фиксированной высотой -->
          <p class="text-gray-600 dark:text-gray-300 mb-5 text-sm line-clamp-3 leading-relaxed flex-1 max-h-[60px] overflow-hidden">
            {{ task.description }}
          </p>

          <!-- Метаданные и действия -->
          <div class="flex justify-between items-center mt-auto">
            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ task.category }}
              </span>
            </div>
            <div class="flex gap-3 items-center">
              <span v-if="isCompleted(task._id)" class="text-emerald-500 dark:text-emerald-400" title="Задача решена">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
              <button
                class="text-white font-medium py-2 px-5 rounded-xl transition-all duration-300 hover:scale-105"
                :style="{ backgroundColor: themeStore.currentColorScheme.primary, borderColor: themeStore.currentColorScheme.accent }"
                @click="$router.push(`/tasks/${task._id}`)"
              >
                {{ t('tasks.solve') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <div v-if="filteredTasks.length > 0 && totalPages > 1" class="flex justify-center items-center gap-2 mt-10">
      <button
        :disabled="currentPage === 1"
        class="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        :class="currentPage === 1 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'"
        @click="currentPage--"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="currentPage === page ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
        :style="currentPage === page ? { backgroundColor: themeStore.currentColorScheme.primary } : {}"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
      <button
        :disabled="currentPage === totalPages"
        class="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        :class="currentPage === totalPages ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'"
        @click="currentPage++"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useLanguageStore } from '../store/language'
import { useProgressStore } from '../store/progress'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import axios from 'axios'

const languageStore = useLanguageStore()
const t = (key, params) => languageStore.t(key, params)
const themeStore = useThemeStore()

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAuthenticated && authStore.user?.role === 'admin')

const progress = useProgressStore()

const tasks = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')

const difficultyLevels = [
  { value: 'easy', label: t('tasks.beginner'), order: 1 },
  { value: 'medium', label: t('tasks.intermediate'), order: 2 },
  { value: 'hard', label: t('tasks.advanced'), order: 3 }
]

const filters = ref({
  category: 'JavaScript',
  difficulty: '',
  sortBy: 'difficulty',
  sortOrder: 'asc'
})

const hideSolved = ref(false)

const debouncedSearch = ref(null)
watch(searchQuery, (newValue) => {
  if (debouncedSearch.value) clearTimeout(debouncedSearch.value)
  debouncedSearch.value = setTimeout(() => {
    currentPage.value = 1
    fetchTasks()
  }, 300)
})

const fetchTasks = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      category: filters.value.category,
      difficulty: filters.value.difficulty,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder,
      hideSolved: hideSolved.value && authStore.isAuthenticated ? true : undefined,
      search: searchQuery.value.trim(),
      lang: languageStore.currentLanguage
    }
    console.log('Fetching tasks with params:', params)
    const response = await axios.get('/api/tasks', { params })
    tasks.value = response.data.tasks
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.error(t('tasks.loadError'), error)
  } finally {
    loading.value = false
  }
}

const isCompleted = (taskId) => {
  return progress.completedTasks.some(task => 
    task.taskId === taskId || task.id === taskId || task._id === taskId
  )
}

const filteredTasks = computed(() => {
  if (!hideSolved.value || !authStore.isAuthenticated) return tasks.value
  return tasks.value.filter(task => !isCompleted(task._id))
})

const changeSort = (field) => {
  if (filters.value.sortBy === field) {
    filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
  } else {
    filters.value.sortBy = field
    filters.value.sortOrder = 'asc'
  }
  currentPage.value = 1
  fetchTasks()
}

const sortIcon = computed(() => {
  return filters.value.sortOrder === 'asc' ? '↓' : '↑'
})

watch([currentPage, filters, hideSolved], () => {
  fetchTasks()
}, { deep: true })

watch(() => languageStore.currentLanguage, () => {
  fetchTasks()
})

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await progress.loadProgress()
    await progress.loadAllCompletedTasks()
  }
  await fetchTasks()
})
</script>

<style scoped>
/* Анимация появления карточек */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Стеклянный эффект для карточек в темной теме */
.dark .backdrop-blur-md {
  background: rgba(31, 41, 55, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Улучшение line-clamp для описания */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Плавное изменение для интерактивных элементов */
input, select, button {
  transition: all 0.3s ease;
}
</style>