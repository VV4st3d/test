import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import TaskView from '../src/views/TaskView.vue';
import { useAuthStore } from '../src/store/auth';
import { useProgressStore } from '../src/store/progress';
import { useLanguageStore } from '../src/store/language';
import axios from 'axios';

// Мок для axios
vi.mock('axios');

// Мок для useRoute, useRouter
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 'task123' }
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('TaskView.vue', () => {
  let wrapper;
  let authStore;
  let progressStore;
  let languageStore;
  
  // Тестовые данные
  const mockTask = {
    _id: 'task123',
    title: 'Тестовая задача',
    description: 'Описание тестовой задачи',
    category: 'JavaScript',
    difficulty: 3,
    template: 'function solution() {\n  // Ваш код здесь\n}',
    requirements: ['Требование 1', 'Требование 2'],
    examples: 'console.log(solution(5)); // Должно вернуть 10',
    tests: [
      {
        description: 'Тест 1: Базовый случай'
      }
    ],
    nextTask: 'task456',
    previousTask: 'task789'
  };
  
  // Успешный результат проверки
  const successResult = {
    success: true,
    message: 'Все тесты пройдены!',
    points: 10,
    results: [
      {
        passed: true,
        description: 'Тест 1: Базовый случай'
      }
    ]
  };
  
  // Неудачный результат проверки
  const failureResult = {
    success: false,
    errors: ['Ошибка в тесте 1'],
    results: [
      {
        passed: false,
        description: 'Тест 1: Базовый случай',
        error: 'Ожидалось 10, получено undefined'
      }
    ]
  };
  
  beforeEach(() => {
    // Сбрасываем состояние моков
    vi.resetAllMocks();
    
    // Создаем тестовый pinia с моками хранилищ
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    });
    
    // Инициализируем хранилища
    authStore = useAuthStore(pinia);
    progressStore = useProgressStore(pinia);
    languageStore = useLanguageStore(pinia);
    
    // Устанавливаем начальные значения
    authStore.isAuthenticated = true;
    authStore.user = {
      name: 'Тестовый пользователь',
      email: 'test@example.com'
    };
    
    progressStore.isTaskCompleted = vi.fn().mockReturnValue(false);
    progressStore.updateProgress = vi.fn().mockResolvedValue({
      points: 150,
      level: 2,
      pointsEarned: 10
    });
    
    // Мок для языковых строк
    languageStore.$t = (key, params) => {
      if (params) {
        return `${key} - ${JSON.stringify(params)}`;
      }
      return key;
    };
    
    // Мок для успешного получения задачи
    axios.get.mockResolvedValue({ data: mockTask });
    
    // Монтируем компонент
    wrapper = mount(TaskView, {
      global: {
        plugins: [pinia],
        stubs: ['router-link', 'router-view']
      }
    });
  });
  
  it('должен загружать данные задачи при монтировании', async () => {
    expect(axios.get).toHaveBeenCalledWith(`/tasks/task123`);
    
    await wrapper.vm.$nextTick();
    
    expect(wrapper.text()).toContain(mockTask.title);
    expect(wrapper.text()).toContain(mockTask.category);
    expect(wrapper.vm.task).toEqual(mockTask);
    expect(wrapper.vm.userCode).toBe(mockTask.template);
  });
  
  it('должен сбрасывать код к шаблону при нажатии на кнопку сброса', async () => {
    await wrapper.vm.$nextTick();
    
    // Меняем код
    await wrapper.setData({ userCode: 'function solution() { return 42; }' });
    
    // Находим и нажимаем кнопку сброса
    const resetButton = wrapper.find('[title="Сбросить код"]');
    await resetButton.trigger('click');
    
    // Проверяем, что код сброшен к шаблону
    expect(wrapper.vm.userCode).toBe(mockTask.template);
  });
  
  it('должен отправлять код на проверку и показывать успешный результат', async () => {
    // Устанавливаем мок для успешной проверки кода
    axios.post.mockResolvedValueOnce({ data: successResult });
    
    await wrapper.vm.$nextTick();
    
    // Устанавливаем код решения
    await wrapper.setData({ userCode: 'function solution() { return 10; }' });
    
    // Находим и нажимаем кнопку "Запустить код"
    const runButton = wrapper.find('button:not([title="Сбросить код"])');
    await runButton.trigger('click');
    
    // Проверяем, что запрос был отправлен
    expect(axios.post).toHaveBeenCalledWith(`/tasks/task123/check`, {
      code: 'function solution() { return 10; }'
    });
    
    await wrapper.vm.$nextTick();
    
    // Проверяем, что результаты тестов отображаются
    expect(wrapper.vm.testResults).toEqual(successResult.results);
    expect(wrapper.vm.solved).toBe(true);
    
    // Проверяем, что был вызван метод обновления прогресса
    expect(progressStore.updateProgress).toHaveBeenCalledWith('task123', true);
  });
  
  it('должен отображать ошибки при неудачной проверке', async () => {
    // Устанавливаем мок для неудачной проверки кода
    axios.post.mockResolvedValueOnce({ data: failureResult });
    
    await wrapper.vm.$nextTick();
    
    // Устанавливаем неправильный код решения
    await wrapper.setData({ userCode: 'function solution() { /* Неправильное решение */ }' });
    
    // Находим и нажимаем кнопку "Запустить код"
    const runButton = wrapper.find('button:not([title="Сбросить код"])');
    await runButton.trigger('click');
    
    await wrapper.vm.$nextTick();
    
    // Проверяем, что ошибки отображаются
    expect(wrapper.vm.testResults).toEqual(failureResult.results);
    expect(wrapper.vm.solved).toBe(false);
    
    // Проверяем, что прогресс не обновлялся
    expect(progressStore.updateProgress).not.toHaveBeenCalled();
  });
  
  it('должен отображать метку "Решено" для уже решенных задач', async () => {
    // Устанавливаем, что задача уже решена
    progressStore.isTaskCompleted.mockReturnValue(true);
    
    // Пересоздаем компонент с обновленным хранилищем
    wrapper = mount(TaskView, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            progress: {
              completedTasks: ['task123']
            }
          }
        })],
        stubs: ['router-link', 'router-view']
      }
    });
    
    await wrapper.vm.$nextTick();
    
    // Проверяем, что отображается метка "Решено"
    expect(wrapper.vm.solved).toBe(true);
  });
  
  it('должен навигировать к следующей/предыдущей задаче', async () => {
    const mockRouter = vi.spyOn(wrapper.vm.router, 'push');
    
    await wrapper.vm.$nextTick();
    
    // Вызываем метод навигации к следующей задаче
    wrapper.vm.navigateToTask('task456');
    
    // Проверяем, что router.push был вызван с правильными параметрами
    expect(mockRouter).toHaveBeenCalledWith({
      name: 'task',
      params: { id: 'task456' }
    });
  });
}); 