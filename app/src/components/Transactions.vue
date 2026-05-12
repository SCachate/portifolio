<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '../composables/useApi'; 
import { useToast } from 'vue-toastification';

const toast = useToast();

// --- LÓGICA DE DATAS ---
const dataAtual = new Date();
const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).toISOString().split('T')[0];
const hoje = dataAtual.toISOString().split('T')[0];

// --- ESTADOS ---
const showNovoAtivoModal = ref(false);
const fileName = ref('');
const form = ref({ assetId: '', brokerId: '', quantity: null, priceUnit: null, date: hoje });
const novoAtivoForm = ref({ nome: '', tipo: 'Ações' });

const filtros = ref({ 
  dataInicio: primeiroDiaMes, 
  dataFim: hoje, 
  brokerId: '',
  assetId: ''
});

// --- API REATIVA ---
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

// --- PROCESSAMENTO ---
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
  <!-- h-full em vez de h-screen para respeitar o container pai + flex col -->
  <div class="h-full flex flex-col bg-[#0b0f17] text-slate-300 font-sans p-6 overflow-hidden max-w-[1600px] mx-auto">
    
    <!-- CABEÇALHO (Altura fixa) -->
    <header class="mb-4 shrink-0">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kaxatapi Finance</h3>
      <h1 class="text-2xl font-bold text-white tracking-tight leading-none">Histórico de Movimentações</h1>
    </header>

    <!-- GRID PRINCIPAL (flex-1 para ocupar o que sobra) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden mb-2">
      
      <!-- LADO ESQUERDO: CADASTRO (Scroll interno se necessário) -->
      <section class="lg:col-span-4 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-5 space-y-5">
          <label class="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all bg-[#0b0f17]/50 group">
            <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" />
            <span class="text-[9px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest text-center px-4">
              {{ fileName || 'IMPORTAR NOTA DE CORRETAGEM' }}
            </span>
          </label>

          <div class="space-y-4">
            <div class="space-y-1 text-left">
              <div class="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">
                <label>Ativo</label>
                <button @click="showNovoAtivoModal = true" class="text-emerald-500 hover:brightness-125">+ Novo</button>
              </div>
              <select v-model="form.assetId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket || a.description }}</option>
              </select>
            </div>

            <div class="space-y-1 text-left">
              <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1 block">Corretora</label>
              <select v-model="form.brokerId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="b in brokersParaSelect" :key="b.brokerId" :value="b.brokerId">{{ b.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1 text-left">
                <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">Qtd.</label>
                <input v-model.number="form.quantity" type="number" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none" />
              </div>
              <div class="space-y-1 text-left">
                <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">Custo Unit.</label>
                <input v-model.number="form.priceUnit" type="number" step="0.01" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none" />
              </div>
            </div>

            <button class="w-full py-3.5 bg-[#1e293b] hover:bg-emerald-600 text-white font-bold rounded-lg transition-all text-sm">
              Registrar Transação
            </button>
          </div>
        </div>
      </section>

      <!-- LADO DIREITO: FILTROS E TABELA -->
      <section class="lg:col-span-8 flex flex-col min-h-0 overflow-hidden">
        
        <!-- Filtros (Altura reduzida) -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-4 flex flex-wrap gap-4 items-end shrink-0 mb-4">
          <div class="flex-1 min-w-[140px] space-y-1 text-left">
            <label class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Período</label>
            <div class="flex gap-2">
              <input v-model="filtros.dataInicio" type="date" class="bg-[#0b0f17] border border-white/5 rounded p-1.5 text-[11px] text-white w-full" />
              <input v-model="filtros.dataFim" type="date" class="bg-[#0b0f17] border border-white/5 rounded p-1.5 text-[11px] text-white w-full" />
            </div>
          </div>
          <div class="flex-1 min-w-[120px] space-y-1 text-left">
            <label class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ativo</label>
            <select v-model="filtros.assetId" class="bg-[#0b0f17] border border-white/5 rounded p-1.5 text-[11px] text-white w-full">
              <option value="">Todos</option>
              <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket || a.description }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-[120px] space-y-1 text-left">
            <label class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Instituição</label>
            <select v-model="filtros.brokerId" class="bg-[#0b0f17] border border-white/5 rounded p-1.5 text-[11px] text-white w-full">
              <option value="">Todas</option>
              <option v-for="b in brokersParaSelect" :key="b.brokerId" :value="b.brokerId">{{ b.name }}</option>
            </select>
          </div>
        </div>

        <!-- TABELA COM SCROLL INTERNO -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 flex flex-col flex-1 min-h-0 overflow-hidden shadow-2xl">
          <div class="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
            <table class="w-full text-left border-collapse min-w-[650px]">
              <thead class="sticky top-0 bg-[#161b26] z-10 shadow-sm">
                <tr class="text-[9px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                  <th class="p-3">Data</th>
                  <th class="p-3">Ativo</th>
                  <th class="p-3">Qtd.</th>
                  <th class="p-3">Custo Unit.</th>
                  <th class="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="(t, index) in transacoesFiltradas" :key="index" class="hover:bg-white/[0.01] transition-colors">
                  <td class="p-3 text-[10px] font-mono text-slate-500 whitespace-nowrap">{{ formatDate(t.date) }}</td>
                  <td class="p-3">
                    <div class="flex flex-col">
                      <span class="text-[13px] font-bold text-white">{{ t.ticket || 'Ativo' }}</span>
                      <span class="text-[9px] text-slate-600 font-black uppercase truncate max-w-[220px]">{{ t.assetDescription }}</span>
                      <span class="text-[9px] text-emerald-500/70 font-bold uppercase">{{ t.brokerName }}</span>
                    </div>
                  </td>
                  <td class="p-3 text-[11px] font-mono text-slate-400">{{ Number(t.quantity).toLocaleString('pt-BR') }}</td>
                  <td class="p-3 text-[11px] font-mono text-slate-400">R$ {{ formatCurrency(t.priceUnit) }}</td>
                  <td class="p-3 text-right font-mono text-white text-sm font-bold">R$ {{ formatCurrency(t.total) }}</td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="loading" class="p-10 text-center text-slate-500 uppercase text-[9px] font-black tracking-widest animate-pulse">
              Carregando dados...
            </div>
            <div v-else-if="transacoesFiltradas.length === 0" class="p-10 text-center text-slate-600 text-[10px] italic">
              Nenhuma movimentação encontrada.
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Remove o scroll do browser forçadamente */
:global(html, body, #app) {
  height: 100%;
  overflow: hidden !important;
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
</style>
