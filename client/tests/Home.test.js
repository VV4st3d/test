import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import HomeView from '../src/views/HomeView.vue';
import { useAuthStore } from '../src/store/auth';
import { useProgressStore } from '../src/store/progress';
import { useLanguageStore } from '../src/store/language';
import axios from 'axios';

// Мок для axios
vi.mock('axios');

// Мок для компонента роутера, если компонент его использует
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {}
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe('HomeView.vue', () => {
  let wrapper;
  let authStore;
  let progressStore;
  let languageStore;
  
  beforeEach(() => {
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
      email: 'test@example.com',
      role: 'user'
    };
    
    progressStore.level = 2;
    progressStore.points = 150;
    progressStore.completedTasks = ['task1', 'task2'];
    progressStore.category = {
      html: 5,
      css: 3,
      javascript: 8,
      total: 20
    };
    
    // Мок для языковых строк
    languageStore.$t = (key) => key;
    
    // Мок для axios.get
    axios.get.mockResolvedValue({
      data: {
        articles: [
          {
            _id: 'article1',
            title: 'Тестовая статья 1',
            description: 'Описание статьи 1',
            category: 'JavaScript',
            difficulty: 2
          },
          {
            _id: 'article2',
            title: 'Тестовая статья 2',
            description: 'Описание статьи 2',
            category: 'CSS',
            difficulty: 1
          }
        ],
        tasks: [
          {
            _id: 'task1',
            title: 'Тестовая задача 1',
            description: 'Описание задачи 1',
            category: 'JavaScript',
            difficulty: 3
          },
          {
            _id: 'task2',
            title: 'Тестовая задача 2',
            description: 'Описание задачи 2',
            category: 'HTML',
            difficulty: 1
          }
        ]
      }
    });
    
    // Монтируем компонент
    wrapper = mount(HomeView, {
      global: {
        plugins: [pinia],
        stubs: ['router-link', 'router-view']
      }
    });
  });
  
  it('должен корректно отображать заголовок приветствия', () => {
    expect(wrapper.text()).toContain('home.welcome');
  });
  
  it('должен отображать кнопку "Начать обучение"', () => {
    const startButton = wrapper.find('button');
    expect(startButton.text()).toContain('home.startLearning');
  });
  
  it('должен загружать рекомендуемые статьи и задачи при монтировании', async () => {
    // Проверяем, что axios.get был вызван
    expect(axios.get).toHaveBeenCalled();
    
    // Дожидаемся обновления компонента после асинхронных операций
    await wrapper.vm.$nextTick();
    
    // Проверяем, что данные загружены в компонент
    expect(wrapper.vm.recommendedArticles.length).toBe(2);
    expect(wrapper.vm.recommendedTasks.length).toBe(2);
  });
  
  it('должен отображать статистику прогресса для авторизованных пользователей', async () => {
    await wrapper.vm.$nextTick();
    
    // Проверяем, что прогресс отображается
    const progressSection = wrapper.find('[data-test="progress-section"]');
    expect(progressSection.exists()).toBe(true);
    
    // Проверяем, что отображается информация о прогрессе
    expect(wrapper.text()).toContain('home.progress');
  });
  
  it('не должен отображать статистику прогресса для неавторизованных пользователей', async () => {
    // Сбрасываем флаг аутентификации
    authStore.isAuthenticated = false;
    await wrapper.vm.$nextTick();
    
    // Проверяем, что прогресс не отображается
    const progressSection = wrapper.find('[data-test="progress-section"]');
    expect(progressSection.exists()).toBe(false);
  });
  
  it('должен фильтровать статьи и задачи по категории', async () => {
    // Устанавливаем фильтр
    await wrapper.vm.filterByCategory('JavaScript');
    
    // Проверяем, что активный фильтр установлен
    expect(wrapper.vm.activeCategory).toBe('JavaScript');
    
    // Проверяем, что axios.get был вызван с правильными параметрами
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/recommended'),
      expect.objectContaining({
        params: expect.objectContaining({
          category: 'JavaScript'
        })
      })
    );
  });
}); 