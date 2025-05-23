<template>
  <div class="admin-tasks">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">{{ $t('admin.tasksManagement') }}</h2>
      <router-link to="/admin/tasks/new" class="btn btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {{ $t('tasks.createTask') }}
      </router-link>
    </div>
    
    <!-- Фильтры -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="difficulty-filter" class="block text-sm font-medium mb-1">{{ $t('tasks.difficulty') }}</label>
          <select id="difficulty-filter" v-model="difficultyFilter" class="input w-full">
            <option value="all">{{ $t('tasks.anyDifficulty') }}</option>
            <option value="easy">{{ $t('tasks.beginner') }}</option>
            <option value="medium">{{ $t('tasks.intermediate') }}</option>
            <option value="hard">{{ $t('tasks.advanced') }}</option>
          </select>
        </div>
        <div>
          <label for="status-filter" class="block text-sm font-medium mb-1">{{ $t('admin.status') }}</label>
          <select id="status-filter" v-model="statusFilter" class="input w-full">
            <option value="all">{{ $t('common.allStatuses') }}</option>
            <option value="published">{{ $t('admin.published') }}</option>
            <option value="draft">{{ $t('admin.draft') }}</option>
          </select>
        </div>
        <div>
          <label for="search-tasks" class="block text-sm font-medium mb-1">{{ $t('common.search') }}</label>
          <input 
            id="search-tasks" 
            v-model="searchQuery" 
            type="text" 
            class="input w-full" 
            :placeholder="$t('admin.searchPlaceholder')"
          />
        </div>
      </div>
    </div>
    
    <!-- Таблица задач -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
      
      <div v-else-if="tasks.length === 0" class="p-6 text-center">
        <p class="text-gray-500">{{ $t('admin.noTasksFound') }}</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400 cursor-pointer" @click="toggleSort('title')">
                {{ $t('tasks.title') }}
                <span v-if="sortBy === 'title'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400 cursor-pointer" @click="toggleSort('difficulty')">
                {{ $t('tasks.difficulty') }}
                <span v-if="sortBy === 'difficulty'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400 cursor-pointer" @click="toggleSort('createdAt')">
                {{ $t('admin.createdAt') }}
                <span v-if="sortBy === 'createdAt'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400 cursor-pointer" @click="toggleSort('isPublished')">
                {{ $t('admin.status') }}
                <span v-if="sortBy === 'isPublished'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ $t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            <tr v-for="task in tasks" :key="task._id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                <div class="flex items-center">
                  <span v-if="!task.isPublished" class="mr-2 w-2 h-2 rounded-full bg-gray-400" title="Черновик"></span>
                  <span>{{ getTaskTitle(task) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ getDifficultyLabel(task.difficulty) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(task.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    task.isPublished 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  ]"
                >
                  <span 
                    :class="[
                      'w-2 h-2 rounded-full mr-1.5',
                      task.isPublished ? 'bg-green-500' : 'bg-gray-500'
                    ]"
                  ></span>
                  {{ task.isPublished ? $t('admin.published') : $t('admin.draft') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <div class="flex space-x-2">
                  <router-link :to="`/tasks/${task._id}`" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" :title="$t('common.view')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>
                  <router-link :to="`/admin/tasks/${task._id}/edit`" class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300" :title="$t('common.edit')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </router-link>
                  <button @click="confirmDeleteTask(task._id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" :title="$t('common.delete')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button 
                    @click="confirmTogglePublishStatus(task._id, task.isPublished)"
                    :title="task.isPublished ? $t('admin.unpublish') : $t('admin.publish')"
                    :class="task.isPublished ? 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'"
                  >
                    <svg v-if="task.isPublished" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            {{ $t('admin.showing') }} <span class="font-medium">{{ (currentPage - 1) * limit + 1 }}</span> {{ $t('admin.to') }} 
            <span class="font-medium">{{ Math.min(currentPage * limit, totalTasks) }}</span> {{ $t('admin.of') }} 
            <span class="font-medium">{{ totalTasks }}</span> {{ $t('admin.results') }}
          </div>
          <div>
            <nav class="flex items-center">
              <button 
                @click="changePage(currentPage - 1)" 
                class="mr-2 px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                :disabled="currentPage === 1"
              >
                {{ $t('admin.previous') }}
              </button>
              <button 
                @click="changePage(currentPage + 1)" 
                class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                :disabled="currentPage === totalPages"
              >
                {{ $t('admin.next') }}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Диалоги подтверждения -->
    <confirm-dialog
      v-if="showConfirmDelete"
      :title="$t('admin.confirmDeleteTask')"
      :message="$t('admin.confirmDeleteTaskText')"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      :confirm-type="'danger'"
      show
      @confirm="deleteTask"
      @cancel="showConfirmDelete = false"
    />
    
    <confirm-dialog
      v-if="showConfirmPublish"
      :title="$t('admin.publish')"
      :message="$t('admin.confirmPublish')"
      :confirm-text="$t('admin.publish')"
      :cancel-text="$t('common.cancel')"
      :confirm-type="'success'"
      show
      @confirm="toggleTaskPublishStatus"
      @cancel="showConfirmPublish = false"
    />
    
    <confirm-dialog
      v-if="showConfirmUnpublish"
      :title="$t('admin.unpublish')"
      :message="$t('admin.confirmUnpublish')"
      :confirm-text="$t('admin.unpublish')"
      :cancel-text="$t('common.cancel')"
      :confirm-type="'primary'"
      show
      @confirm="toggleTaskPublishStatus"
      @cancel="showConfirmUnpublish = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/store/toast';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { useLanguageStore } from '@/store/language';

const router = useRouter();
const toastStore = useToastStore();
const { t } = useI18n();
const languageStore = useLanguageStore();

// Состояние
const tasks = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const limit = 10;
const totalTasks = ref(0);
const totalPages = ref(0);
const showConfirmDelete = ref(false);
const taskToDelete = ref(null);
const showConfirmPublish = ref(false);
const showConfirmUnpublish = ref(false);
const taskToTogglePublish = ref(null);

// Фильтры и сортировка
const difficultyFilter = ref('all');
const statusFilter = ref('all');
const searchQuery = ref('');
const sortBy = ref('createdAt');
const sortOrder = ref('asc');

// Получение задач
const fetchTasks = async () => {
  loading.value = true;
  
  try {
    const params = {
      page: currentPage.value,
      limit,
      difficulty: difficultyFilter.value !== 'all' ? difficultyFilter.value : undefined,
      search: searchQuery.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    };

    
    // Добавляем параметр status только если выбран конкретный статус
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value;
    }
    
    const response = await axios.get('/api/admin/tasks', { params });

    console.log(response)
    
    // Нормализуем формат данных
    const normalizedTasks = response.data.tasks.map(task => {
      // Проверяем наличие обоих полей для определения статуса публикации
      let isTaskPublished;
      
      if (typeof task.isPublished === 'boolean') {
        isTaskPublished = task.isPublished;
      } else if (task.status) {
        isTaskPublished = task.status === 'published';
      } else {
        // Значение по умолчанию, если ни одно из полей не найдено
        isTaskPublished = false;
      }
      
      return {
        ...task,
        isPublished: isTaskPublished
      };
    });
    
    tasks.value = normalizedTasks;
    totalTasks.value = response.data.totalTasks || response.data.total || 0;
    totalPages.value = response.data.totalPages || Math.ceil(totalTasks.value / limit);
  } catch (error) {
    console.error('Ошибка при загрузке задач:', error);
    toastStore.error(t('tasks.loadError'));
  } finally {
    loading.value = false;
  }
};

// Изменение страницы
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchTasks();
};

// Переключение сортировки
const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1; // Сбрасываем страницу при изменении сортировки
  fetchTasks();
};

// Получение метки сложности
const getDifficultyLabel = (difficulty) => {
  switch (difficulty) {
    case 'easy': return t('tasks.beginner');
    case 'medium': return t('tasks.intermediate');
    case 'hard': return t('tasks.advanced');
    default: return difficulty;
  }
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(document.documentElement.lang || 'ru', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Получение заголовка задачи в зависимости от языка
const getTaskTitle = (task) => {
  const currentLang = languageStore.currentLanguage;
  
  // Проверяем наличие перевода на текущем языке
  if (task.translations && task.translations[currentLang]?.title) {
    return task.translations[currentLang].title;
  }
  
  // Если нет перевода на текущем языке, пробуем получить на другом языке
  if (task.translations) {
    const otherLang = currentLang === 'ru' ? 'en' : 'ru';
    if (task.translations[otherLang]?.title) {
      return task.translations[otherLang].title;
    }
  }
  
  // Если нет переводов, возвращаем основной заголовок
  return task.title || t('common.untitled');
};

// Подтверждение удаления
const confirmDeleteTask = (taskId) => {
  taskToDelete.value = taskId;
  showConfirmDelete.value = true;
};

// Удаление задачи
const deleteTask = async () => {
  if (!taskToDelete.value) return;
  
  try {
    await axios.delete(`/api/tasks/${taskToDelete.value}`);
    toastStore.success(t('tasks.deleteSuccess'));
    showConfirmDelete.value = false;
    taskToDelete.value = null;
    fetchTasks();
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    toastStore.error(t('tasks.deleteError'));
  }
};

// Подтверждение смены статуса
const confirmTogglePublishStatus = (taskId, isPublished) => {
  taskToTogglePublish.value = taskId;
  if (isPublished) {
    showConfirmUnpublish.value = true;
  } else {
    showConfirmPublish.value = true;
  }
};

// Смена статуса публикации
const toggleTaskPublishStatus = async () => {
  try {
    const taskId = taskToTogglePublish.value;
    if (!taskId) return;
    
    const taskIndex = tasks.value.findIndex(t => t._id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks.value[taskIndex];
    const newStatus = !task.isPublished;
    
    const response = await axios.put(`/api/admin/tasks/${taskId}/toggle-publish`);
    
    if (response.data && response.data.success) {
      toastStore.success(newStatus ? t('tasks.publishSuccess') : t('tasks.unpublishSuccess'));
      
      // Очищаем кэш на стороне сервера
      await axios.delete('/api/tasks/clear-cache');
      
      // Обновляем список задач немедленно
      await fetchTasks();
    } else {
      throw new Error('Не удалось обновить статус публикации');
    }
    
    showConfirmPublish.value = false;
    showConfirmUnpublish.value = false;
  } catch (error) {
    console.error('Ошибка при изменении статуса публикации:', error);
    toastStore.error(t('tasks.updateError'));
  }
};

// Слежение за изменениями
watch([difficultyFilter, statusFilter, searchQuery, sortBy, sortOrder], () => {
  currentPage.value = 1; // Сбрасываем страницу при изменении фильтров
  fetchTasks();
}, { deep: true });

// Слежение за изменением языка
watch(() => languageStore.currentLanguage, () => {
  // При изменении языка обновляем список задач
  fetchTasks();
});

// Загрузка данных
onMounted(() => {
  fetchTasks();
});
</script>