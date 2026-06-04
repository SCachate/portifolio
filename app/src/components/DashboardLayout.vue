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
          <div v-for="item in navigationItems" :key="item.id" class="space-y-1">
            
            <button 
              v-if="!item.children"
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

            <div v-else class="space-y-1">
              <button 
                @click="toggleCadastros"
                :class="[
                  isCadastrosOpen || item.children.some(sub => sub.id === activePage)
                    ? 'text-white border-white/5 bg-white/[0.02]' 
                    : 'text-slate-400 border-transparent hover:bg-white/5'
                ]"
                class="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all font-medium text-sm text-left group"
              >
                <div class="flex items-center gap-3">
                  <span class="text-base group-hover:scale-110 transition-transform duration-200">
                    {{ item.icon }}
                  </span>
                  <span>{{ item.label }}</span>
                </div>
                <span 
                  :class="[isCadastrosOpen ? 'rotate-180 text-emerald-500' : 'text-slate-500']"
                  class="text-xs transition-transform duration-200 font-bold"
                >
                  ▼
                </span>
              </button>

              <div 
                v-show="isCadastrosOpen" 
                class="space-y-1 overflow-hidden transition-all duration-300"
              >
                <button
                  v-for="subItem in item.children"
                  :key="subItem.id"
                  @click="$emit('navigate', subItem.id)"
                  :class="[
                    activePage === subItem.id
                      ? 'text-emerald-500 bg-emerald-500/5 font-semibold'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                  ]"
                  class="w-full flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-xl text-xs text-left transition-all"
                >
                  <span>{{ subItem.icon }}</span>
                  <span>{{ subItem.label }}</span>
                </button>
              </div>
            </div>

          </div>
        </nav>
      </div>

      <div class="absolute bottom-0 w-full p-6 border-t border-white/5 bg-[#0a0f18]">
        <div class="flex items-center justify-between">
          <div class="text-xs text-slate-600 font-mono italic">v1.2.0</div>
          <button @click="$emit('logout')" class="text-xs text-red-500/80 font-bold hover:text-red-500 transition-colors">
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
            <div class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Premium</div>
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
import { ref, computed } from 'vue';

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

defineEmits(['logout', 'navigate']);

// Controle reativo para abrir/fechar a seção de Cadastros
const isCadastrosOpen = ref(false);
const toggleCadastros = () => {
  isCadastrosOpen.value = !isCadastrosOpen.value;
};

// 1. Array Único Atualizado com a Nova Estrutura Hierárquica
const navigationItems = [
  { id: 'dashboard',  label: 'Dashboard',    icon: '📊' },
  { id: 'ativos',     label: 'Meus Ativos',  icon: '💰' },
  { id: 'transacoes', label: 'Transações',   icon: '🔄' },
  { 
    id: 'cadastros',   
    label: 'Cadastros',    
    icon: '⚙️', // Ícone de engrenagem/configuração para Cadastros
    children: [
      { id: 'usuarios',         label: 'Usuários',          icon: '👤' },
      { id: 'cadastro-ativos',  label: 'Ativos',            icon: '📄' },
      { id: 'classes-ativos',   label: 'Classes de Ativos', icon: '📁' },
    ]
  }
];

// 2. Computada inteligente para buscar títulos normais ou de subitens
const currentPageLabel = computed(() => {
  for (const item of navigationItems) {
    if (item.id === props.activePage) return item.label;
    if (item.children) {
      const subMatch = item.children.find(sub => sub.id === props.activePage);
      if (subMatch) {
        // Se um subitem estiver ativo, abre o menu automaticamente ao carregar a página
        isCadastrosOpen.value = true;
        return `${item.label} / ${subMatch.label}`; // Ex: "Cadastros / Classes de Ativos"
      }
    }
  }
  return props.activePage;
});
</script>