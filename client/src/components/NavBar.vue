<template>
  <nav class="bg-white dark:bg-gray-800 shadow">
    <div class="container mx-auto px-6 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40" class="h-8 w-auto">
              <rect width="120" height="40" rx="8" :style="{ fill: bgColor }" />
              <path d="M10,8 L0,20 L10,32 L14,28 L6,20 L14,12 Z" :style="{ fill: primaryColor }" />
              <path d="M30,8 L40,20 L30,32 L26,28 L34,20 L26,12 Z" :style="{ fill: accentColor }" />
              <text x="45" y="27" font-family="Arial, sans-serif" font-weight="bold" font-size="20"
                :style="{ fill: primaryColor }">
                Web
              </text>
              <text x="85" y="27" font-family="Arial, sans-serif" font-weight="bold" font-size="20"
                :style="{ fill: accentColor }">
                Dev
              </text>
            </svg>
          </router-link>
          <div class="hidden md:flex items-center ml-8 space-x-4">
            <router-link v-for="item in navItems" :key="item.path" :to="item.path"
              class="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              :class="{ 'bg-gray-100 dark:bg-gray-700': isActive(item.path) }"
              v-show="item.condition === undefined || item.condition">
              {{ item.label }}
            </router-link>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Переключатель цветовой схемы -->
          <div class="relative" ref="colorSchemeDropdown">
            <button @click="toggleColorDropdown"
              class="flex items-center text-gray-600 dark:text-gray-300 focus:outline-none"
              :title="t('common.colorScheme')">
              <div class="w-5 h-5 rounded-full" :style="{ backgroundColor: currentColorDisplay }"></div>
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-show="colorDropdownOpen"
              class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
              <button v-for="color in availableColorSchemes" :key="color"
                @click="changeColorScheme(color); colorDropdownOpen = false;"
                class="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                :class="{ 'font-semibold': currentColorScheme === color }">
                <div class="w-4 h-4 rounded-full mr-2" :style="{ backgroundColor: getColorDisplay(color) }"></div>
                <span>{{ t(`common.schemes.${color}`) }}</span>
              </button>
            </div>
          </div>

          <!-- Переключатель языка -->
          <div class="relative" ref="languageDropdown">
            <button @click="toggleLanguageDropdown"
              class="flex items-center text-gray-600 dark:text-gray-300 focus:outline-none"
              :title="t('common.language')">
              <span class="mr-1 font-medium">{{ currentLanguage.toUpperCase() }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-show="languageDropdownOpen"
              class="absolute right-0 mt-2 w-24 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
              <button v-for="lang in availableLanguages" :key="lang"
                @click="changeLanguage(lang)"
                class="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                :class="{ 'font-semibold bg-gray-50 dark:bg-gray-700': currentLanguage === lang }">
                <span class="w-full text-left">{{ lang.toUpperCase() }}</span>
                <svg v-if="currentLanguage === lang" class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Переключатель темы -->
          <button @click="toggleTheme" class="text-gray-600 dark:text-gray-300 focus:outline-none"
            :title="isDark ? t('common.lightTheme') : t('common.darkTheme')">
            <svg v-if="isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Авторизация -->
          <div v-if="isAuthenticated" class="relative" ref="userDropdown">
            <button @click="toggleUserDropdown"
              class="flex items-center text-gray-600 dark:text-gray-300 focus:outline-none">
              <span class="mr-1">{{ user?.name || t('common.user') }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-show="userDropdownOpen"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
              <router-link to="/profile" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="userDropdownOpen = false">
                {{ t('profile.title') }}
              </router-link>
              <button @click="logout"
                class="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                {{ t('auth.logout') }}
              </button>
            </div>
          </div>
          <router-link v-else to="/login" class="btn btn-primary">
            {{ t('auth.login.title') }}
          </router-link>
        </div>
      </div>

      <!-- Мобильное меню -->
      <div class="md:hidden mt-3">
        <div class="space-y-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path"
            class="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            :class="{ 'bg-gray-100 dark:bg-gray-700': isActive(item.path) }"
            v-show="item.condition === undefined || item.condition">
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageStore } from '../store/language'
import { useThemeStore } from '../store/theme'
import { useAuthStore } from '../store/auth'

// Получаем хранилище языка
const languageStore = useLanguageStore()
const t = (key) => languageStore.t(key)
const currentLanguage = computed(() => languageStore.currentLanguage)
const availableLanguages = computed(() => languageStore.availableLanguages)

// Получаем хранилище темы
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
const toggleTheme = () => themeStore.toggleTheme()
const currentColorScheme = computed(() => themeStore.colorScheme)
const availableColorSchemes = computed(() => themeStore.availableColorSchemes)
const changeColorScheme = (color) => themeStore.setColorScheme(color)
const currentColorDisplay = computed(() => getColorDisplay(currentColorScheme.value))

// Вычисляемые свойства для цветов SVG
const primaryColor = computed(() =>
  isDark.value
    ? getColorStyles(currentColorScheme.value).primaryDark
    : getColorStyles(currentColorScheme.value).primary
)
const accentColor = computed(() =>
  isDark.value
    ? getColorStyles(currentColorScheme.value).accentDark
    : getColorStyles(currentColorScheme.value).accent
)
const bgColor = computed(() =>
  isDark.value
    ? getColorStyles(currentColorScheme.value).bgDark
    : getColorStyles(currentColorScheme.value).bg
)

// Получаем хранилище авторизации
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const logout = () => authStore.logout()

const route = useRoute()
const router = useRouter()

// Ссылки на DOM-элементы выпадающих меню
const languageDropdown = ref(null)
const userDropdown = ref(null)
const colorSchemeDropdown = ref(null)

// Инициализация данных пользователя при монтировании компонента
onMounted(async () => {
  if (isAuthenticated.value && !user.value) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      console.error('Не удалось загрузить данные пользователя:', error)
    }
  }

  // Инициализация пунктов меню
  updateNavItems()
  
  // Добавляем обработчик клика вне выпадающих меню
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  // Удаляем обработчик при размонтировании компонента
  document.removeEventListener('click', handleClickOutside)
})

// Состояние выпадающих меню
const languageDropdownOpen = ref(false)
const userDropdownOpen = ref(false)
const colorDropdownOpen = ref(false)

// Пункты главного меню
const navItems = ref([])

// Метод обновления пунктов меню
const updateNavItems = () => {
  navItems.value = [
    { path: '/', label: t('navigation.home') },
    { path: '/articles', label: t('navigation.articles') },
    { path: '/tasks', label: t('navigation.tasks') },
    { path: '/admin', label: t('navigation.admin'), condition: isAdmin.value },
  ]
}

// Функция для получения цветов для каждой схемы
function getColorStyles(scheme) {
  const schemes = {
    blue: {
      primary: '#3b82f6',
      accent: '#2563eb',
      bg: '#ffffff',
      primaryDark: '#60a5fa',
      accentDark: '#93c5fd',
      bgDark: '#1f2937',
    },
    green: {
      primary: '#10b981',
      accent: '#059669',
      bg: '#ffffff',
      primaryDark: '#34d399',
      accentDark: '#6ee7b7',
      bgDark: '#1f2937',
    },
    purple: {
      primary: '#8b5cf6',
      accent: '#7c3aed',
      bg: '#ffffff',
      primaryDark: '#a78bfa',
      accentDark: '#c4b5fd',
      bgDark: '#1f2937',
    },
    red: {
      primary: '#ef4444',
      accent: '#dc2626',
      bg: '#ffffff',
      primaryDark: '#f87171',
      accentDark: '#fca5a5',
      bgDark: '#1f2937',
    },
    orange: {
      primary: '#f97316',
      accent: '#ea580c',
      bg: '#ffffff',
      primaryDark: '#fb923c',
      accentDark: '#fdba74',
      bgDark: '#1f2937',
    },
  }
  return schemes[scheme] || schemes.blue
}

// Наблюдаем за изменением языка
watch(currentLanguage, () => {
  updateNavItems()
})

// Проверка активности пути
const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// Функция для получения цвета схемы
function getColorDisplay(color) {
  return getColorStyles(color).primary
}

// Переключение выпадающих меню
const toggleLanguageDropdown = () => {
  languageDropdownOpen.value = !languageDropdownOpen.value
  if (languageDropdownOpen.value) {
    userDropdownOpen.value = false
    colorDropdownOpen.value = false
  }
}

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value
  if (userDropdownOpen.value) {
    languageDropdownOpen.value = false
    colorDropdownOpen.value = false
  }
}

const toggleColorDropdown = () => {
  colorDropdownOpen.value = !colorDropdownOpen.value
  if (colorDropdownOpen.value) {
    languageDropdownOpen.value = false
    userDropdownOpen.value = false
  }
}

// Обработчик клика вне выпадающих меню
const handleClickOutside = (event) => {
  // Закрываем меню языка при клике вне его области
  if (languageDropdownOpen.value && languageDropdown.value && !languageDropdown.value.contains(event.target)) {
    languageDropdownOpen.value = false
  }
  
  // Закрываем меню пользователя при клике вне его области
  if (userDropdownOpen.value && userDropdown.value && !userDropdown.value.contains(event.target)) {
    userDropdownOpen.value = false
  }
  
  // Закрываем меню цветовой схемы при клике вне его области
  if (colorDropdownOpen.value && colorSchemeDropdown.value && !colorSchemeDropdown.value.contains(event.target)) {
    colorDropdownOpen.value = false
  }
}

// Улучшенная функция смены языка
const changeLanguage = async (lang) => {
  if (lang === currentLanguage.value) {
    languageDropdownOpen.value = false
    return
  }
  
  // Закрываем выпадающее меню
  languageDropdownOpen.value = false
  
  try {
    // Меняем язык через хранилище
    await languageStore.changeLanguage(lang)
    
    // Обновляем пункты меню с новыми переводами
    updateNavItems()
  } catch (error) {
    console.error('Ошибка при смене языка:', error)
  }
}
</script>

<style scoped>
/* Стили для выпадающих меню */
.absolute {
  z-index: 1000;
}

/* Стили для активных пунктов меню */
.bg-gray-100.dark\:bg-gray-700 {
  transition: background-color 0.2s ease;
}

/* Анимация для выпадающих меню */
.absolute {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
</style>