<template>
  <div class="card" :class="{ 'ml-8': level > 0 }">
    <div class="flex justify-between items-start mb-2">
      <div>
        <span class="font-semibold">{{ comment.author?.name || t('common.anonymous') }}</span>
        <span class="text-gray-500 text-sm ml-2">
          {{ new Date(comment.createdAt).toLocaleDateString() }}
        </span>
        <span v-if="comment.status === 'pending'" class="text-yellow-500 text-sm ml-2">
          {{ t('comments.pending') }}
        </span>
        <span v-if="comment.isDeleted" class="text-red-500 text-sm ml-2">
          {{ t('comments.deleted') }}
        </span>
      </div>
      
      <!-- Кнопки действий: отображаются для админов и авторов комментариев -->
      <div class="flex gap-2">
        <!-- Кнопка ответа на комментарий (доступна всем авторизованным пользователям) -->
        <button
          v-if="level < 3 && !comment.isDeleted"
          class="text-gray-500 hover:text-gray-700"
          @click="$emit('reply', comment._id)"
        >
          {{ t('comments.reply') }}
        </button>
        
        <!-- Кнопка редактирования (для автора и админа) -->
        <button
          v-if="!comment.isDeleted && (isAdmin || isAuthor)"
          class="text-gray-500 hover:text-gray-700"
          @click="$emit('edit', comment)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        
        <!-- Кнопка удаления (для автора и админа) -->
        <button
          v-if="!comment.isDeleted && (isAdmin || isAuthor)"
          class="text-red-500 hover:text-red-700"
          @click="$emit('delete', comment._id)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    <p class="text-gray-700 dark:text-gray-300" v-html="sanitizeComment(comment.content)"></p>
    <div v-if="comment.replies && comment.replies.length" class="mt-4 space-y-4">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply._id"
        :comment="reply"
        :isAdmin="isAdmin"
        :user="user"
        @delete="$emit('delete', $event)"
        @edit="$emit('edit', $event)"
        @reply="$emit('reply', $event)"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script setup>
import { useLanguageStore } from '../store/language';
import { computed, onMounted } from 'vue';

const props = defineProps({
  comment: Object,
  isAdmin: Boolean,
  user: Object,
  level: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['delete', 'edit', 'reply']);

const languageStore = useLanguageStore();
const t = (key) => languageStore.t(key);

// Проверяем, является ли текущий пользователь автором комментария
const isAuthor = computed(() => {
  // Получаем ID текущего пользователя из различных возможных полей
  const currentUserId = props.user?._id || props.user?.id || (typeof props.user === 'string' ? props.user : null);
  
  // Получаем ID автора комментария (также может быть в разных полях)
  const authorId = props.comment.author?._id || props.comment.author?.id;
  
  if (!currentUserId || !authorId) {
    return false;
  }
  
  // Проверяем совпадение
  return currentUserId === authorId;
});

// Функция для очистки содержимого комментария от XSS
const sanitizeComment = (content) => {
  // Простая замена потенциально опасных тегов
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Проверяем в консоли значения для отладки
onMounted(() => {
  // Получаем ID текущего пользователя из различных возможных полей
  const currentUserId = props.user?._id || props.user?.id || (typeof props.user === 'string' ? props.user : null);
  const authorId = props.comment.author?._id || props.comment.author?.id;
  const canUserDelete = props.isAdmin || currentUserId === authorId;
});
</script> 