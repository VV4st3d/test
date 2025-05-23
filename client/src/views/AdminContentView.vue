<template>
  <div class="admin-content">
    <h1 class="text-2xl font-bold mb-4">{{ t('admin.content.title') }}</h1>
    
    <div class="flex justify-end mb-4">
      <router-link 
        :to="{ name: 'new-article' }" 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('admin.content.actions.createArticle') }}
      </router-link>
    </div>
    
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <div class="relative">
          <input
            type="text"
            v-model="searchTerm"
            class="block w-64 p-2 pl-10 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            :placeholder="t('admin.searchPlaceholder')"
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <select 
          v-model="categoryFilter" 
          class="p-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">{{ t('common.allCategories') }}</option>
          <option value="HTML">HTML</option>
          <option value="CSS">CSS</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Vue">Vue</option>
          <option value="React">React</option>
          <option value="Node.js">Node.js</option>
          <option value="MongoDB">MongoDB</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.content.table.id') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.content.table.title') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.content.table.category') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.content.table.author') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.content.table.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.content.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="content in filteredContent" :key="content._id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ content._id.slice(-6) }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ getContentTitle(content) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  v-if="content.category"
                  class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ content.category }}
                </span>
                <span v-else class="text-gray-500">
                  {{ t('common.notSpecified') || 'Не указана' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ content.author?.name || t('common.system') }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(content.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <router-link 
                    :to="{ name: 'edit-article', params: { id: content._id } }"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    :title="t('admin.content.actions.editArticle')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </router-link>
                  
                  <button 
                    @click="confirmDeleteContent(content)" 
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    :title="t('admin.content.actions.delete')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredContent.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {{ t('admin.noContentFound') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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

    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('common.confirmDelete') }}</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          {{ t('admin.content.confirmDeleteMessage', { title: getContentTitle(contentToDelete) }) }}
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {{ t('common.cancel') }}
          </button>
          <button 
            @click="deleteContent" 
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {{ t('common.delete') }}
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
import { useRouter } from 'vue-router';
import axios from 'axios';

const toast = useToast();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const router = useRouter();
const t = (key, params) => languageStore.t(key, params);

const isAdmin = computed(() => authStore.isAuthenticated && authStore.user?.role === 'admin');

const content = ref([]);
const searchTerm = ref('');
const categoryFilter = ref('');
const page = ref(1);
const limit = ref(10);
const totalContent = ref(0);
const totalPages = computed(() => Math.ceil(totalContent.value / limit.value));

const showDeleteModal = ref(false);
const contentToDelete = ref(null);

const getContentTitle = (content) => {
  if (!content) return t('common.untitled');
  
  const lang = languageStore.currentLanguage;
  
  // Проверяем наличие translations и его структуру
  if (content.translations) {
    // Пытаемся получить заголовок на текущем языке
    if (content.translations[lang]?.title) {
      return content.translations[lang].title;
    }
    
    // Если нет на текущем языке, пробуем английский
    if (content.translations.en?.title) {
      return content.translations.en.title;
    }
    
    // Если нет в translations.en, ищем в любом доступном языке
    for (const langKey in content.translations) {
      if (content.translations[langKey]?.title) {
        return content.translations[langKey].title;
      }
    }
  }
  
  // Для обратной совместимости проверяем старый формат
  if (content.title) {
    return content.title;
  }
  
  if (content.titleRu && lang === 'ru') {
    return content.titleRu;
  }
  
  if (content.titleEn && lang === 'en') {
    return content.titleEn;
  }
  
  // Если ничего не найдено, возвращаем запасной вариант
  return t('common.untitled');
};

const filteredContent = computed(() => {
  let result = content.value;

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    result = result.filter(item => {
      // Проверяем наличие translations и его структуру
      const titleRu = item.translations?.ru?.title?.toLowerCase() || '';
      const titleEn = item.translations?.en?.title?.toLowerCase() || '';
      const contentRu = item.translations?.ru?.content?.toLowerCase() || '';
      const contentEn = item.translations?.en?.content?.toLowerCase() || '';
      
      // Проверяем также старый формат
      const oldTitle = item.title?.toLowerCase() || '';
      const oldTitleEn = item.titleEn?.toLowerCase() || '';
      
      return titleRu.includes(term) || 
             titleEn.includes(term) || 
             contentRu.includes(term) || 
             contentEn.includes(term) ||
             oldTitle.includes(term) ||
             oldTitleEn.includes(term);
    });
  }

  if (categoryFilter.value) {
    result = result.filter(item => item.category === categoryFilter.value);
  }

  return result;
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(languageStore.currentLanguage, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const fetchContent = async () => {
  if (!isAdmin.value) {
    toast.error(t('admin.accessDenied'));
    router.push('/');
    return;
  }
  
  try {
    console.log('Fetching articles with params:', {
      page: page.value,
      limit: limit.value,
      search: searchTerm.value,
      category: categoryFilter.value
    });
    
    const response = await axios.get('/api/admin/articles', {
      params: {
        page: page.value,
        limit: limit.value,
        search: searchTerm.value,
        category: categoryFilter.value
      }
    });
    
    console.log('Articles response:', response.data);
    
    // Проверяем структуру ответа
    if (!response.data || typeof response.data !== 'object') {
      console.error('Invalid API response format:', response.data);
      toast.error(t('notifications.error'));
      return;
    }
    
    // Проверяем наличие массива статей
    const articles = response.data.articles || [];
    if (Array.isArray(articles)) {
      // Проверяем каждую статью на корректность
      const validArticles = articles.filter(article => article && typeof article === 'object');
      
      if (validArticles.length !== articles.length) {
        console.warn(`Filtered out ${articles.length - validArticles.length} invalid articles`);
      }
      
      // Преобразуем статьи, чтобы убедиться, что у каждой есть поле translations
      const processedArticles = validArticles.map(article => {
        // Если у статьи нет поля translations, создаем его
        if (!article.translations) {
          article.translations = {
            ru: { title: article.title || article.titleRu || t('common.untitled') },
            en: { title: article.titleEn || article.title || t('common.untitled') }
          };
        }
        return article;
      });
      
      content.value = processedArticles;
      console.log('Processed articles:', content.value);
    } else {
      console.error('Articles is not an array:', articles);
      content.value = [];
    }
    
    totalContent.value = response.data.totalArticles || 0;
  } catch (error) {
    console.error('Failed to load content:', error);
    toast.error(t('notifications.error'));
    content.value = [];
  }
};

const confirmDeleteContent = (item) => {
  if (!isAdmin.value) {
    toast.error(t('admin.accessDenied'));
    return;
  }
  
  contentToDelete.value = item;
  showDeleteModal.value = true;
};

const deleteContent = async () => {
  if (!contentToDelete.value || !isAdmin.value) return;

  try {
    await axios.delete(`/api/articles/${contentToDelete.value._id}`);
    toast.success(t('admin.content.deleteSuccess'));
    showDeleteModal.value = false;
    contentToDelete.value = null;
    await fetchContent();
  } catch (error) {
    toast.error(t('notifications.error'));
    console.error('Failed to delete content:', error);
  }
};

onMounted(async () => {
  if (isAdmin.value) {
    await fetchContent();
  } else {
    router.push('/');
  }
});

watch(page, async () => {
  await fetchContent();
});

watch([searchTerm, categoryFilter], () => {
  page.value = 1;
  fetchContent();
}, { deep: true });

// Слежение за изменением языка
watch(() => languageStore.currentLanguage, () => {
  // При изменении языка обновляем список статей
  fetchContent();
});
</script>