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

// Garante que sempre retorne um array para evitar erros de .map ou .filter
const transacoesFiltradas = computed(() => apiResponse.value?.data || []);

const ativosParaSelect = computed(() => {
  // Blindagem: Filtra itens que por ventura venham nulos da API antes de mapear
  const únicos = [...new Map(
    transacoesFiltradas.value
      .filter(item => item && item.assetId)
      .map(item => [item.assetId, { assetId: item.assetId, ticket: item.ticket, description: item.assetDescription }])
  ).values()];
  return únicos.sort((a, b) => (a.ticket || a.description || '').localeCompare(b.ticket || b.description || ''));
});

const brokersParaSelect = computed(() => {
  // Blindagem: Filtra itens que por ventura venham nulos da API antes de mapear
  const únicos = [...new Map(
    transacoesFiltradas.value
      .filter(item => item && item.brokerId)
      .map(item => [item.brokerId, { brokerId: item.brokerId, name: item.brokerName }])
  ).values()];
  return únicos.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
});

const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (val) => Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) fileName.value = file.name;
};
</script>

<template>
  <!-- inset-0 trava o componente nos limites do container pai -->
  <div class="absolute inset-0 flex flex-col bg-[#0b0f17] text-slate-300 font-sans p-6 overflow-hidden">
    
    <header class="shrink-0 mb-4">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kaxatapi Finance</h3>
      <h1 class="text-3xl font-bold text-white tracking-tight leading-none">Histórico de Movimentações</h1>
    </header>

    <!-- O segredo: flex-1 min-h-0 faz o grid ocupar apenas o espaço disponível -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
      
      <!-- LADO ESQUERDO: CADASTRO -->
      <section class="lg:col-span-4 flex flex-col min-h-0">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 space-y-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <!-- ... (seu conteúdo de cadastro aqui) ... -->
          <label class="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/10 rounded-xl bg-[#0b0f17]/50 shrink-0">
             <span class="text-[10px] font-black text-slate-500 uppercase">IMPORTAR NOTA DE CORRETAGEM</span>
          </label>
          
          <div class="space-y-4 flex-1">
             <!-- Campos do formulário -->
             <div class="space-y-1">
               <label class="text-[10px] font-black uppercase text-slate-500">Ativo</label>
               <select v-model="form.assetId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white">
                 <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket }}</option>
               </select>
             </div>
             <!-- ... outros campos ... -->
          </div>

          <button class="w-full py-4 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white font-black uppercase tracking-widest rounded-lg shrink-0">
            Registrar Transação
          </button>
        </div>
      </section>

      <!-- LADO DIREITO: FILTROS E TABELA -->
      <section class="lg:col-span-8 flex flex-col min-h-0">
        
        <!-- Filtros -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-5 flex flex-wrap gap-4 items-end shrink-0 mb-4">
           <!-- Seus filtros aqui -->
           <div class="flex-1 min-w-[200px]">
             <label class="text-[10px] font-black text-slate-600 uppercase">Período</label>
             <div class="flex gap-2">
               <input v-model="filtros.dataInicio" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-white w-full" />
               <input v-model="filtros.dataFim" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-white w-full" />
             </div>
           </div>
        </div>

        <!-- Tabela com Scroll Interno Real -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="overflow-auto custom-scrollbar flex-1">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-[#1b2230] z-20">
                <tr class="text-[10px] font-black text-slate-500 uppercase border-b border-white/5">
                  <th class="p-4">Data</th>
                  <th class="p-4">Ativo</th>
                  <th class="p-4">Qtd.</th>
                  <th class="p-4">Preço</th>
                  <th class="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="(t, index) in transacoesFiltradas" :key="index" class="hover:bg-white/[0.02]">
                  <td class="p-4 text-[11px] font-mono">{{ formatDate(t?.date) }}</td>
                  <td class="p-4 font-bold text-white">{{ t?.ticket }}</td>
                  <td class="p-4">{{ t?.quantity }}</td>
                  <td class="p-4">R$ {{ formatCurrency(t?.priceUnit) }}</td>
                  <td class="p-4 text-right font-bold">R$ {{ formatCurrency(t?.total) }}</td>
                </tr>
              </tbody>
            </table>
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

/* Força o reset de altura para garantir o comportamento de Single Page App sem scroll na borda da janela */
:global(body, html, #app) {
  height: 100vh !important;
  overflow: hidden !important;
  margin: 0;
}
</style>
