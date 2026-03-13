import { createI18n } from 'vue-i18n'
import zh from './locales/zh'
import en from './locales/en'

// Get saved language from localStorage or use Chinese as default
const savedLanguage = localStorage.getItem('language') || 'zh'

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'zh',
  messages: {
    zh,
    en
  }
})

export default i18n
