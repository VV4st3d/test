import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Ленивая загрузка компонентов
const HomeView = () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue')
const ArticlesView = () => import(/* webpackChunkName: "articles" */ '@/views/ArticlesView.vue')
const ArticleView = () => import(/* webpackChunkName: "article" */ '@/views/ArticleView.vue')
const TasksView = () => import(/* webpackChunkName: "tasks" */ '@/views/TasksView.vue')
const TaskView = () => import(/* webpackChunkName: "task" */ '@/views/TaskView.vue')
const LoginView = () => import(/* webpackChunkName: "auth" */ '@/views/LoginView.vue')
const RegisterView = () => import(/* webpackChunkName: "auth" */ '@/views/RegisterView.vue')
const ProfileView = () => import(/* webpackChunkName: "profile" */ '@/views/ProfileView.vue')
const AdminView = () => import(/* webpackChunkName: "admin" */ '@/views/AdminView.vue')
const ArticleFormView = () => import(/* webpackChunkName: "admin" */ '@/views/ArticleFormView.vue')
const TaskFormView = () => import(/* webpackChunkName: "admin" */ '@/views/TaskFormView.vue')
const NotFoundView = () => import(/* webpackChunkName: "error" */ '@/views/NotFoundView.vue')
const AboutView = () => import(/* webpackChunkName: "static" */ '@/views/AboutView.vue')
const ContactsView = () => import(/* webpackChunkName: "static" */ '@/views/ContactsView.vue')
const PrivacyView = () => import(/* webpackChunkName: "static" */ '@/views/PrivacyView.vue')
const TermsView = () => import(/* webpackChunkName: "static" */ '@/views/TermsView.vue')
const AdminForbiddenWordsView = () => import(/* webpackChunkName: "admin" */ '@/views/AdminForbiddenWordsView.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { 
      title: 'Главная',
      transition: 'fade' 
    }
  },
  {
    path: '/articles',
    name: 'articles',
    component: ArticlesView,
    meta: { 
      title: 'Статьи',
      transition: 'slide-left' 
    }
  },
  {
    path: '/articles/:id',
    name: 'article',
    component: ArticleView,
    props: true,
    meta: { 
      transition: 'fade',
      // Предзагрузка редактора для создания комментариев
      prefetch: ['comments-editor']
    }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TasksView,
    meta: { 
      title: 'Задачи',
      transition: 'slide-left' 
    }
  },
  {
    path: '/tasks/:id',
    name: 'task',
    component: TaskView,
    props: true,
    meta: { 
      transition: 'fade',
      // Предзагрузка редактора кода
      prefetch: ['code-editor']
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { 
      title: 'Вход',
      guest: true,
      transition: 'fade-up' 
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { 
      title: 'Регистрация',
      guest: true,
      transition: 'fade-up' 
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { 
      title: 'Профиль',
      requiresAuth: true,
      transition: 'fade' 
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { 
      title: 'Админ панель',
      requiresAdmin: true,
      transition: 'fade' 
    }
  },
  {
    path: '/admin/articles/new',
    name: 'new-article',
    component: ArticleFormView,
    meta: { 
      title: 'Создание статьи',
      requiresAdmin: true,
      transition: 'fade' 
    }
  },
  {
    path: '/admin/articles/:id/edit',
    name: 'edit-article',
    component: ArticleFormView,
    props: true,
    meta: { 
      title: 'Редактирование статьи',
      requiresAdmin: true,
      transition: 'fade' 
    }
  },
  {
    path: '/admin/tasks/new',
    name: 'new-task',
    component: TaskFormView,
    meta: { 
      title: 'Создание задачи',
      requiresAdmin: true,
      transition: 'fade' 
    }
  },
  {
    path: '/admin/tasks/:id/edit',
    name: 'edit-task',
    component: TaskFormView,
    props: true,
    meta: { 
      title: 'Редактирование задачи',
      requiresAdmin: true,
      transition: 'fade' 
    }
  },
  {
    path: '/admin/forbidden-words',
    name: 'admin-forbidden-words',
    component: AdminForbiddenWordsView,
    meta: { 
      title: 'Управление запрещенными словами',
      requiresAdmin: true,
      transition: 'fade' 
    }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: {
      title: 'О нас',
      transition: 'fade'
    }
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: ContactsView,
    meta: {
      title: 'Контакты',
      transition: 'fade'
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyView,
    meta: {
      title: 'Политика конфиденциальности',
      transition: 'fade'
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: TermsView,
    meta: {
      title: 'Условия использования',
      transition: 'fade'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { 
      title: 'Страница не найдена',
      transition: 'fade' 
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Возвращение к сохраненной позиции при использовании кнопок навигации браузера
    if (savedPosition) {
      return savedPosition;
    }
    
    // Плавная прокрутка к началу страницы при переходе на новую страницу
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Предзагрузка компонентов для следующей страницы
router.beforeResolve((to, from, next) => {
  // Если у маршрута есть метаданные о предзагрузке, загружаем компоненты
  if (to.meta.prefetch) {
    // Здесь можно динамически импортировать нужные компоненты
    // Для примера - ничего не делаем, просто отмечаем, что логика есть
    console.log(`Prefetching components for ${to.path}`, to.meta.prefetch);
  }
  next();
});

// Защита маршрутов и управление заголовком страницы
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Установка заголовка страницы
  if (to.meta.title) {
    document.title = `WebDev Platform | ${to.meta.title}`;
  } else {
    document.title = 'WebDev Platform';
  }

  // Защита маршрутов, требующих аутентификации
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  // Защита маршрутов только для админа
  if (to.meta.requiresAdmin && (!authStore.isAuthenticated || authStore.user.role !== 'admin')) {
    next({ name: 'home' });
    return;
  }

  // Защита маршрутов для гостей (например, страницы логина/регистрации)
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router 