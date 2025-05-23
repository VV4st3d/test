<template>
  <div class="card hover:shadow-lg transition-shadow duration-300">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-semibold">{{ task.title }}</h3>
      <div class="flex items-center">
        <span 
          class="ml-2 px-2 py-1 text-xs rounded-full" 
          :class="difficultyClass"
        >
          {{ task.difficulty }}
        </span>
      </div>
    </div>
    <p class="text-gray-600 dark:text-gray-300 mb-4">{{ task.description }}</p>
    <div class="flex justify-between items-center">
      <span class="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {{ task.category }}
      </span>
      <div class="flex items-center gap-2">
        <span v-if="isCompleted" class="text-green-500 flex items-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <button class="btn btn-primary" @click="navigateToTask">
          {{ t('tasks.solve') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '../store/language'
import { useProgressStore } from '../store/progress'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
})

const { t } = useLanguageStore()
const router = useRouter()

const difficultyClass = computed(() => {
  switch (props.task.difficulty) {
    case 'Начинающий':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Средний':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'Продвинутый':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
})

const navigateToTask = () => {
  router.push(`/tasks/${props.task._id}`)
}
</script> 