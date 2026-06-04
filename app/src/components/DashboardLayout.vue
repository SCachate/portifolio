<template>
  <div class="flex h-screen w-full bg-[#0a0f18] overflow-hidden select-none">
    
    <aside class="w-64 h-full border-r border-white/5 bg-[#0a0f18] flex flex-col relative flex-shrink-0">
      <div class="p-6">
        <div class="text-emerald-500 font-black text-2xl flex items-center gap-2 mb-10">
          <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-[#0a0f18] font-bold">
            K
          </div>
          K-Portfolio
        </div>
        
        <nav class="space-y-2">
          <button 
            v-for="item in navigationItems" 
            :key="item.id"
            @click="$emit('navigate', item.id)"
            :class="[
              activePage === item.id 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'text-slate-400 border-transparent hover:bg-white/5'
            ]"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all font-medium text-sm text-left group"
          >
            <span class="text-base group-hover:scale-110 transition-transform duration-200">
              {{ item.icon }}
            </span>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>

      <div class="absolute bottom-0 w-full p-6 border-t border-white/5 bg-[#0a0f18]">
        <div class="flex items-center justify-between">
          <div class="text-xs text-slate-600 font-mono italic select-none">v1.2.0</div>
          <button 
            @click="$emit('logout')" 
            class="text-xs text-red-500/80 font-bold hover:text-red-500 transition-colors duration-150"
          >
            Sair
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 h-full flex flex-col overflow-hidden min-w-0">
      
      <header class="w-full h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0f18]/80 backdrop-blur-xl sticky top-0 z-40 flex-shrink-0">
        <div class="text-white font-bold text-lg">
          {{ currentPageLabel }}
        </div>
        
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-xs text-white font-bold">{{ user?.name || 'Sidnei Cachate' }}</div>
            <div class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">
              Premium
            </div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/10"></div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Definição estrita das propriedades recebidas
const props = defineProps({
  user: {
    type: Object,
    default: () => ({ name: 'Sidnei Cachate' })
  },
  activePage: {
    type: String,
    required: true,
    default: 'dashboard'
  }
});

// Emissões de Eventos do Componente
defineEmits(['logout', 'navigate']);

// 1. Configuração Única de Rotas/Menus (Fácil de dar manutenção!)
const navigationItems = [
  { id: 'dashboard',  label: 'Dashboard',    icon: '📊' },
  { id: 'ativos',     label: 'Meus Ativos',  icon: '💰' },
  { id: 'transacoes', label: 'Transações',   icon: '🔄' }
];

// 2. Propriedade Computada para tratar o título da página no Header com acentuação correta
const currentPageLabel = computed(() => {
  const match = navigationItems.find(item => item.id === props.activePage);
  return match ? match.label : props.activePage;
});
</script>