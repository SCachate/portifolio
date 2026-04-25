<template>
  <div class="w-full">
    <div v-if="loading" class="w-full flex flex-col items-center justify-center py-32">
      <div class="relative flex items-center justify-center">
         <div class="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
         <div class="absolute text-xl">💎</div>
      </div>
      <p class="mt-6 text-slate-400 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Sincronizando Portfólio
      </p>
    </div>

    <div v-else-if="error" class="w-full p-8 border border-red-500/20 bg-red-500/5 rounded-2xl text-red-400 text-center">
      Ocorreu um erro ao carregar os dados.
    </div>

    <div v-else class="w-full">
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
