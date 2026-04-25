<template>
  <div class="flex h-screen w-full bg-[#0a0f18] overflow-hidden">
    <aside class="w-64 flex-shrink-0 bg-slate-900 border-r border-white/10 hidden md:flex flex-col">
      <div class="p-6 font-bold text-emerald-500 text-2xl shrink-0">K-Portfolio</div>
      
      <nav class="mt-6 px-4 space-y-2 flex-1">
        <div 
          @click="$emit('navigate', 'dashboard')"
          :class="activePage === 'dashboard' ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-400 hover:text-white hover:bg-white/5'"
          class="p-3 rounded-xl font-medium cursor-pointer flex items-center gap-3 transition-all"
        >
          <span>📊</span> Dashboard
        </div>

        <div 
          @click="$emit('navigate', 'ativos')"
          :class="activePage === 'ativos' ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-400 hover:text-white hover:bg-white/5'"
          class="p-3 rounded-xl font-medium cursor-pointer flex items-center gap-3 transition-all"
        >
          <span>💰</span> Meus Ativos
        </div>

        <div 
          @click="$emit('navigate', 'transacoes')"
          :class="activePage === 'transacoes' ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-400 hover:text-white hover:bg-white/5'"
          class="p-3 rounded-xl font-medium cursor-pointer flex items-center gap-3 transition-all"
        >
          <span>🔄</span> Transações
        </div>
      </nav>

      <div class="p-4 border-t border-white/5 text-slate-500 text-xs text-center">v1.2.0</div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 h-full">
      <header class="h-20 bg-slate-900/50 border-b border-white/10 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
        <h2 class="text-white font-semibold text-lg capitalize">
          {{ activePage === 'transacoes' ? 'Histórico de Transações' : activePage }}
        </h2>
        
        <div class="flex items-center gap-3 md:gap-6 shrink-0">
          <div class="flex flex-col items-end">
            <span class="text-xs md:text-sm text-slate-300">{{ user?.name || 'Investidor' }}</span>
            <span class="text-[10px] text-emerald-500">Premium</span>
          </div>
          <button @click="$emit('logout')" class="text-red-400 text-sm hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-all font-medium border border-red-400/20">
            Sair
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-[#0a0f18] scrollbar-thin scrollbar-thumb-slate-700">      
        <div class="w-full max-w-[1400px] mx-auto p-4 md:p-8 min-h-full">
          <slot />
        </div>      
      </main>
    </div>
  </div>
</template>

<script setup>
defineProps(['user', 'activePage']); // Recebe qual página está ativa para pintar o menu
defineEmits(['logout', 'navigate']);
</script>
