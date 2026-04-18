<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="bg-[#1a1c24] border border-slate-700 w-full max-w-[95vw] h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal">
          
          <header class="p-4 border-b border-slate-700 bg-slate-800/20 flex flex-wrap items-end justify-between gap-4">
            <div class="flex items-end gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[9px] font-bold text-slate-500 uppercase">Classe</label>
                <select :value="idClasseAtiva" @change="aoMudarClasseManual" class="bg-slate-900 border border-slate-700 text-white font-bold rounded-lg p-1.5 px-3 text-sm outline-none focus:border-blue-500 cursor-pointer">
                  <option v-if="carregandoClasses" value="">Carregando...</option>
                  <option v-for="c in classesResponse" :key="c.id" :value="c.id">{{ c.nome }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[9px] font-bold text-slate-500 uppercase">Início</label>
                <input type="date" v-model="dataInicio" class="bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs outline-none" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[9px] font-bold text-slate-500 uppercase">Término</label>
                <input type="date" v-model="dataFim" class="bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-xs outline-none" />
              </div>
            </div>
            <button @click="$emit('update:modelValue', false)" class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>

          <div class="flex flex-1 overflow-hidden">
            <aside class="w-72 border-r border-slate-700 flex flex-col bg-slate-900/40">
              <div class="p-3 bg-slate-800/30">
                <input v-model="buscaAsset" type="text" placeholder="Buscar pela descrição..." class="w-full bg-slate-900 border border-slate-700 rounded-md py-1.5 px-3 text-xs text-white outline-none focus:border-blue-500" />
              </div>

              <div class="flex-1 overflow-y-auto custom-scrollbar relative">
                <div v-if="carregandoAssets" class="absolute inset-0 bg-[#1a1c24]/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center">
                  <div class="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                  <span class="text-blue-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Atualizando Ativos...</span>
                </div>
                
                <button v-for="asset in assetsFiltrados" :key="asset.Id" @click="assetSelecionado = asset"
                  :class="['w-full p-3 flex flex-col border-b border-slate-800/40 hover:bg-slate-800/60 transition-all text-left group', (assetSelecionado && assetSelecionado.Id === asset.Id) ? 'bg-blue-600/20 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent']">
                  <span class="font-bold text-xs" :class="assetSelecionado?.Id === asset.Id ? 'text-blue-400' : 'text-slate-200'">{{ asset.ticker }}</span>
                  <span class="text-[10px] text-slate-500 leading-tight mt-0.5 group-hover:text-slate-300">{{ asset.nome_completo }}</span>
                </button>
              </div>
            </aside>

            <main class="flex-1 flex flex-col bg-slate-900/10 overflow-hidden">
              <div v-if="assetSelecionado" class="flex-1 flex flex-col p-4 overflow-hidden">
                
                <div class="flex items-center justify-between gap-4 mb-4 bg-slate-800/20 p-4 rounded-xl border border-slate-800 shadow-lg">
                  <div class="flex flex-col border-r border-slate-700 pr-6">
                    <h4 class="text-2xl font-black text-white leading-none uppercase tracking-tighter">{{ assetSelecionado.ticker }}</h4>
                    <span class="text-[10px] text-slate-500 uppercase mt-1.5 font-bold">{{ assetSelecionado.nome_completo }}</span>
                  </div>
                  
                  <div class="flex-1 grid grid-cols-4 gap-4 px-4">
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold">Início Período</span><span class="text-sm text-white font-semibold">{{ valorInicialGeral }}</span></div>
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold">Final Período</span><span class="text-sm text-white font-semibold">{{ valorFinalGeral }}</span></div>
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold text-orange-400">Total Proventos</span><span class="text-sm text-orange-300 font-semibold">{{ totalProventosGeral }}</span></div>
                    
                    <div class="flex flex-col bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 text-right">
                      <span class="text-[8px] text-emerald-500 uppercase font-black">Ganho Período</span>
                      <span class="text-sm font-bold" :class="totalResultado >= 0 ? 'text-emerald-400' : 'text-red-400'">
                        {{ formatarMoeda(totalResultado) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-inner relative">
                  <div v-if="carregandoRendimento" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div class="flex items-center gap-2 text-blue-400 text-xs font-bold animate-pulse uppercase tracking-widest">
                       Buscando Histórico...
                    </div>
                  </div>

                  <div class="h-full overflow-y-auto custom-scrollbar">
                    <table class="w-full text-left text-[11px]">
                      <thead class="bg-slate-800 text-slate-400 uppercase font-bold sticky top-0 z-20">
                        <tr>
                          <th class="px-4 py-3 border-b border-slate-700">Data</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right">Inicial</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right text-blue-400">Aportes</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right text-orange-400">Prov.</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right">Final</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800/60 text-slate-300">
                        <tr v-for="(row, idx) in listaRendimento" :key="idx" class="hover:bg-white/5 transition-colors">
                          <td class="px-4 py-2 font-mono text-slate-500">{{ formatarData(row.data) }}</td>
                          <td class="px-4 py-2 text-right text-slate-400">{{ formatarMoeda(row.inicial) }}</td>
                          <td class="px-4 py-2 text-right" :class="row.aportes > 0 ? 'text-blue-400 font-bold' : 'text-slate-600'">
                            {{ row.aportes > 0 ? formatarMoeda(row.aportes) : '-' }}
                          </td>
                          <td class="px-4 py-2 text-right" :class="row.proventos > 0 ? 'text-orange-400 font-bold' : 'text-slate-600'">
                            {{ row.proventos > 0 ? formatarMoeda(row.proventos) : '-' }}
                          </td>
                          <td class="px-4 py-2 text-right font-medium text-white">{{ formatarMoeda(row.final) }}</td>
                          <td class="px-4 py-2 text-right font-bold" :class="row.resultado > 0 ? 'text-emerald-400' : row.resultado < 0 ? 'text-red-400' : 'text-slate-600'">
                            {{ row.resultado !== 0 ? formatarMoeda(row.resultado) : '0,00' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div v-else class="h-full flex flex-col items-center justify-center text-slate-700">
                <p class="text-[10px] tracking-[0.3em] uppercase opacity-20 font-bold">Selecione um ativo para analisar</p>
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

// API 2: LISTA DE ATIVOS
const urlAtivos = computed(() => {
  if (!props.modelValue || !idClasseAtiva.value) return null;
  return `/assets/ByClass/${idClasseAtiva.value}`;
});
const { data: assetsResponse, loading: carregandoAssets } = useApi(urlAtivos);

// API 3: RENDIMENTO DIÁRIO DO ATIVO
const urlRendimento = computed(() => {
  if (!assetSelecionado.value || !props.modelValue) return null;
  return `/rendimento-asset/${assetSelecionado.value.Id}?inicio=${dataInicio.value}&fim=${dataFim.value}`;
});
const { data: rendimentoResponse, loading: carregandoRendimento } = useApi(urlRendimento);

// COMPUTEDS DE TRATAMENTO
const assetsFiltrados = computed(() => {
  const data = unref(assetsResponse);
  const lista = Array.isArray(data) ? data : (data?.rows || []);
  if (!buscaAsset.value) return lista;
  const termo = buscaAsset.value.toLowerCase();
  return lista.filter(a => (a.nome_completo || '').toLowerCase().includes(termo) || (a.ticker || '').toLowerCase().includes(termo));
});

const listaRendimento = computed(() => {
  // Agora assume que rendimentoResponse já é o array direto
  const data = unref(rendimentoResponse);
  return Array.isArray(data) ? data : (data?.rows || []);
});

// CÁLCULOS TOTAIS PARA OS CARDS
const totalResultado = computed(() => listaRendimento.value.reduce((acc, row) => acc + (Number(row.resultado) || 0), 0));
const totalProventosGeral = computed(() => {
  const total = listaRendimento.value.reduce((acc, row) => acc + (Number(row.proventos) || 0), 0);
  return formatarMoeda(total);
});
const valorInicialGeral = computed(() => {
  if (listaRendimento.value.length === 0) return 'R$ 0,00';
  return formatarMoeda(listaRendimento.value[0].inicial);
});
const valorFinalGeral = computed(() => {
  if (listaRendimento.value.length === 0) return 'R$ 0,00';
  return formatarMoeda(listaRendimento.value[listaRendimento.value.length - 1].final);
});

// FUNÇÕES AUXILIARES
const formatarMoeda = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarData = (d) => d ? d.split('-').reverse().join('/') : '';

const limparDadosAtuais = () => {
  if (assetsResponse.value) assetsResponse.value = null; 
  assetSelecionado.value = null;
  buscaAsset.value = '';
};

const sincronizarLabelComId = () => {
  const data = unref(classesResponse);
  const lista = Array.isArray(data) ? data : (data?.rows || []);
  if (lista.length && props.classeSelecionada) {
    const encontrado = lista.find(c => c.nome === props.classeSelecionada);
    if (encontrado && encontrado.id !== idClasseAtiva.value) {
      limparDadosAtuais();
      idClasseAtiva.value = encontrado.id;
    }
  }
};

const aoMudarClasseManual = (event) => {
  const novoId = parseInt(event.target.value);
  if (novoId !== idClasseAtiva.value) {
    limparDadosAtuais();
    idClasseAtiva.value = novoId;
    const lista = Array.isArray(classesResponse.value) ? classesResponse.value : (classesResponse.value?.rows || []);
    const obj = lista.find(c => c.id === novoId);
    if (obj) emit('update:classe', obj.nome);
  }
};

const calcularDatasPadrao = () => {
  const hoje = new Date();
  const format = (d) => d.toISOString().split('T')[0];
  dataFim.value = format(hoje);
  if (props.tipo === 'dia') dataInicio.value = format(hoje);
  else if (props.tipo === 'mes') dataInicio.value = format(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  else if (props.tipo === 'ano') dataInicio.value = format(new Date(hoje.getFullYear(), 0, 1));
};

// WATCHERS
watch([() => props.modelValue, classesResponse], () => {
  if (props.modelValue) {
    calcularDatasPadrao();
    if (classesResponse.value) sincronizarLabelComId();
  }
}, { immediate: true });

watch(() => props.classeSelecionada, () => {
  if (props.modelValue) sincronizarLabelComId();
});
</script>

<style scoped>
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes modal-in { from { transform: scale(0.98) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
.animate-modal { animation: modal-in 0.2s cubic-bezier(0, 0, 0.2, 1); }
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>