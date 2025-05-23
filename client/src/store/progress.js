import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';
import { useLanguageStore } from './language';

const apiUrl = import.meta.env.VITE_API_URL;

export const useProgressStore = defineStore('progress', {
  state: () => ({
    progress: {
      points: 0,
      level: 1,
      tasksByDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0
      },
      totalTasks: 0,
      totalArticles: 0,
      nextLevelThreshold: 100,
      prevLevelThreshold: 0,
      averagePoints: 0
    },
    completedTasks: [],
    activity: {
      tasks: Array(30).fill(0),
      articles: Array(30).fill(0)
    },
    loading: false,
    error: null
  }),

  getters: {
    getCompletedTasks: (state) => state.completedTasks,
    getLevel: (state) => state.progress.level,
    getPoints: (state) => state.progress.points
  },

  actions: {
    isTaskCompleted(taskId) {
      if (!this.completedTasks || !this.completedTasks.length) {
        return false;
      }
      return this.completedTasks.some(task =>
        task._id === taskId || task.taskId === taskId
      );
    },

    updateLocalProgress(taskData) {
      if (taskData.points) {
        this.progress.points = taskData.points;
      }
      if (taskData.level) {
        this.progress.level = taskData.level;
      }
      
      if (taskData.taskId && !this.isTaskCompleted(taskData.taskId)) {
        this.completedTasks.push({
          taskId: taskData.taskId,
          completedAt: taskData.completedAt || new Date()
        });
        
        this.progress.totalTasks += 1;
      }
    },

    async loadProgress() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.loading = true;
      this.error = null;

      try {
        const response = await this.retryRequest(() =>
          axios.get(`${apiUrl}/api/progress`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        );

        if (response.data && response.data.success) {
          this.progress = {
            points: response.data.points || 0,
            level: response.data.level || 1,
            tasksByDifficulty: response.data.tasksByDifficulty || {
              easy: 0,
              medium: 0,
              hard: 0
            },
            totalTasks: response.data.totalTasks || 0,
            totalArticles: response.data.totalArticles || 0,
            nextLevelThreshold: response.data.nextLevelThreshold || 100,
            prevLevelThreshold: response.data.prevLevelThreshold || 0,
            averagePoints: response.data.averagePoints || 0
          };
        }
        return this.progress;
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки прогресса';
        console.error('Ошибка загрузки прогресса:', error);
        this.resetProgressData();
        return null;
      } finally {
        this.loading = false;
      }
    },

    async loadCompletedTasks(page = 1, limit = 10) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.loading = true;
      this.error = null;

      try {
        const languageStore = useLanguageStore();
        const response = await this.retryRequest(() =>
          axios.get(`${apiUrl}/api/progress/completed-tasks`, {
            params: { page, limit, lang: languageStore.currentLanguage },
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        );

        if (response.data && response.data.success) {
          this.completedTasks = response.data.tasks || [];
        }
        return this.completedTasks;
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки выполненных заданий';
        console.error('Ошибка загрузки выполненных заданий:', error);
        this.completedTasks = [];
        return [];
      } finally {
        this.loading = false;
      }
    },

    async loadAllCompletedTasks() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.loading = true;
      this.error = null;

      try {
        const languageStore = useLanguageStore();
        const response = await this.retryRequest(() =>
          axios.get(`${apiUrl}/api/progress/completed-tasks`, {
            params: { page: 1, limit: 1000, lang: languageStore.currentLanguage },
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        );

        if (response.data && response.data.success) {
          this.completedTasks = response.data.tasks || [];
        }
        return this.completedTasks;
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки выполненных заданий';
        console.error('Ошибка загрузки всех выполненных заданий:', error);
        this.completedTasks = [];
        return [];
      } finally {
        this.loading = false;
      }
    },

    async loadActivity() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.loading = true;
      this.error = null;

      try {
        const response = await this.retryRequest(() =>
          axios.get(`${apiUrl}/api/progress/activity`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
        );

        if (response.data && response.data.success) {
          this.activity = {
            tasks: response.data.tasks || Array(30).fill(0),
            articles: response.data.articles || Array(30).fill(0)
          };
        }
        return this.activity;
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки активности';
        console.error('Ошибка загрузки активности:', error);
        this.activity = {
          tasks: Array(30).fill(0),
          articles: Array(30).fill(0)
        };
        return this.activity;
      } finally {
        this.loading = false;
      }
    },

    async fetchLeaderboard(period = 'all', limit = 10) {
      this.loading = true;

      try {
        const response = await this.retryRequest(() =>
          axios.get(`${apiUrl}/api/progress/leaderboard`, {
            params: { period, limit },
            headers: { Authorization: `Bearer ${useAuthStore().token}` }
          })
        );

        this.loading = false;

        if (response.data && response.data.success) {
          return {
            leaderboard: response.data.leaderboard || [],
            yourRank: response.data.yourRank || null,
            period: response.data.period || 'all'
          };
        }
        return { leaderboard: [], yourRank: null, period };
      } catch (error) {
        this.loading = false;
        console.error('Ошибка загрузки лидеров:', error);
        return { leaderboard: [], yourRank: null, period };
      }
    },

    async retryRequest(requestFn, retries = 3, delay = 1000) {
      for (let i = 0; i < retries; i++) {
        try {
          return await requestFn();
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    },

    resetProgressData() {
      this.progress = {
        points: 0,
        level: 1,
        tasksByDifficulty: {
          easy: 0,
          medium: 0,
          hard: 0
        },
        totalTasks: 0,
        totalArticles: 0,
        nextLevelThreshold: 100,
        prevLevelThreshold: 0,
        averagePoints: 0
      };
      this.completedTasks = [];
    }
  }
});