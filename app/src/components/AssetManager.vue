<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '../composables/useApi';
import { useToast } from 'vue-toastification';

const toast = useToast();
const filtroBusca = ref('');
const salvando = ref(false);

// 🟢 Estados de controle da Paginação
const paginaAtual = ref(1);
const itensPorPagina = ref(8); // Quantidade sênior ideal por página de tabela

const form = ref({
  id: null,
  ticket: '',
  description: '',
  assetType: 'B3',
  apiCode: '',
  defaultClassId: '',
  strategyId: '',
  currencyAssetId: '',
  is_liquidity: false
});

// 🟢 URL Reativa do useApi incluindo os parâmetros de paginação e busca ativa
const assetsUrl = computed(() => {
  return `/assets?page=${paginaAtual.value}&limit=${itensPorPagina.value}&search=${filtroBusca.value}`;
});

const classesUrl = computed(() => '/classes');
const strategiesUrl = computed(() => '/strategies');

// Dispara automaticamente sempre que assetsUrl mudar (seja por busca ou mudança de página)
const { data: assetsResponse, loading: loadingAssets, fetchData: buscarAtivos } = useApi(assetsUrl, { immediate: true });
const { data: classesList } = useApi(classesUrl, { immediate: true });
const { data: strategiesList } = useApi(strategiesUrl, { immediate: true });

const isEditing = computed(() => form.value.id !== null);
const loadingGlobal = computed(() => loadingAssets.value || salvando.value);

const assetTypes = ['B3', 'EUA', 'RENDA_FIXA', 'FII', 'TESOURO DIRETO', 'MOEDA'];

// 🟢 Mapeamento seguro dos dados paginados vindos do backend
const safeAssetsList = computed(() => {
  if (!assetsResponse.value) return [];
  // Como o backend agora responde um objeto { data, meta }, pegamos a propriedade correta
  return assetsResponse.value.data || [];
});

const metadadosPaginacao = computed(() => {
  if (!assetsResponse.value || !assetsResponse.value.meta) {
    return { totalItems: 0, totalPages: 1, currentPage: 1 };
  }
  return assetsResponse.value.meta;
});

// 🟢 Se o usuário digitar na busca, reseta para a página 1 para evitar inconsistências
watch(filtroBusca, () => {
  paginaAtual.value = 1;
});

// Resto das funções auxiliares permanecem idênticas (moedasDisponiveis, selecionarAtivo, etc.)
const moedasDisponiveis = computed(() => {
  if (!safeAssetsList.value) return [];
  return safeAssetsList.value.filter(a => a.assetType === 'MOEDA');
});

const estrategiasFiltradas = computed(() => {
  if (!strategiesList.value || !form.value.defaultClassId) return [];
  return Array.isArray(strategiesList.value) ? strategiesList.value : [].filter(s => s.classId === form.value.defaultClassId);
});

watch(() => form.value.defaultClassId, () => {
  if (!isEditing.value) form.value.strategyId = '';
});

const selecionarAtivo = (asset) => {
  form.value = {
    id: asset.id,
    ticket: asset.ticket || '',
    description: asset.description,
    assetType: asset.assetType,
    apiCode: asset.apiCode || '',
    defaultClassId: asset.defaultClassId,
    strategyId: asset.strategyId || '',
    currencyAssetId: asset.currencyAssetId || '',
    is_liquidity: asset.is_liquidity === 1
  };
};

const resetarFormulario = () => {
  form.value = { id: null, ticket: '', description: '', assetType: 'B3', apiCode: '', defaultClassId: '', strategyId: '', currencyAssetId: '', is_liquidity: false };
};

const salvarAtivo = async () => {
  if (!form.value.description || !form.value.defaultClassId) {
    toast.warning('Preencha os campos obrigatórios.');
    return;
  }
  try {
    salvando.value = true;
    const url = isEditing.value ? `/assets/${form.value.id}` : '/assets';
    await useApi(url, { method: isEditing.value ? 'PUT' : 'POST', data: { ...form.value }, immediate: false }).fetchData();
    toast.success(isEditing.value ? 'Ativo atualizado!' : 'Novo ativo salvo!');
    resetarFormulario();
    await buscarAtivos();
  } catch (err) { console.error(err); } finally { salvando.value = false; }
};

const deletarAtivo = async (id) => {
  if (!id || !confirm('Deseja realmente remover?')) return;
  try {
    salvando.value = true;
    await useApi(`/assets/${id}`, { method: 'DELETE', data: {}, immediate: false }).fetchData();
    toast.success('Ativo deletado.');
    if (form.value.id === id) resetarFormulario();
    await buscarAtivos();
  } catch (err) { console.error(err); } finally { salvando.value = false; }
};
</script>

<template>
  <div class="flex flex-col bg-[#0b0f17] text-slate-300 font-sans p-6 overflow-hidden w-full h-full relative">
    
    <div v-if="loadingGlobal" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-30 flex items-center justify-center">
      <div class="w-16 h-16 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>

    <header class="shrink-0 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Dicionário de Ativos</h3>
        <h1 class="text-3xl font-bold text-white tracking-tight">Cadastro de Ativos</h1>
      </div>
      <input v-model="filtroBusca" type="text" placeholder="🔍 Filtrar no banco por ticket ou nome..." class="bg-[#161b26] border border-white/5 rounded-lg px-4 py-2 text-sm text-white outline-none w-full md:w-72 focus:border-emerald-500/30 transition-all" />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
      
      <section class="lg:col-span-8 flex flex-col min-h-0">
        <div class="bg-[#161b26] rounded-xl border border-white/5 shadow-xl flex flex-col h-full overflow-hidden">
          
          <div class="flex-1 overflow-auto custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-[#161b26] z-10 border-b border-white/5">
                <tr class="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th class="p-4 w-28">Ticket</th>
                  <th class="p-4">Descrição</th>
                  <th class="p-4 w-28">Mercado</th>
                  <th class="p-4 w-36">Classe Macro</th>
                  <th class="p-4 text-center w-20">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr 
                  v-for="asset in safeAssetsList" 
                  :key="asset.id" 
                  class="hover:bg-white/[0.02] cursor-pointer"
                  :class="{'bg-emerald-500/5': form.id === asset.id}"
                  @click="selecionarAtivo(asset)"
                >
                  <td class="p-4 font-mono font-bold text-white text-sm">
                    {{ asset.ticket || '—' }}
                    <span v-if="asset.is_liquidity" class="block text-[8px] font-black uppercase text-emerald-400 tracking-wider">Liquidez</span>
                  </td>
                  <td class="p-4 text-sm text-slate-300">
                    <div class="font-medium text-slate-200">{{ asset.description }}</div>
                    <div class="text-[11px] text-slate-500 font-mono" v-if="asset.strategyName">↳ {{ asset.strategyName }}</div>
                  </td>
                  <td class="p-4">
                    <span class="text-[9px] px-2 py-0.5 rounded font-black border uppercase tracking-wider bg-slate-900 border-white/5 text-slate-400">
                      {{ asset.assetType }}
                    </span>
                  </td>
                  <td class="p-4 text-xs font-bold text-slate-400">
                    {{ asset.className }}
                    <span v-if="asset.currencyTicket" class="block font-mono text-[10px] text-amber-500">💵 {{ asset.currencyTicket }}</span>
                  </td>
                  <td class="p-4 text-center" @click.stop>
                    <button @click="deletarAtivo(asset.id)" class="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-md text-xs transition-colors">✕</button>
                  </td>
                </tr>
                <tr v-if="safeAssetsList.length === 0">
                  <td colspan="5" class="p-8 text-center text-xs text-slate-500 italic">Nenhum ativo localizado para os filtros informados.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="shrink-0 bg-[#0e121a] border-t border-white/5 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
            <div>
              Exibindo <span class="font-bold text-white">{{ safeAssetsList.length }}</span> de 
              <span class="font-bold text-white">{{ metadadosPaginacao.totalItems }}</span> ativos registrados
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                :disabled="paginaAtual === 1"
                @click="paginaAtual--"
                class="px-3 py-1.5 bg-[#161b26] border border-white/5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300"
              >
                ◀ Voltar
              </button>

              <span class="font-mono text-xs px-2">
                Pág <span class="text-emerald-400 font-bold">{{ metadadosPaginacao.currentPage }}</span> de <span class="text-white">{{ metadadosPaginacao.totalPages }}</span>
              </span>

              <button 
                type="button" 
                :disabled="paginaAtual >= metadadosPaginacao.totalPages"
                @click="paginaAtual++"
                class="px-3 py-1.5 bg-[#161b26] border border-white/5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300"
              >
                Avançar ▶
              </button>
            </div>
          </div>

        </div>
      </section>

      <section class="lg:col-span-4 flex flex-col min-h-0">
        </section>

    </div>
  </div>
</template>