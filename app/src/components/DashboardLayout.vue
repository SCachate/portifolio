<template>
  <div class="flex h-screen w-full bg-[#0a0f18] overflow-hidden">
    <aside class="w-64 flex-shrink-0 bg-slate-900 border-r border-white/10 hidden md:flex flex-col">
      <div class="p-6 font-bold text-emerald-500 text-2xl shrink-0">K-Portfolio</div>
      <nav class="mt-6 px-4 space-y-2 flex-1">
        <div class="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl font-medium cursor-pointer">Dashboard</div>
        <div class="p-3 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors">Meus Ativos</div>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 h-full">
      <header class="h-20 bg-slate-900/50 border-b border-white/10 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
        <h2 class="text-white font-semibold text-lg truncate mr-4">Dashboard</h2>
        <div class="flex items-center gap-3 md:gap-6 shrink-0">
          <span class="text-xs md:text-sm text-slate-300 whitespace-nowrap">Olá, {{ user?.name || 'Investidor' }}</span>
          <button @click="$emit('logout')" class="text-red-400 text-sm hover:text-red-300 font-bold px-2 py-1">Sair</button>
        </div>
      </header>

      <main class="flex-1 p-4 md:p-8 overflow-y-auto bg-[#0a0f18]">
        <div class="w-full max-w-[1400px] mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
defineProps(['user']);
defineEmits(['logout']);
</script>