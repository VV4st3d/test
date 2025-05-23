<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
    </div>

    <div v-else-if="article" class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Основное содержимое статьи -->
      <div class="lg:col-span-3">
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-4">{{ getTranslatedField('title') }}</h1>
          <div class="flex flex-wrap items-center gap-4 text-gray-500 mb-4">
            <span>{{ article.category }}</span>
            <span>•</span>
            <span>{{ t(`articles.${article.difficulty}`) }}</span>
            <span>•</span>
            <span>{{ new Date(article.createdAt).toLocaleDateString() }}</span>
          </div>
          
          <!-- Теги статьи -->
          <div class="flex flex-wrap gap-2 mb-4" v-if="article.tags && article.tags.length">
            <span 
              v-for="tag in article.tags" 
              :key="tag" 
              class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300"
            >
              {{ tag }}
            </span>
          </div>
          
          <div class="flex items-center gap-4">
            <button
              v-if="isAuthenticated"
              class="btn"
              :class="isFavorite ? 'btn-primary' : 'btn-secondary'"
              @click="toggleFavorite"
            >
              {{ isFavorite ? t('articles.removeFavorite') : t('articles.addFavorite') }}
            </button>
          </div>
        </div>

        <div class="prose dark:prose-invert max-w-none mb-12" v-html="renderedContent"></div>

        <div class="border-t pt-8">
          <h2 class="text-2xl font-bold mb-6">{{ t('articles.comments') }}</h2>

          <div v-if="isAuthenticated" class="mb-8">
            <div v-if="replyingToComment" class="mb-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
              <div class="flex justify-between items-center">
                <span>
                  {{ t('comments.replyingTo') }}: <span class="font-semibold">{{ replyingToComment.author?.name || t('common.anonymous') }}</span>
                </span>
                <button 
                  @click="cancelReply" 
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ replyingToComment.content }}</p>
            </div>
            <textarea
              v-model="newComment"
              class="input mb-4 w-full border rounded-md p-2"
              rows="3"
              :placeholder="replyingToComment ? t('comments.replyPlaceholder') : t('comments.commentPlaceholder')"
            ></textarea>
            <div class="flex justify-end space-x-2">
              <button 
                v-if="replyingToComment"
                class="btn btn-secondary"
                @click="cancelReply"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                class="btn btn-primary"
                @click="submitComment"
                :disabled="!newComment.trim()"
              >
                {{ replyingToComment ? t('comments.submitReply') : t('comments.postComment') }}
              </button>
            </div>
          </div>

          <div v-if="comments.length === 0" class="text-gray-500 text-center py-4">
            {{ t('articles.noComments') }}
          </div>

          <TransitionGroup v-else name="comment" tag="div" class="space-y-6">
            <CommentItem
              v-for="comment in comments"
              :key="comment._id"
              :comment="comment"
              :isAdmin="isAdmin"
              :user="userForComments"
              @delete="deleteComment"
              @edit="editComment"
              @reply="setReply"
              :level="0"
            />
          </TransitionGroup>

          <!-- Пагинация -->
          <div class="flex justify-center mt-4" v-if="totalPages > 1">
            <nav class="flex space-x-2">
              <button
                @click="changePage(page - 1)"
                :disabled="page === 1"
                class="px-3 py-1 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                «
              </button>
              <button
                v-for="p in totalPages"
                :key="p"
                @click="changePage(p)"
                :class="page === p ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
                class="px-3 py-1 rounded-md"
              >
                {{ p }}
              </button>
              <button
                @click="changePage(page + 1)"
                :disabled="page === totalPages"
                class="px-3 py-1 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                »
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      <!-- Боковая панель -->
      <div class="lg:col-span-1">
        <div class="sticky top-24">
          <!-- Содержание -->
          <div class="card mb-6">
            <h3 class="font-bold text-lg mb-2">{{ t('articles.tableOfContents') }}</h3>
            <div class="text-sm sidebar-content">
              <div v-html="tableOfContents"></div>
            </div>
          </div>
          
          <!-- Похожие статьи -->
          <div class="card mb-6" v-if="relatedArticles.length">
            <h3 class="font-bold text-lg mb-2">{{ t('articles.relatedArticles') }}</h3>
            <div class="space-y-3">
              <div v-for="related in relatedArticles" :key="related._id" class="text-sm">
                <router-link 
                  :to="`/articles/${related._id}`" 
                  class="hover:text-[var(--color-primary)] block"
                >
                  {{ getTranslatedField('title', related) }}
                </router-link>
                <p class="text-xs text-gray-500">{{ related.category }} • {{ t(`articles.${related.difficulty}`) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Популярные теги -->
          <div class="card" v-if="popularTags.length">
            <h3 class="font-bold text-lg mb-2">{{ t('articles.popularTags') }}</h3>
            <div class="flex flex-wrap gap-2">
              <router-link
                v-for="tag in popularTags"
                :key="tag"
                :to="`/articles?tags=${tag}`"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-[var(--color-primary)] hover:text-white dark:bg-gray-700 dark:text-gray-300"
              >
                {{ tag }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Модальное окно подтверждения удаления комментария -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('common.confirmDelete') || 'Подтверждение удаления' }}</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        {{ t('comments.confirmDelete') || 'Вы уверены, что хотите удалить этот комментарий?' }}
      </p>
      <div class="flex justify-end space-x-3">
        <button 
          @click="showDeleteModal = false" 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {{ t('common.cancel') }}
        </button>
        <button 
          @click="deleteComment(commentToDelete.value)" 
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          {{ t('common.delete') }}
        </button>
      </div>
    </div>
  </div>
  
  <!-- Модальное окно редактирования комментария -->
  <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('comments.editComment') || 'Редактирование комментария' }}</h3>
      
      <textarea
        v-model="editedCommentContent"
        class="input mb-4 w-full border rounded-md p-2 resize-y"
        rows="4"
        :placeholder="t('comments.commentPlaceholder')"
      ></textarea>
      
      <div class="flex justify-end space-x-3">
        <button 
          @click="showEditModal = false" 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {{ t('common.cancel') }}
        </button>
        <button 
          @click="saveEditedComment()" 
          class="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-accent)]"
          :disabled="!editedCommentContent.trim()"
        >
          {{ t('common.save') || 'Сохранить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted, onUpdated } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLanguageStore } from '../store/language';
import { useAuthStore } from '../store/auth';
import { useProgressStore } from '../store/progress';
import CommentItem from '../components/CommentItem.vue';
import axios from 'axios';
import { useToast } from '@/composables/toast';
import { marked } from 'marked';
import hljs from 'highlight.js';

// Определяем props, включая id, передаваемый из роутера
const props = defineProps({
  id: {
    type: String,
    required: false
  }
});

const languageStore = useLanguageStore();
const authStore = useAuthStore();
const progressStore = useProgressStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const t = (key) => languageStore.t(key);

const article = ref(null);
const comments = ref([]);
const loading = ref(true);
const newComment = ref('');
const forbiddenWords = ref([]);
const parentCommentId = ref('');
const isFavorite = ref(false);
const relatedArticles = ref([]);
const popularTags = ref([]);
const isArticleRead = ref(false);
const hasMarkedAsRead = ref(false);
const page = ref(1);
const limit = ref(10);
const totalPages = ref(1);
const totalComments = ref(0);
const replyingToComment = ref(null);
const commentToDelete = ref(null);
const commentToEdit = ref(null);
const editedCommentContent = ref('');
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const userLoaded = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAuthenticated && authStore.user?.role === 'admin');

// Получаем id статьи либо из props, либо из параметров маршрута
const articleId = computed(() => props.id || route.params.id);

// Настраиваем marked для использования highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    try {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      } else {
        return hljs.highlightAuto(code).value;
      }
    } catch (e) {
      console.error('Highlight.js error:', e);
      return code;
    }
  },
  gfm: true,
  breaks: true,
  headerIds: true,
  langPrefix: 'hljs language-'
});

// Создание содержания на основе заголовков в статье
const tableOfContents = computed(() => {
  if (!article.value || !renderedContent.value) return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderedContent.value;
  
  const headings = tempDiv.querySelectorAll('h2, h3');
  if (headings.length === 0) return '';
  
  let toc = '<ul class="list-disc pl-5">';
  
  headings.forEach((heading, index) => {
    const id = `heading-${index}`;
    const isSubHeading = heading.tagName === 'H3';
    const className = isSubHeading ? 'pl-4' : '';
    
    toc += `
      <li class="${className} mb-1">
        <a 
          class="hover:text-[var(--color-primary)] toc-link cursor-pointer" 
          data-heading-id="${id}"
          onclick="document.getElementById('${id}')?.scrollIntoView({behavior: 'smooth'});"
        >
          ${heading.textContent}
        </a>
      </li>
    `;
  });
  
  toc += '</ul>';
  return toc;
});

// Функция для обработки клика на ссылку в содержании
const setupTocListeners = () => {
  const sidebarContent = document.querySelector('.sidebar-content');
  if (sidebarContent) {
    sidebarContent.removeEventListener('click', handleTocClick);
    sidebarContent.addEventListener('click', handleTocClick);
  }
};

const handleTocClick = (event) => {
  const tocLink = event.target.closest('.toc-link');
  if (tocLink) {
    event.preventDefault();
    const headingId = tocLink.getAttribute('data-heading-id');
    if (headingId) {
      scrollToHeading(headingId);
    }
  }
};

const scrollToHeading = (headingId) => {
  const heading = document.getElementById(headingId);
  if (heading) {
    const navHeight = 80;
    const headingRect = heading.getBoundingClientRect();
    const absoluteTop = window.pageYOffset + headingRect.top;
    
    window.scrollTo({
      top: absoluteTop - navHeight - 20,
      behavior: 'smooth'
    });
    
    heading.classList.add('heading-highlight');
    setTimeout(() => {
      heading.classList.remove('heading-highlight');
    }, 2000);
  }
};

// Получение перевода из статьи
const getTranslatedField = (field, item = article.value) => {
  if (!item) return '';
  if (item.translations) {
    const currentLang = languageStore.currentLanguage;
    if (item.translations[currentLang] && item.translations[currentLang][field]) {
      return item.translations[currentLang][field];
    }
    const availableLang = Object.keys(item.translations).find(lang => 
      item.translations[lang] && item.translations[lang][field]
    );
    if (availableLang) {
      return item.translations[availableLang][field];
    }
  }
  return item[field] || item[`${field}${languageStore.currentLanguage === 'en' ? 'En' : ''}`] || '';
};

const renderedContent = computed(() => {
  const content = getTranslatedField('content');
  if (!content) return '';
  
  let processedContent = content
    .replace(/:::info\s+(.*?)\s*\n([\s\S]*?):::/g, '<div class="info-block"><h4>$1</h4>$2</div>')
    .replace(/:::warning\s+(.*?)\s*\n([\s\S]*?):::/g, '<div class="warning-block"><h4>$1</h4>$2</div>')
    .replace(/:::tip\s+(.*?)\s*\n([\s\S]*?):::/g, '<div class="tip-block"><h4>$1</h4>$2</div>')
    .replace(/:::important\s+(.*?)\s*\n([\s\S]*?):::/g, '<div class="important-block"><h4>$1</h4>$2</div>');
  
  return marked.parse(processedContent);
});

// Применение ID к заголовкам и добавление кнопок копирования
const applyHeadingIds = () => {
  setTimeout(() => {
    const contentDiv = document.querySelector('.prose');
    if (contentDiv) {
      const headings = contentDiv.querySelectorAll('h2, h3');
      headings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
      
      const codeBlocks = contentDiv.querySelectorAll('pre');
      codeBlocks.forEach((block) => {
        if (block.querySelector('.copy-button')) return;
        block.style.position = 'relative';
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
          </svg>
        `;
        copyButton.title = t('articles.copyCode');
        
        copyButton.addEventListener('click', () => {
          const code = block.querySelector('code').innerText;
          navigator.clipboard.writeText(code).then(() => {
            copyButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `;
            copyButton.title = t('articles.copied');
            setTimeout(() => {
              copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                </svg>
              `;
              copyButton.title = t('articles.copyCode');
            }, 2000);
          }).catch(err => {
            console.error('Ошибка при копировании кода:', err);
            toast.error(t('articles.copyError'));
          });
        });
        
        block.appendChild(copyButton);
      });
    }
  }, 100);
};

// Отслеживание прокрутки
const setupScrollTracking = () => {
  if (!authStore.isAuthenticated || !article.value || hasMarkedAsRead.value || isArticleRead.value) {
    return;
  }
  
  const handleScroll = () => {
    if (hasMarkedAsRead.value || isArticleRead.value) {
      return;
    }
    
    const contentElement = document.querySelector('.prose');
    if (!contentElement) return;
    
    const scrollHeight = contentElement.scrollHeight;
    const scrollPosition = window.scrollY + window.innerHeight;
    const contentTop = contentElement.offsetTop;
    const contentBottom = contentTop + scrollHeight;
    
    if (scrollPosition >= contentBottom - (scrollHeight * 0.1)) {
      markArticleAsRead();
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  return handleScroll;
};

let scrollHandler = null;

const markArticleAsRead = async () => {
  if (!authStore.isAuthenticated || hasMarkedAsRead.value || isArticleRead.value) {
    return;
  }
  
  try {
    hasMarkedAsRead.value = true;
    const response = await axios.post(`/api/articles/${articleId.value}/read`);
    if (response.data.success) {
      isArticleRead.value = true;
      if (progressStore) {
        progressStore.loadProgress();
      }
    }
  } catch (error) {
    console.error('Ошибка при отметке статьи как прочитанной:', error);
    hasMarkedAsRead.value = false;
    toast.error(t('articles.readError'));
  }
};

// Загрузка списка запрещенных слов
const fetchForbiddenWords = async () => {
  try {
    const response = await axios.get('/api/forbidden-words/client');
    forbiddenWords.value = response.data.forbiddenWords || [];
  } catch (error) {
    console.error('Error loading forbidden words:', error);
    toast.error(t('notifications.error') || 'Ошибка загрузки запрещенных слов');
  }
};

// Экранирование специальных символов для регулярных выражений
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Проверка комментария на запрещенные слова
const checkCommentForForbiddenWords = () => {
  const text = newComment.value.toLowerCase();
  const foundWords = [];

  forbiddenWords.value.forEach(wordObj => {
    try {
      if (wordObj.isRegex) {
        const regex = new RegExp(wordObj.word, 'i');
        if (regex.test(text)) {
          foundWords.push(wordObj.word);
        }
      } else {
        // Проверка основного слова
        const regex = new RegExp(`\\b${escapeRegExp(wordObj.word)}\\b`, 'i');
        if (regex.test(text)) {
          foundWords.push(wordObj.word);
          return; // Если нашли основное слово, не проверяем английскую версию
        }
        
        // Проверка английского варианта, если он задан
        if (wordObj.englishWord && wordObj.englishWord.trim()) {
          const engRegex = new RegExp(`\\b${escapeRegExp(wordObj.englishWord)}\\b`, 'i');
          if (engRegex.test(text)) {
            foundWords.push(wordObj.word); // Добавляем основное слово для отображения
          }
        }
      }
    } catch (e) {
      console.error(`Error checking forbidden word: ${wordObj.word}`, e);
    }
  });

  const linkPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9._-]+\.(com|org|net|ru|io|xyz|me|info))/gi;
  const links = text.match(linkPattern) || [];

  if (foundWords.length > 0) {
    toast.warning(`${t('comments.containsForbiddenWords')}: ${foundWords.join(', ')}`);
    return false;
  }

  if (links.length > 2) {
    toast.warning(t('comments.excessiveLinks'));
    return false;
  }

  return true;
};

const fetchArticle = async () => {
  try {
    loading.value = true;
    const params = { lang: languageStore.currentLanguage };
    
    const articleResponse = await axios.get(`/api/articles/${articleId.value}`, { params });
    article.value = articleResponse.data;
    
    if (article.value.isRead) {
      isArticleRead.value = true;
    }
    
    // Убедимся, что данные пользователя загружены перед загрузкой комментариев
    if (!userLoaded.value && isAuthenticated.value) {
      await initializeUserData();
    }
    
    // Загружаем комментарии с пагинацией
    await fetchComments();
    
    if (authStore.isAuthenticated) {
      try {
        const favoriteResponse = await axios.get(`/api/articles/${articleId.value}/favorite`);
        isFavorite.value = favoriteResponse.data.isFavorite;
      } catch (favoriteError) {
        console.error('Error checking favorite status:', favoriteError);
      }
    }
    
    await fetchRelatedArticles();
    await fetchPopularTags();
    
    setTimeout(() => {
      applyHeadingIds();
      setupTocListeners();
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
      }
      scrollHandler = setupScrollTracking();
    }, 200);
  } catch (error) {
    console.error('Error loading article:', error);
    toast.error(t('articles.error') || 'Ошибка загрузки статьи');
  } finally {
    loading.value = false;
  }
};

const fetchComments = async () => {
  try {
    // Убедимся, что пользовательские данные загружены перед загрузкой комментариев
    if (isAuthenticated.value && !userLoaded.value) {
      await initializeUserData();
    }
    
    const response = await axios.get(`/api/articles/${articleId.value}/comments`, {
      params: { page: page.value, limit: limit.value }
    });
    comments.value = response.data.comments || [];
    totalPages.value = response.data.totalPages || 1;
    totalComments.value = response.data.totalComments || 0;
    
  } catch (error) {
    console.error('Error loading comments:', error);
    toast.error(t('comments.commentError') || 'Ошибка загрузки комментариев');
  }
};

const fetchRelatedArticles = async () => {
  if (!article.value) return;
  
  try {
    const params = {
      category: article.value.category,
      limit: 3,
      lang: languageStore.currentLanguage
    };
    
    if (article.value.tags && article.value.tags.length) {
      params.tags = article.value.tags.join(',');
    }
    
    const response = await axios.get('/api/articles', { params });
    relatedArticles.value = response.data.articles.filter(
      a => a._id !== article.value._id
    ).slice(0, 3);
  } catch (error) {
    console.error('Error loading related articles:', error);
  }
};

const fetchPopularTags = async () => {
  try {
    const response = await axios.get('/api/articles/tags');
    if (response.data && Array.isArray(response.data.tags)) {
      popularTags.value = response.data.tags.slice(0, 10);
    }
  } catch (error) {
    console.error('Error loading tags:', error);
  }
};

const submitComment = async () => {
  if (!checkCommentForForbiddenWords()) {
    return;
  }
  
  try {
    const response = await axios.post(`/api/articles/${articleId.value}/comments`, {
      content: newComment.value,
      parentComment: parentCommentId.value || undefined
    });
    
    if (!parentCommentId.value) {
      comments.value.unshift(response.data.comment);
    } else {
      const parentComment = findComment(comments.value, parentCommentId.value);
      if (parentComment) {
        parentComment.replies = parentComment.replies || [];
        parentComment.replies.unshift(response.data.comment);
      }
    }
    
    newComment.value = '';
    parentCommentId.value = '';
    replyingToComment.value = null;
    
    if (response.data.message.includes('ожидает модерации')) {
      toast.info(t('comments.moderationPending') || 'Комментарий отправлен на модерацию');
    } else {
      toast.success(t('comments.commentSuccess') || 'Комментарий успешно опубликован');
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
    if (error.response && error.response.data) {
      const { message, details } = error.response.data;
      if (message.includes('запрещенные слова') && details && details.forbiddenWords) {
        const words = details.forbiddenWords.join(', ');
        toast.error(`${t('comments.containsForbiddenWords')}: ${words}`);
      } else if (message.includes('слишком много ссылок')) {
        toast.error(t('comments.excessiveLinks') || 'Слишком много ссылок в комментарии');
      } else if (message.includes('спам')) {
        toast.error(t('comments.spamPattern') || 'Комментарий похож на спам');
      } else {
        toast.error(t('comments.commentError') || 'Ошибка при отправке комментария');
      }
    } else {
      toast.error(t('comments.commentError') || 'Ошибка при отправке комментария');
    }
  }
};

// Подтверждение удаления комментария
const confirmDeleteComment = (commentId) => {
  commentToDelete.value = commentId;
  showDeleteModal.value = true;
};

const deleteComment = async (commentId) => {
  // Если вызвано из кнопки в комментарии, показываем подтверждение
  if (!showDeleteModal.value) {
    confirmDeleteComment(commentId);
    return;
  }
  
  
  // Иначе выполняем удаление
  try {
    await axios.delete(`/api/articles/${articleId.value}/comments/${commentToDelete.value}`);
    comments.value = comments.value.filter(c => c._id !== commentToDelete.value);
    removeCommentFromReplies(comments.value, commentToDelete.value);
    toast.success(t('comments.deleteSuccess'));
    // Закрываем модальное окно
    showDeleteModal.value = false;
    commentToDelete.value = null;
  } catch (error) {
    console.error('Error deleting comment:', error);
    toast.error(t('comments.deleteError'));
  }
};

const editComment = async (comment) => {
  // Устанавливаем комментарий для редактирования и его содержимое
  commentToEdit.value = comment;
  editedCommentContent.value = comment.content;
  showEditModal.value = true;
};

const saveEditedComment = async () => {
  if (!editedCommentContent.value.trim() || !commentToEdit.value) {
    return;
  }
  
  // Проверка на запрещенные слова
  const tempComment = newComment.value;
  newComment.value = editedCommentContent.value.trim();
  
  if (!checkCommentForForbiddenWords()) {
    newComment.value = tempComment;
    return;
  }
  
  newComment.value = tempComment;
  
  try {
    const response = await axios.put(`/api/articles/${articleId.value}/comments/${commentToEdit.value._id}`, {
      content: editedCommentContent.value.trim()
    });
    
    updateCommentInList(comments.value, response.data.comment);
    toast.success(t('comments.editSuccess'));
    
    // Закрываем модальное окно
    showEditModal.value = false;
    commentToEdit.value = null;
    editedCommentContent.value = '';
  } catch (error) {
    console.error('Error editing comment:', error);
    if (error.response && error.response.data) {
      const { message, details } = error.response.data;
      if (message.includes('запрещенные слова') && details && details.forbiddenWords) {
        const words = details.forbiddenWords.join(', ');
        toast.error(`${t('comments.containsForbiddenWords')}: ${words}`);
      } else if (message.includes('слишком много ссылок')) {
        toast.error(t('comments.excessiveLinks'));
      } else if (message.includes('спам')) {
        toast.error(t('comments.spamPattern'));
      } else {
        toast.error(t('comments.editError'));
      }
    } else {
      toast.error(t('comments.editError'));
    }
  }
};

const toggleFavorite = async () => {
  try {
    if (isFavorite.value) {
      await axios.delete(`/api/articles/${articleId.value}/favorite`);
    } else {
      await axios.post(`/api/articles/${articleId.value}/favorite`);
    }
    isFavorite.value = !isFavorite.value;
    toast.success(
      isFavorite.value ? t('articles.addedToFavorites') : t('articles.removedFromFavorites')
    );
  } catch (error) {
    console.error('Error toggling favorite:', error);
    toast.error(t('articles.favoriteError'));
  }
};

// Установка ID родительского комментария
const setReply = (commentId) => {
  parentCommentId.value = commentId;
  // Находим комментарий, на который отвечаем
  replyingToComment.value = findComment(comments.value, commentId);
  // Прокручиваем к форме комментария
  setTimeout(() => {
    document.querySelector('textarea[v-model="newComment"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.querySelector('textarea[v-model="newComment"]')?.focus();
  }, 100);
};

// Отмена ответа на комментарий
const cancelReply = () => {
  parentCommentId.value = '';
  replyingToComment.value = null;
};

// Поиск комментария по ID
const findComment = (comments, commentId) => {
  for (const comment of comments) {
    if (comment._id === commentId) return comment;
    if (comment.replies) {
      const found = findComment(comment.replies, commentId);
      if (found) return found;
    }
  }
  return null;
};

// Удаление комментария из вложенных ответов
const removeCommentFromReplies = (comments, commentId) => {
  for (const comment of comments) {
    if (comment.replies) {
      comment.replies = comment.replies.filter(reply => reply._id !== commentId);
      removeCommentFromReplies(comment.replies, commentId);
    }
  }
};

// Обновление комментария в списке
const updateCommentInList = (comments, updatedComment) => {
  for (const comment of comments) {
    if (comment._id === updatedComment._id) {
      Object.assign(comment, updatedComment);
      return;
    }
    if (comment.replies) {
      updateCommentInList(comment.replies, updatedComment);
    }
  }
};

// Создание плоского списка комментариев для выпадающего меню
const flattenComments = (comments, level = 0) => {
  const result = [];
  for (const comment of comments) {
    result.push({ ...comment, level });
    if (comment.replies && comment.replies.length) {
      result.push(...flattenComments(comment.replies, level + 1));
    }
  }
  return result;
};

// Смена страницы пагинации
const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
    fetchComments();
  }
};

// Инициализируем данные о пользователе, если пользователь авторизован
const initializeUserData = async () => {
  if (isAuthenticated.value) {
    try {
      // Проверяем, загружен ли пользователь с ID
      if (!authStore.user || !authStore.user._id) {
        const userData = await authStore.fetchUser();
        
        // Проверяем загруженные данные
        if (!userData || !userData._id) {
          console.warn('Данные пользователя загружены некорректно:', userData);
          
          // Проверка наличия токена в localStorage
          const token = localStorage.getItem('token');
          if (token) {
            console.log('Токен существует, попытка восстановления сессии');
            // Настройка заголовков авторизации
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Повторная попытка загрузки пользователя
            await authStore.fetchUser();
          } else {
            console.warn('Отсутствует токен авторизации, сеанс может быть истек');
            // Если токена нет, выходим из учетной записи
            authStore.logout();
          }
        } else {
          console.log('Пользовательские данные успешно загружены:', userData._id);
        }
      } else {
        console.log('Пользовательские данные уже загружены:', authStore.user._id);
      }
    } catch (error) {
      console.error('Ошибка при инициализации данных пользователя:', error);
      toast.error('Ошибка авторизации. Пожалуйста, войдите снова.');
    }
  }
  
  userLoaded.value = true;
  return authStore.user;
};

// Подготовленная версия пользовательских данных для компонента комментариев
const userForComments = computed(() => {
  // Если пользователь не авторизован, возвращаем null
  if (!isAuthenticated.value || !authStore.user) {
    return null;
  }
  
  // Получаем ID пользователя из объекта, если он есть
  const userId = authStore.user._id || authStore.user.id;
  
  // Если ID не найден, используем объект как есть
  if (!userId) {
    console.warn('Не удалось определить ID пользователя!', authStore.user);
    return authStore.user;
  }
  
  // Иначе создаем объект с явно указанным ID
  return {
    _id: userId,
    id: userId,
    name: authStore.user.name || 'Пользователь',
    role: authStore.user.role || 'user',
    ...authStore.user
  };
});

onMounted(async () => {
  await initializeUserData();
  fetchArticle();
  fetchForbiddenWords();
  scrollHandler = setupScrollTracking();
});

onUnmounted(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
  }
});

onUpdated(() => {
  applyHeadingIds();
  setupTocListeners();
});

watch(
  [() => languageStore.currentLanguage, () => articleId.value],
  () => {
    page.value = 1;
    fetchArticle();
    fetchForbiddenWords();
    hasMarkedAsRead.value = false;
  }
);

watch(
  () => renderedContent.value,
  () => {
    setTimeout(() => {
      applyHeadingIds();
      setupTocListeners();
    }, 100);
  }
);
</script>

<style scoped>
.sticky {
  position: sticky;
  top: 2rem;
}

.card {
  @apply bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-700;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)] focus:ring-[var(--color-primary)];
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500;
}

.input {
  @apply border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)];
}

/* Анимации для комментариев */
.comment-enter-active,
.comment-leave-active {
  transition: all 0.3s ease;
}
.comment-enter-from,
.comment-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.prose :deep(.heading-highlight) {
  background-color: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.1);
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.5s;
}

.prose :deep(h2), .prose :deep(h3) {
  scroll-margin-top: 100px;
}

.prose :deep(h2) {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.2);
  color: var(--color-primary);
}

.prose :deep(h3) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--color-primary);
}

.prose :deep(h4) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.prose :deep(pre) {
  background-color: var(--bg-code, #1e293b);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1.5rem 0;
  overflow-x: auto;
  border: 1px solid var(--border-code, #334155);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.prose :deep(pre code) {
  color: var(--text-code, #e2e8f0);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre;
}

.prose :deep(:not(pre) > code) {
  background-color: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.1);
  color: var(--color-primary);
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875em;
}

.prose :deep(a) {
  color: var(--color-primary);
  text-decoration: none;
  border-bottom: 1px dashed var(--color-primary);
  transition: border-bottom 0.2s ease;
}

.prose :deep(a:hover) {
  border-bottom: 1px solid var(--color-primary);
}

.prose :deep(ul), .prose :deep(ol) {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}

.prose :deep(ul li::before) {
  content: "•";
  color: var(--color-primary);
  font-weight: bold;
  display: inline-block;
  width: 1rem;
  margin-left: -1rem;
}

.prose :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: var(--text-secondary);
}

.dark .prose :deep(pre) {
  background-color: var(--bg-code);
  border-color: var(--border-code);
}

.dark .prose :deep(:not(pre) > code) {
  background-color: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.15);
}

.dark .prose :deep(blockquote) {
  color: #94a3b8;
}

.prose :deep(.info-block),
.prose :deep(.warning-block),
.prose :deep(.tip-block),
.prose :deep(.important-block) {
  padding: 1rem;
  margin: 1.5rem 0;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.prose :deep(.info-block) {
  background-color: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.1);
  border-left-color: var(--color-primary);
}

.prose :deep(.warning-block) {
  background-color: rgba(var(--color-warning-rgb, var(--warning-rgb)), 0.1);
  border-left-color: var(--color-warning);
}

.prose :deep(.tip-block) {
  background-color: rgba(var(--color-success-rgb, var(--success-rgb)), 0.1);
  border-left-color: var(--color-success);
}

.prose :deep(.important-block) {
  background-color: rgba(var(--color-error-rgb, var(--danger-rgb)), 0.1);
  border-left-color: var(--color-error);
}

.dark .prose :deep(.info-block) {
  background-color: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.15);
}

.dark .prose :deep(.warning-block) {
  background-color: rgba(var(--color-warning-rgb, var(--warning-rgb)), 0.15);
}

.dark .prose :deep(.tip-block) {
  background-color: rgba(var(--color-success-rgb, var(--success-rgb)), 0.15);
}

.dark .prose :deep(.important-block) {
  background-color: rgba(var(--color-error-rgb, var(--danger-rgb)), 0.15);
}

.prose :deep(.info-block h4),
.prose :deep(.warning-block h4),
.prose :deep(.tip-block h4),
.prose :deep(.important-block h4) {
  margin-top: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.prose :deep(.info-block h4) {
  color: var(--color-primary);
}

.prose :deep(.warning-block h4) {
  color: var(--color-warning);
}

.prose :deep(.tip-block h4) {
  color: var(--color-success);
}

.prose :deep(.important-block h4) {
  color: var(--color-error);
}

.prose :deep(.copy-button) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-code, #e2e8f0);
  opacity: 0.6;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

.prose :deep(.copy-button:hover) {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
}

.prose :deep(.copy-button:focus) {
  outline: none;
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.3);
}

.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  overflow-x: auto;
  display: block;
}

.prose :deep(table th) {
  background-color: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.1);
  color: var(--color-primary);
  font-weight: 600;
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid var(--color-primary);
}

.prose :deep(table td) {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.prose :deep(table tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.02);
}

.prose :deep(table tr:hover) {
  background-color: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.05);
}

.dark .prose :deep(table th) {
  background-color: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.15);
}

.dark .prose :deep(table tr:nth-child(even)) {
  background-color: rgba(255, 255, 255, 0.03);
}

.dark .prose :deep(table tr:hover) {
  background-color: rgba(var(--color-primary-rgb, var(--primary-rgb)), 0.1);
}
</style>