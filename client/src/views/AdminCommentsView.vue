<template>
  <div class="admin-comments">
    <h1 class="text-2xl font-bold mb-4">{{ t('admin.comments.title') }}</h1>
    
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
    </div>
    
    <div v-else class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
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
          v-model="statusFilter" 
          class="p-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">{{ t('common.allStatuses') || 'Все статусы' }}</option>
          <option value="pending">{{ t('comments.pending') || 'На модерации' }}</option>
          <option value="approved">{{ t('comments.approved') || 'Одобренные' }}</option>
          <option value="rejected">{{ t('comments.rejected') || 'Отклоненные' }}</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.comments.table.id') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.comments.table.content') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.comments.table.author') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.status') || 'Статус' }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.comments.table.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.comments.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="comment in filteredComments" :key="comment._id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ comment._id.slice(-6) }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                <div class="max-w-xs truncate">{{ comment.content }}</div>
                <div v-if="comment.moderationNote" class="mt-1">
                  <span class="text-xs font-medium text-red-600 dark:text-red-400 whitespace-normal">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {{ comment.moderationNote.length > 50 ? comment.moderationNote.substring(0, 50) + '...' : comment.moderationNote }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ comment.author?.name || t('common.anonymous') || 'Аноним' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  :class="{
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': comment.status === 'pending',
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': comment.status === 'approved',
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': comment.status === 'rejected'
                  }" 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ getStatusLabel(comment.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(comment.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <button 
                    v-if="comment.status !== 'approved'" 
                    @click="approveComment(comment._id)" 
                    class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    :title="t('admin.comments.actions.approve')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button 
                    v-if="comment.status !== 'rejected'"
                    @click="rejectComment(comment._id)" 
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    :title="t('admin.comments.actions.reject')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button 
                    @click="confirmDeleteComment(comment)" 
                    class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                    :title="t('admin.comments.actions.delete')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button 
                    @click="viewCommentDetails(comment)" 
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    :title="t('admin.comments.viewDetails') || 'Просмотреть детали'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredComments.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {{ t('admin.noCommentsFound') || 'Комментарии не найдены' }}
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

    <!-- Модальное окно просмотра комментария -->
    <div v-if="showCommentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('admin.commentDetails') || 'Просмотр комментария' }}</h3>
        
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">ID: {{ selectedComment?._id }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('admin.comments.table.author') || 'Автор' }}: {{ selectedComment?.author?.name || t('common.anonymous') || 'Аноним' }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('admin.comments.table.date') || 'Дата' }}: {{ formatDate(selectedComment?.createdAt) }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('admin.status') || 'Статус' }}: {{ getStatusLabel(selectedComment?.status) }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400" v-if="selectedComment?.contentTitle">
              {{ t('admin.comments.relatedContent') || 'К материалу' }}: {{ selectedComment?.contentTitle }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400" v-if="selectedComment?.moderationNote">
              {{ t('admin.comments.moderationNote') || 'Примечание для модератора' }}: 
              <span class="font-medium text-red-600 dark:text-red-400">{{ selectedComment?.moderationNote }}</span>
            </p>
          </div>
          
          <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p class="text-gray-800 dark:text-gray-200">{{ selectedComment?.content }}</p>
          </div>
        </div>
        
        <div class="flex justify-between mt-6">
          <div class="space-x-2">
            <button 
              v-if="selectedComment?.status !== 'approved'"
              @click="approveComment(selectedComment?._id, true)" 
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              {{ t('admin.comments.actions.approve') }}
            </button>
            <button 
              v-if="selectedComment?.status !== 'rejected'"
              @click="rejectComment(selectedComment?._id, true)" 
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              {{ t('admin.comments.actions.reject') }}
            </button>
          </div>
          
          <button 
            @click="showCommentModal = false" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('common.confirmDelete') || 'Подтверждение удаления' }}</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          {{ t('admin.comments.confirmDelete') || 'Вы уверены, что хотите удалить этот комментарий?' }}
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {{ t('common.cancel') }}
          </button>
          <button 
            @click="deleteComment" 
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
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '@/composables/toast'
import { useAuthStore } from '@/store/auth'
import { useLanguageStore } from '@/store/language'
import axios from 'axios'

const toast = useToast()
const authStore = useAuthStore()
const languageStore = useLanguageStore()
const t = (key) => languageStore.t(key)

// Состояние для списка комментариев
const comments = ref([])
const searchTerm = ref('')
const statusFilter = ref('')
const page = ref(1)
const limit = ref(10)
const totalComments = ref(0)
const totalPages = computed(() => Math.ceil(totalComments.value / limit.value))
const loading = ref(false)

// Модальные окна и выбранный комментарий
const showCommentModal = ref(false)
const showDeleteModal = ref(false)
const selectedComment = ref(null)
const commentToDelete = ref(null)

// Функция получения метки статуса
const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return t('comments.pending')
    case 'approved': return t('comments.approved')
    case 'rejected': return t('comments.rejected')
    default: return status
  }
}

// Фильтрация комментариев
const filteredComments = computed(() => {
  let result = comments.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(comment => 
      comment.content.toLowerCase().includes(term) ||
      (comment.author?.name && comment.author.name.toLowerCase().includes(term))
    )
  }

  if (statusFilter.value) {
    result = result.filter(comment => comment.status === statusFilter.value)
  }

  return result
})

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

// Загрузка комментариев с фильтрами
const fetchComments = async () => {
  try {
    loading.value = true;
    
    const params = {
      page: page.value,
      limit: limit.value,
      status: statusFilter.value || undefined
    }
    
    if (searchTerm.value) {
      params.search = searchTerm.value
    }
    
    console.log('Fetching comments with params:', params);
    
    // Запрос к API для получения всех комментариев (используем маршрут для админов)
    const response = await axios.get('/api/comments/pending', { params });
    
    console.log('Comments response:', response.data);
    
    // Обрабатываем полученные данные
    comments.value = response.data.comments || [];
    totalComments.value = response.data.totalPending || response.data.totalComments || 0;
    
    if (response.data.totalPages > 0 && page.value > response.data.totalPages) {
      page.value = 1;
      await fetchComments();
    }
  } catch (error) {
    toast.error(t('notifications.error'));
    console.error('Failed to fetch comments:', error);
  } finally {
    loading.value = false;
  }
}

// Просмотр деталей комментария
const viewCommentDetails = (comment) => {
  selectedComment.value = comment
  showCommentModal.value = true
}

// Одобрение комментария
const approveComment = async (commentId, closeModal = false) => {
  if (!commentId) return;

  try {
    await axios.put(`/api/comments/${commentId}/moderate`, { 
      status: 'approved',
      moderationNote: 'Одобрено администратором'
    });
    
    toast.success(t('admin.comments.approveSuccess') || 'Комментарий одобрен');
    
    if (closeModal) {
      showCommentModal.value = false;
    }
    
    await fetchComments();
  } catch (error) {
    toast.error(t('notifications.error'));
    console.error('Failed to approve comment:', error);
  }
}

// Отклонение комментария
const rejectComment = async (commentId, closeModal = false) => {
  if (!commentId) return;

  try {
    await axios.put(`/api/comments/${commentId}/moderate`, { 
      status: 'rejected',
      moderationNote: 'Отклонено администратором'
    });
    
    toast.success(t('admin.comments.rejectSuccess') || 'Комментарий отклонен');
    
    if (closeModal) {
      showCommentModal.value = false;
    }
    
    await fetchComments();
  } catch (error) {
    toast.error(t('notifications.error'));
    console.error('Failed to reject comment:', error);
  }
}

// Подтверждение удаления комментария
const confirmDeleteComment = (comment) => {
  commentToDelete.value = comment
  showDeleteModal.value = true
}

// Удаление комментария
const deleteComment = async () => {
  if (!commentToDelete.value) return

  try {
    await axios.delete(`/api/comments/${commentToDelete.value._id}`)
    toast.success(t('admin.comments.deleteSuccess') || 'Комментарий удален')
    showDeleteModal.value = false
    commentToDelete.value = null
    await fetchComments()
  } catch (error) {
    toast.error(t('notifications.error'))
    console.error('Failed to delete comment:', error)
  }
}

// Загрузка данных при монтировании компонента
onMounted(async () => {
  await fetchComments()
})

// Отслеживание изменения страницы
watch(page, async () => {
  await fetchComments()
})

// Отслеживание изменения фильтров
watch([searchTerm, statusFilter], () => {
  page.value = 1;
  fetchComments();
}, { deep: true });
</script> 