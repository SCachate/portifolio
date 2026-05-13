<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '../composables/useApi'; 
import { useToast } from 'vue-toastification';

const toast = useToast();

const dataAtual = new Date();
const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).toISOString().split('T')[0];
const hoje = dataAtual.toISOString().split('T')[0];

const fileName = ref('');
const form = ref({ assetId: '', brokerId: '', quantity: null, priceUnit: null, date: hoje });

const filtros = ref({ 
  dataInicio: primeiroDiaMes, 
  dataFim: hoje, 
  brokerId: '',
  assetId: ''
});

const apiUrl = computed(() => {
  if (filtros.value.dataInicio.length < 10 || filtros.value.dataFim.length < 10) return null;
  const params = new URLSearchParams({
    startDate: filtros.value.dataInicio,
    endDate: filtros.value.dataFim,
    brokerId: filtros.value.brokerId,
    assetId: filtros.value.assetId
  });
  return `/transactions?${params.toString()}`;
});

const { data: apiResponse, loading, fetchData } = useApi(apiUrl, { immediate: true });

let debounceTimer = null;
watch(apiUrl, (newUrl) => {
  if (!newUrl) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchData(), 500);
});

const transacoesFiltradas = computed(() => apiResponse.value?.data || []);

const ativosParaSelect = computed(() => {
  const únicos = [...new Map(transacoesFiltradas.value.map(item => [item.assetId, { assetId: item.assetId, ticket: item.ticket, description: item.assetDescription }])).values()];
  return únicos.sort((a, b) => (a.ticket || a.description).localeCompare(b.ticket || b.description));
});

const brokersParaSelect = computed(() => {
  const únicos = [...new Map(transacoesFiltradas.value.map(item => [item.brokerId, { brokerId: item.brokerId, name: item.brokerName }])).values()];
  return únicos.sort((a, b) => a.name.localeCompare(b.name));
});

const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) fileName.value = file.name;
};
</script>

<template>
  <div class="flex flex-col bg-[#0b0f17] text-slate-300 font-sans p-6 overflow-hidden h-screen">
    
    <header class="shrink-0 max-w-[1600px] mx-auto w-full mb-4">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kaxatapi Finance</h3>
      <h1 class="text-3xl font-bold text-white tracking-tight leading-none">Histórico de Movimentações</h1>
    </header>

    <!-- Grid principal com altura fixa de 85% da viewport para garantir o aumento de 40% e scroll interno -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full h-[65vh] min-h-0 overflow-hidden">
      
      <!-- LADO ESQUERDO: CADASTRO -->
      <section class="lg:col-span-4 flex flex-col min-h-0 h-full">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar shadow-xl">
          <label class="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all bg-[#0b0f17]/50 group shrink-0">
            <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" />
            <span class="text-[10px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest text-center px-4">
              {{ fileName || 'IMPORTAR NOTA DE CORRETAGEM' }}
            </span>
          </label>

          <div class="space-y-4">
            <div class="space-y-1 text-left">
              <div class="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">
                <label>Ativo</label>
                <button class="text-emerald-500 hover:brightness-125">+ Novo</button>
              </div>
              <select v-model="form.assetId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket || a.description }}</option>
              </select>
            </div>

            <div class="space-y-1 text-left">
              <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1 block">Corretora</label>
              <select v-model="form.brokerId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="b in brokersParaSelect" :key="b.brokerId" :value="b.brokerId">{{ b.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1 text-left">
                <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">Qtd.</label>
                <input v-model.number="form.quantity" type="number" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none" />
              </div>
              <div class="space-y-1 text-left">
                <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">Custo Unit.</label>
                <input v-model.number="form.priceUnit" type="number" step="0.01" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none" />
              </div>
            </div>

            <button class="w-full py-4 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white font-black uppercase tracking-widest rounded-lg transition-all text-xs border border-emerald-500/20">
              Registrar Transação
            </button>
          </div>
        </div>
      </section>

      <!-- LADO DIREITO: FILTROS E TABELA -->
      <section class="lg:col-span-8 flex flex-col min-h-0 h-full overflow-hidden">
        
        <!-- RESTAURADO: FILTROS COMPLETOS -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-5 flex flex-wrap gap-4 items-end shrink-0 mb-4 shadow-lg">
          <div class="flex-1 min-w-[200px] space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Período</label>
            <div class="flex gap-2">
              <input v-model="filtros.dataInicio" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
              <input v-model="filtros.dataFim" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
            </div>
          </div>
          <div class="flex-1 min-w-[140px] space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ativo</label>
            <select v-model="filtros.assetId" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none">
              <option value="">Todos</option>
              <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket || a.description }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-[140px] space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Instituição</label>
            <select v-model="filtros.brokerId" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none">
              <option value="">Todas</option>
              <option v-for="b in brokersParaSelect" :key="b.brokerId" :value="b.brokerId">{{ b.name }}</option>
            </select>
          </div>
        </div>

        <!-- GRID DE DADOS COM SCROLL INTERNO E COLUNAS RESTAURADAS -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 shadow-2xl flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="overflow-y-auto custom-scrollbar flex-1">
            <table class="w-full text-left border-collapse min-w-[800px]">
              <thead class="sticky top-0 bg-[#1b2230] z-20 shadow-md">
                <tr class="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">
                  <th class="p-4 bg-[#1b2230]">Data</th>
                  <th class="p-4 bg-[#1b2230]">Ativo / Descrição</th>
                  <th class="p-4 bg-[#1b2230]">Qtd.</th>
                  <th class="p-4 bg-[#1b2230]">Preço Unit.</th>
                  <th class="p-4 bg-[#1b2230] text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="(t, index) in transacoesFiltradas" :key="index" class="hover:bg-white/[0.02] transition-colors">
                  <td class="p-4 text-[11px] font-mono text-slate-500 whitespace-nowrap">{{ formatDate(t.date) }}</td>
                  <td class="p-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-white tracking-tight">{{ t.ticket || '---' }}</span>
                      <span class="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[250px]">{{ t.assetDescription }}</span>
                      <span class="text-[9px] text-emerald-500/80 font-black uppercase tracking-wider">{{ t.brokerName }}</span>
                    </div>
                  </td>
                  <td class="p-4 text-xs font-mono text-slate-400 font-bold">{{ Number(t.quantity).toLocaleString('pt-BR') }}</td>
                  <td class="p-4 text-xs font-mono text-slate-400">R$ {{ formatCurrency(t.priceUnit) }}</td>
                  <td class="p-4 text-right font-mono text-white text-sm font-bold">R$ {{ formatCurrency(t.total) }}</td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="loading" class="p-20 text-center text-slate-500 uppercase text-[10px] font-black tracking-widest animate-pulse">
              Consultando dados reais...
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.5);
}

:global(body, html, #app) {
  height: 100vh !important;
  overflow: hidden !important;
  margin: 0;
}
</style>
