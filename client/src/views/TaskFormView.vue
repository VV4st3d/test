<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold mb-6">{{ isEditMode ? $t('tasks.editTask') : $t('tasks.createTask') }}</h1>
      
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Переключатель языков -->
        <div class="flex items-center mb-6 border-b pb-4">
          <button
            v-for="lang in ['ru', 'en']"
            :key="lang"
            type="button"
            class="px-4 py-2 mr-2 rounded-md transition-colors"
            :class="currentLang === lang ? 'bg-blue-500 text-white dark:bg-blue-600' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="currentLang = lang"
          >
            {{ lang === 'ru' ? 'Русский' : 'English' }}
          </button>
          <div class="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {{ $t('tasks.translationStatus') }}: 
            <span :class="isRussianComplete ? 'text-green-500' : 'text-yellow-500'">RU</span> / 
            <span :class="isEnglishComplete ? 'text-green-500' : 'text-yellow-500'">EN</span>
          </div>
        </div>
        
        <!-- Основные поля -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label for="title" class="block text-sm font-medium mb-2">{{ $t('tasks.title') }} *</label>
            <input 
              type="text" 
              id="title" 
              v-model="task.translations[currentLang].title" 
              required
              class="input w-full"
              :placeholder="$t('tasks.titlePlaceholder')"
            />
          </div>
          
          <div class="form-group">
            <label for="difficulty" class="block text-sm font-medium mb-2">{{ $t('tasks.difficulty') }} *</label>
            <select 
              id="difficulty" 
              v-model="task.difficulty" 
              required
              class="input w-full"
            >
              <option value="">{{ $t('tasks.selectDifficulty') }}</option>
              <option value="easy">{{ $t('tasks.beginner') }}</option>
              <option value="medium">{{ $t('tasks.intermediate') }}</option>
              <option value="hard">{{ $t('tasks.advanced') }}</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="description" class="block text-sm font-medium mb-2">{{ $t('tasks.description') }} *</label>
          <textarea 
            id="description" 
            v-model="task.translations[currentLang].description" 
            :required="currentLang === 'ru'"
            class="input w-full"
            rows="5"
            :placeholder="$t('tasks.descriptionPlaceholder')"
          ></textarea>
          <p class="text-sm text-gray-500 mt-1">{{ $t('tasks.descriptionHelp') }}</p>
        </div>
        
        <!-- Требования к решению -->
        <div class="form-group">
          <label class="block text-sm font-medium mb-2">{{ $t('tasks.requirements') }}</label>
          <div v-for="(req, index) in task.translations[currentLang].requirements" :key="`req-${index}`" class="flex items-center mb-2">
            <input 
              type="text" 
              v-model="task.translations[currentLang].requirements[index]" 
              class="input flex-grow"
              :placeholder="$t('tasks.requirementPlaceholder')"
            />
            <button type="button" class="btn btn-icon ml-2" @click="removeRequirement(index)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <button type="button" class="btn btn-outline mt-2" @click="addRequirement">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('tasks.addRequirement') }}
          </button>
        </div>
        
        <!-- Шаблон кода -->
        <div class="form-group">
          <label for="template" class="block text-sm font-medium mb-2">{{ $t('tasks.codeTemplate') }}</label>
          <code-editor
            v-model="task.translations[currentLang].template"
            :mode="getEditorMode()"
            :height="'200px'"
            ref="templateEditor"
          />
          <p class="text-sm text-gray-500 mt-1">{{ $t('tasks.templateHelp') }}</p>
        </div>
        
        <!-- Подсказки -->
        <div class="form-group">
          <label class="block text-sm font-medium mb-2">{{ $t('tasks.hints') }}</label>
          <div v-for="(hint, index) in task.translations[currentLang].hints" :key="`hint-${index}`" class="flex items-center mb-2">
            <input 
              type="text" 
              v-model="hint.text" 
              class="input flex-grow"
              :placeholder="$t('tasks.hintPlaceholder')"
            />
            <input 
              type="number" 
              v-model.number="hint.order"
              class="input w-20 ml-2"
              placeholder="Порядок"
            />
            <button type="button" class="btn btn-icon ml-2" @click="removeHint(index)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <button type="button" class="btn btn-outline mt-2" @click="addHint">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('tasks.addHint') }}
          </button>
        </div>
        
        <!-- Тесты для проверки -->
        <div class="form-group">
          <label class="block text-sm font-medium mb-2">{{ $t('tasks.tests') }} *</label>
          <div v-for="(test, index) in task.tests" :key="`test-${index}`" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">{{ $t('tasks.testDescription') }} (RU)</label>
              <input 
                type="text" 
                v-model="task.translations.ru.testDescriptions[test._id || `temp-${index}`]" 
                class="input w-full"
                :placeholder="$t('tasks.testDescriptionPlaceholder')"
              />
            </div>
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">{{ $t('tasks.testDescription') }} (EN)</label>
              <input 
                type="text" 
                v-model="task.translations.en.testDescriptions[test._id || `temp-${index}`]" 
                class="input w-full"
                :placeholder="$t('tasks.testDescriptionPlaceholder')"
              />
            </div>
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">{{ $t('tasks.testDescription') }} (Default)</label>
              <input 
                type="text" 
                v-model="test.description" 
                class="input w-full"
                :placeholder="$t('tasks.testDescriptionPlaceholder')"
                @input="updateTestDescription(index, test._id)"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tasks.input') }}</label>
                <textarea 
                  v-model="test.input" 
                  class="input w-full"
                  rows="3"
                  :placeholder="$t('tasks.inputPlaceholder')"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tasks.expectedOutput') }}</label>
                <textarea 
                  v-model="test.expectedOutput" 
                  class="input w-full"
                  rows="3"
                  :placeholder="$t('tasks.outputPlaceholder')"
                ></textarea>
              </div>
            </div>
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">{{ $t('tasks.testCode') }} *</label>
              <code-editor
                v-model="test.testCode"
                mode="javascript"
                :height="'100px'"
                ref="testEditors"
              />
              <p class="text-sm text-gray-500 mt-1">{{ $t('tasks.testCodeHelp') }}</p>
            </div>
            <div class="flex justify-end">
              <button type="button" class="btn btn-danger" @click="removeTest(index)">
                {{ $t('tasks.removeTest') }}
              </button>
            </div>
          </div>
          <button type="button" class="btn btn-outline" @click="addTest">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('tasks.addTest') }}
          </button>
          <p v-if="task.tests.length === 0" class="text-red-500 text-sm mt-1">
            {{ $t('tasks.testRequired') }}
          </p>
        </div>
        
        <!-- Эталонное решение -->
        <div class="form-group">
          <label for="solution" class="block text-sm font-medium mb-2">{{ $t('tasks.solution') }}</label>
          <code-editor
            v-model="task.solution"
            :mode="getEditorMode()"
            :height="'200px'"
            ref="solutionEditor"
          />
          <p class="text-sm text-gray-500 mt-1">{{ $t('tasks.solutionHelp') }}</p>
        </div>
        
        <!-- Опция публикации -->
        <div class="form-group">
          <label class="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              v-model="task.isPublished" 
              class="form-checkbox rounded mr-2 h-5 w-5 transition-colors text-blue-500 focus:ring-2 focus:ring-offset-0 focus:ring-blue-500" 
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('tasks.publishImmediately') }}</span>
          </label>
          <p class="text-xs text-gray-500 mt-1 ml-7">
            {{ $t('tasks.publishHelp') }}
          </p>
        </div>
        
        <!-- Кнопки действий -->
        <div class="flex justify-end space-x-4">
          <button type="button" class="btn btn-outline" @click="$router.go(-1)">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isFormValid">
            <span v-if="isSubmitting" class="loading-spinner mr-2"></span>
            {{ isEditMode ? $t('tasks.saveChanges') : (task.isPublished ? $t('tasks.createAndPublish') : $t('tasks.saveAsDraft')) }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToastStore } from '../store/toast';
import { useLanguageStore } from '../store/language';
import { useAuthStore } from '../store/auth';
import axios from 'axios';
import CodeEditor from '../components/CodeEditor.vue';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();
const { t } = useLanguageStore();
const authStore = useAuthStore();

const apiUrl = import.meta.env.VITE_API_URL || '';
const isSubmitting = ref(false);
const isEditMode = computed(() => !!route.params.id);
const currentLang = ref('ru');

const task = ref({
  translations: {
    ru: {
      title: '',
      description: '',
      requirements: [],
      template: '',
      hints: [],
      testDescriptions: {}
    },
    en: {
      title: '',
      description: '',
      requirements: [],
      template: '',
      hints: [],
      testDescriptions: {}
    }
  },
  difficulty: '',
  tests: [],
  hints: [],
  solution: '',
  isPublished: false
});

const templateEditor = ref(null);
const solutionEditor = ref(null);
const testEditors = ref([]);

// Проверка заполненности переводов
const isRussianComplete = computed(() => {
  const ru = task.value.translations.ru;
  return ru.title.trim() !== '' && ru.description.trim() !== '';
});

const isEnglishComplete = computed(() => {
  const en = task.value.translations.en;
  return en.title.trim() !== '' && en.description.trim() !== '';
});

// Валидация формы
const isFormValid = computed(() => {
  return (
    task.value.difficulty !== '' &&
    task.value.solution.trim() !== '' &&
    task.value.tests.length > 0 &&
    task.value.tests.every(test => test.input && test.expectedOutput && test.testCode) &&
    isRussianComplete.value
  );
});

const fetchTask = async () => {
  if (isEditMode.value) {
    try {
      const taskId = route.params.id;
      if (!taskId) {
        console.error('ID задачи отсутствует');
        toast.error('ID задачи не указан');
        router.push('/admin/tasks');
        return;
      }

      const response = await axios.get(`${apiUrl}/api/tasks/${taskId}/full`);
      const taskData = response.data;
      
      console.log('Получены данные задачи:', taskData);

      // Инициализация объектов testDescriptions, если они отсутствуют
      if (!taskData.translations?.ru?.testDescriptions) {
        taskData.translations = taskData.translations || {};
        taskData.translations.ru = taskData.translations.ru || {};
        taskData.translations.ru.testDescriptions = {};
      }
      
      if (!taskData.translations?.en?.testDescriptions) {
        taskData.translations = taskData.translations || {};
        taskData.translations.en = taskData.translations.en || {};
        taskData.translations.en.testDescriptions = {};
      }
      
      // Если у теста нет описания в переводах, используем основное описание
      taskData.tests?.forEach(test => {
        if (test._id && !taskData.translations.ru.testDescriptions[test._id]) {
          taskData.translations.ru.testDescriptions[test._id] = test.description || '';
        }
      });

      // Подготовка переводов
      let translations = {
        ru: {
          title: taskData.title || '',
          description: taskData.description || '',
          requirements: taskData.requirements || [],
          template: String(taskData.template || ''),
          hints: taskData.translations?.ru?.hints || taskData.hints?.map(h => ({ text: h.text, order: h.order })) || [],
          testDescriptions: taskData.translations?.ru?.testDescriptions || {}
        },
        en: {
          title: taskData.translations?.en?.title || '',
          description: taskData.translations?.en?.description || '',
          requirements: taskData.translations?.en?.requirements || [],
          template: taskData.translations?.en?.template || '',
          hints: taskData.translations?.en?.hints || [],
          testDescriptions: taskData.translations?.en?.testDescriptions || {}
        }
      };
      
      // Логирование для отладки
      console.log('Загруженные описания тестов RU:', translations.ru.testDescriptions);
      console.log('Загруженные описания тестов EN:', translations.en.testDescriptions);

      task.value = {
        _id: taskData._id,
        translations,
        difficulty: taskData.difficulty || '',
        tests: taskData.tests?.map(test => ({
          _id: test._id,
          description: test.description || '',
          input: test.input || '',
          expectedOutput: test.expectedOutput || '',
          testCode: String(test.testCode || '')
        })) || [],
        hints: taskData.hints?.map(hint => ({
          text: hint.text || '',
          order: hint.order || 0
        })) || [],
        solution: String(taskData.solution || ''),
        isPublished: taskData.isPublished !== undefined ? taskData.isPublished : false
      };

      // Проверяем, что у всех тестов есть записи в testDescriptions
      task.value.tests.forEach(test => {
        if (test._id) {
          if (!task.value.translations.ru.testDescriptions[test._id]) {
            task.value.translations.ru.testDescriptions[test._id] = test.description || '';
          }
          if (!task.value.translations.en.testDescriptions[test._id]) {
            task.value.translations.en.testDescriptions[test._id] = '';
          }
        }
      });

      console.log('Задача установлена:', {
        templateLength: task.value.translations.ru.template.length,
        solutionLength: task.value.solution.length,
        testsCount: task.value.tests.length,
        hintsCount: task.value.translations.ru.hints.length,
        testIds: task.value.tests.map(t => t._id)
      });

      await nextTick();
      updateCodeEditors();
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error(t('tasks.loadError'));
      router.push('/admin/tasks');
    }
  } else {
    task.value = {
      translations: {
        ru: {
          title: '',
          description: '',
          requirements: [''],
          template: '',
          hints: [],
          testDescriptions: {}
        },
        en: {
          title: '',
          description: '',
          requirements: [''],
          template: '',
          hints: [],
          testDescriptions: {}
        }
      },
      difficulty: '',
      tests: [],
      hints: [],
      solution: '',
      isPublished: false
    };
  }
};

const addRequirement = () => {
  task.value.translations[currentLang.value].requirements.push('');
};

const removeRequirement = (index) => {
  task.value.translations[currentLang.value].requirements.splice(index, 1);
  if (task.value.translations[currentLang.value].requirements.length === 0) {
    addRequirement();
  }
};

const addTest = () => {
  const index = task.value.tests.length;
  const tempId = `temp-${index}`;
  
  // Создаем новый тест с временным ID
  task.value.tests.push({
    description: '',
    input: '',
    expectedOutput: '',
    testCode: 'function test(solution) {\n  // Проверка решения\n  return true;\n}',
    _id: tempId
  });
  
  // Добавляем пустые описания для обоих языков
  task.value.translations.ru.testDescriptions[tempId] = '';
  task.value.translations.en.testDescriptions[tempId] = '';
};

const removeTest = (index) => {
  const testId = task.value.tests[index]._id;
  console.log(`Удаление теста с ID: ${testId}`);
  
  // Удаляем тест из массива
  task.value.tests.splice(index, 1);
  
  // Удаляем соответствующие переводы описаний для обоих языков
  ['ru', 'en'].forEach(lang => {
    if (task.value.translations[lang].testDescriptions[testId]) {
      console.log(`Удаление описания теста для языка ${lang}, ID: ${testId}`);
      delete task.value.translations[lang].testDescriptions[testId];
    }
  });
  
  // Логируем оставшиеся описания для отладки
  console.log('Оставшиеся описания тестов RU:', task.value.translations.ru.testDescriptions);
  console.log('Оставшиеся описания тестов EN:', task.value.translations.en.testDescriptions);
};

const addHint = () => {
  const order = task.value.translations[currentLang.value].hints.length + 1;
  task.value.translations[currentLang.value].hints.push({
    text: '',
    order
  });
};

const removeHint = (index) => {
  task.value.translations[currentLang.value].hints.splice(index, 1);
  task.value.translations[currentLang.value].hints.forEach((hint, idx) => {
    hint.order = idx + 1;
  });
};

const getEditorMode = () => {
  return 'javascript';
};

const validateForm = () => {
  // Проверяем русский перевод (обязательный)
  if (!task.value.translations.ru.title || 
      !task.value.translations.ru.description || 
      !task.value.difficulty) {
    toast.error(t('tasks.requiredFieldsError'));
    return false;
  }

  if (!task.value.tests.length) {
    toast.error(t('tasks.noTestsError'));
    return false;
  }

  const invalidTests = task.value.tests.some(test => !test.testCode || !test.input || !test.expectedOutput);
  if (invalidTests) {
    toast.error(t('tasks.invalidTestsError'));
    return false;
  }

  // Проверяем, что у всех тестов есть описания на русском языке
  const missingDescriptions = task.value.tests.some(test => {
    const testId = test._id;
    return !task.value.translations.ru.testDescriptions[testId] && !test.description;
  });
  
  if (missingDescriptions) {
    toast.error('Необходимо заполнить описания всех тестов на русском языке');
    return false;
  }

  if (!task.value.solution) {
    toast.error(t('tasks.solutionRequired'));
    return false;
  }

  // Фильтруем пустые требования и подсказки
  ['ru', 'en'].forEach(lang => {
    task.value.translations[lang].requirements = task.value.translations[lang].requirements.filter(req => req.trim());
    task.value.translations[lang].hints = task.value.translations[lang].hints.filter(hint => hint.text.trim());
  });

  return true;
};

const checkAuth = () => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    toast.error(t('common.notAuthorized'));
    router.push('/login');
    return false;
  }
  return true;
};

const submitForm = async () => {
  if (!checkAuth() || !validateForm()) return;

  isSubmitting.value = true;
  
  // Обновляем описания тестов перед отправкой
  task.value.tests.forEach((test, index) => {
    // Если тест имеет временный ID, обновляем его в описаниях
    if (test._id.startsWith('temp-')) {
      // Сохраняем описания из временного ID
      const ruDesc = task.value.translations.ru.testDescriptions[test._id] || '';
      const enDesc = task.value.translations.en.testDescriptions[test._id] || '';
      
      // Удаляем временные ключи
      delete task.value.translations.ru.testDescriptions[test._id];
      delete task.value.translations.en.testDescriptions[test._id];
      
      // Создаем новый ключ для описания
      const newKey = `temp-${index}`;
      task.value.translations.ru.testDescriptions[newKey] = ruDesc;
      task.value.translations.en.testDescriptions[newKey] = enDesc;
    }
  });
  
  console.log('Отправляемые описания тестов RU:', task.value.translations.ru.testDescriptions);
  console.log('Отправляемые описания тестов EN:', task.value.translations.en.testDescriptions);
  
  // Подготовка данных для отправки
  const preparedTaskData = {
    _id: task.value._id,
    title: task.value.translations.ru.title,
    description: task.value.translations.ru.description,
    difficulty: task.value.difficulty,
    requirements: task.value.translations.ru.requirements,
    tests: task.value.tests.map(test => {
      // Если у теста нет описания, но есть в переводах, используем его
      if (!test.description && task.value.translations.ru.testDescriptions[test._id]) {
        test.description = task.value.translations.ru.testDescriptions[test._id];
      }
      
      return {
        _id: test._id.startsWith('temp-') ? undefined : test._id,
        description: test.description,
        input: test.input,
        expectedOutput: test.expectedOutput,
        testCode: test.testCode
      };
    }),
    hints: task.value.translations.ru.hints,
    template: task.value.translations.ru.template,
    solution: task.value.solution,
    isPublished: task.value.isPublished,
    translations: {
      ru: {
        ...task.value.translations.ru,
        testDescriptions: { ...task.value.translations.ru.testDescriptions }
      },
      en: task.value.translations.en.title || task.value.translations.en.description || 
          task.value.translations.en.requirements.length || task.value.translations.en.template || 
          task.value.translations.en.hints.length || Object.keys(task.value.translations.en.testDescriptions).length
        ? {
            ...task.value.translations.en,
            testDescriptions: { ...task.value.translations.en.testDescriptions }
          }
        : null
    }
  };

  try {
    const token = authStore.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('Отправляемые данные задачи:', preparedTaskData);

    let response;
    if (isEditMode.value) {
      response = await axios.put(`${apiUrl}/api/tasks/${route.params.id}`, preparedTaskData, { headers });
      toast.success(t('tasks.updateSuccess'));
      router.push({ name: 'task', params: { id: response.data.task?._id || route.params.id } });
    } else {
      response = await axios.post(`${apiUrl}/api/tasks`, preparedTaskData, { headers });
      toast.success(t('tasks.createSuccess'));
      router.push({ name: 'tasks' });
    }
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    if (error.response?.status === 401) {
      toast.error(t('common.sessionExpired'));
      authStore.logout();
      router.push('/login');
    } else {
      toast.error(error.response?.data?.message || t('tasks.saveError'));
    }
  } finally {
    isSubmitting.value = false;
  }
};

const updateCodeEditors = () => {
  nextTick(() => {
    if (templateEditor.value?.forceRefreshContent) {
      templateEditor.value.forceRefreshContent();
    }
    if (solutionEditor.value?.forceRefreshContent) {
      solutionEditor.value.forceRefreshContent();
    }
    if (testEditors.value) {
      testEditors.value.forEach((editor, index) => {
        if (editor?.forceRefreshContent && task.value.tests[index]) {
          editor.forceRefreshContent();
        }
      });
    }
  });
};

// При изменении языка обновляем редакторы
watch(currentLang, () => {
  nextTick(() => {
    updateCodeEditors();
  });
});

const updateTestDescription = (index, testId) => {
  if (testId && task.value.tests[index]) {
    // Если описание на русском языке пустое, копируем из основного описания
    if (!task.value.translations.ru.testDescriptions[testId] && task.value.tests[index].description) {
      task.value.translations.ru.testDescriptions[testId] = task.value.tests[index].description;
    }
  }
};

onMounted(async () => {
  if (!checkAuth()) return;
  await fetchTask();
});
</script>

<style scoped>
.form-group {
  @apply mb-4;
}

.input {
  @apply bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700;
}

.btn-outline {
  @apply bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600;
}

.btn-danger {
  @apply bg-red-500 text-white hover:bg-red-600;
}

.btn-icon {
  @apply p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600;
}

.form-checkbox {
  @apply rounded text-blue-500 focus:ring-blue-500 h-5 w-5;
}
</style>