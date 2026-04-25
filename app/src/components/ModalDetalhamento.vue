<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-[#1a1c24] border border-slate-700 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal">
          
          <header class="p-4 border-b border-slate-700 bg-slate-800/30 flex items-center gap-4">
            <div class="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl flex flex-col items-center min-w-[200px] h-[64px] justify-center hover:border-slate-600 transition-colors relative group">
              <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Classe de Ativo</span>
              <div class="relative w-full flex items-center justify-center">
                <select :value="idClasseAtiva" @change="aoMudarClasseManual" 
                  class="bg-transparent text-white font-bold text-xs outline-none cursor-pointer w-full text-center appearance-none z-10 px-6">
                  <option v-for="c in (classesResponse?.rows || classesResponse || [])" :key="c.id" :value="c.id" class="bg-[#1a1c24] text-white">{{ c.nome }}</option>
                </select>
                <div class="absolute right-4 pointer-events-none text-slate-600 group-hover:text-slate-400">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </div>
              </div>
            </div>

            <div class="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl flex flex-col items-center h-[64px] justify-center hover:border-slate-600 transition-colors px-6">
              <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Período de Análise</span>
              <div class="flex items-center gap-2">
                <input type="date" v-model="dataInicio" 
                  :class="['bg-transparent text-[11px] outline-none w-[105px] text-center transition-colors', dataEhValida(dataInicio) ? 'text-white font-bold' : 'text-red-400']" />
                <span class="text-slate-600 font-black text-[12px]">→</span>
                <input type="date" v-model="dataFim" 
                  :class="['bg-transparent text-[11px] outline-none w-[105px] text-center transition-colors', dataEhValida(dataFim) ? 'text-white font-bold' : 'text-red-400']" />
              </div>
            </div>

            <div class="flex-1"></div>

            <div class="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl flex flex-col items-center min-w-[180px] h-[64px] justify-center">
              <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Resultado da Classe</span>
              <span :class="['text-sm font-mono font-bold', totalGeralClasse >= 0 ? 'text-emerald-400' : 'text-red-400']">
                {{ formatarMoeda(totalGeralClasse) }}
              </span>
            </div>

            <button @click="$emit('update:modelValue', false)" class="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>

          <div class="flex flex-1 overflow-hidden">
            <aside class="w-[40%] border-r border-slate-700 flex flex-col bg-slate-900/50">
              <div class="p-4">
                <div class="relative">
                  <input v-model="buscaAsset" type="text" placeholder="Filtrar ativo..." 
                    class="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50 pl-10" />
                  <svg class="w-4 h-4 text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </div>
              </div>
              
              <div class="flex-1 overflow-y-auto custom-scrollbar relative">
                <div v-if="carregandoAssets" class="absolute inset-0 bg-[#1a1c24]/50 z-10 flex items-center justify-center">
                   <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>

                <template v-if="assetsFiltrados.length > 0">
                  <button v-for="asset in assetsFiltrados" :key="asset.Id" @click="assetSelecionado = asset"
                    :class="['w-full p-4 text-left border-b border-slate-800/40 transition-all group', (assetSelecionado?.Id === asset.Id) ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent hover:bg-white/5']">
                    <div class="flex justify-between items-center mb-1.5">
                      <div class="font-bold text-sm tracking-tight" :class="assetSelecionado?.Id === asset.Id ? 'text-blue-400' : 'text-slate-200'">{{ asset.ticker }}</div>
                      <div :class="['text-[13px] font-mono font-bold', asset.resultado >= 0 ? 'text-emerald-400' : 'text-red-400']">{{ formatarMoeda(asset.resultado) }}</div>
                    </div>
                    <div class="text-[11px] text-slate-500 uppercase truncate font-medium group-hover:text-slate-400 transition-colors">{{ asset.nome_completo }}</div>
                  </button>
                </template>
                <div v-else-if="!carregandoAssets" class="p-10 text-center flex flex-col items-center justify-center h-full">
                  <p class="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Nenhum ativo</p>
                </div>
              </div>
            </aside>

            <main class="flex-1 flex flex-col overflow-hidden bg-slate-950/20">
              <div v-if="assetSelecionado" class="flex-1 flex flex-col p-6 overflow-hidden">
                
                <div class="grid grid-cols-4 gap-4 mb-6">
                  <div v-for="card in cardsIndicadores" :key="card.label" class="bg-slate-800/20 border border-slate-800 p-3.5 rounded-2xl text-center h-[64px] flex flex-col justify-center">
                    <span class="text-[9px] text-slate-500 uppercase font-black block mb-0.5 tracking-widest">{{ card.label }}</span>
                    <span :class="['text-sm font-bold', card.color || 'text-white']">{{ card.valor }}</span>
                  </div>
                </div>

                <div class="flex-1 bg-slate-900/40 border border-slate-700 rounded-2xl overflow-hidden flex flex-col relative">
                  <div v-if="carregandoRendimento" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div class="h-full overflow-y-auto custom-scrollbar">
                    <table class="w-full text-[10px] border-separate border-spacing-0">
                      <thead class="bg-slate-800 sticky top-0 z-10">
                        <tr>
                          <th class="px-3 py-3 border-b border-slate-700 text-left text-slate-400 font-bold uppercase tracking-widest">Data</th>
                          <th class="px-3 py-3 border-b border-slate-700 text-right text-slate-400 font-bold uppercase tracking-widest">Vl. Inicial</th>
                          <th class="px-3 py-3 border-b border-slate-700 text-right text-blue-500 font-bold uppercase tracking-widest">Aportes</th>
                          <th class="px-3 py-3 border-b border-slate-700 text-right text-rose-500 font-bold uppercase tracking-widest">Retiradas</th>
                          <th class="px-3 py-3 border-b border-slate-700 text-right text-orange-500 font-bold uppercase tracking-widest">Prov.</th>
                          <th class="px-3 py-3 border-b border-slate-700 text-right text-slate-400 font-bold uppercase tracking-widest">Vl. Final</th>
                          <th class="px-3 py-3 border-b border-slate-700 text-right text-slate-400 font-bold uppercase tracking-widest">Resultado</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800/30">
                        <tr v-for="(row, idx) in listaRendimento" :key="idx" class="row-item transition-colors">
                          <td class="px-3 py-2.5 font-mono text-slate-300 border-r border-slate-800/30">{{ formatarDataRelatorio(row.data) }}</td>
                          <td class="px-3 py-2.5 text-right text-slate-400">{{ formatarMoeda(row.inicial) }}</td>
                          <td class="px-3 py-2.5 text-right font-medium" :class="row.aportes > 0 ? 'text-blue-400' : 'text-slate-700'">{{ row.aportes > 0 ? formatarMoeda(row.aportes) : '-' }}</td>
                          <td class="px-3 py-2.5 text-right font-medium" :class="row.retiradas > 0 ? 'text-rose-500' : 'text-slate-700'">{{ row.retiradas > 0 ? formatarMoeda(row.retiradas) : '-' }}</td>
                          <td class="px-3 py-2.5 text-right font-medium" :class="row.proventos > 0 ? 'text-orange-400' : 'text-slate-700'">{{ row.proventos > 0 ? formatarMoeda(row.proventos) : '-' }}</td>
                          <td class="px-3 py-2.5 text-right text-white font-medium">{{ formatarMoeda(row.final) }}</td>
                          <td class="px-3 py-2.5 text-right font-bold" :class="row.resultado > 0 ? 'text-emerald-500' : row.resultado < 0 ? 'text-red-500' : 'text-slate-600'">
                            {{ row.resultado !== 0 ? formatarMoeda(row.resultado) : '0,00' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
                 <div v-if="carregandoAssets" class="flex flex-col items-center">
                    <div class="w-10 h-10 border-2 border-slate-700 border-t-slate-500 rounded-full animate-spin mb-4"></div>
                    <p class="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Buscando dados...</p>
                 </div>
                 <div v-else class="flex flex-col items-center max-w-xs animate-modal">
                    <div class="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                      <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </div>
                    <h3 class="text-white font-bold text-sm mb-2">Sem movimentações</h3>
                    <p class="text-xs text-slate-500 leading-relaxed">Não há ativos para mostrar nesta classe.</p>
                 </div>
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
  tipo: String,
  listaClasses: Array // Recebendo a lista para redundância
});
const emit = defineEmits(['update:modelValue']);

const dataInicio = ref('');
const dataFim = ref('');
const buscaAsset = ref('');
const assetSelecionado = ref(null);
const idClasseAtiva = ref(null);

// Busca a lista oficial de classes do banco
const { data: classesResponse } = useApi('/classes/', { method: 'get' });

// URL para buscar os ativos (Só ativa se tiver ID e Datas)
const urlAtivos = computed(() => {
  if (props.modelValue && idClasseAtiva.value && dataEhValida(dataInicio.value)) {
    return `/assets/ByClass/${idClasseAtiva.value}/${dataInicio.value}/${dataFim.value}`;
  }
  return null;
});
const { data: assetsResponse, loading: carregandoAssets } = useApi(urlAtivos);

const urlRendimento = computed(() => {
  if (assetSelecionado.value && idClasseAtiva.value && props.modelValue) 
    return `/assets/Rendimentos/${assetSelecionado.value.Id}/${idClasseAtiva.value}/${dataInicio.value}/${dataFim.value}`;
  return null;
});
const { data: rendimentoResponse, loading: carregandoRendimento } = useApi(urlRendimento);

// Lógica de seleção de ID baseada no nome recebido do Resumo.vue
const sincronizarClasse = () => {
  const lista = Array.isArray(classesResponse.value) ? classesResponse.value : (classesResponse.value?.rows || []);
  
  if (lista.length > 0 && props.classeSelecionada) {
    console.log("🔍 Buscando ID para a classe:", props.classeSelecionada);
    
    // Tenta achar o ID pelo nome vindo do gráfico
    const found = lista.find(c => 
      c.nome.toLowerCase().trim() === props.classeSelecionada.toLowerCase().trim()
    );

    if (found) {
      idClasseAtiva.value = found.id;
      console.log("✅ ID Encontrado:", found.id);
    } else {
      console.error("❌ Não encontrei a classe na lista oficial:", props.classeSelecionada);
    }
  }
};

// Observa abertura do modal
watch(() => props.modelValue, (val) => {
  if (val) {
    assetSelecionado.value = null;
    buscaAsset.value = ''; 
    calcularDatasPadrao();
    sincronizarClasse();
  }
});

// Observa se os dados da API de classes chegaram (importante no primeiro carregamento)
watch(classesResponse, () => {
  if (props.modelValue) sincronizarClasse();
});

// Auto-seleção do primeiro ativo
watch(assetsResponse, (newVal) => {
  const lista = Array.isArray(newVal) ? newVal : (newVal?.rows || []);
  if (lista.length > 0) {
    assetSelecionado.value = lista[0];
  }
});

const dataEhValida = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
const formatarMoeda = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarDataRelatorio = (d) => d ? d.split('T')[0].split('-').reverse().join('/') : '-';

const assetsFiltrados = computed(() => {
  const lista = Array.isArray(unref(assetsResponse)) ? unref(assetsResponse) : (unref(assetsResponse)?.rows || []);
  if (!buscaAsset.value) return lista;
  return lista.filter(a => 
    a.nome_completo?.toLowerCase().includes(buscaAsset.value.toLowerCase()) || 
    a.ticker?.toLowerCase().includes(buscaAsset.value.toLowerCase())
  );
});

const totalGeralClasse = computed(() => assetsFiltrados.value.reduce((acc, a) => acc + (Number(a.resultado) || 0), 0));
const listaRendimento = computed(() => Array.isArray(unref(rendimentoResponse)) ? unref(rendimentoResponse) : (unref(rendimentoResponse)?.rows || []));

const cardsIndicadores = computed(() => {
  if (!listaRendimento.value.length) return [];
  const dadoMaisRecente = listaRendimento.value[0];
  const dadoMaisAntigo = listaRendimento.value[listaRendimento.value.length - 1];
  return [
    { label: 'Início Período', valor: formatarMoeda(dadoMaisAntigo.inicial) },
    { label: 'Total Proventos', valor: formatarMoeda(listaRendimento.value.reduce((acc, r) => acc + (Number(r.proventos) || 0), 0)), color: 'text-orange-400' },
    { label: 'Patrimônio Final', valor: formatarMoeda(dadoMaisRecente.final) },
    { label: 'Ganho no Período', valor: formatarMoeda(listaRendimento.value.reduce((acc, r) => acc + (Number(r.resultado) || 0), 0)), color: 'text-emerald-400' }
  ];
});

const calcularDatasPadrao = () => {
  const hoje = new Date();
  const offset = hoje.getTimezoneOffset() * 60000;
  const dataLocal = new Date(hoje.getTime() - offset);
  const f = (d) => d.toISOString().split('T')[0];
  dataFim.value = f(dataLocal);
  if (props.tipo === 'mes') dataInicio.value = f(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  else if (props.tipo === 'ano') dataInicio.value = f(new Date(hoje.getFullYear(), 0, 1));
  else dataInicio.value = f(dataLocal);
};

const aoMudarClasseManual = (e) => {
  idClasseAtiva.value = parseInt(e.target.value);
  assetSelecionado.value = null;
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes modal-in { from { transform: scale(0.98) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
.animate-modal { animation: modal-in 0.2s ease-out; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.row-item:hover { background-color: rgba(59, 130, 246, 0.05); }
select option { background-color: #1a1c24; color: white; }
</style>
