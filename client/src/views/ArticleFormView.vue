<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{{ isEditMode ? t('articles.edit') : t('articles.create') }}</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div class="flex items-center mb-6 border-b pb-4">
        <button 
          v-for="lang in ['ru', 'en']" 
          :key="lang" 
          @click="currentLang = lang"
          class="px-4 py-2 mr-2 rounded-md transition-colors"
          :class="currentLang === lang ? 
            'bg-blue-500 text-white dark:bg-blue-600' : 
            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          :style="currentLang === lang ? { backgroundColor: themeStore.currentColorScheme.primary } : {}"
        >
          {{ lang === 'ru' ? 'Русский' : 'English' }}
        </button>
        <div class="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {{ t('articles.translationStatus') }}: 
          <span :class="isRussianComplete ? 'text-green-500' : 'text-yellow-500'">RU</span> / 
          <span :class="isEnglishComplete ? 'text-green-500' : 'text-yellow-500'">EN</span>
        </div>
      </div>
      
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Общие поля -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('articles.category') }}</label>
            <select 
              v-model="article.category" 
              required
              class="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
            >
              <option value="">{{ t('articles.selectCategory') }}</option>
              <option value="HTML">HTML</option>
              <option value="CSS">CSS</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Vue">Vue</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="MongoDB">MongoDB</option>
              <option value="TypeScript">TypeScript</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('articles.difficulty') }}</label>
            <select 
              v-model="article.difficulty" 
              required
              class="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
            >
              <option value="">{{ t('articles.selectDifficulty') }}</option>
              <option value="beginner">{{ t('articles.beginner') }}</option>
              <option value="intermediate">{{ t('articles.intermediate') }}</option>
              <option value="advanced">{{ t('articles.advanced') }}</option>
            </select>
          </div>
        </div>
        
        <!-- Поля для текущего языка -->
        <div v-if="currentLang === 'ru'">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('articles.title') }} (RU)</label>
            <input 
              type="text" 
              v-model="article.translations.ru.title" 
              required
              class="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
              :placeholder="t('articles.titlePlaceholder')"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('articles.description') }} (RU)</label>
            <textarea 
              v-model="article.translations.ru.description" 
              required
              rows="3"
              class="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
              :placeholder="t('articles.descriptionPlaceholder')"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('articles.content') }} (RU)</label>
            <textarea 
              v-model="article.translations.ru.content" 
              required
              rows="15"
              class="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 font-mono"
              :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
              :placeholder="t('articles.contentPlaceholder')"
            ></textarea>
          </div>
        </div>
        
        <div v-else>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('articles.title') }} (EN)</label>
            <input 
              type="text" 
              v-model="article.translations.en.title" 
              required
              class="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
              :placeholder="t('articles.titlePlaceholder')"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('articles.description') }} (EN)</label>
            <textarea 
              v-model="article.translations.en.description" 
              required
              rows="3"
              class="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2"
              :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
              :placeholder="t('articles.descriptionPlaceholder')"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('articles.content') }} (EN)</label>
            <textarea 
              v-model="article.translations.en.content" 
              required
              rows="15"
              class="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 font-mono"
              :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
              :placeholder="t('articles.contentPlaceholder')"
            ></textarea>
          </div>
        </div>
        
        <!-- Дополнительные настройки -->
        <div class="border-t pt-4 mt-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('articles.additionalSettings') }}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('articles.tags') }}</label>
              <div class="flex flex-wrap gap-2 mb-3">
                <div 
                  v-for="(tag, index) in article.tags" 
                  :key="index"
                  class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md flex items-center"
                >
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ tag }}</span>
                  <button 
                    type="button"
                    @click="removeTag(index)" 
                    class="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="flex flex-col gap-2">
                <div class="flex items-center">
                  <input 
                    type="text" 
                    v-model="newTag" 
                    @keydown.enter.prevent="addTag"
                    class="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 min-w-[150px]"
                    :style="{ '--tw-ring-color': themeStore.currentColorScheme.primary + '80' }"
                    :placeholder="t('articles.addTag')"
                  />
                  <button 
                    type="button"
                    @click="addTag"
                    class="ml-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center w-10 h-10"
                    :style="{ backgroundColor: themeStore.currentColorScheme.primary, color: 'white' }"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-4 pt-4">
          <button 
            type="button" 
            @click="cancel" 
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 text-white rounded-lg transition-colors"
            :style="{ backgroundColor: themeStore.currentColorScheme.primary, borderColor: themeStore.currentColorScheme.accent }"
            :disabled="!isFormValid"
          >
            {{ isEditMode ? t('common.save') : t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageStore } from '../store/language'
import { useThemeStore } from '../store/theme'
import { useAuthStore } from '../store/auth'
import { useToastStore } from '../store/toast'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const t = (key) => languageStore.t(key)
const isEditMode = computed(() => route.params.id !== undefined)
const currentLang = ref('ru')
const newTag = ref('')

const article = ref({
  category: '',
  difficulty: '',
  isPublished: true,
  tags: [],
  translations: {
    ru: {
      title: '',
      description: '',
      content: ''
    },
    en: {
      title: '',
      description: '',
      content: ''
    }
  }
})

// Проверка прав администратора
const isAdmin = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role === 'admin'
})

// Проверка заполненности формы для каждого языка
const isRussianComplete = computed(() => {
  const ru = article.value.translations.ru
  return ru.title.trim() !== '' && ru.description.trim() !== '' && ru.content.trim() !== ''
})

const isEnglishComplete = computed(() => {
  const en = article.value.translations.en
  return en.title.trim() !== '' && en.description.trim() !== '' && en.content.trim() !== ''
})

// Валидация формы
const isFormValid = computed(() => {
  return (
    article.value.category !== '' &&
    article.value.difficulty !== '' &&
    isRussianComplete.value && 
    isEnglishComplete.value
  )
})

// Загрузка статьи для редактирования
onMounted(async () => {
  if (!isAdmin.value) {
    toastStore.error(t('admin.accessDenied'))
    router.push('/')
    return
  }
  
  if (isEditMode.value) {
    try {
      console.log('Fetching article for editing:', route.params.id);
      const response = await axios.get(`/api/articles/${route.params.id}`);
      
      if (response.data) {
        console.log('Received article data:', response.data);
        
        // Проверяем наличие и структуру поля translations
        if (!response.data.translations || 
            !response.data.translations.ru || 
            !response.data.translations.en) {
          console.log('Converting article from old format to new format');
          
          // Если статья в старом формате, преобразуем ее
          article.value = {
            ...response.data,
            tags: response.data.tags || [],
            translations: {
              ru: {
                title: response.data.title || '',
                description: response.data.description || '',
                content: response.data.content || ''
              },
              en: {
                title: response.data.titleEn || '',
                description: response.data.descriptionEn || '',
                content: response.data.contentEn || ''
              }
            }
          };
          
          // Удаляем старые поля
          delete article.value.title;
          delete article.value.description;
          delete article.value.content;
          delete article.value.titleEn;
          delete article.value.descriptionEn;
          delete article.value.contentEn;
        } else {
          console.log('Article already in new format with translations');
          
          // Проверяем наличие всех необходимых полей в translations
          if (!response.data.translations.ru.title) response.data.translations.ru.title = '';
          if (!response.data.translations.ru.description) response.data.translations.ru.description = '';
          if (!response.data.translations.ru.content) response.data.translations.ru.content = '';
          
          if (!response.data.translations.en.title) response.data.translations.en.title = '';
          if (!response.data.translations.en.description) response.data.translations.en.description = '';
          if (!response.data.translations.en.content) response.data.translations.en.content = '';
          
          article.value = response.data;
        }
        
        // Убедимся, что tags всегда является массивом
        if (!Array.isArray(article.value.tags)) {
          article.value.tags = [];
        }
        
        console.log('Processed article for form:', article.value);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toastStore.error(t('notifications.error'));
      router.push('/articles');
    }
  } 
});

// Добавление тега
const addTag = () => {
  const tag = newTag.value.trim();
  
  if (!tag) {
    return; // Не добавляем пустые теги
  }
  
  // Инициализируем массив тегов, если он не существует
  if (!Array.isArray(article.value.tags)) {
    article.value.tags = [];
  }
  
  // Проверяем, не существует ли уже такой тег (без учета регистра)
  const tagExists = article.value.tags.some(existingTag => 
    existingTag.toLowerCase() === tag.toLowerCase()
  );
  
  if (!tagExists) {
    console.log('Adding tag:', tag);
    article.value.tags.push(tag);
    newTag.value = ''; // Очищаем поле ввода
  } else {
    console.log('Tag already exists:', tag);
    // Можно добавить уведомление, что тег уже существует
    toastStore.info(t('articles.tagAlreadyExists'));
  }
}

// Удаление тега
const removeTag = (index) => {
  article.value.tags.splice(index, 1)
}

// Отправка формы
const submitForm = async () => {
  if (!isAdmin.value) {
    toastStore.error(t('admin.accessDenied'))
    return
  }
  
  if (!isFormValid.value) {
    toastStore.error(t('articles.formIncomplete'))
    return
  }
  
  try {
    console.log('Submitting article form:', isEditMode.value ? 'edit mode' : 'create mode');
    console.log('Article data to submit:', JSON.stringify(article.value, null, 2));
    
    let response;
    
    if (isEditMode.value) {
      // Обновляем существующую статью
      console.log('Updating article with ID:', route.params.id);
      response = await axios.put(`/api/articles/${route.params.id}`, article.value);
      console.log('Update response:', response.data);
      toastStore.success(t('articles.updateSuccess'));
    } else {
      // Создаем новую статью
      console.log('Creating new article');
      response = await axios.post('/api/articles', article.value);
      console.log('Create response:', response.data);
      toastStore.success(t('articles.createSuccess'));
    }
    
    if (response.data) {
      router.push(`/articles/${response.data._id || response.data.id}`);
    }
  } catch (error) {
    console.error('Error saving article:', error);
    console.error('Error details:', error.response?.data);
    toastStore.error(t('notifications.error'));
  }
};

// Отмена и возврат
const cancel = () => {
  if (isEditMode.value) {
    router.push(`/articles/${route.params.id}`)
  } else {
    router.push('/articles')
  }
}
</script>

<style scoped>
.article-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.content-editor {
  font-family: monospace;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #4a89dc;
  color: white;
}

.btn-primary:hover {
  background-color: #357cd2;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style> 