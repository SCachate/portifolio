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
                  <input type="date" v-model="dataInicio" class="bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Término</label>
                  <input type="date" v-model="dataFim" class="bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <button @click="$emit('update:modelValue', false)" class="ml-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
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
                <input 
                  v-model="buscaAsset"
                  type="text" 
                  placeholder="Pesquisar ticker ou nome..." 
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              
              <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div v-if="carregandoAssets" class="p-8 text-center text-slate-500 text-sm italic">Carregando ativos...</div>
                
                <button 
                  v-for="asset in assetsFiltrados" 
                  :key="asset.id"
                  @click="assetSelecionado = asset"
                  :class="[
                    'w-full p-4 flex flex-col items-start transition-all border-b border-slate-800/40 hover:bg-slate-800/60 text-left',
                    assetSelecionado?.id === asset.id ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                  ]"
                >
                  <span class="font-bold text-sm" :class="assetSelecionado?.id === asset.id ? 'text-blue-400' : 'text-slate-200'">{{ asset.ticker || asset.nome }}</span>
                  <span class="text-[10px] text-slate-500 truncate w-full uppercase mt-1">{{ asset.nome_completo || asset.instituicao }}</span>
                </button>
              </div>
            </aside>

            <main class="w-2/3 overflow-y-auto p-8 bg-slate-900/10 custom-scrollbar">
              <div v-if="assetSelecionado" class="animate-in fade-in duration-500">
                
                <div class="flex justify-between items-start mb-8 border-b border-slate-800 pb-6">
                  <div>
                    <h4 class="text-3xl font-black text-white tracking-tight">{{ assetSelecionado.ticker || assetSelecionado.nome }}</h4>
                    <p class="text-slate-500 text-xs uppercase tracking-[0.2em] mt-2 font-semibold">{{ assetSelecionado.nome_completo }}</p>
                  </div>
                  <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 px-5 text-right">
                    <p class="text-[9px] text-emerald-500/70 uppercase font-black tracking-widest">Lucro Estimado</p>
                    <p class="text-emerald-400 text-xl font-bold">R$ 482,10</p>
                  </div>
                </div>

                <div class="mb-10">
                  <h5 class="text-white text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Resumo do Relatório
                  </h5>
                  <div class="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-6 leading-relaxed text-slate-400 text-sm space-y-4">
                    <p>O ativo <strong class="text-white">{{ assetSelecionado.ticker }}</strong> apresentou uma movimentação estável no período entre <span class="text-slate-200">{{ dataInicio }}</span> e <span class="text-slate-200">{{ dataFim }}</span>.</p>
                    <p>Com base no preço médio de aquisição frente ao preço atual de mercado, a posição registra uma valorização de <span class="text-emerald-400 font-bold">7.15%</span>. Não foram detectadas vendas parciais no intervalo selecionado, mantendo a estratégia de acumulação.</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div class="p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group">
                    <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest group-hover:text-blue-400 transition-colors">Quantidade</span>
                    <p class="text-white text-xl font-bold mt-2">150</p>
                    <p class="text-[10px] text-slate-600 mt-1">Cotas/Ações</p>
                  </div>

                  <div class="p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group">
                    <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest group-hover:text-blue-400 transition-colors">Preço Médio</span>
                    <p class="text-white text-xl font-bold mt-2">R$ 45,20</p>
                    <p class="text-[10px] text-slate-600 mt-1">Custo Aquisição</p>
                  </div>

                  <div class="p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group">
                    <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest group-hover:text-blue-400 transition-colors">Valor Investido</span>
                    <p class="text-white text-xl font-bold mt-2">R$ 6.780,00</p>
                    <p class="text-[10px] text-slate-600 mt-1">Capital Total</p>
                  </div>

                  <div class="p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group">
                    <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest group-hover:text-blue-400 transition-colors">Preço Atual</span>
                    <p class="text-emerald-400 text-xl font-bold mt-2">R$ 48,41</p>
                    <p class="text-[10px] text-slate-600 mt-1">Cotação Mercado</p>
                  </div>

                  <div class="p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group">
                    <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest group-hover:text-blue-400 transition-colors">Valor Atual</span>
                    <p class="text-emerald-400 text-xl font-bold mt-2">R$ 7.262,10</p>
                    <p class="text-[10px] text-slate-600 mt-1">Patrimônio Hoje</p>
                  </div>
                </div>

              </div>

              <div v-else class="h-full flex flex-col items-center justify-center text-slate-600 text-center">
                <div class="w-20 h-20 bg-slate-800/20 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h6 class="text-white font-bold mb-2">Análise de Ativo</h6>
                <p class="text-sm max-w-[280px]">Selecione um ativo à esquerda para gerar o relatório consolidado do período.</p>
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
  tipo: String 
});

const emit = defineEmits(['update:modelValue', 'update:classe']);

const dataInicio = ref('');
const dataFim = ref('');
const buscaAsset = ref('');
const assetSelecionado = ref(null);
const assets = ref([]); 
const carregandoAssets = ref(false);

const formatDate = (date) => date.toISOString().split('T')[0];

const calcularDatasPadrao = () => {
  const hoje = new Date();
  dataFim.value = formatDate(hoje);
  if (props.tipo === 'dia') {
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    dataInicio.value = formatDate(ontem);
  } else if (props.tipo === 'mes') {
    dataInicio.value = formatDate(new Date(hoje.getFullYear(), hoje.getMonth(), 0));
  } else if (props.tipo === 'ano') {
    dataInicio.value = formatDate(new Date(hoje.getFullYear() - 1, 11, 31));
  }
};

const buscarAssets = async () => {
  if (!props.modelValue) return;
  carregandoAssets.value = true;
  assetSelecionado.value = null;
  try {
    // MOCK - Substituir pela sua API real
    assets.value = [
      { id: 1, ticker: 'PETR4', nome_completo: 'Petróleo Brasileiro S.A.' },
      { id: 2, ticker: 'VALE3', nome_completo: 'Vale S.A.' },
      { id: 3, ticker: 'HGLG11', nome_completo: 'CSHG Logística FII' },
      { id: 4, ticker: 'BTC', nome_completo: 'Bitcoin Core' },
      { id: 5, ticker: 'IVVB11', nome_completo: 'iShares S&P 500 Fundo de Índice' }
    ];
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    carregandoAssets.value = false;
  }
};

const assetsFiltrados = computed(() => {
  if (!buscaAsset.value) return assets.value;
  const termo = buscaAsset.value.toLowerCase();
  return assets.value.filter(a => a.ticker.toLowerCase().includes(termo));
});

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
  from { transform: translateY(15px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-modal { animation: modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>