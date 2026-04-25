<template>
  <div class="w-full h-full flex flex-col flex-1">
    
    <div v-if="loading" class="w-full flex-1 flex flex-col items-center justify-center p-12">
      <svg class="w-12 h-12 animate-spin text-emerald-500" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <p class="mt-4 text-slate-400 text-sm font-medium">Sincronizando dados...</p>
    </div>

    <div v-else-if="error" class="w-full p-4 bg-red-900/10 border border-red-900 rounded-xl">
      Erro ao carregar dados.
    </div>

    <div v-else class="w-full flex-1">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  error: Boolean
});
</script>
