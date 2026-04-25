<template>
  <div class="h-screen w-full bg-[#05070a] text-white overflow-hidden">
    
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

      <div v-else class="h-full w-full flex justify-center items-center">
        
        <div class="w-[60%] h-full flex flex-col items-center justify-center bg-[#0a0f18] border-x border-white/[0.03] shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          
          <div class="relative flex items-center justify-center w-28 h-28 mb-10">
            <div class="w-28 h-28 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
            
            <div class="absolute flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl shadow-lg">
              <span class="text-black font-black text-4xl select-none">K</span>
            </div>
          </div>
          
          <p class="text-slate-500 font-mono text-[12px] uppercase tracking-[0.8em] animate-pulse text-center">
            Sincronizando K-Portfolio...
          </p>
          
        </div>
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
// Começamos como true para verificar o token silenciosamente no onMounted
const loading = ref(true); 
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
/* Transição global para troca de estado de autenticação (Dashboard <-> Login <-> Loading) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reset básico para evitar saltos de layout globais ao carregar o Vue */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Estilos adicionais para o logotipo K ficar robusto */
.font-black {
  font-weight: 900;
}
.select-none {
  user-select: none;
}
</style>
