<template>
  <div class="min-h-screen bg-[#0a0f18] flex w-full">
    
    <aside class="w-64 bg-slate-900 border-r border-white/10 hidden md:block">
      <div class="p-6 font-bold text-emerald-500 text-2xl">K-Portfolio</div>
      <nav class="mt-6 px-4 space-y-2">
        <div class="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl font-medium">Dashboard</div>
        <div class="p-3 text-slate-400 hover:text-white rounded-xl cursor-pointer">Meus Ativos</div>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col w-full">
      <header class="h-20 bg-slate-900/50 border-b border-white/10 flex items-center justify-between px-8">
        <h2 class="text-white font-semibold text-lg"></h2>
        <div class="flex items-center gap-6">
          <span class="text-sm text-slate-300">Olá, {{ user?.name || 'Investidor' }}</span>
          <button @click="$emit('logout')" class="text-red-400 text-sm hover:text-red-300 font-bold">
            Sair
          </button>
        </div>
      </header>

      <main class="p-8 w-full">
        <slot /> 
      </main>
    </div>
  </div>
</template>

<script setup>
defineProps(['user']);
defineEmits(['logout']);
</script>