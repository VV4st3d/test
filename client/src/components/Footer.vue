<template>
  <footer class="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-200">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Основной контент футера -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Колонка 1: Логотип и описание -->
        <div>
          <div class="flex items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="120"
              height="40"
              viewBox="0 0 120 40"
              class="h-8 w-auto mr-2"
            >
              <rect width="120" height="40" rx="8" :style="{ fill: 'none' }" />
              <path
                d="M10,8 L0,20 L10,32 L14,28 L6,20 L14,12 Z"
                :style="{ fill: primaryColor }"
              />
              <path
                d="M30,8 L40,20 L30,32 L26,28 L34,20 L26,12 Z"
                :style="{ fill: accentColor }"
              />
              <text
                x="45"
                y="27"
                font-family="Arial, sans-serif"
                font-weight="bold"
                font-size="20"
                :style="{ fill: primaryColor }"
              >
                Web
              </text>
              <text
                x="85"
                y="27"
                font-family="Arial, sans-serif"
                font-weight="bold"
                font-size="20"
                :style="{ fill: accentColor }"
              >
                Dev
              </text>
            </svg>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-300">
            {{ $t('footer.description') }}
          </p>
        </div>

        <!-- Колонка 2: Полезные ссылки -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            {{ $t('footer.links') }}
          </h3>
          <ul class="space-y-2">
            <li>
              <router-link
                to="/about"
                class="text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              >
                {{ $t('footer.about') }}
              </router-link>
            </li>
            <li>
              <router-link
                to="/contacts"
                class="text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              >
                {{ $t('footer.contacts') }}
              </router-link>
            </li>
            <li>
              <router-link
                to="/privacy"
                class="text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              >
                {{ $t('footer.privacy') }}
              </router-link>
            </li>
            <li>
              <router-link
                to="/terms"
                class="text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              >
                {{ $t('footer.terms') }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Колонка 3: Социальные сети -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            {{ $t('footer.socialMedia') }}
          </h3>
          <div class="flex space-x-4">
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-github"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com/your-account"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-twitter-x"
                viewBox="0 0 16 16"
              >
                <path
                  d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"
                />
              </svg>
            </a>
            <a
              href="https://t.me/your-channel"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              aria-label="Telegram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-telegram"
                viewBox="0 0 16 16"
              >
                <path
                  d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"
                />
              </svg>
            </a>
            <a
              href="https://youtube.com/your-channel"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors"
              aria-label="YouTube"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="bi bi-youtube"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Копирайт -->
      <div
        class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-600 text-center"
      >
        <p class="text-xs text-gray-500 dark:text-gray-300">
          {{ $t('footer.copyright', { year: currentYear }) }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../store/theme'

const currentYear = computed(() => new Date().getFullYear())

// Получаем хранилище темы
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// Вычисляемые свойства для цветов SVG
const primaryColor = computed(() =>
  isDark.value
    ? getColorStyles(themeStore.colorScheme).primaryDark
    : getColorStyles(themeStore.colorScheme).primary
)
const accentColor = computed(() =>
  isDark.value
    ? getColorStyles(themeStore.colorScheme).accentDark
    : getColorStyles(themeStore.colorScheme).accent
)
const bgColor = computed(() =>
  isDark.value
    ? getColorStyles(themeStore.colorScheme).bgDark
    : getColorStyles(themeStore.colorScheme).bg
)

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
</script>

<style scoped>
/* Ховер-эффекты используют CSS-переменную из themeStore */
.text-\[var\(--color-primary\)\] {
  color: var(--color-primary);
}
</style>