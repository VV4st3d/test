<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold mb-6">{{ t('profile.settings') }}</h2>
    
    <!-- Настройки темы и цветовой схемы -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ t('common.appearance') }}</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Переключатель темы -->
        <div class="space-y-2">
          <label class="block text-sm font-medium">{{ t('common.theme') }}</label>
          <div class="flex space-x-4">
            <button 
              @click="setTheme('light')" 
              class="flex items-center justify-center p-3 rounded-md border"
              :class="{ 'bg-primary text-white border-primary': !isDark, 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600': isDark }"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {{ t('common.light') }}
            </button>
            
            <button 
              @click="setTheme('dark')" 
              class="flex items-center justify-center p-3 rounded-md border"
              :class="{ 'bg-primary text-white border-primary': isDark, 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600': !isDark }"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              {{ t('common.dark') }}
            </button>
          </div>
        </div>
        
        <!-- Выбор цветовой схемы -->
        <div class="space-y-2">
          <label class="block text-sm font-medium">{{ t('common.colorScheme') }}</label>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <button
              v-for="color in availableColorSchemes"
              :key="color"
              @click="setColorScheme(color)"
              class="flex flex-col items-center justify-center p-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              :class="{ 'ring-2 ring-offset-2 ring-primary': currentColorScheme === color }"
            >
              <div class="w-6 h-6 rounded-full mb-1" :style="{ backgroundColor: getColorDisplay(color) }"></div>
              <span class="text-xs truncate w-full text-center" :title="t(`common.schemes.${color}`)">{{ t(`common.schemes.${color}`) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Языковые настройки -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ t('common.language') }}</h3>
      <div class="flex space-x-4">
        <button
          v-for="lang in availableLanguages"
          :key="lang"
          @click="changeLanguage(lang)"
          class="px-4 py-2 rounded-md border"
          :class="{ 'bg-primary text-white border-primary': currentLanguage === lang, 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600': currentLanguage !== lang }"
        >
          {{ lang === 'ru' ? 'Русский' : 'English' }}
        </button>
      </div>
    </div>
    
    <!-- Учетная запись -->
    <div v-if="isAuthenticated" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ t('profile.account') }}</h3>
      
      <div class="space-y-4">
        <!-- Email -->
        <div class="flex flex-col space-y-2">
          <label for="email" class="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            :value="user.email"
            disabled
            class="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('profile.emailNotEditable') }}
          </p>
        </div>
        
        <!-- Имя пользователя -->
        <div class="flex flex-col space-y-2">
          <label for="name" class="text-sm font-medium">{{ t('auth.name') }}</label>
          <input
            id="name"
            v-model="userData.name"
            type="text"
            class="input"
          />
        </div>
        
        <!-- Кнопки управления -->
        <div class="flex justify-end space-x-3 mt-4">
          <button
            @click="resetForm"
            class="btn btn-outline"
            :disabled="!isFormChanged"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="saveProfile"
            class="btn btn-primary"
            :disabled="!isFormChanged || isLoading"
          >
            <span v-if="isLoading" class="loading-spinner mr-2"></span>
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useThemeStore } from '../store/theme'
import { useLanguageStore } from '../store/language'
import { useAuthStore } from '../store/auth'
import { useToastStore } from '../store/toast'

// Получаем хранилища
const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

// Получаем данные из хранилищ
const t = (key) => languageStore.t(key)
const isDark = computed(() => themeStore.isDark)
const currentColorScheme = computed(() => themeStore.colorScheme)
const availableColorSchemes = computed(() => themeStore.availableColorSchemes)
const currentLanguage = computed(() => languageStore.currentLanguage)
const availableLanguages = computed(() => languageStore.availableLanguages)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// Состояние формы
const isLoading = ref(false)
const userData = reactive({
  name: user.value?.name || ''
})

// Методы для работы с темой и цветовой схемой
const setTheme = (theme) => {
  themeStore.setTheme(theme)
  toastStore.success(t('profile.themeChanged'))
}

const setColorScheme = (color) => {
  themeStore.setColorScheme(color)
  toastStore.success(t('profile.colorSchemeChanged'))
}

const changeLanguage = (lang) => {
  languageStore.changeLanguage(lang)
  toastStore.success(t('profile.languageChanged'))
}

// Функция для получения цвета схемы
function getColorDisplay(color) {
  const colors = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    red: '#ef4444',
    orange: '#f97316'
  }
  return colors[color] || colors.blue
}

// Проверка изменений в форме
const isFormChanged = computed(() => {
  return userData.name !== user.value?.name
})

// Сброс формы
const resetForm = () => {
  userData.name = user.value?.name || ''
}

// Сохранение профиля
const saveProfile = async () => {
  if (!isFormChanged.value) return
  
  isLoading.value = true
  
  try {
    await authStore.updateProfile(userData)
    toastStore.success(t('profile.profileUpdated'))
  } catch (error) {
    toastStore.error(t('profile.updateError'))
    console.error('Error updating profile:', error)
  } finally {
    isLoading.value = false
  }
}
</script> 