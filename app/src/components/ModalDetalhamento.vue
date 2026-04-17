<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="bg-[#1a1c24] border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal">
          
          <header class="p-6 border-b border-slate-700 bg-slate-800/20">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
              
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Classe de Ativo</label>
                <select 
                  :value="classeSelecionada" 
                  @change="$emit('update:classe', $event.target.value)"
                  class="bg-slate-900 border border-slate-700 text-white font-bold rounded-lg p-2.5 px-4 outline-none focus:border-blue-500 transition-all cursor-pointer min-w-[200px]"
                >
                  <option v-for="opt in listaClasses" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <div class="flex items-end gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Início</label>
                  <input 
                    type="date" 
                    v-model="dataInicio" 
                    class="bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Término</label>
                  <input 
                    type="date" 
                    v-model="dataFim" 
                    class="bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <button 
                  @click="$emit('update:modelValue', false)" 
                  class="ml-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <div class="flex flex-1 h-[650px] overflow-hidden">
            
            <aside class="w-1/3 border-r border-slate-700 flex flex-col bg-slate-900/40">
              <div class="p-4 bg-slate-800/30">
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input 
                    v-model="buscaAsset"
                    type="text" 
                    placeholder="Pesquisar ticker ou nome..." 
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div v-if="carregandoAssets" class="p-8 text-center text-slate-500 text-sm">Carregando ativos...</div>
                
                <button 
                  v-for="asset in assetsFiltrados" 
                  :key="asset.id"
                  @click="assetSelecionado = asset"
                  :class="[
                    'w-full p-4 flex flex-col items-start transition-all border-b border-slate-800/40 hover:bg-slate-800/60 text-left',
                    assetSelecionado?.id === asset.id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                  ]"
                >
                  <span class="font-bold text-sm tracking-wide" :class="assetSelecionado?.id === asset.id ? 'text-blue-400' : 'text-slate-200'">
                    {{ asset.ticker || asset.nome }}
                  </span>
                  <span class="text-[10px] text-slate-500 truncate w-full uppercase mt-1">
                    {{ asset.nome_completo || asset.instituicao || 'Instituição não informada' }}
                  </span>
                </button>

                <div v-if="!carregandoAssets && assetsFiltrados.length === 0" class="p-8 text-center text-slate-600 text-xs italic">
                  Nenhum ativo encontrado nesta classe.
                </div>
              </div>
            </aside>

            <main class="w-2/3 overflow-y-auto p-8 bg-slate-900/10 custom-scrollbar">
              <div v-if="assetSelecionado" class="animate-in fade-in slide-in-from-right-4 duration-300">
                <div class="flex justify-between items-start mb-8">
                  <div>
                    <h4 class="text-2xl font-black text-white tracking-tight">{{ assetSelecionado.ticker || assetSelecionado.nome }}</h4>
                    <p class="text-slate-500 text-xs uppercase tracking-widest mt-1">{{ assetSelecionado.nome_completo }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Resultado do Período</p>
                    <p :class="['text-xl font-bold mt-1', 1250 >= 0 ? 'text-emerald-400' : 'text-red-400']">
                      R$ 1.250,45
                    </p>
                  </div>
                </div>

                <div class="space-y-6">
                  <div class="h-64 bg-slate-800/20 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center p-4">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                     </svg>
                     <span class="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Gráfico de Evolução entre {{ dataInicio }} e {{ dataFim }}</span>
                  </div>
                  
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                     <div class="p-4 bg-slate-800/10 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                       <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Preço Médio</span>
                       <p class="text-white text-lg font-medium mt-1">R$ 45,20</p>
                     </div>
                     <div class="p-4 bg-slate-800/10 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                       <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Quantidade Atual</span>
                       <p class="text-white text-lg font-medium mt-1">150</p>
                     </div>
                     <div class="p-4 bg-slate-800/10 rounded-xl border border-slate-800 hover:border-slate-700 transition-all col-span-2 md:col-span-1">
                       <span class="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Total Investido</span>
                       <p class="text-white text-lg font-medium mt-1">R$ 6.780,00</p>
                     </div>
                  </div>
                </div>
              </div>

              <div v-else class="h-full flex flex-col items-center justify-center text-slate-600 text-center space-y-4">
                <div class="p-6 bg-slate-800/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p class="text-sm max-w-[250px]">Selecione um ativo da lista lateral para visualizar o relatório detalhado.</p>
              </div>
            </main>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  classeSelecionada: String,
  listaClasses: Array,
  tipo: String // 'dia', 'mes', 'ano'
});

const emit = defineEmits(['update:modelValue', 'update:classe']);

// Estados de Data
const dataInicio = ref('');
const dataFim = ref('');

// Estados de Assets
const buscaAsset = ref('');
const assetSelecionado = ref(null);
const assets = ref([]); // Onde ficarão os ativos retornados pela API
const carregandoAssets = ref(false);

// Auxiliares de Formatação
const formatDate = (date) => date.toISOString().split('T')[0];

// Lógica de cálculo automático de datas
const calcularDatasPadrao = () => {
  const hoje = new Date();
  dataFim.value = formatDate(hoje);

  if (props.tipo === 'dia') {
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    dataInicio.value = formatDate(ontem);
  } else if (props.tipo === 'mes') {
    const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    dataInicio.value = formatDate(ultimoDiaMesAnterior);
  } else if (props.tipo === 'ano') {
    const ultimoDiaAnoAnterior = new Date(hoje.getFullYear() - 1, 11, 31);
    dataInicio.value = formatDate(ultimoDiaAnoAnterior);
  }
};

// Busca de ativos (Ajuste a URL para sua API real)
const buscarAssets = async () => {
  if (!props.modelValue) return;
  carregandoAssets.value = true;
  assetSelecionado.value = null;
  
  try {
    // Simulação de chamada de API:
    // const response = await fetch(`/api/assets?classe=${props.classeSelecionada}`);
    // assets.value = await response.json();
    
    // MOCK para teste visual:
    assets.value = [
      { id: 1, ticker: 'PETR4', nome: 'Petrobras', nome_completo: 'Petróleo Brasileiro S.A.' },
      { id: 2, ticker: 'VALE3', nome: 'Vale', nome_completo: 'Vale S.A.' },
      { id: 3, ticker: 'BOVA11', nome: 'iShares IBOVESPA', nome_completo: 'iShares IBOVESPA Index Fund' },
      { id: 4, ticker: 'HGLG11', nome: 'CGHG Logística', nome_completo: 'CSHG Logística - Fundo de Investimento Imobiliário' },
    ];
  } catch (error) {
    console.error("Erro ao carregar assets:", error);
  } finally {
    carregandoAssets.value = false;
  }
};

// Filtro computado para a busca de texto
const assetsFiltrados = computed(() => {
  if (!buscaAsset.value) return assets.value;
  const termo = buscaAsset.value.toLowerCase();
  return assets.value.filter(a => 
    (a.ticker || '').toLowerCase().includes(termo) || 
    (a.nome || '').toLowerCase().includes(termo)
  );
});

// Watchers para reagir a mudanças
watch(() => props.modelValue, (aberto) => {
  if (aberto) {
    calcularDatasPadrao();
    buscarAssets();
  }
});

watch(() => props.classeSelecionada, buscarAssets);

</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes modal-in {
  from { transform: translateY(20px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
.animate-modal { animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
</style>