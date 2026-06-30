<template>
  <div ref="googleButtonRef" class="w-full flex justify-center"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const emit = defineEmits(['success']);
const googleButtonRef = ref(null);
const Client_Id = "289336503031-s8athopc2o6dsqk8f79dln4318l7b3o2.apps.googleusercontent.com";
const loading = ref(true);

const initGoogle = () => {
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: Client_Id,
      callback: (response) => emit('success', response),
      auto_select: false,
    });
    
    window.google.accounts.id.renderButton(
      googleButtonRef.value, // Referência direta ao elemento
      { theme: "outline", size: "large", type: "standard", shape: "pill" }
    );
  } else {
    setTimeout(initGoogle, 500);
  }
};

onMounted(initGoogle);
</script>