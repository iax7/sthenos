import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import '@/style.css'
import App from '@/App.vue'
import { router } from '@/router.js'

import en from '@/locales/en.json'
import es from '@/locales/es.json'
const browserLang = navigator.language.split('-')[0] // 'es' or 'en'

const i18n = createI18n({
  legacy: false,
  locale: ['en', 'es'].includes(browserLang) ? browserLang : 'en',
  fallbackLocale: 'en',
  messages: { en, es },
})

createApp(App).use(router).use(i18n).mount('#app')
