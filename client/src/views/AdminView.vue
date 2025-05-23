<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Проверка прав доступа -->
    <div v-if="!isAdmin" class="text-center py-16">
      <div class="text-red-500 text-lg mb-4">{{ t('admin.accessDenied') }}</div>
      <router-link to="/" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90">
        {{ t('navigation.home') }}
      </router-link>
    </div>

    <template v-else>
      <h1 class="text-3xl font-bold mb-6">{{ t('admin.title') }}</h1>
      
      <div class="admin-tabs mb-6">
        <div class="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'py-2 px-4 text-center font-medium text-sm leading-5 rounded-t-lg focus:outline-none transition',
              activeTab === tab.value 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      
      <div class="admin-content">
        <component :is="currentTabComponent"></component>
      </div>
    </template>
  </div>
</template> 

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useLanguageStore } from '../store/language';
import axios from 'axios';
import AdminUsersView from './AdminUsersView.vue'
import AdminContentView from './AdminContentView.vue'
import AdminCommentsView from './AdminCommentsView.vue'
import AdminTasksView from './AdminTasksView.vue'
import AdminForbiddenWordsView from './AdminForbiddenWordsView.vue'

const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = (key) => languageStore.t(key);

// Проверка прав администратора
const isAdmin = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role === 'admin';
});

// Вкладки
const tabs = computed(() => [
  { label: t('admin.content.title'), value: 'content' },
  { label: t('admin.tasksManagement'), value: 'tasks' },
  { label: t('admin.users.title'), value: 'users' },
  { label: t('admin.comments.title'), value: 'comments' },
  { label: t('admin.forbiddenWords.title') || 'Запрещенные слова', value: 'forbiddenWords' }
]);
const activeTab = ref('users');

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'users': return AdminUsersView
    case 'content': return AdminContentView
    case 'comments': return AdminCommentsView
    case 'tasks': return AdminTasksView
    case 'forbiddenWords': return AdminForbiddenWordsView
    default: return AdminUsersView
  }
})

// Общие данные
const categories = [
  'HTML', 'CSS', 'JavaScript', 'Vue', 'React', 'Angular', 'Node.js', 'Express', 'MongoDB'
];

const difficultyLevels = [1, 2, 3, 4, 5];

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(languageStore.currentLanguage, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// ===== Управление статьями =====
const articles = ref([]);
const loadingArticles = ref(false);
const articlesFilter = ref({
  category: '',
  status: '',
  search: ''
});
const articlesPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});
const showCreateArticleForm = ref(false);
const editingArticle = ref(null);
const articleFormError = ref('');

// Загрузка статей
const fetchArticles = async () => {
  if (!isAdmin.value) return;
  
  loadingArticles.value = true;
  
  try {
    const params = {
      page: articlesPagination.value.page,
      limit: articlesPagination.value.limit,
      ...articlesFilter.value
    };
    
    const response = await axios.get('/api/admin/articles', { params });
    articles.value = response.data.articles;
    articlesPagination.value.total = response.data.total;
    articlesPagination.value.totalPages = response.data.totalPages;
  } catch (error) {
    console.error('Ошибка при загрузке статей:', error);
  } finally {
    loadingArticles.value = false;
  }
};

// Просмотр статьи
const viewArticle = (articleId) => {
  router.push({ name: 'article', params: { id: articleId } });
};

// Редактирование статьи
const editArticle = async (articleId) => {
  try {
    const response = await axios.get(`/api/articles/${articleId}`);
    editingArticle.value = response.data;
    router.push({ name: 'article-form', params: { id: articleId } });
  } catch (error) {
    console.error('Ошибка при загрузке статьи для редактирования:', error);
  }
};

// Публикация статьи
const publishArticle = async (articleId) => {
  try {
    await axios.put(`/api/admin/articles/${articleId}/publish`);
    await fetchArticles();
  } catch (error) {
    console.error('Ошибка при публикации статьи:', error);
  }
};

// Подтверждение удаления статьи
const articleToDelete = ref(null);
const showDeleteConfirmation = ref(false);

const confirmDeleteArticle = (articleId) => {
  articleToDelete.value = articleId;
  showDeleteConfirmation.value = true;
};

// Удаление статьи
const deleteArticle = async () => {
  if (!articleToDelete.value) return;
  
  try {
    await axios.delete(`/api/articles/${articleToDelete.value}`);
    showDeleteConfirmation.value = false;
    articleToDelete.value = null;
    await fetchArticles();
  } catch (error) {
    console.error('Ошибка при удалении статьи:', error);
  }
};

// Обработка изменения фильтров
watch(articlesFilter, () => {
  articlesPagination.value.page = 1;
  fetchArticles();
}, { deep: true });

// Обработка изменения страницы
watch(() => articlesPagination.value.page, fetchArticles);

// Обработка изменения языка
watch(() => languageStore.currentLanguage, () => {
  // Tabs будут автоматически обновлены, так как это вычисляемое свойство
}, { immediate: true });

// Обработка изменения активной вкладки
watch(activeTab, (newTab) => {
  if (newTab === 'content') {
    fetchArticles();
  } else if (newTab === 'tasks') {
    fetchTasks();
  } else if (newTab === 'users') {
    fetchUsers();
  } else if (newTab === 'comments') {
    fetchComments();
  }
});

// Инициализация
onMounted(() => {
  // Загружаем данные для активной вкладки
  if (activeTab.value === 'articles') {
    fetchArticles();
  }
});

// ===== Управление задачами =====
const tasks = ref([]);
const loadingTasks = ref(false);
const tasksFilter = ref({
  category: '',
  difficulty: '',
  search: ''
});
const tasksPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});
const taskToDelete = ref(null);

// Загрузка задач
const fetchTasks = async () => {
  if (!isAdmin.value) return;
  
  loadingTasks.value = true;
  
  try {
    const params = {
      page: tasksPagination.value.page,
      limit: tasksPagination.value.limit,
      ...tasksFilter.value
    };
    
    const response = await axios.get('/api/admin/tasks', { params });
    tasks.value = response.data.tasks;
    tasksPagination.value.total = response.data.total;
    tasksPagination.value.totalPages = response.data.totalPages;
  } catch (error) {
    console.error('Ошибка при загрузке задач:', error);
  } finally {
    loadingTasks.value = false;
  }
};

// Просмотр задачи
const viewTask = (taskId) => {
  router.push({ name: 'task', params: { id: taskId } });
};

// Редактирование задачи
const editTask = (taskId) => {
  router.push({ name: 'task-form', params: { id: taskId } });
};

// Публикация задачи
const publishTask = async (taskId) => {
  try {
    await axios.put(`/api/admin/tasks/${taskId}/publish`);
    await fetchTasks();
  } catch (error) {
    console.error('Ошибка при публикации задачи:', error);
  }
};

// Подтверждение удаления задачи
const confirmDeleteTask = (taskId) => {
  taskToDelete.value = taskId;
  showDeleteConfirmation.value = true;
};

// Удаление задачи
const deleteTask = async () => {
  if (!taskToDelete.value) return;
  
  try {
    await axios.delete(`/api/tasks/${taskToDelete.value}`);
    showDeleteConfirmation.value = false;
    taskToDelete.value = null;
    await fetchTasks();
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
  }
};

// Обработка изменения фильтров задач
watch(tasksFilter, () => {
  tasksPagination.value.page = 1;
  fetchTasks();
}, { deep: true });

// Обработка изменения страницы задач
watch(() => tasksPagination.value.page, fetchTasks);

// ===== Управление пользователями =====
const users = ref([]);
const loadingUsers = ref(false);
const usersFilter = ref({
  role: '',
  search: ''
});
const usersPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});
const showRoleModal = ref(false);
const selectedUser = ref(null);
const selectedRole = ref('user');
const roleChangeLoading = ref(false);
const roleChangeError = ref('');

// Загрузка пользователей
const fetchUsers = async () => {
  if (!isAdmin.value) return;
  
  loadingUsers.value = true;
  
  try {
    const params = {
      page: usersPagination.value.page,
      limit: usersPagination.value.limit,
      ...usersFilter.value
    };
    
    const response = await axios.get('/api/admin/users', { params });
    users.value = response.data.users;
    usersPagination.value.total = response.data.total;
    usersPagination.value.totalPages = response.data.totalPages;
  } catch (error) {
    console.error('Ошибка при загрузке пользователей:', error);
  } finally {
    loadingUsers.value = false;
  }
};

// Показать модальное окно изменения роли
const showChangeRoleModal = (user) => {
  if (user._id === authStore.user?._id) return; // Запрещаем менять свою роль
  
  selectedUser.value = user;
  selectedRole.value = user.role;
  showRoleModal.value = true;
  roleChangeError.value = '';
};

// Изменить роль пользователя
const changeUserRole = async () => {
  if (!selectedUser.value) return;
  
  roleChangeLoading.value = true;
  roleChangeError.value = '';
  
  try {
    await axios.put(`/api/admin/users/${selectedUser.value._id}/role`, {
      role: selectedRole.value
    });
    
    // Обновляем пользователя в списке
    const userIndex = users.value.findIndex(u => u._id === selectedUser.value._id);
    if (userIndex !== -1) {
      users.value[userIndex].role = selectedRole.value;
    }
    
    showRoleModal.value = false;
  } catch (error) {
    roleChangeError.value = error.response?.data?.message || 'Ошибка при изменении роли';
    console.error('Ошибка при изменении роли пользователя:', error);
  } finally {
    roleChangeLoading.value = false;
  }
};

// Обработка изменения фильтров пользователей
watch(usersFilter, () => {
  usersPagination.value.page = 1;
  fetchUsers();
}, { deep: true });

// Обработка изменения страницы пользователей
watch(() => usersPagination.value.page, fetchUsers);

// ===== Управление комментариями =====
const comments = ref([]);
const loadingComments = ref(false);
const commentsFilter = ref({
  status: '',
  search: ''
});
const commentsPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
});
const showCommentModal = ref(false);
const selectedComment = ref(null);

// Загрузка комментариев
const fetchComments = async () => {
  if (!isAdmin.value) return;
  
  loadingComments.value = true;
  
  try {
    const params = {
      page: commentsPagination.value.page,
      limit: commentsPagination.value.limit,
      ...commentsFilter.value
    };
    
    const response = await axios.get('/api/admin/comments', { params });
    comments.value = response.data.comments;
    commentsPagination.value.total = response.data.total;
    commentsPagination.value.totalPages = response.data.totalPages;
  } catch (error) {
    console.error('Ошибка при загрузке комментариев:', error);
  } finally {
    loadingComments.value = false;
  }
};

// Просмотр деталей комментария
const showCommentDetailsModal = (comment) => {
  selectedComment.value = comment;
  showCommentModal.value = true;
};

// Обновление статуса комментария
const updateCommentStatus = async (commentId, newStatus) => {
  if (!isAdmin.value) return;
  
  try {
    await axios.put(`/api/admin/comments/${commentId}/status`, {
      status: newStatus
    });
    await fetchComments();
  } catch (error) {
    console.error(`Ошибка при обновлении статуса комментария: ${error.message}`);
  }
};

// Удаление комментария
const deleteComment = async (commentId) => {
  if (!isAdmin.value) return;
  
  try {
    await axios.delete(`/api/admin/comments/${commentId}`);
    await fetchComments();
  } catch (error) {
    console.error(`Ошибка при удалении комментария: ${error.message}`);
  }
};

// Обработка изменения фильтров комментариев
watch(commentsFilter, () => {
  commentsPagination.value.page = 1;
  fetchComments();
}, { deep: true });

// Обработка изменения страницы комментариев
watch(() => commentsPagination.value.page, fetchComments);
</script> 

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}

.form-select, .form-input {
  @apply w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary;
}

.admin-table-th {
  @apply px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider;
}

.admin-table-td {
  @apply px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300;
}

.admin-action-btn {
  @apply p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none;
}

.admin-pagination-btn {
  @apply px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none;
}

/* Модальные окна */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xl w-full max-h-screen overflow-auto;
}

.modal-header {
  @apply px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3;
}
</style> 