<template>
  <div class="card hover:shadow-lg transition-shadow duration-300">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-semibold">{{ article.title }}</h3>
      <span class="text-sm text-gray-500">{{ article.difficulty }}</span>
    </div>
    <p class="text-gray-600 dark:text-gray-300 mb-4">{{ article.description }}</p>
    
    <!-- Отображение тегов -->
    <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
      <span 
        v-for="tag in article.tags" 
        :key="tag" 
        class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-2 py-1 text-xs"
      >
        #{{ tag }}
      </span>
    </div>
    
    <div class="flex justify-between items-center">
      <span class="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {{ article.category }}
      </span>
      <button class="btn btn-primary" @click="navigateToArticle">
        {{ t('articles.readMore') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useLanguageStore } from '../store/language'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const { t } = useLanguageStore()
const router = useRouter()

const navigateToArticle = () => {
  router.push(`/articles/${props.article._id}`)
}
</script> 