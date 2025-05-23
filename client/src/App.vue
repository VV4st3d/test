<script setup>
import { onMounted, watch, computed } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { useThemeStore } from './store/theme'
import { useLanguageStore } from './store/language'
import { useAuthStore } from './store/auth'
import { useToastStore } from './store/toast'
import Toast from './components/Toast.vue'
import ToastNotification from './components/ToastNotification.vue'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
const colorScheme = computed(() => themeStore.colorScheme)

const languageStore = useLanguageStore()
const currentLanguage = computed(() => languageStore.currentLanguage)

const authStore = useAuthStore()

const toastStore = useToastStore()

const { darkMode } = storeToRefs(themeStore)

onMounted(async () => {
  await themeStore.initialize()
  await languageStore.initialize()
  await authStore.initializeAuth()
  
  // Показываем приветственное уведомление
  toastStore.success('Приложение успешно загружено!')
})

// Применяем тему и цветовую схему при изменении
watch(isDark, (value) => {
  if (value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', value)
}, { immediate: true })

// Применяем язык при изменении
watch(currentLanguage, async (value) => {
  document.documentElement.lang = value
  // Убедимся, что переводы загружены
  await languageStore.initializeLanguage()
}, { immediate: true })

// Применяем цветовую схему при изменении
watch(colorScheme, (value) => {
  themeStore.applyColorScheme(value)
}, { immediate: true })
</script>

<template>
  <div class="app min-h-screen flex flex-col dark:bg-gray-900 dark:text-white transition-colors duration-200">
    <nav-bar />
    <main class="container mx-auto px-4 py-6 flex-grow">
      <router-view />
    </main>
    <Footer />
    <toast-notification />
    <Toast />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
