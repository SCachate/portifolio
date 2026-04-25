<template>
  <div class="h-screen w-screen bg-[#05070a] text-white overflow-hidden flex flex-col items-stretch">
  
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

      <div v-else class="h-full w-full flex justify-center items-center bg-[#05070a]">
        
        <div class="flex flex-col items-center justify-center">
          
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
  loading.value = false;
});

const login = async (token) => {
  const res = await api.post('https://portifolio-api-b1ml.onrender.com/auth/google', { token });    
  if (res.data) {
    user.value = res.data;
  } 
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.font-black {
  font-weight: 900;
}

.select-none {
  user-select: none;
}
</style>
