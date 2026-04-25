<template>
  <div class="grid grid-cols-[280px_1fr] min-h-screen w-full bg-[#0a0f18] overflow-x-hidden">
    
    <aside class="w-[280px] h-screen sticky top-0 border-r border-white/5 bg-[#0a0f18] z-50">
      <div class="p-6">
        <div class="text-emerald-500 font-black text-2xl flex items-center gap-2 mb-10">
          <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-[#0a0f18]">K</div>
          K-Portfolio
        </div>
        
        <nav class="space-y-2">
          <button 
            @click="$emit('navigate', 'dashboard')"
            :class="activePage === 'dashboard' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'text-slate-400 border-transparent hover:bg-white/5'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all font-medium text-sm"
          >
            📊 Dashboard
          </button>
          <button 
            @click="$emit('navigate', 'ativos')"
            :class="activePage === 'ativos' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'text-slate-400 border-transparent hover:bg-white/5'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all font-medium text-sm"
          >
            💰 Meus Ativos
          </button>
          <button 
            @click="$emit('navigate', 'transacoes')"
            :class="activePage === 'transacoes' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'text-slate-400 border-transparent hover:bg-white/5'"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all font-medium text-sm"
          >
            🔄 Transações
          </button>
        </nav>
      </div>

      <div class="absolute bottom-0 w-full p-6 border-t border-white/5">
        <div class="flex items-center justify-between">
          <div class="text-xs text-slate-600 font-mono italic">v1.2.0</div>
          <button @click="$emit('logout')" class="text-xs text-red-500 font-bold hover:underline">Sair</button>
        </div>
      </div>
    </aside>

    <main class="w-full h-screen overflow-y-auto bg-[#0a0f18] flex flex-col">
      <header class="w-full h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0f18]/80 backdrop-blur-xl sticky top-0 z-40 flex-shrink-0">
        <div class="text-white font-bold capitalize">{{ activePage }}</div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-xs text-white font-bold">{{ user?.name || 'Sidnei Cachate' }}</div>
            <div class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Premium</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600"></div>
        </div>
      </header>

      <div class="w-full max-w-7xl mx-auto p-8 flex-1">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
defineProps(['user', 'activePage']);
defineEmits(['logout', 'navigate']);
</script>
