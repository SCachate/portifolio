<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

// --- ESTADOS ---
const transacoesBrutas = ref([]);
const loading = ref(true);

// Estado dos filtros (Exatamente como o Back-end espera receber via Query String)
const filtros = ref({
  dataInicio: '2024-01-01',
  dataFim: new Date().toISOString().split('T')[0], // Hoje
  brokerId: '',
  assetId: '' 
});

/**
 * FUNÇÃO DE BUSCA (ACIONA A ROTA GET /)
 * Centralizamos a lógica aqui para ser chamada no mount e nos watches
 */
const fetchTransacoes = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/transactions', {
      params: {
        startDate: filtros.value.dataInicio,
        endDate: filtros.value.dataFim,
        brokerId: filtros.value.brokerId,
        assetId: filtros.value.assetId
      }
    });

    // Atualiza o estado com o array 'data' que vem do transactionController.js
    transacoesBrutas.value = response.data.data;
  } catch (error) {
    console.error("Erro na integração com o Back-end:", error);
  } finally {
    loading.value = false;
  }
};

/**
 * REATIVIDADE AUTOMÁTICA
 * O segredo está aqui: Mudou o objeto 'filtros' -> Dispara o 'fetchTransacoes'
 */
watch(filtros, () => {
  fetchTransacoes();
}, { deep: true });

// Carregamento inicial ao abrir a página
onMounted(fetchTransacoes);

// --- AUXILIARES ---
const formatDate = (dateString) => {
  if (!dateString) return '---';
  return dateString.split('-').reverse().join('/');
};

// Gera a lista de corretoras para o select baseada no que já existe no banco
const brokersParaSelect = computed(() => {
  const map = new Map();
  transacoesBrutas.value.forEach(t => {
    if (!map.has(t.brokerId)) {
      map.set(t.brokerId, { id: t.brokerId, name: t.brokerName });
    }
  });
  return Array.from(map.values());
});
</script>

<template>
  <div class="min-h-screen bg-[#0b0f17] text-slate-300 p-8">
    
    <!-- Filtros Reativos -->
    <section class="mb-6">
      <div class="bg-[#161b26] rounded-xl border border-white/5 p-5 flex flex-wrap gap-4 items-end">
        
        <!-- Input de Data Início -->
        <div class="flex-1 min-w-[150px] space-y-2">
          <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Desde</label>
          <input 
            v-model="filtros.dataInicio" 
            type="date" 
            class="bg-[#0b0f17] border border-white/5 rounded-lg p-2 text-xs text-white w-full outline-none focus:border-emerald-500/50" 
          />
        </div>

        <!-- Input de Data Fim -->
        <div class="flex-1 min-w-[150px] space-y-2">
          <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Até</label>
          <input 
            v-model="filtros.dataFim" 
            type="date" 
            class="bg-[#0b0f17] border border-white/5 rounded-lg p-2 text-xs text-white w-full outline-none focus:border-emerald-500/50" 
          />
        </div>

        <!-- Select de Corretora -->
        <div class="flex-1 min-w-[200px] space-y-2">
          <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Instituição</label>
          <select 
            v-model="filtros.brokerId" 
            class="bg-[#0b0f17] border border-white/5 rounded-lg p-2 text-xs text-white w-full outline-none focus:border-emerald-500/50 appearance-none"
          >
            <option value="">Todas as Instituições</option>
            <option v-for="b in brokersParaSelect" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>

      </div>
    </section>

    <!-- Tabela de Resultados -->
    <div class="bg-[#161b26] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
      <table class="w-full text-left">
        <thead>
          <tr class="text-[10px] font-black text-slate-600 uppercase border-b border-white/5 bg-white/[0.02]">
            <th class="p-4">Data</th>
            <th class="p-4">Ativo</th>
            <th class="p-4">Corretora</th>
            <th class="p-4 text-right">Valor Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-if="loading">
            <td colspan="4" class="p-20 text-center text-slate-500 text-xs font-black uppercase animate-pulse tracking-widest">
              Filtrando no Banco de Dados...
            </td>
          </tr>
          <tr v-else-if="transacoesBrutas.length === 0">
            <td colspan="4" class="p-20 text-center text-slate-500 text-xs uppercase">
              Nenhuma transação encontrada para este filtro.
            </td>
          </tr>
          <tr v-for="t in transacoesBrutas" :key="t.id" class="hover:bg-white/[0.01] transition-colors">
            <td class="p-4 text-xs font-mono text-slate-500">{{ formatDate(t.date) }}</td>
            <td class="p-4">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-white">{{ t.ticket || 'Renda Fixa' }}</span>
                <span class="text-[9px] text-slate-600 font-black uppercase truncate max-w-[200px]">{{ t.assetDescription }}</span>
              </div>
            </td>
            <td class="p-4 text-xs">{{ t.brokerName }}</td>
            <td class="p-4 text-right font-mono text-white text-sm">
              R$ {{ Number(t.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
