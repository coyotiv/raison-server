import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
setActivePinia(pinia)

app.use(router)
app.use(vuetify)

app.mount('#app')
