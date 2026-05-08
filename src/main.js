import '@/assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from '@/App.vue'
import router from '@/router'

import en from '@/locales/en.json'
import es from '@/locales/es.json'
const browserLang = navigator.language.split('-')[0] // 'es' or 'en'

const i18n = createI18n({
  legacy: false,
  locale: ['en', 'es'].includes(browserLang) ? browserLang : 'en',
  fallbackLocale: 'en',
  messages: { en, es },
})

const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount('#app')
