import { createI18n } from 'vue-i18n'
import ru from '../locales/ru.json'
import en from '../locales/en.json'

const i18n = createI18n({
  legacy: false, // отключение legacy режима для Vue 3
  locale: localStorage.getItem('language') || 'ru',
  fallbackLocale: 'ru',
  messages: {
    ru,
    en
  }
})

export default i18n 