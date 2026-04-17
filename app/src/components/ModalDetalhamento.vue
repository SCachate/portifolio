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
                  :disabled="carregandoClasses"
                  :value="classeSelecionada" 
                  @change="$emit('update:classe', $event.target.value)" 
                  class="bg-slate-900 border border-slate-700 text-white font-bold rounded-lg p-1.5 px-3 text-sm outline-none focus:border-blue-500 transition-all"
                >
                  <option v-if="carregandoClasses" value="">Carregando...</option>
                  <option v-for="opt in classesDoBanco" :key="opt" :value="opt">{{ opt }}</option>
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
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div class="flex flex-1 overflow-hidden">
            <aside class="w-64 border-r border-slate-700 flex flex-col bg-slate-900/40">
              <div class="p-3 bg-slate-800/30">
                <input v-model="buscaAsset" type="text" placeholder="Buscar..." class="w-full bg-slate-900 border border-slate-700 rounded-md py-1.5 px-3 text-xs text-white outline-none focus:border-blue-500" />
              </div>
              <div class="flex-1 overflow-y-auto custom-scrollbar">
                <button v-for="asset in assetsFiltrados" :key="asset.id" @click="assetSelecionado = asset"
                  :class="['w-full p-3 flex flex-col border-b border-slate-800/40 hover:bg-slate-800/60 transition-all text-left', assetSelecionado?.id === asset.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent']">
                  <span class="font-bold text-xs" :class="assetSelecionado?.id === asset.id ? 'text-blue-400' : 'text-slate-200'">{{ asset.ticker }}</span>
                  <span class="text-[9px] text-slate-500 truncate uppercase">{{ asset.nome_completo }}</span>
                </button>
              </div>
            </aside>

            <main class="flex-1 flex flex-col bg-slate-900/10 overflow-hidden">
              <div v-if="assetSelecionado" class="flex-1 flex flex-col p-4 overflow-hidden">
                
                <div class="flex items-center justify-between gap-4 mb-4 bg-slate-800/20 p-3 rounded-xl border border-slate-800">
                  <div class="flex items-center gap-3 border-r border-slate-700 pr-4">
                    <h4 class="text-xl font-black text-white leading-none">{{ assetSelecionado.ticker }}</h4>
                    <span class="text-[9px] text-slate-500 uppercase max-w-[100px] truncate leading-tight">{{ assetSelecionado.nome_completo }}</span>
                  </div>
                  
                  <div class="flex-1 grid grid-cols-5 gap-2">
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold">Qtd</span><span class="text-xs text-white font-semibold">150</span></div>
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold">P. Médio</span><span class="text-xs text-white font-semibold">R$ 45,20</span></div>
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold">Investido</span><span class="text-xs text-white font-semibold">R$ 6.780,00</span></div>
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold">P. Atual</span><span class="text-xs text-emerald-400 font-semibold">R$ 48,41</span></div>
                    <div class="flex flex-col bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <span class="text-[8px] text-emerald-500 uppercase font-black">Resultado Período</span>
                      <span class="text-xs text-emerald-400 font-bold">R$ 482,10</span>
                    </div>
                  </div>
                </div>

                <div class="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                  <div class="overflow-x-auto custom-scrollbar">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-800 text-slate-400 uppercase font-bold sticky top-0">
                        <tr>
                          <th class="px-4 py-3 border-b border-slate-700">Data</th>
                          <th class="px-4 py-3 border-b border-slate-700">Tipo</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right">Qtd</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right">Preço</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right">Total</th>
                          <th class="px-4 py-3 border-b border-slate-700 text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800/60 text-slate-300">
                        <tr v-for="i in 20" :key="i" class="hover:bg-white/5 transition-colors">
                          <td class="px-4 py-2">12/04/2026</td>
                          <td class="px-4 py-2"><span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-bold">COMPRA</span></td>
                          <td class="px-4 py-2 text-right">10</td>
                          <td class="px-4 py-2 text-right">R$ 45,00</td>
                          <td class="px-4 py-2 text-right">R$ 450,00</td>
                          <td class="px-4 py-2 text-right text-emerald-400">+ R$ 34,10</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div v-else class="h-full flex flex-col items-center justify-center text-slate-600">
                <p class="text-sm italic">Selecione um ativo da lista lateral para detalhamento.</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  classeSelecionada: String,
  tipo: String 
});

const emit = defineEmits(['update:modelValue', 'update:classe']);

const dataInicio = ref('');
const dataFim = ref('');
const buscaAsset = ref('');
const assetSelecionado = ref(null);
const assets = ref([]); 
const classesDoBanco = ref([]);
const carregandoClasses = ref(false);

const formatDate = (date) => date.toISOString().split('T')[0];

/**
 * REGRAS DE DATAS ATUALIZADAS:
 * Dia: Início hoje, Término hoje
 * Mês: Início dia 1 do mês atual, Término hoje
 * Ano: Início dia 1 do ano atual, Término hoje
 */
const calcularDatasPadrao = () => {
  const hoje = new Date();
  dataFim.value = formatDate(hoje);

  if (props.tipo === 'dia') {
    dataInicio.value = formatDate(hoje);
  } else if (props.tipo === 'mes') {
    // Primeiro dia do mês atual
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    dataInicio.value = formatDate(inicioMes);
  } else if (props.tipo === 'ano') {
    // Primeiro dia do ano atual
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    dataInicio.value = formatDate(inicioAno);
  }
};

const buscarClasses = async () => {
  carregandoClasses.value = true;
  try {
    // const response = await fetch('/api/investimentos/classes');
    // classesDoBanco.value = await response.json();
    classesDoBanco.value = ['Ações', 'FIIs', 'Cripto', 'Renda Fixa'];
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    carregandoClasses.value = false;
  }
};

const buscarAssets = async () => {
  if (!props.modelValue) return;
  assetSelecionado.value = null;
  assets.value = [
    { id: 1, ticker: 'PETR4', nome_completo: 'Petróleo Brasileiro S.A.' },
    { id: 2, ticker: 'VALE3', nome_completo: 'Vale S.A.' },
    { id: 3, ticker: 'HGLG11', nome_completo: 'CSHG Logística FII' },
  ];
};

const assetsFiltrados = computed(() => {
  if (!buscaAsset.value) return assets.value;
  const termo = buscaAsset.value.toLowerCase();
  return assets.value.filter(a => a.ticker.toLowerCase().includes(termo));
});

onMounted(() => {
  buscarClasses();
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
@keyframes modal-in { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-modal { animation: modal-in 0.2s ease-out; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>