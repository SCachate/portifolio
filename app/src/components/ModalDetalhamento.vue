<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="bg-[#1a1c24] border border-slate-700 w-full max-w-[95vw] h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal">
          
          <header class="p-4 border-b border-slate-700 bg-slate-800/20 flex flex-wrap items-end justify-between gap-4">
            <div class="flex items-end gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[9px] font-bold text-slate-500 uppercase">Classe</label>
                <select 
                  :value="idClasseAtiva" 
                  @change="aoMudarClasseManual" 
                  class="bg-slate-900 border border-slate-700 text-white font-bold rounded-lg p-1.5 px-3 text-sm outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option v-if="carregandoClasses" value="">Carregando...</option>
                  <option v-for="c in classesResponse" :key="c.id" :value="c.id">{{ c.nome }}</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[9px] font-bold text-slate-500 uppercase">Início</label>
                <input type="date" v-model="dataInicio" class="bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs outline-none focus:border-blue-500" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[9px] font-bold text-slate-500 uppercase">Término</label>
                <input type="date" v-model="dataFim" class="bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs outline-none focus:border-blue-500" />
              </div>
            </div>

            <button @click="$emit('update:modelValue', false)" class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>

          <div class="flex flex-1 overflow-hidden">
            <aside class="w-72 border-r border-slate-700 flex flex-col bg-slate-900/40">
              <div class="p-3 bg-slate-800/30">
                <input 
                  v-model="buscaAsset" 
                  type="text" 
                  placeholder="Buscar pela descrição..." 
                  class="w-full bg-slate-900 border border-slate-700 rounded-md py-1.5 px-3 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div v-if="carregandoAssets" class="p-8 text-center">
                   <span class="text-slate-500 text-[10px] italic animate-pulse">Carregando ativos da classe...</span>
                </div>
                
                <button 
                  v-for="asset in assetsFiltrados" 
                  :key="asset.assetId" 
                  @click="assetSelecionado = asset"
                  :class="[
                    'w-full p-3 flex flex-col border-b border-slate-800/40 hover:bg-slate-800/60 transition-all text-left group', 
                    (assetSelecionado && assetSelecionado.assetId === asset.assetId) ? 'bg-blue-600/20 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                  ]"
                >
                  <span class="font-bold text-xs" :class="assetSelecionado?.assetId === asset.assetId ? 'text-blue-400' : 'text-slate-200'">
                    {{ asset.Ticker }}
                  </span>
                  <span class="text-[10px] text-slate-500 leading-tight mt-0.5 group-hover:text-slate-300">
                    {{ asset.nome_ativo }}
                  </span>
                </button>

                <div v-if="!carregandoAssets && assetsFiltrados.length === 0" class="p-8 text-center text-slate-600 text-[10px] italic">
                  Nenhum ativo com saldo encontrado.
                </div>
              </div>
            </aside>

            <main class="flex-1 flex flex-col bg-slate-900/10 overflow-hidden">
              <div v-if="assetSelecionado" class="flex-1 flex flex-col p-4 overflow-hidden">
                
                <div class="flex items-center justify-between gap-4 mb-4 bg-slate-800/20 p-4 rounded-xl border border-slate-800">
                  <div class="flex flex-col border-r border-slate-700 pr-6">
                    <h4 class="text-2xl font-black text-white leading-none">{{ assetSelecionado.Ticker }}</h4>
                    <span class="text-[10px] text-slate-500 uppercase mt-1 tracking-wider">{{ assetSelecionado.nome_ativo }}</span>
                  </div>
                  
                  <div class="flex-1 grid grid-cols-4 gap-4 px-4">
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Custódia</span><span class="text-sm text-white font-semibold">--</span></div>
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Investido</span><span class="text-sm text-white font-semibold">--</span></div>
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">P. Médio</span><span class="text-sm text-white font-semibold">--</span></div>
                    <div class="flex flex-col bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 text-right">
                      <span class="text-[8px] text-emerald-500 uppercase font-black">Ganho</span>
                      <span class="text-sm text-emerald-400 font-bold">R$ 0,00</span>
                    </div>
                  </div>
                </div>

                <div class="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                  <div class="h-full overflow-y-auto custom-scrollbar">
                    <table class="w-full text-left text-[11px]">
                      <thead class="bg-slate-800 text-slate-400 uppercase font-bold sticky top-0">
                        <tr>
                          <th class="px-4 py-3 border-b border-slate-700">Data</th>
                          <th class="px-4 py-3 border-b border-slate-700">Tipo</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right">Qtd</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800/60 text-slate-300">
                        <tr v-for="i in 8" :key="i" class="hover:bg-white/5 transition-colors opacity-30">
                          <td class="px-4 py-2 font-mono">--/--/----</td>
                          <td class="px-4 py-2 text-[9px]">HISTÓRICO</td>
                          <td class="px-4 py-2 text-right">--</td>
                          <td class="px-4 py-2 text-right">R$ 0,00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div v-else class="h-full flex flex-col items-center justify-center text-slate-700">
                <p class="text-[10px] tracking-[0.3em] uppercase opacity-20 font-bold">Selecione um ativo na lista</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, unref } from 'vue';
import { useApi } from '../composables/useApi';

const props = defineProps({
  modelValue: Boolean,
  classeSelecionada: String, 
  tipo: String 
});

const emit = defineEmits(['update:modelValue', 'update:classe']);

// ESTADOS
const dataInicio = ref('');
const dataFim = ref('');
const buscaAsset = ref('');
const assetSelecionado = ref(null);
const idClasseAtiva = ref(null);

// API 1: CLASSES
const { data: classesResponse, loading: carregandoClasses } = useApi('/classes/', { method: 'get' });

// API 2: ATIVOS (REATIVA)
// Note: Garantimos que props.modelValue esteja true para evitar chamadas com modal fechado
const urlAtivos = computed(() => {
  if (!props.modelValue || !idClasseAtiva.value) return null;
  return `/assets/ByClass/${idClasseAtiva.value}`;
});
const { data: assetsResponse, loading: carregandoAssets } = useApi(urlAtivos);

// FILTRO DE BUSCA
const assetsFiltrados = computed(() => {
  // Verificação de segurança para o formato do dado (Array ou Objeto)
  const listaRaw = unref(assetsResponse);
  const lista = Array.isArray(listaRaw) ? listaRaw : (listaRaw?.rows || []);
  
  if (!buscaAsset.value) return lista;

  const termo = buscaAsset.value.toLowerCase();
  return lista.filter(a => {
    const nome = (a.nome_ativo || '').toLowerCase();
    const ticker = (a.Ticker || '').toLowerCase();
    return nome.includes(termo) || ticker.includes(termo);
  });
});

// MÉTODOS
const sincronizarLabelComId = () => {
  if (classesResponse.value && props.classeSelecionada) {
    const lista = Array.isArray(classesResponse.value) ? classesResponse.value : (classesResponse.value?.rows || []);
    const encontrado = lista.find(c => c.nome === props.classeSelecionada);
    if (encontrado) {
      idClasseAtiva.value = encontrado.id;
    }
  }
};

const aoMudarClasseManual = (event) => {
  const novoId = parseInt(event.target.value);
  idClasseAtiva.value = novoId;
  assetSelecionado.value = null; // Reseta seleção para não bugar a visualização
  
  const lista = Array.isArray(classesResponse.value) ? classesResponse.value : (classesResponse.value?.rows || []);
  const obj = lista.find(c => c.id === novoId);
  if (obj) emit('update:classe', obj.nome);
};

const calcularDatasPadrao = () => {
  const hoje = new Date();
  const format = (d) => d.toISOString().split('T')[0];
  dataFim.value = format(hoje);
  if (props.tipo === 'dia') dataInicio.value = format(hoje);
  else if (props.tipo === 'mes') dataInicio.value = format(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  else if (props.tipo === 'ano') dataInicio.value = format(new Date(hoje.getFullYear(), 0, 1));
};

// SINCRONIZAÇÃO INICIAL E AO ABRIR
watch([() => props.modelValue, classesResponse], () => {
  if (props.modelValue) {
    calcularDatasPadrao();
    if (classesResponse.value) sincronizarLabelComId();
  }
}, { immediate: true });

// SE O PAI MUDAR A CLASSE EXTERNAMENTE
watch(() => props.classeSelecionada, () => {
  if (props.modelValue) sincronizarLabelComId();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes modal-in { from { transform: scale(0.98) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
.animate-modal { animation: modal-in 0.2s cubic-bezier(0, 0, 0.2, 1); }

.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
</style>