<template>
  <div class="h-screen w-full bg-[#0a0f18] text-white overflow-hidden">
    
    <transition name="fade" mode="out-in">
      
      <Dashboard 
        v-if="user && user.id && !loading" 
        :key="user.id"
        :userId="user.id" 
        :user="user" 
      />

      <Login 
        v-else-if="!user && !loading" 
        @success="callback" 
        :loading="loading" 
        :error="error" 
      />

      <div v-else class="h-full w-full flex flex-col items-center justify-center gap-4">
        <div class="animate-spin text-4xl text-emerald-500">🔄</div>
        <p class="text-slate-400 font-medium animate-pulse">Sincronizando K-Portfolio...</p>
      </div>

    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Login from './components/Login.vue';
import Dashboard from './components/Dashboard.vue';
import api from './api/axiosConfig';

const user = ref(null);
const loading = ref(true); // Começamos como true para verificar o token silenciosamente
const error = ref(false);

const callback = async (response) => {
  try {
    loading.value = true;
    error.value = false;
    localStorage.setItem('user_token', response.credential);
    await login(response.credential);   
  } catch (err) {
    error.value = true;
    alert("Erro na conexão com o K-Portfolio.");
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const token = localStorage.getItem('user_token');
  if (token) {
    try {
      await login(token);
    } catch (err) {
      localStorage.removeItem('user_token');
      error.value = true;
    }
  }
  // Só paramos o loading global após a tentativa de login (com sucesso ou falha)
  loading.value = false;
});

const login = async (token) => {
  // Nota: Idealmente use a variável de ambiente VITE_API_URL aqui também
  const res = await api.post('https://portifolio-api-b1ml.onrender.com/auth/google', { token });    
  if (res.data) {
    user.value = res.data;
  } 
}
</script>

<style>
/* Transição global para troca de estado de autenticação */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reset básico para evitar saltos de layout globais */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
