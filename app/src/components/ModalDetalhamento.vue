<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-[#1a1c24] border border-slate-700 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal">
          
          <header class="p-3 border-b border-slate-700 bg-slate-800/30 flex items-center justify-between">
            <div class="flex items-center gap-6">
               <div class="flex items-center gap-2">
                 <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Classe</label>
                 <select :value="idClasseAtiva" @change="aoMudarClasseManual" class="bg-slate-900 border border-slate-700 text-white font-bold rounded p-1 px-2 text-xs outline-none focus:border-blue-500 cursor-pointer">
                    <option v-for="c in classesResponse" :key="c.id" :value="c.id">{{ c.nome }}</option>
                 </select>
               </div>
               <div class="flex items-center gap-2">
                 <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Período</label>
                 <div class="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5">
                    <input type="date" v-model="dataInicio" class="bg-transparent text-white p-1 text-xs outline-none w-32" />
                    <span class="text-slate-600 px-1 font-bold text-[10px]">ATÉ</span>
                    <input type="date" v-model="dataFim" class="bg-transparent text-white p-1 text-xs outline-none w-32" />
                 </div>
               </div>
            </div>
            <button @click="$emit('update:modelValue', false)" class="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>

          <div class="flex flex-1 overflow-hidden">
            <aside class="w-60 border-r border-slate-700 flex flex-col bg-slate-900/50">
              <div class="p-3">
                <input v-model="buscaAsset" type="text" placeholder="Filtrar ativo..." class="w-full bg-slate-800 border border-slate-700 rounded py-1.5 px-3 text-[11px] text-white outline-none focus:ring-1 focus:ring-blue-500/50" />
              </div>
              <div class="flex-1 overflow-y-auto custom-scrollbar relative">
                <div v-if="carregandoAssets" class="absolute inset-0 bg-[#1a1c24]/50 z-10 flex items-center justify-center">
                   <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <button v-for="asset in assetsFiltrados" :key="asset.Id" @click="assetSelecionado = asset"
                  :class="['w-full p-2.5 text-left border-b border-slate-800/40 transition-all group', (assetSelecionado?.Id === asset.Id) ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent hover:bg-white/5']">
                  <div class="font-bold text-[11px]" :class="assetSelecionado?.Id === asset.Id ? 'text-blue-400' : 'text-slate-300'">{{ asset.ticker }}</div>
                  <div class="text-[9px] text-slate-500 uppercase truncate leading-tight">{{ asset.nome_completo }}</div>
                </button>
              </div>
            </aside>

            <main class="flex-1 flex flex-col overflow-hidden bg-slate-950/20">
              <div v-if="assetSelecionado" class="flex-1 flex flex-col p-5 overflow-hidden">
                
                <div class="grid grid-cols-4 gap-4 mb-4">
                  <div class="bg-slate-800/20 border border-slate-800 p-3 rounded-xl">
                    <span class="text-[9px] text-slate-500 uppercase font-black block mb-1">Início Período</span>
                    <span class="text-sm font-bold text-white">{{ valorInicialGeral }}</span>
                  </div>
                  <div class="bg-slate-800/20 border border-slate-800 p-3 rounded-xl">
                    <span class="text-[9px] text-orange-500/70 uppercase font-black block mb-1">Total Proventos</span>
                    <span class="text-sm font-bold text-orange-400">{{ totalProventosGeral }}</span>
                  </div>
                  <div class="bg-slate-800/20 border border-slate-800 p-3 rounded-xl">
                    <span class="text-[9px] text-slate-500 uppercase font-black block mb-1">Patrimônio Final</span>
                    <span class="text-sm font-bold text-white">{{ valorFinalGeral }}</span>
                  </div>
                  <div class="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
                    <span class="text-[9px] text-emerald-500 uppercase font-black block mb-1">Ganho no Período</span>
                    <span class="text-sm font-bold" :class="totalResultado >= 0 ? 'text-emerald-400' : 'text-red-400'">
                      {{ formatarMoeda(totalResultado) }}
                    </span>
                  </div>
                </div>

                <div class="flex-1 bg-slate-900/40 border border-slate-700 rounded-xl overflow-hidden flex flex-col relative">
                  <div v-if="carregandoRendimento" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>

                  <div class="h-full overflow-y-auto custom-scrollbar">
                    <table class="w-full text-[11px] border-separate border-spacing-0">
                      <thead class="bg-slate-800 sticky top-0 z-10">
                        <tr>
                          <th class="px-4 py-2 border-b border-slate-700 text-left text-slate-400 font-bold uppercase tracking-tighter">Data</th>
                          <th class="px-4 py-2 border-b border-slate-700 text-right text-slate-400 font-bold uppercase tracking-tighter">Vl. Inicial</th>
                          <th class="px-4 py-2 border-b border-slate-700 text-right text-blue-500/80 font-bold uppercase tracking-tighter">Aportes</th>
                          <th class="px-4 py-2 border-b border-slate-700 text-right text-orange-500/80 font-bold uppercase tracking-tighter">Prov.</th>
                          <th class="px-4 py-2 border-b border-slate-700 text-right text-slate-400 font-bold uppercase tracking-tighter">Vl. Final</th>
                          <th class="px-4 py-2 border-b border-slate-700 text-right text-slate-400 font-bold uppercase tracking-tighter">Resultado</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800/30">
                        <tr v-for="(row, idx) in listaRendimento" :key="idx" 
                            class="row-item transition-colors">
                          <td class="px-4 py-1 font-mono text-slate-300 border-r border-slate-800/30">{{ formatarDataRelatorio(row.data) }}</td>
                          <td class="px-4 py-1 text-right text-slate-400">{{ formatarMoeda(row.inicial) }}</td>
                          <td class="px-4 py-1 text-right font-medium" :class="row.aportes > 0 ? 'text-blue-400' : 'text-slate-700'">
                             {{ row.aportes > 0 ? formatarMoeda(row.aportes) : '-' }}
                          </td>
                          <td class="px-4 py-1 text-right font-medium" :class="row.proventos > 0 ? 'text-orange-400' : 'text-slate-700'">
                             {{ row.proventos > 0 ? formatarMoeda(row.proventos) : '-' }}
                          </td>
                          <td class="px-4 py-1 text-right text-white font-medium">{{ formatarMoeda(row.final) }}</td>
                          <td class="px-4 py-1 text-right font-bold" :class="row.resultado > 0 ? 'text-emerald-500' : row.resultado < 0 ? 'text-red-500' : 'text-slate-600'">
                            {{ row.resultado !== 0 ? formatarMoeda(row.resultado) : '0,00' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div v-else class="flex-1 flex flex-col items-center justify-center">
                 <div class="w-8 h-8 border-2 border-slate-700 border-t-slate-500 rounded-full animate-spin mb-4"></div>
                 <p class="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Aguardando ativos...</p>
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

const props = defineProps({ modelValue: Boolean, classeSelecionada: String, tipo: String });
const emit = defineEmits(['update:modelValue', 'update:classe']);

const dataInicio = ref('');
const dataFim = ref('');
const buscaAsset = ref('');
const assetSelecionado = ref(null);
const idClasseAtiva = ref(null);

const { data: classesResponse } = useApi('/classes/', { method: 'get' });
const urlAtivos = computed(() => (props.modelValue && idClasseAtiva.value) ? `/assets/ByClass/${idClasseAtiva.value}` : null);
const { data: assetsResponse, loading: carregandoAssets } = useApi(urlAtivos);

const urlRendimento = computed(() => {
  if (!assetSelecionado.value || !idClasseAtiva.value || !props.modelValue) return null;
  return `/assets/Rendimentos/${assetSelecionado.value.Id}/${idClasseAtiva.value}/${dataInicio.value}/${dataFim.value}`;
});
const { data: rendimentoResponse, loading: carregandoRendimento } = useApi(urlRendimento);

// Seleção automática do primeiro item
watch(assetsResponse, (newAssets) => {
  if (newAssets) {
    const lista = Array.isArray(newAssets) ? newAssets : (newAssets.rows || []);
    if (lista.length > 0 && !assetSelecionado.value) {
      assetSelecionado.value = lista[0];
    }
  }
}, { deep: true });

watch(idClasseAtiva, () => { assetSelecionado.value = null; });

const assetsFiltrados = computed(() => {
  const data = unref(assetsResponse);
  const lista = Array.isArray(data) ? data : (data?.rows || []);
  if (!buscaAsset.value) return lista;
  const termo = buscaAsset.value.toLowerCase();
  return lista.filter(a => (a.nome_completo || '').toLowerCase().includes(termo) || (a.ticker || '').toLowerCase().includes(termo));
});

const listaRendimento = computed(() => {
  const data = unref(rendimentoResponse);
  return Array.isArray(data) ? data : (data?.rows || []);
});

const totalResultado = computed(() => listaRendimento.value.reduce((acc, row) => acc + (Number(row.resultado) || 0), 0));
const totalProventosGeral = computed(() => formatarMoeda(listaRendimento.value.reduce((acc, row) => acc + (Number(row.proventos) || 0), 0)));
const valorInicialGeral = computed(() => listaRendimento.value.length ? formatarMoeda(listaRendimento.value[listaRendimento.value.length - 1].inicial) : 'R$ 0,00');
const valorFinalGeral = computed(() => listaRendimento.value.length ? formatarMoeda(listaRendimento.value[0].final) : 'R$ 0,00');

const formatarMoeda = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarDataRelatorio = (dataStr) => {
  if (!dataStr) return '-';
  const apenasData = dataStr.includes('T') ? dataStr.split('T')[0] : dataStr;
  const [ano, mes, dia] = apenasData.split('-');
  return `${dia}/${mes}/${ano}`;
};

const aoMudarClasseManual = (event) => {
  const novoId = parseInt(event.target.value);
  if (novoId !== idClasseAtiva.value) {
    idClasseAtiva.value = novoId;
    const lista = Array.isArray(classesResponse.value) ? classesResponse.value : (classesResponse.value?.rows || []);
    const obj = lista.find(c => c.id === novoId);
    if (obj) emit('update:classe', obj.nome);
  }
};

const sincronizarLabelComId = () => {
  const lista = Array.isArray(classesResponse.value) ? classesResponse.value : (classesResponse.value?.rows || []);
  const encontrado = lista.find(c => c.nome === props.classeSelecionada);
  if (encontrado) idClasseAtiva.value = encontrado.id;
};

const calcularDatasPadrao = () => {
  const hoje = new Date();
  const format = (d) => d.toISOString().split('T')[0];
  dataFim.value = format(hoje);
  if (props.tipo === 'mes') dataInicio.value = format(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  else if (props.tipo === 'ano') dataInicio.value = format(new Date(hoje.getFullYear(), 0, 1));
  else dataInicio.value = format(hoje);
};

watch([() => props.modelValue, classesResponse], () => {
  if (props.modelValue) {
    calcularDatasPadrao();
    if (classesResponse.value) sincronizarLabelComId();
  }
}, { immediate: true });
</script>

<style scoped>
/* Animações de Entrada */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes modal-in { 
    from { transform: scale(0.98) translateY(10px); opacity: 0; } 
    to { transform: scale(1) translateY(0); opacity: 1; } 
}
.animate-modal { animation: modal-in 0.2s cubic-bezier(0, 0, 0.2, 1); }

/* Spinner */
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Scrollbar Customizada */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }

/* Efeito Zebrado nas Linhas */
.row-item:nth-child(even) { background-color: rgba(255, 255, 255, 0.02); }
.row-item:hover { background-color: rgba(59, 130, 246, 0.1); }
</style>