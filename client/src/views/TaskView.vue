<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="error" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 my-4">
      <div class="text-center py-8">
        <h2 class="text-xl font-bold text-red-500 mb-4">{{ error }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ $t('tasks.loadError') }}
        </p>
        <div class="flex justify-center space-x-4">
          <button 
            @click="fetchTask" 
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
          >
            {{ $t('tasks.tryAgain') }}
          </button>
          <router-link 
            to="/tasks" 
            class="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded transition"
          >
            {{ $t('tasks.backToTasks') }}
          </router-link>
        </div>
      </div>
    </div>
    
    <template v-else-if="task">
      <div class="flex items-center text-sm mb-6">
        <router-link to="/tasks" class="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
          {{ $t('navigation.tasks') }}
        </router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">{{ task.title }}</span>
      </div>
      
      <div class="mb-8">
        <div class="flex flex-wrap justify-between items-center mb-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ task.title }}</h1>
          
          <div class="flex items-center space-x-4 mt-2 sm:mt-0">
            <span class="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
              {{ task.category }}
            </span>
            <span class="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm">
              {{ $t('tasks.difficulty') }}: {{ task.difficulty }}
            </span>
          </div>
        </div>
        
        <div class="prose dark:prose-invert max-w-none mb-6" v-html="task.description"></div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">{{ $t('tasks.examples') }}</h3>
            <div v-if="task.tests && task.tests.length > 0" class="space-y-3">
              <div v-for="(test, index) in task.tests" :key="index" class="bg-gray-100 dark:bg-gray-900 rounded p-3 overflow-x-auto text-sm">
                <div class="font-medium mb-1">{{ test.description || `Пример ${index + 1}` }}</div>
                <div class="text-gray-700 dark:text-gray-300">
                  <div class="mb-1"><span class="font-mono">{{ $t('tasks.input') }}:</span> <code class="ml-2">{{ test.input }}</code></div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 dark:text-gray-400 italic">
              {{ $t('tasks.noExamples') }}
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">{{ $t('tasks.requirements') }}</h3>
            <div v-if="hasRequirements" class="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              <ul>
                <li v-for="(req, index) in task.requirements" :key="index">{{ req }}</li>
              </ul>
            </div>
            <div v-else class="text-gray-500 dark:text-gray-400 italic">
              {{ $t('tasks.noRequirements') }}
            </div>
          </div>
        </div>
        
        <div v-if="task.hints && task.hints.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">{{ $t('tasks.hints') }}</h3>
          <div class="space-y-4">
            <div v-for="(hint, index) in sortedHints" :key="hint.order" class="border border-gray-200 dark:border-gray-700 rounded">
              <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 cursor-pointer"
                @click="toggleHint(index)">
                <span class="font-medium">{{ $t('tasks.hintTitle', { number: hint.order }) }}</span>
                <button class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                  {{ shownHints[index] ? $t('tasks.hideHint') : $t('tasks.showHint') }}
                </button>
              </div>
              <div v-show="shownHints[index]" class="p-4 text-gray-700 dark:text-gray-300">
                {{ hint.text }}
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="hasHintsSection" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">{{ $t('tasks.hints') }}</h3>
          <div class="text-gray-500 dark:text-gray-400 italic">
            {{ $t('tasks.noHints') }}
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ $t('tasks.yourCode') }}</h3>
          </div>
          
          <div class="p-4">
            <code-editor
              v-model="userCode" 
              :mode="getEditorMode()"
              :height="'300px'"
              ref="codeEditor"
              :placeholder="$t('tasks.codePlaceholder')"
              :initial-value="task.template || ''"
            />
          </div>
          
          <div class="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="runCode"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              :disabled="codeRunning"
            >
              <span v-if="codeRunning">{{ $t('tasks.running') }}</span>
              <span v-else>{{ $t('tasks.runCode') }}</span>
            </button>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ $t('tasks.results') }}</h3>
            <div class="flex space-x-2 items-center">
              <span v-if="solved" class="text-green-500 text-sm flex items-center">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ $t('tasks.solved') }}
              </span>
            </div>
          </div>
          
          <div class="p-4 h-64 overflow-auto">
            <div v-if="!testResults.length" class="text-center py-8 text-gray-500 dark:text-gray-400">
              {{ $t('tasks.runCodeToSeeResults') }}
            </div>
            
            <template v-else>
              <div v-for="(result, index) in testResults" :key="index" class="mb-4">
                <div class="flex items-start">
                  <div
                    :class="[
                      'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3',
                      result.passed ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                    ]"
                  >
                    <svg v-if="result.passed" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  
                  <div class="flex-1">
                    <div class="font-medium text-gray-900 dark:text-white">{{ result.description || `Тест ${index + 1}` }}</div>
                    <div class="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {{ $t('tasks.input') }}: <code>{{ result.input }}</code>
                    </div>
                    
                    <div v-if="!result.passed" class="mt-2">
                      <div v-if="result.error" class="text-sm text-red-600 dark:text-red-400">
                        {{ $t('tasks.error') }}: {{ result.error }}
                      </div>
                      <div v-else class="text-sm text-red-600 dark:text-red-400">
                        {{ $t('tasks.testFailed') }}
                      </div>
                      
                      <div class="mt-1 text-sm">
                        <div class="text-gray-600 dark:text-gray-400">{{ $t('tasks.expected') }}:</div>
                        <pre class="bg-gray-100 dark:bg-gray-900 rounded p-2 mt-1 overflow-x-auto text-xs">{{ result.expected }}</pre>
                      </div>
                      
                      <div class="mt-1 text-sm">
                        <div class="text-gray-600 dark:text-gray-400">{{ $t('tasks.actual') }}:</div>
                        <pre class="bg-gray-100 dark:bg-gray-900 rounded p-2 mt-1 overflow-x-auto text-xs">{{ result.actual }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="progressUpdate && testResults.every(r => r.passed)" class="mt-6 p-4 rounded-lg"
                   :class="progressUpdate.previouslyCompleted ? 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20' : 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20'">
                <div class="flex items-center mb-2">
                  <svg v-if="progressUpdate.previouslyCompleted" class="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <svg v-else class="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h4 class="font-medium text-gray-900 dark:text-gray-200">
                    {{ progressUpdate.previouslyCompleted ? $t('tasks.taskPreviouslyCompleted') : $t('tasks.taskCompleted') }}
                  </h4>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  <p v-if="!progressUpdate.previouslyCompleted">
                    {{ $t('tasks.pointsEarned', { points: progressUpdate.pointsEarned }) }}
                  </p>
                  <p v-else>
                    {{ $t('tasks.pointsEarnedPreviously', { points: progressUpdate.pointsEarned }) }}
                  </p>
                  <p class="mt-1">{{ $t('tasks.totalPoints', { points: progressUpdate.points }) }}</p>
                  
                  <div v-if="progressUpdate.previouslyCompleted" class="mt-2 text-gray-500 dark:text-gray-400">
                    {{ $t('tasks.completedAt', { date: formatDate(progressUpdate.completedAt) }) }}
                  </div>
                  
                  <div v-if="progressUpdate.levelUp && !progressUpdate.previouslyCompleted" class="mt-3 font-medium text-blue-600 dark:text-blue-400">
                    {{ $t('tasks.levelUp', { level: progressUpdate.level }) }} 🎉
                  </div>
                </div>
                
                <div v-if="progressUpdate.achievement" class="mt-4 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-3 rounded-lg">
                  <div class="flex items-center">
                    <div class="text-2xl mr-3">🏆</div>
                    <div>
                      <h5 class="font-medium text-gray-900 dark:text-yellow-300">{{ progressUpdate.achievement.title }}</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-300">{{ progressUpdate.achievement.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          
          <div class="flex justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              v-if="task.previousTask"
              @click="navigateToTask(task.previousTask)"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
            >
              {{ $t('tasks.previousTask') }}
            </button>
            <span v-else></span>
            
            <button
              v-if="task.nextTask"
              @click="navigateToTask(task.nextTask)"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
            >
              {{ $t('tasks.nextTask') }}
            </button>
            <span v-else></span>
          </div>
        </div>
      </div>

      <!-- Модальное окно для успешного выполнения -->
      <div v-if="showSuccessModal" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform scale-95 animate-modal-enter">
          <div class="flex items-center mb-4">
            <svg class="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('tasks.successModalTitle') }}</h2>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-6">{{ $t('tasks.taskCompleted') }}</p>
          <div class="flex justify-end space-x-4">
            <button
              @click="showSuccessModal = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {{ $t('tasks.successModalClose') }}
            </button>
            <button
              v-if="task.nextTask"
              @click="navigateToTask(task.nextTask)"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {{ $t('tasks.successModalNextTask') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useProgressStore } from '../store/progress';
import { useLanguageStore } from '../store/language';
import CodeEditor from '../components/CodeEditor.vue';
import { useToastStore } from '../store/toast';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const progressStore = useProgressStore();
const languageStore = useLanguageStore();
const toast = useToastStore();

const task = ref(null);
const loading = ref(true);
const error = ref(null);
const userCode = ref('');
const codeRunning = ref(false);
const testResults = ref([]);
const solved = ref(false);
const progressUpdate = ref(null);
const codeEditor = ref(null);
const shownHints = ref([]);
const hasHintsSection = ref(true);
const showSuccessModal = ref(false); // Новое состояние для модального окна

const hasRequirements = computed(() => {
  return task.value && 
         task.value.requirements && 
         Array.isArray(task.value.requirements) && 
         task.value.requirements.length > 0;
});

const sortedHints = computed(() => {
  if (!task.value || !task.value.hints || !Array.isArray(task.value.hints)) {
    return [];
  }
  return [...task.value.hints].sort((a, b) => a.order - b.order);
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const toggleHint = (index) => {
  if (!shownHints.value[index]) {
    const newShownHints = [...shownHints.value];
    newShownHints[index] = true;
    shownHints.value = newShownHints;
  } else {
    const newShownHints = [...shownHints.value];
    newShownHints[index] = !newShownHints[index];
    shownHints.value = newShownHints;
  }
};

const fetchTask = async () => {
  loading.value = true;
  error.value = null;
  userCode.value = '';
  shownHints.value = [];
  
  try {
    const taskId = route.params.id;
    
    if (!taskId || taskId === 'undefined') {
      error.value = languageStore.t('tasks.invalidTaskId');
      console.error('Отсутствует ID задачи в параметрах маршрута');
      return;
    }
    
    const response = await axios.get(`/api/tasks/${taskId}`, {
      params: {
        lang: languageStore.currentLanguage
      }
    });
    
    task.value = response.data;
    userCode.value = task.value.template || '';
    
    if (task.value.tests && Array.isArray(task.value.tests)) {
      const lang = languageStore.currentLanguage;
      const testDescriptionsMap = task.value.translations?.[lang]?.testDescriptions || {};
      
      task.value.tests.forEach(test => {
        if (testDescriptionsMap[test._id]) {
          test.description = testDescriptionsMap[test._id];
        } else {
          const testIndex = task.value.tests.findIndex(t => t._id === test._id);
          if (testIndex !== -1) {
            const translationKeys = Object.keys(testDescriptionsMap);
            if (translationKeys.length > testIndex) {
              test.description = testDescriptionsMap[translationKeys[testIndex]];
            }
          }
        }
      });
    }
    
    const currentLang = languageStore.currentLanguage;
    if (task.value.translations && 
        task.value.translations[currentLang] && 
        task.value.translations[currentLang].hints && 
        task.value.translations[currentLang].hints.length > 0) {
      task.value.hints = task.value.translations[currentLang].hints;
    }
    
    if (task.value.hints && task.value.hints.length > 0) {
      shownHints.value = Array(task.value.hints.length).fill(false);
    }
    
    if (authStore.isAuthenticated) {
      try {
        if (!progressStore.completedTasks || progressStore.completedTasks.length === 0) {
          await progressStore.loadAllCompletedTasks();
        }
        solved.value = progressStore.isTaskCompleted(taskId) || task.value.isCompleted;
      } catch (progressError) {
        console.error('Error checking task completion status:', progressError);
        solved.value = false;
      }
    }
  } catch (err) {
    console.error('Error fetching task:', err);
    error.value = err.response?.data?.message || languageStore.t('errors.failedToLoad');
  } finally {
    loading.value = false;
  }
};

const runCode = async () => {
  if (codeRunning.value) return;
  
  codeRunning.value = true;
  testResults.value = [];
  progressUpdate.value = null;
  showSuccessModal.value = false; // Сбрасываем модальное окно перед запуском
  
  try {
    const response = await axios.post(`/api/tasks/${route.params.id}/check`, {
      solution: userCode.value
    });
    
    testResults.value = response.data.results;
    
    const allPassed = testResults.value.every(test => test.passed);
    
    if (allPassed && response.data.progressUpdate) {
      const { progressUpdate: progressData } = response.data;
      
      if (progressData.previouslyCompleted) {
        progressUpdate.value = {
          pointsEarned: progressData.pointsEarned,
          points: progressData.points,
          level: progressData.level,
          levelUp: progressData.levelUp || false,
          previouslyCompleted: true,
          completedAt: progressData.completedAt
        };
        solved.value = true;
        toast.info(languageStore.t('tasks.taskPreviouslyCompleted'));
      } else if (authStore.isAuthenticated) {
        try {
          // Обновляем локальное состояние прогресса
          if (progressStore.updateLocalProgress) {
            progressStore.updateLocalProgress({
              taskId: route.params.id,
              points: progressData.points,
              level: progressData.level,
              completedAt: new Date()
            });
          } else {
            // Если функция не определена, обновляем состояние напрямую
            if (progressData.points) {
              progressStore.progress.points = progressData.points;
            }
            if (progressData.level) {
              progressStore.progress.level = progressData.level;
            }
            
            if (!progressStore.isTaskCompleted(route.params.id)) {
              progressStore.completedTasks.push({
                taskId: route.params.id,
                completedAt: new Date()
              });
              progressStore.progress.totalTasks += 1;
            }
          }
          
          progressUpdate.value = {
            pointsEarned: progressData.pointsEarned,
            points: progressData.points,
            level: progressData.level,
            levelUp: progressData.levelUp || false,
            previouslyCompleted: false
          };
          
          solved.value = true;
          showSuccessModal.value = true; // Показываем модальное окно
          toast.success(languageStore.t('tasks.taskCompleted'));
          
          try {
            await axios.get('/api/tasks/clear-cache');
          } catch (cacheError) {
            console.error('Error clearing cache:', cacheError);
          }
        } catch (progressError) {
          console.error('Error updating progress:', progressError);
          toast.error(languageStore.t('tasks.progressUpdateError'));
        }
      } else {
        progressUpdate.value = {
          pointsEarned: 0,
          points: 0,
          level: 1,
          levelUp: false,
          previouslyCompleted: false
        };
        showSuccessModal.value = true; // Показываем модальное окно для неавторизованных
        toast.success(languageStore.t('tasks.correctSolution'));
      }
    } else if (allPassed) {
      progressUpdate.value = {
        pointsEarned: 0,
        points: 0,
        level: 1,
        levelUp: false,
        previouslyCompleted: false
      };
      showSuccessModal.value = true; // Показываем модальное окно
      toast.success(languageStore.t('tasks.correctSolution'));
    } else {
      toast.error(languageStore.t('tasks.someTestsFailed'));
    }
  } catch (err) {
    console.error('Error running code:', err);
    testResults.value = [{
      passed: false,
      description: languageStore.t('tasks.runCodeError'),
      error: err.response?.data?.message || err.message
    }];
    toast.error(languageStore.t('tasks.runCodeError'));
  } finally {
    codeRunning.value = false;
  }
};

const resetCode = () => {
  if (task.value && task.value.template) {
    userCode.value = task.value.template;
    if (codeEditor.value && typeof codeEditor.value.forceRefreshContent === 'function') {
      codeEditor.value.forceRefreshContent();
    }
  } else {
    userCode.value = '';
  }
};

const getEditorMode = () => {
  return 'javascript';
};

const navigateToTask = (taskId) => {
  showSuccessModal.value = false; // Закрываем модальное окно при переходе
  router.push({ name: 'task', params: { id: taskId } });
};

onMounted(async () => {
  await fetchTask();
  
  if (task.value && task.value.template) {
    userCode.value = task.value.template;
  }
  
  watch(() => route.params.id, async (newId, oldId) => {
    if (newId !== oldId) {
      await fetchTask();
      if (task.value && task.value.template) {
        userCode.value = task.value.template;
      }
    }
  });
  
  watch(() => languageStore.currentLanguage, async () => {
    await fetchTask();
    if (task.value && task.value.template) {
      userCode.value = task.value.template;
    }
  });
});
</script>

<style scoped>
.spinner {
  @apply w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.prose :deep(pre) {
  @apply bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto;
}

.prose :deep(code) {
  @apply text-sm font-mono bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded;
}

.prose :deep(h3) {
  @apply text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3;
}

.prose :deep(ul) {
  @apply list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300;
}

.prose :deep(p) {
  @apply text-gray-700 dark:text-gray-300 mb-4;
}

/* Стили для анимации модального окна */
@keyframes modal-enter {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-modal-enter {
  animation: modal-enter 0.3s ease-out;
}
</style>