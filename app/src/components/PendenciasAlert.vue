<template>
  <div class="bg-slate-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-2xl transition-all duration-300">
    <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
      <span class="w-2 h-2 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"></span>
      Pendências para resolver
    </h3>

    <div class="space-y-4">
      <div v-for="item in lista" :key="item.codigo" 
           class="bg-slate-800/50 border border-amber-500/20 p-5 rounded-2xl flex items-center justify-between hover:border-amber-500/40 transition-all duration-300 group">
        
        <p class="text-slate-300 text-sm font-medium">{{ item.mensagem }}</p>
        
        <router-link :to="item.link_destino" 
                     class="bg-amber-500 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-400 shrink-0 ml-4 transition-all duration-300 transform group-hover:scale-105">
          {{ item.texto_botao }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  lista: { type: Array, required: true, default: () => [] }
});
</script>