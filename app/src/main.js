import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './components/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: App },
    { path: '/:pathMatch(.*)*', redirect: '/' },    
    { 
      path: '/dashboard', 
      component: Dashboard,
      meta: { requiresAuth: true } 
    }
  ] 
});
const app = createApp(App)

app.use(vue3GoogleLogin, {
  clientId: '289336503031-s8athopc2o6dsqk8f79dln4318l7b3o2.apps.googleusercontent.com',
  language: 'pt-BR' // <--- Adicione esta linha exatamente assim
})

app.use(router);
app.mount('#app')

// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('user_token');

//   // Se a rota exige autenticação E não temos token, mandamos pro Login
//   if (to.meta.requiresAuth && !token) {
//     next('/');
//   } else {
//     // Caso contrário, deixa passar
//     next();
//   }
// });

// export default router;