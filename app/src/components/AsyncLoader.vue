<template>
  <div class="w-full">
    <div v-if="loading" class="w-full h-[60vh] flex flex-col items-center justify-center">
      <div class="relative flex items-center justify-center">
        <div class="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
        <div class="absolute text-xl">💎</div>
      </div>
      <p class="mt-6 text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">
        Sincronizando K-Portfolio...
      </p>
    </div>

    <div v-else-if="error" class="w-full p-12 bg-red-950/20 border border-red-500/20 rounded-3xl text-center">
      <span class="text-3xl mb-4 block">⚠️</span>
      <h3 class="text-red-400 font-bold">Erro de Conexão</h3>
      <p class="text-red-400/60 text-sm mt-1">Não foi possível buscar seus dados financeiros.</p>
    </div>

    <div v-else class="w-full animate-in fade-in duration-700">
      <slot />
    </div>
  </div>
</template>

<script setup>
/**
 * Define as propriedades que o componente pai (Dashboard.vue) passará.
 * Sem isso, as diretivas v-if="loading" resultam em erro.
 */
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
/* Animações simples para uma entrada suave do conteúdo */
.animate-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
