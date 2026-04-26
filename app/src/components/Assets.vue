<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8" id="report-container">
    
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Patrimônio Consolidado</h1>
        <p class="text-slate-500 font-medium">Visão estratégica por classe de ativos</p>
      </div>
      
      <button 
        @click="generatePDF" 
        class="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm font-semibold text-sm"
      >
        <span class="text-blue-500 text-lg">📄</span> Exportar PDF
      </button>
    </div>

    <AsyncLoader :loading="loading" :error="!!error">
      <div class="max-w-6xl mx-auto">
        
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Total de Mercado</p>
            <h2 class="text-3xl font-black text-slate-900">{{ formatCurrency(totalGeral) }}</h2>
          </div>
          <div class="hidden md:block bg-blue-50 p-4 rounded-full">
            <span class="text-2xl">📊</span>
          </div>
        </div>

        <div class="space-y-8">
          <section v-for="(grupo, classe) in patrimonioAgrupado" :key="classe" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            
            <div class="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div class="w-2 h-6 bg-blue-500 rounded-full"></div>
                <h3 class="font-bold text-slate-800 text-lg">{{ classe }}</h3>
                <span class="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded-md ml-2">
                  {{ ((grupo.totalClasse / totalGeral) * 100).toFixed(1) }}%
                </span>
              </div>
              <span class="text-lg font-bold text-slate-900">{{ formatCurrency(grupo.totalClasse) }}</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-50">
                    <th class="px-6 py-4 font-black">Ativo</th>
                    <th class="px-6 py-4 font-black">Corretora</th>
                    <th class="px-6 py-4 font-black text-right">Qtd</th>
                    <th class="px-6 py-4 font-black text-right">Cotação</th>
                    <th class="px-6 py-4 font-black text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="item in grupo.itens" :key="item.ativo" class="hover:bg-blue-50/30 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-800">{{ item.ativo || '---' }}</div>
                      <div class="text-[10px] text-slate-400 truncate max-w-[150px] uppercase">{{ item.description }}</div>
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-600">{{ item.corretora }}</td>
                    <td class="px-6 py-4 text-right font-mono text-xs text-slate-600">{{ item.quantidade }}</td>
                    <td class="px-6 py-4 text-right font-mono text-xs text-slate-600">{{ formatCurrency(item.cotacao_atual_brl) }}</td>
                    <td class="px-6 py-4 text-right">
                      <span class="font-bold text-slate-900" :class="{'text-red-500': item.valor_mercado_brl < 0}">
                        {{ formatCurrency(item.valor_mercado_brl) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </AsyncLoader>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useApi } from '../composables/useApi'; // Usando o seu composable
import html2pdf from 'html2pdf.js';

// Chamada única usando o seu padrão
const { data: assets, loading, error } = useApi('/assets/patrimonio');

// Agrupamento Reativo
const patrimonioAgrupado = computed(() => {
  if (!assets.value) return {};
  return assets.value.reduce((acc, item) => {
    const cls = item.classe || 'Outros';
    if (!acc[cls]) acc[cls] = { itens: [], totalClasse: 0 };
    acc[cls].itens.push(item);
    acc[cls].totalClasse += parseFloat(item.valor_mercado_brl || 0);
    return acc;
  }, {});
});

const totalGeral = computed(() => {
  if (!assets.value) return 0;
  return assets.value.reduce((sum, item) => sum + parseFloat(item.valor_mercado_brl || 0), 0);
});

const formatCurrency = (v) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
};

const generatePDF = () => {
  const element = document.getElementById('report-container');
  const opt = {
    margin: 8,
    filename: 'K-Portfolio-Report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
};
</script>

<style scoped>
@media print {
  .no-print { display: none !important; }
}
</style>
