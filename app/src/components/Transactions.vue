<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '../composables/useApi'; 
import { useToast } from 'vue-toastification';

const toast = useToast();

// Configurações de Datas Iniciais
const dataAtual = new Date();
const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).toISOString().split('T')[0];
const hoje = dataAtual.toISOString().split('T')[0];

const fileName = ref('');
const form = ref({ assetId: '', brokerId: '', quantity: null, priceUnit: null, date: hoje });

// Filtros Reativos
const filtros = ref({ 
  dataInicio: primeiroDiaMes, 
  dataFim: hoje, 
  brokerId: '',
  assetId: ''
});

// Controle de Paginação
const paginaAtual = ref(1);
const itensPorPagina = 8;

// Definição da URL da API - Monitora mudanças nos filtros
const apiUrl = computed(() => {
  if (!filtros.value.dataInicio || !filtros.value.dataFim) return null;
  
  const params = new URLSearchParams({
    startDate: filtros.value.dataInicio,
    endDate: filtros.value.dataFim,
    brokerId: filtros.value.brokerId || '',
    assetId: filtros.value.assetId || ''
  });
  return `/transactions?${params.toString()}`;
});

// Hook de API - O 'fetchData' é a função que dispara a requisição real
const { data: apiResponse, loading, fetchData } = useApi(apiUrl, { immediate: true });

// MONITOR DE DISPARO: Se a URL mudar pelos filtros, chama o backend e reseta a página
watch(apiUrl, (newUrl) => {
  if (newUrl) {
    paginaAtual.value = 1;
    fetchData(); 
  }
}, { deep: true });

// Dados processados do Backend
const transacoesTotal = computed(() => apiResponse.value?.data || []);

// Lógica de Fatiamento para a Grid (Paginação Client-side)
const transacoesPaginadas = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  return transacoesTotal.value.slice(inicio, fim);
});

const totalPaginas = computed(() => 
  Math.max(1, Math.ceil(transacoesTotal.value.length / itensPorPagina))
);

// Auxiliares para preencher os Selects com base nos dados reais retornados
const ativosParaSelect = computed(() => {
  const unicos = [...new Map(
    transacoesTotal.value
      .filter(item => item?.assetId)
      .map(item => [item.assetId, { assetId: item.assetId, ticket: item.ticket, description: item.assetDescription }])
  ).values()];
  return unicos.sort((a, b) => (a.ticket || '').localeCompare(b.ticket || ''));
});

const brokersParaSelect = computed(() => {
  const unicos = [...new Map(
    transacoesTotal.value
      .filter(item => item?.brokerId)
      .map(item => [item.brokerId, { brokerId: item.brokerId, name: item.brokerName }])
  ).values()];
  return unicos.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
});

// Formatações Utilitárias
const formatDate = (dateString) => {
  if (!dateString) return '---';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (val) => 
  Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) fileName.value = file.name;
};
</script>

<template>
  <div class="flex flex-col bg-[#0b0f17] text-slate-300 font-sans p-6 overflow-hidden w-full h-full">
    
    <header class="shrink-0 mb-4">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kaxatapi Finance</h3>
      <h1 class="text-3xl font-bold text-white tracking-tight leading-none">Histórico de Movimentações</h1>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
      
      <!-- COLUNA ESQUERDA: CADASTRO -->
      <section class="lg:col-span-4 flex flex-col min-h-0">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 space-y-6 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-xl">
          <label class="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all bg-[#0b0f17]/50 group shrink-0">
            <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" />
            <span class="text-[10px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest text-center px-4">
              {{ fileName || 'IMPORTAR NOTA DE CORRETAGEM' }}
            </span>
          </label>

          <div class="space-y-4 flex-grow">
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-black uppercase text-slate-500">
                <label>Ativo</label>
                <button class="text-emerald-500 hover:brightness-125">+ Novo</button>
              </div>
              <select v-model="form.assetId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket || a.description }}</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-black uppercase text-slate-500 block">Corretora</label>
              <select v-model="form.brokerId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="b in brokersParaSelect" :key="b.brokerId" :value="b.brokerId">{{ b.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-500">Qtd.</label>
                <input v-model.number="form.quantity" type="number" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-500">Custo Unit.</label>
                <input v-model.number="form.priceUnit" type="number" step="0.01" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none" />
              </div>
            </div>
          </div>

          <button class="w-full py-4 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white font-black uppercase tracking-widest rounded-lg transition-all text-xs border border-emerald-500/20 shrink-0">
            Registrar Transação
          </button>
        </div>
      </section>

      <!-- COLUNA DIREITA: FILTROS E GRID PAGINADA -->
      <section class="lg:col-span-8 flex flex-col min-h-0 h-full">
        
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-5 flex flex-wrap gap-4 items-end shrink-0 mb-4">
          <div class="flex-1 min-w-[180px] space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Período</label>
            <div class="flex gap-2">
              <input v-model="filtros.dataInicio" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
              <input v-model="filtros.dataFim" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
            </div>
          </div>
          <div class="flex-1 min-w-[120px] space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ativo</label>
            <select v-model="filtros.assetId" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none">
              <option value="">Todos</option>
              <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket || a.description }}</option>
            </select>
          </div>
        </div>

        <div class="bg-[#161b26] rounded-xl border border-white/5 shadow-2xl flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="flex-1 overflow-x-auto overflow-y-hidden flex flex-col">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-[#1b2230] z-20">
                <tr class="text-[10px] font-black text-slate-500 uppercase border-b border-white/5">
                  <th class="p-4 bg-[#1b2230]">Data</th>
                  <th class="p-4 bg-[#1b2230]">Ativo / Descrição</th>
                  <th class="p-4 bg-[#1b2230]">Qtd.</th>
                  <th class="p-4 bg-[#1b2230]">Preço Unit.</th>
                  <th class="p-4 bg-[#1b2230] text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="(t, index) in transacoesPaginadas" :key="index" class="hover:bg-white/[0.02]">
                  <td class="p-4 text-[11px] font-mono text-slate-500">{{ formatDate(t?.date) }}</td>
                  <td class="p-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-white tracking-tight">{{ t?.ticket || '---' }}</span>
                      <span class="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[200px]">{{ t?.assetDescription }}</span>
                    </div>
                  </td>
                  <td class="p-4 text-xs font-mono text-slate-400 font-bold">{{ Number(t?.quantity || 0).toLocaleString('pt-BR') }}</td>
                  <td class="p-4 text-xs font-mono text-slate-400">R$ {{ formatCurrency(t?.priceUnit) }}</td>
                  <td class="p-4 text-right font-mono text-white text-sm font-bold">R$ {{ formatCurrency(t?.total) }}</td>
                </tr>
              </tbody>
            </table>

            <div v-if="loading" class="p-10 text-center text-slate-500 uppercase text-[10px] font-black animate-pulse">
              Chamando Backend...
            </div>
            <div v-if="!loading && transacoesTotal.length === 0" class="p-10 text-center text-slate-600 uppercase text-[10px] font-black">
              Nenhuma movimentação no período.
            </div>
          </div>

          <!-- PAGINAÇÃO FIXA NO RODAPÉ -->
          <div class="p-4 border-t border-white/5 flex justify-between items-center bg-[#1b2230]/30 shrink-0">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Página {{ paginaAtual }} de {{ totalPaginas }} ({{ transacoesTotal.length }} registros reais)
            </span>
            <div class="flex gap-2">
              <button 
                @click="paginaAtual--" 
                :disabled="paginaAtual === 1"
                class="px-4 py-2 bg-[#0b0f17] border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-500/30 disabled:opacity-20 transition-all"
              >
                Anterior
              </button>
              <button 
                @click="paginaAtual++" 
                :disabled="paginaAtual >= totalPaginas"
                class="px-4 py-2 bg-[#0b0f17] border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-500/30 disabled:opacity-20 transition-all"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); }
</style>
