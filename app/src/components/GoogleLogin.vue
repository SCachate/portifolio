<template>
  <button @click="loginComGoogle" class="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-full shadow-sm bg-white hover:bg-gray-50 transition-colors w-full font-medium text-gray-700">
    <svg class="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.313-.178-1.709H12.24z"/>
    </svg>
    Continuar com o Google
  </button>
</template>

<script setup>
import { onMounted } from 'vue';

const emit = defineEmits(['success']);
const Client_Id = "289336503031-s8athopc2o6dsqk8f79dln4318l7b3o2.apps.googleusercontent.com";

let client = null;

const initGoogle = () => {
  if (window.google) {
    // Inicializa o cliente focado em obter autorização e tokens offline
    client = window.google.accounts.oauth2.initCodeClient({
      client_id: Client_Id,
      scope: 'openid email profile', // Escopos necessários
      access_type: 'offline',        // CRUCIAL: Garante o envio do refresh_token
      prompt: 'consent',             // Força a tela de consentimento para garantir o refresh_token no teste
      callback: (response) => {
        console.info(['google',response]);
        // O response aqui conterá um 'code'
        if (response.code) {
          emit('success', response); 
        }
      },
    });
  } else {
    setTimeout(initGoogle, 500);
  }
};

const loginComGoogle = () => {
  if (client) {
    client.requestCode(); // Abre o pop-up oficial do Google
  }
};

onMounted(initGoogle);
</script>