<template>
  <div class="min-h-screen bg-[#0a0f18] text-white">
    <Dashboard v-if="user && user.id" :userId="user.id" :user="user" />
    <Login v-else @success="callback" :loading="loading" :error="error" />  
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Login from './components/Login.vue';
import Dashboard from './components/Dashboard.vue';
import AsyncLoader from './components/AsyncLoader.vue';
import api from './api/axiosConfig';

const user = ref(null);
const loading = ref(false);
const error = ref(false);

const callback = async (response) => {
  try {
    loading.value = true;
    error.value = false;
    localStorage.setItem('user_token', response.credential);
    await login(response.credential);   
  } catch (error) {
    error.value = true;
    alert("Erro na conexão com o K-Portfolio.");
    console.error(error);
  }
  finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const token = localStorage.getItem('user_token');
  if (token) {
    try {
     loading.value = true;
     error.value = false;
     await login(token);
    } catch (err) {
      // Se der erro, o token expirou ou é inválido
      localStorage.removeItem('user_token');
      error.value = true;
    }
    finally {
      loading.value = false;
    }
  }
});

const login = async (token) => {

  const res = await api.post('https://supreme-acorn-gpxrgxr74v4hv45w-3000.app.github.dev/auth/google', { token });    
  if (res.data) {
    user.value = res.data;
  } 
}
</script>