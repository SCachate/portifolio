<template>
  <div class="w-full">
    
    <AsyncLoader :loading="loading" :error="!!error">
      
      <div v-if="assets && assets.length > 0" id="report-container" class="space-y-8">
        
        <div class="flex justify-between items-center mb-6 no-print">
          <h1 class="text-xl font-bold text-white uppercase tracking-wider">Patrimônio Consolidado</h1>
          <button @click="generatePDF" class="bg-[#1a1d2b] border border-slate-800 text-[10px] font-black uppercase text-slate-400 px-4 py-2 rounded hover:text-emerald-500 transition-all">
            Exportar PDF
          </button>
        </div>

        <div class="bg-[#1a1d2b] rounded-xl p-8 border border-slate-800/50 relative overflow-hidden">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Valor Total</p>
          <h2 class="text-3xl font-bold text-white">{{ formatCurrency(totalGeral) }}</h2>
          <div class="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
             <span class="text-4xl">📊</span>
          </div>
        </div>

        <div v-for="(grupo, classe) in patrimonioAgrupado" :key="classe" class="bg-[#1a1d2b] rounded-xl border border-slate-800/50 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-800/50 flex justify-between items-center bg-[#1c2030]">
            <h3 class="font-bold text-white uppercase text-sm tracking-widest">{{ classe }}</h3>
            <span class="text-emerald-500 font-mono font-bold">{{ formatCurrency(grupo.totalClasse) }}</span>
          </div>

          <table class="w-full text-left">
            <tbody class="divide-y divide-slate-800/30">
              <tr v-for="item in grupo.itens" :key="item.ativo" class="hover:bg-slate-800/20">
                <td class="px-6 py-4">
                  <div class="font-bold text-white text-sm">{{ item.ativo }}</div>
                  <div class="text-[9px] text-slate-500 uppercase">{{ item.description }}</div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="text-white font-bold text-sm">{{ formatCurrency(item.valor_mercado_brl) }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template v-else-if="!loading && assets?.length === 0">
        <div class="flex flex-col items-center justify-center py-20 opacity-30">
          <span class="text-4xl mb-4">🔍</span>
          <p class="text-white text-xs font-bold uppercase tracking-[0.3em]">Nenhum ativo disponível</p>
        </div>
      </template>

    </AsyncLoader>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue'; // Certifique-se que o import está aqui!
import html2pdf from 'html2pdf.js';

// Chamada idêntica à que você usa no Dashboard
const { data: assets, loading, error } = useApi('/assets/patrimonio');

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

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const generatePDF = () => {
  const element = document.getElementById('report-container');
  html2pdf().set({
    margin: 10,
    filename: 'Patrimonio.pdf',
    html2canvas: { scale: 2, backgroundColor: '#0f111a' },
    jsPDF: { unit: 'mm', format: 'a4' }
  }).from(element).save();
};
</script>
