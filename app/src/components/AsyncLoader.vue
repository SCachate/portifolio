<template>
  <div class="w-full min-h-full flex flex-col">
    
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
      <svg class="w-12 h-12 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <p class="mt-4 text-slate-400 text-sm font-medium animate-pulse font-mono uppercase tracking-widest">
        Sincronizando dados...
      </p>
    </div>

    <div v-else-if="error" class="m-8 p-6 border border-red-500/20 rounded-2xl bg-red-500/5 text-center">
      <span class="text-2xl mb-2 block">⚠️</span>
      <p class="text-red-400 font-medium">Erro ao carregar informações financeiros.</p>
      <button @click="$router.go(0)" class="mt-4 text-xs text-red-400/60 underline">Tentar novamente</button>
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
