<!-- Компонент прогресс-бара для отображения уровня и прогресса пользователя -->
<template>
  <div class="progress-container">
    <div class="level-info">
      <div class="level-badge">
        <span>{{ currentLevel }}</span>
      </div>
      <div class="points-info">
        <h3>{{ $t('profile.level') }} {{ currentLevel }}</h3>
        <p v-if="showPointsToNextLevel">
          {{ $t('profile.pointsToNextLevel', { points: pointsToNextLevel }) }}
        </p>
      </div>
    </div>
    
    <div class="progress-bar-wrapper">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${percentage}%` }"
          :class="{ 'animate-pulse': animatePulse }"
        ></div>
      </div>
      <div class="progress-text">
        {{ currentPoints }} / {{ nextLevelPoints }} {{ $t('profile.points') }}
      </div>
    </div>
    
    <div v-if="recentAchievement" class="achievement">
      <div class="achievement-icon">🏆</div>
      <div class="achievement-info">
        <h4>{{ recentAchievement.title }}</h4>
        <p>{{ recentAchievement.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  currentLevel: {
    type: Number,
    required: true
  },
  currentPoints: {
    type: Number,
    required: true
  },
  nextLevelPoints: {
    type: Number,
    required: true
  },
  recentAchievement: {
    type: Object,
    default: null
  },
  showPointsToNextLevel: {
    type: Boolean,
    default: true
  }
});

// Рассчитываем процент прогресса
const percentage = computed(() => {
  // Вычисляем баллы для текущего уровня
  const currentLevelPoints = Math.pow(props.currentLevel - 1, 2) * 100;
  
  // Вычисляем прогресс внутри текущего уровня
  const pointsInCurrentLevel = props.currentPoints - currentLevelPoints;
  const pointsRequiredForNextLevel = props.nextLevelPoints - currentLevelPoints;
  
  // Вычисляем процент и ограничиваем его до 100%
  const percent = Math.min(Math.round((pointsInCurrentLevel / pointsRequiredForNextLevel) * 100), 100);
  return percent;
});

// Баллы до следующего уровня
const pointsToNextLevel = computed(() => {
  return props.nextLevelPoints - props.currentPoints;
});

// Анимация пульсации при получении достижения
const animatePulse = ref(false);

// При получении нового достижения, запускаем анимацию
watch(() => props.recentAchievement, (newValue) => {
  if (newValue) {
    animatePulse.value = true;
    
    // Останавливаем анимацию через 3 секунды
    setTimeout(() => {
      animatePulse.value = false;
    }, 3000);
  }
}, { immediate: true });
</script>

<style scoped>
.progress-container {
  @apply bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md w-full max-w-md mx-auto;
}

.level-info {
  @apply flex items-center mb-4;
}

.level-badge {
  @apply bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4;
}

.points-info h3 {
  @apply text-lg font-bold text-gray-800 dark:text-white;
}

.points-info p {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.progress-bar-wrapper {
  @apply mb-4;
}

.progress-bar {
  @apply bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden;
}

.progress-fill {
  @apply bg-blue-500 h-full rounded-full transition-all duration-500;
}

.progress-text {
  @apply text-sm text-gray-600 dark:text-gray-300 text-right;
}

.achievement {
  @apply flex items-center bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-3 rounded-lg mt-4;
}

.achievement-icon {
  @apply text-2xl mr-3;
}

.achievement-info h4 {
  @apply font-bold text-gray-800 dark:text-yellow-300;
}

.achievement-info p {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style> 