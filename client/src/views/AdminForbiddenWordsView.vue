<template>
  <div class="admin-forbidden-words">
    <h1 class="text-2xl font-bold mb-4">{{ t('admin.forbiddenWords.title') || 'Управление запрещенными словами' }}</h1>
    
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
    </div>
    
    <div v-else>
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
        <!-- Панель с фильтрами и кнопкой добавления -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div class="relative">
              <input
                type="text"
                v-model="searchTerm"
                class="block w-full sm:w-64 p-2 pl-10 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="t('admin.searchPlaceholder') || 'Поиск...'"
              />
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            
            <select 
              v-model="categoryFilter" 
              class="p-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full sm:w-auto"
            >
              <option value="">{{ t('common.allCategories') || 'Все категории' }}</option>
              <option value="spam">{{ t('admin.forbiddenWords.categories.spam') || 'Спам' }}</option>
              <option value="abuse">{{ t('admin.forbiddenWords.categories.abuse') || 'Оскорбления' }}</option>
              <option value="adult">{{ t('admin.forbiddenWords.categories.adult') || 'Контент 18+' }}</option>
              <option value="drugs">{{ t('admin.forbiddenWords.categories.drugs') || 'Наркотики' }}</option>
              <option value="other">{{ t('admin.forbiddenWords.categories.other') || 'Другое' }}</option>
            </select>
          </div>
          
          <button 
            @click="showAddWordModal = true" 
            class="btn btn-primary w-full md:w-auto"
          >
            {{ t('admin.forbiddenWords.addWord') || 'Добавить запрещенное слово' }}
          </button>
        </div>

        <!-- Таблица запрещенных слов -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.forbiddenWords.table.word') || 'Слово' }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ 'Английский вариант' }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.forbiddenWords.table.category') || 'Категория' }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.forbiddenWords.table.type') || 'Тип' }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.forbiddenWords.table.addedBy') || 'Добавил' }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.forbiddenWords.table.date') || 'Дата' }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.forbiddenWords.table.actions') || 'Действия' }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="word in filteredWords" :key="word._id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ word.word }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ word.englishWord || '—' }}</td>
                <td class="px-6 py-4 text-sm">
                  <span 
                    :class="{
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': word.category === 'abuse',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': word.category === 'spam',
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300': word.category === 'adult',
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': word.category === 'drugs',
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300': word.category === 'other'
                    }" 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getCategoryLabel(word.category) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ word.isRegex ? t('admin.forbiddenWords.regex') || 'Регулярное выражение' : t('admin.forbiddenWords.word') || 'Слово' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ word.addedBy?.name || '-' }}</td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ formatDate(word.createdAt) }}</td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex space-x-2">
                    <button 
                      @click="editWord(word)" 
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      :title="t('admin.forbiddenWords.actions.edit') || 'Редактировать'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="confirmDeleteWord(word)" 
                      class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      :title="t('admin.forbiddenWords.actions.delete') || 'Удалить'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredWords.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {{ t('admin.forbiddenWords.noWordsFound') || 'Запрещенные слова не найдены' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Пагинация -->
        <div class="flex justify-center mt-4" v-if="totalPages > 1">
          <nav class="flex space-x-2">
            <button 
              @click="page = page - 1" 
              :disabled="page === 1"
              class="px-3 py-1 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              &laquo;
            </button>
            <button 
              v-for="p in totalPages" 
              :key="p" 
              @click="page = p"
              :class="page === p ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
              class="px-3 py-1 rounded-md"
            >
              {{ p }}
            </button>
            <button 
              @click="page = page + 1" 
              :disabled="page === totalPages || totalPages === 0"
              class="px-3 py-1 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              &raquo;
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования слова -->
    <div v-if="showAddWordModal || showEditWordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ showEditWordModal ? (t('admin.forbiddenWords.editWord') || 'Редактировать запрещенное слово') : (t('admin.forbiddenWords.addWord') || 'Добавить запрещенное слово') }}
        </h3>
        
        <div class="space-y-4">
          <!-- Поле для ввода слова (только при добавлении) -->
          <div v-if="!showEditWordModal">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('admin.forbiddenWords.wordLabel') || 'Слово' }} *
            </label>
            <input 
              type="text" 
              v-model="wordForm.word"
              class="block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="t('admin.forbiddenWords.wordPlaceholder') || 'Введите запрещенное слово'"
            />
          </div>
          
          <!-- Поле для ввода английского варианта -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('admin.forbiddenWords.englishWordLabel') || 'Английский вариант' }}
            </label>
            <input 
              type="text" 
              v-model="wordForm.englishWord"
              class="block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="t('admin.forbiddenWords.englishWordPlaceholder') || 'Введите запрещенное слово на английском (необязательно)'"
            />
          </div>
          
          <!-- Категория -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('admin.forbiddenWords.categoryLabel') || 'Категория' }} *
            </label>
            <select 
              v-model="wordForm.category"
              class="block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="spam">{{ t('admin.forbiddenWords.categories.spam') || 'Спам' }}</option>
              <option value="abuse">{{ t('admin.forbiddenWords.categories.abuse') || 'Оскорбления' }}</option>
              <option value="adult">{{ t('admin.forbiddenWords.categories.adult') || 'Контент 18+' }}</option>
              <option value="drugs">{{ t('admin.forbiddenWords.categories.drugs') || 'Наркотики' }}</option>
              <option value="other">{{ t('admin.forbiddenWords.categories.other') || 'Другое' }}</option>
            </select>
          </div>
          
          <!-- Тип (регулярное выражение или обычное слово) -->
          <div v-if="!showEditWordModal">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="isRegex" 
                v-model="wordForm.isRegex"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label for="isRegex" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {{ t('admin.forbiddenWords.isRegex') || 'Регулярное выражение' }}
              </label>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1" v-if="wordForm.isRegex">
              {{ t('admin.forbiddenWords.regexHelp') || 'Введите корректное регулярное выражение без ограничителей /.../' }}
            </p>
          </div>
          
          <!-- Описание -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('admin.forbiddenWords.descriptionLabel') || 'Описание' }}
            </label>
            <textarea 
              v-model="wordForm.description"
              rows="3"
              class="block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="t('admin.forbiddenWords.descriptionPlaceholder') || 'Описание (необязательно)'"
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="closeWordModal" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {{ t('common.cancel') || 'Отмена' }}
          </button>
          <button 
            @click="saveWord" 
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            :disabled="!isFormValid || isSaving"
          >
            <span v-if="isSaving" class="mr-2">
              <svg class="animate-spin h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ t('common.save') || 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('common.confirmDelete') || 'Подтверждение удаления' }}</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          {{ t('admin.forbiddenWords.confirmDelete') || 'Вы уверены, что хотите удалить это запрещенное слово?' }}
          <span class="font-medium">{{ selectedWord?.word }}</span>
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {{ t('common.cancel') || 'Отмена' }}
          </button>
          <button 
            @click="deleteWord" 
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="mr-2">
              <svg class="animate-spin h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ t('common.delete') || 'Удалить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from '@/composables/toast';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';
import axios from 'axios';

const toast = useToast();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = (key) => languageStore.t(key);

// Состояние для списка запрещенных слов
const forbiddenWords = ref([]);
const searchTerm = ref('');
const categoryFilter = ref('');
const page = ref(1);
const limit = ref(10);
const totalWords = ref(0);
const totalPages = computed(() => Math.ceil(totalWords.value / limit.value));
const loading = ref(true);

// Состояние для модальных окон
const showAddWordModal = ref(false);
const showEditWordModal = ref(false);
const showDeleteModal = ref(false);
const selectedWord = ref(null);
const isSaving = ref(false);
const isDeleting = ref(false);

// Форма для добавления/редактирования слова
const wordForm = ref({
  word: '',
  englishWord: '',
  category: 'other',
  isRegex: false,
  description: ''
});

// Проверка валидности формы
const isFormValid = computed(() => {
  if (showEditWordModal.value) {
    return !!wordForm.value.category;
  }
  return !!wordForm.value.word && !!wordForm.value.category;
});

// Отфильтрованный список запрещенных слов
const filteredWords = computed(() => {
  return forbiddenWords.value;
});

// Загрузка списка запрещенных слов
const loadForbiddenWords = async () => {
  try {
    loading.value = true;
    
    // Подготовка параметров запроса
    const params = {
      page: page.value,
      limit: limit.value
    };
    
    // Добавляем фильтры, если они указаны
    if (searchTerm.value) {
      params.search = searchTerm.value;
    }
    
    if (categoryFilter.value) {
      params.category = categoryFilter.value;
    }
    
    const response = await axios.get('/api/forbidden-words', { params });
    
    // Обновляем данные
    forbiddenWords.value = response.data.forbiddenWords || [];
    totalWords.value = response.data.totalWords || 0;
  } catch (error) {
    console.error('Error loading forbidden words:', error);
    toast.error(t('notifications.error') || 'Произошла ошибка при загрузке данных');
  } finally {
    loading.value = false;
  }
};

// Получение метки категории
const getCategoryLabel = (category) => {
  const categories = {
    'spam': t('admin.forbiddenWords.categories.spam') || 'Спам',
    'abuse': t('admin.forbiddenWords.categories.abuse') || 'Оскорбления',
    'adult': t('admin.forbiddenWords.categories.adult') || 'Контент 18+',
    'drugs': t('admin.forbiddenWords.categories.drugs') || 'Наркотики',
    'other': t('admin.forbiddenWords.categories.other') || 'Другое'
  };
  
  return categories[category] || category;
};

// Форматирование даты
const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Открытие модального окна для редактирования
const editWord = (word) => {
  selectedWord.value = word;
  wordForm.value = {
    category: word.category,
    isRegex: word.isRegex,
    description: word.description || '',
    englishWord: word.englishWord || ''
  };
  showEditWordModal.value = true;
};

// Открытие модального окна для подтверждения удаления
const confirmDeleteWord = (word) => {
  selectedWord.value = word;
  showDeleteModal.value = true;
};

// Закрытие модальных окон
const closeWordModal = () => {
  showAddWordModal.value = false;
  showEditWordModal.value = false;
  selectedWord.value = null;
  wordForm.value = {
    word: '',
    category: 'other',
    isRegex: false,
    description: '',
    englishWord: ''
  };
};

// Сохранение слова (добавление или редактирование)
const saveWord = async () => {
  try {
    isSaving.value = true;
    
    if (showEditWordModal.value && selectedWord.value) {
      // Редактирование существующего слова
      const response = await axios.put(`/api/forbidden-words/${selectedWord.value._id}`, {
        category: wordForm.value.category,
        description: wordForm.value.description,
        englishWord: wordForm.value.englishWord
      });
      
      toast.success(t('admin.forbiddenWords.updateSuccess') || 'Запрещенное слово успешно обновлено');
    } else {
      // Добавление нового слова
      const response = await axios.post('/api/forbidden-words', {
        word: wordForm.value.word,
        category: wordForm.value.category,
        isRegex: wordForm.value.isRegex,
        description: wordForm.value.description,
        englishWord: wordForm.value.englishWord
      });
      
      toast.success(t('admin.forbiddenWords.addSuccess') || 'Запрещенное слово успешно добавлено');
    }
    
    // Закрываем модальное окно и обновляем список
    closeWordModal();
    await loadForbiddenWords();
  } catch (error) {
    console.error('Error saving forbidden word:', error);
    
    const errorMessage = error.response?.data?.message || 
                         (t('notifications.error') || 'Произошла ошибка');
    
    toast.error(errorMessage);
  } finally {
    isSaving.value = false;
  }
};

// Удаление слова
const deleteWord = async () => {
  if (!selectedWord.value) return;
  
  try {
    isDeleting.value = true;
    
    await axios.delete(`/api/forbidden-words/${selectedWord.value._id}`);
    
    toast.success(t('admin.forbiddenWords.deleteSuccess') || 'Запрещенное слово успешно удалено');
    
    // Закрываем модальное окно и обновляем список
    showDeleteModal.value = false;
    selectedWord.value = null;
    await loadForbiddenWords();
  } catch (error) {
    console.error('Error deleting forbidden word:', error);
    toast.error(t('notifications.error') || 'Произошла ошибка при удалении');
  } finally {
    isDeleting.value = false;
  }
};

// Загрузка данных при изменении параметров
watch([page, searchTerm, categoryFilter], () => {
  loadForbiddenWords();
});

// Загрузка данных при монтировании компонента
onMounted(() => {
  loadForbiddenWords();
});
</script> 