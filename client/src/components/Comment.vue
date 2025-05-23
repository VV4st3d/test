<template>
  <div class="card mb-4">
    <div class="flex justify-between items-start mb-2">
      <div>
        <span class="font-semibold">{{ comment.author.name }}</span>
        <span class="text-gray-500 text-sm ml-2">
          {{ formatDate(comment.createdAt) }}
        </span>
        <span v-if="comment.status === 'pending'" class="ml-2 text-xs py-1 px-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
          {{ t('comments.pending') }}
        </span>
      </div>
      <div class="flex gap-2">
        <button 
          v-if="canModerate" 
          class="text-blue-500 hover:text-blue-700"
          @click="moderateComment('approved')"
          :disabled="comment.status === 'approved'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button 
          v-if="canModerate" 
          class="text-red-500 hover:text-red-700"
          @click="moderateComment('rejected')"
          :disabled="comment.status === 'rejected'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button 
          v-if="canEdit" 
          class="text-gray-500 hover:text-gray-700"
          @click="$emit('edit', comment)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          v-if="canDelete" 
          class="text-red-500 hover:text-red-700"
          @click="$emit('delete', comment._id)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button 
          v-if="!canModerate && isAuthenticated && comment.author._id !== user?._id" 
          class="text-gray-500 hover:text-gray-700"
          @click="showReportModal = true"
          :title="t('comments.report')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </button>
      </div>
    </div>
    <p class="text-gray-700 dark:text-gray-300">{{ comment.content }}</p>
    
    <!-- Модальное окно для отправки жалобы -->
    <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('comments.report') }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('comments.reportReason') }}
            </label>
            <select 
              v-model="reportReason" 
              class="block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="spam">{{ t('comments.reportSpam') }}</option>
              <option value="abuse">{{ t('comments.reportAbusive') }}</option>
              <option value="inappropriate">{{ t('comments.reportInappropriate') }}</option>
              <option value="other">{{ t('comments.reportOther') }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('comments.reportDetails') }}
            </label>
            <textarea 
              v-model="reportDetails" 
              rows="3"
              class="block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button 
            @click="showReportModal = false" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {{ t('common.cancel') }}
          </button>
          <button 
            @click="submitReport" 
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {{ t('comments.reportSubmit') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLanguageStore } from '../store/language'
import { useAuthStore } from '../store/auth'
import { useToast } from '../composables/toast'
import axios from 'axios'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'edit', 'moderate', 'report'])

const languageStore = useLanguageStore()
const authStore = useAuthStore()
const toast = useToast()
const t = (key) => languageStore.t(key)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAuthenticated && authStore.user?.role === 'admin')

const canModerate = computed(() => isAdmin.value)
const canEdit = computed(() => isAuthenticated.value && (user.value?._id === props.comment.author._id || isAdmin.value))
const canDelete = computed(() => isAuthenticated.value && (user.value?._id === props.comment.author._id || isAdmin.value))

// Состояние для модального окна жалобы
const showReportModal = ref(false)
const reportReason = ref('spam')
const reportDetails = ref('')

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const moderateComment = (status) => {
  emit('moderate', { id: props.comment._id, status })
}

const submitReport = async () => {
  try {
    // Получаем идентификатор статьи или задачи из URL
    const path = window.location.pathname;
    let url;
    
    if (path.includes('/articles/')) {
      const articleId = path.split('/articles/')[1];
      url = `/api/articles/${articleId}/comments/${props.comment._id}/report`;
    } else if (path.includes('/tasks/')) {
      const taskId = path.split('/tasks/')[1];
      url = `/api/tasks/${taskId}/comments/${props.comment._id}/report`;
    } else {
      // Если не можем определить контекст, используем старый формат
      url = `/api/comments/${props.comment._id}/report`;
    }
    
    await axios.post(url, {
      reason: reportReason.value,
      details: reportDetails.value
    });
    
    toast.success(t('comments.reportSuccess'));
    showReportModal.value = false;
    reportReason.value = 'spam';
    reportDetails.value = '';
  } catch (error) {
    console.error('Error reporting comment:', error);
    toast.error(t('comments.reportError'));
  }
}
</script> 