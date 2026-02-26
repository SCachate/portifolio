import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'
import App from './App.vue'

const app = createApp(App)

app.use(vue3GoogleLogin, {
  clientId: '289336503031-s8athopc2o6dsqk8f79dln4318l7b3o2.apps.googleusercontent.com',
  language: 'pt-BR' // <--- Adicione esta linha exatamente assim
})

app.mount('#app')