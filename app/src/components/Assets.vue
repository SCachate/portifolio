<script setup>
import { computed, ref, watchEffect } from 'vue'; // Adicionei ref e watchEffect
import { useApi } from '../composables/useApi';
import html2pdf from 'html2pdf.js';

// Chamada do seu composable
const { data: assets, loading: apiLoading, error } = useApi('/assets/patrimonio');

// FORÇA o estado de loading inicial para evitar que a tela "vazia" apareça
const isInitialLoading = ref(true);

// Monitora o estado da API: só para de carregar quando apiLoading for false E assets chegar (ou der erro)
watchEffect(() => {
  if (!apiLoading.value) {
    // Pequeno timeout de segurança para o DOM processar
    setTimeout(() => {
      isInitialLoading.ref = false;
    }, 50);
  }
});

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
  html2pdf().set({
    margin: 5,
    filename: 'K-Portfolio.pdf',
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f111a' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(element).save();
};
</script>

<template>
  <div class="min-h-screen bg-[#0f111a] text-slate-300 p-4 md:p-8">
    
    <AsyncLoader :loading="apiLoading || isInitialLoading" :error="!!error">
      
      <div v-if="assets && assets.length > 0" id="report-container" class="max-w-[1400px] mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Patrimônio Consolidado</h1>
            <p class="text-slate-500 text-sm">Visão estratégica por classe de ativos</p>
          </div>
          <button @click="generatePDF" class="bg-[#1a1d2b] border border-slate-800 text-slate-300 px-4 py-2 rounded-md hover:bg-[#252a3d] transition-all text-sm">
            <span class="text-emerald-500">📄</span> Exportar PDF
          </button>
        </div>

        <div class="bg-[#1a1d2b] rounded-xl p-8 border border-slate-800/50 mb-10 relative overflow-hidden shadow-2xl">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Valor Total de Mercado</p>
          <h2 class="text-4xl font-bold text-white tracking-tighter">{{ formatCurrency(totalGeral) }}</h2>
        </div>

        <div class="space-y-12">
          <section v-for="(grupo, classe) in patrimonioAgrupado" :key="classe" class="bg-[#1a1d2b] rounded-xl border border-slate-800/50 overflow-hidden shadow-sm">
            <div class="px-8 py-5 border-b border-slate-800/50 flex justify-between items-center bg-[#1c2030]">
              <h3 class="font-bold text-white text-xl">{{ classe }}</h3>
              <span class="text-xl font-bold text-white">{{ formatCurrency(grupo.totalClasse) }}</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/30">
                    <th class="px-8 py-5 font-bold">Ativo</th>
                    <th class="px-8 py-5 font-bold">Instituição</th>
                    <th class="px-8 py-5 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/30">
                  <tr v-for="item in grupo.itens" :key="item.ativo" class="hover:bg-slate-800/20 transition-all">
                    <td class="px-8 py-5 font-bold text-white uppercase">{{ item.ativo || '---' }}</td>
                    <td class="px-8 py-5 text-[11px] text-slate-400 uppercase">{{ item.corretora }}</td>
                    <td class="px-8 py-5 text-right font-bold text-white">{{ formatCurrency(item.valor_mercado_brl) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <div v-else-if="!apiLoading && !isInitialLoading && assets && assets.length === 0" class="flex flex-col items-center justify-center py-32 opacity-40">
          <span class="text-5xl mb-4">🔎</span>
          <p class="text-white font-bold tracking-widest uppercase text-xs">Nenhum ativo encontrado.</p>
      </div>

    </AsyncLoader>
  </div>
</template>
