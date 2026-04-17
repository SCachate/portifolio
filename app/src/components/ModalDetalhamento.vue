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
                  class="bg-slate-900 border border-slate-700 text-white font-bold rounded-lg p-1.5 px-3 text-sm outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option v-if="classesDoBanco.length === 0" value="">Carregando...</option>
                  <option v-for="item in classesDoBanco" :key="item.id" :value="item.id">
                    {{ item.nome }}
                  </option>
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

            <button @click="$emit('update:modelValue', false)" class="p-2 text-slate-400 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>

          <div class="flex flex-1 overflow-hidden">
            <aside class="w-64 border-r border-slate-700 flex flex-col bg-slate-900/40">
              <div class="p-3">
                <input v-model="buscaAsset" type="text" placeholder="Filtrar..." class="w-full bg-slate-900 border border-slate-700 rounded py-1.5 px-3 text-[10px] text-white outline-none" />
              </div>
              <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div v-if="carregandoAssets" class="p-4 text-[10px] text-slate-500 italic text-center">Buscando ativos...</div>
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
                    <h4 class="text-xl font-black text-white">{{ assetSelecionado.ticker }}</h4>
                  </div>
                  <div class="flex-1 grid grid-cols-5 gap-2 px-2">
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold">Qtd</span><span class="text-xs text-white font-semibold">150</span></div>
                    <div class="flex flex-col"><span class="text-[8px] text-slate-500 uppercase font-bold">Investido</span><span class="text-xs text-white font-semibold">R$ 6.780,00</span></div>
                    <div class="flex flex-col bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-right col-span-2">
                      <span class="text-[8px] text-emerald-500 uppercase font-black">Resultado Período</span>
                      <span class="text-xs text-emerald-400 font-bold">R$ 482,10</span>
                    </div>
                  </div>
                </div>

                <div class="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                  <div class="overflow-x-auto custom-scrollbar">
                    <table class="w-full text-left text-[11px]">
                      <thead class="bg-slate-800 text-slate-400 uppercase font-bold sticky top-0">
                        <tr>
                          <th class="px-4 py-3">Data</th>
                          <th class="px-4 py-3">Tipo</th>
                          <th class="px-4 py-3 text-right">Qtd</th>
                          <th class="px-4 py-3 text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800/60 text-slate-300">
                        <tr v-for="i in 10" :key="i" class="hover:bg-white/5 transition-colors">
                          <td class="px-4 py-2 font-mono">17/04/2026</td>
                          <td class="px-4 py-2"><span class="text-emerald-500 text-[9px] font-bold">COMPRA</span></td>
                          <td class="px-4 py-2 text-right">10</td>
                          <td class="px-4 py-2 text-right text-emerald-400 font-bold">+ R$ 34,10</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div v-else class="h-full flex items-center justify-center text-slate-600 text-xs italic">
                Selecione um ativo para carregar o relatório.
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
  classeSelecionada: String, // Recebe o Label (ex: "FII")
  tipo: String 
});

const emit = defineEmits(['update:modelValue', 'update:classe']);

const dataInicio = ref('');
const dataFim = ref('');
const buscaAsset = ref('');
const assetSelecionado = ref(null);
const assets = ref([]); 
const carregandoAssets = ref(false);

// ESTADO DAS CLASSES COMO OBJETOS
const classesDoBanco = ref([]); // Ex: [{id: 1, nome: 'FII'}, {id: 2, nome: 'Ações'}]
const idClasseAtiva = ref(null); // Vai guardar o ID (ex: 1)

const formatDate = (date) => date.toISOString().split('T')[0];

const calcularDatasPadrao = () => {
  const hoje = new Date();
  dataFim.value = formatDate(hoje);
  if (props.tipo === 'dia') dataInicio.value = formatDate(hoje);
  else if (props.tipo === 'mes') dataInicio.value = formatDate(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  else if (props.tipo === 'ano') dataInicio.value = formatDate(new Date(hoje.getFullYear(), 0, 1));
};

const buscarClassesDoServidor = async () => {
  // Simulando vinda do backend com ID e Nome
  classesDoBanco.value = [
    { id: 1, nome: 'FIIs' },
    { id: 2, nome: 'Ações' },
    { id: 3, nome: 'Cripto' },
    { id: 4, nome: 'Renda Fixa' }
  ];
};

// ESSA FUNÇÃO RESOLVE O SEU PROBLEMA
const sincronizarClassePorLabel = () => {
  if (!props.classeSelecionada) return;
  
  // Procura na lista o objeto que tem o mesmo nome que recebemos do Dashboard
  const encontrado = classesDoBanco.value.find(c => c.nome === props.classeSelecionada);
  
  if (encontrado) {
    idClasseAtiva.value = encontrado.id; // Define o ID para o Select e para a busca
  }
};

const buscarAssets = async () => {
  if (!props.modelValue || !idClasseAtiva.value) return;
  
  carregandoAssets.value = true;
  assetSelecionado.value = null;

  try {
    // Agora você busca pelo ID (idClasseAtiva.value)
    // const res = await fetch(`/api/ativos?classe_id=${idClasseAtiva.value}`);
    
    // Mock simples
    setTimeout(() => {
      if (idClasseAtiva.value === 1) { // FIIs
        assets.value = [{ id: 10, ticker: 'HGLG11', nome_completo: 'CSHG Logística' }];
      } else if (idClasseAtiva.value === 2) { // Ações
        assets.value = [{ id: 20, ticker: 'PETR4', nome_completo: 'Petrobras' }];
      } else {
        assets.value = [];
      }
      carregandoAssets.value = false;
    }, 300);
  } catch (e) {
    carregandoAssets.value = false;
  }
};

const aoMudarClasseManual = (event) => {
  const novoId = parseInt(event.target.value);
  idClasseAtiva.value = novoId;
  
  // Avisa o pai que a classe mudou (enviando o Nome/Label de volta para manter o padrão)
  const obj = classesDoBanco.value.find(c => c.id === novoId);
  if (obj) emit('update:classe', obj.nome);
};

const assetsFiltrados = computed(() => {
  if (!buscaAsset.value) return assets.value;
  return assets.value.filter(a => a.ticker.toLowerCase().includes(buscaAsset.value.toLowerCase()));
});

onMounted(async () => {
  await buscarClassesDoServidor();
});

watch(() => props.modelValue, (aberto) => {
  if (aberto) {
    calcularDatasPadrao();
    sincronizarClassePorLabel(); // Sincroniza o nome recebido com o ID do banco
    buscarAssets();
  }
});

// Se a prop mudar de fora enquanto aberto
watch(() => props.classeSelecionada, () => {
  if (props.modelValue) {
    sincronizarClassePorLabel();
    buscarAssets();
  }
});
</script>