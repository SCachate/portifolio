<template>
  <div class="min-h-screen bg-[#0f111a] text-slate-300 p-4 md:p-8" id="report-container">
    
    <AsyncLoader :loading="loading" :error="!!error">
      
      <div v-if="assets?.length > 0" class="max-w-[1400px] mx-auto">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Patrimônio Consolidado</h1>
            <p class="text-slate-500 text-sm italic">Visão estratégica por classe de ativos</p>
          </div>
          
          <button 
            @click="generatePDF" 
            class="flex items-center gap-2 bg-[#1a1d2b] border border-slate-800 text-slate-300 px-4 py-2 rounded-md hover:bg-[#252a3d] transition-all shadow-lg text-sm font-medium"
          >
            <span class="text-emerald-500">📄</span> Exportar PDF
          </button>
        </div>

        <div class="bg-[#1a1d2b] rounded-xl p-8 border border-slate-800/50 mb-10 relative overflow-hidden shadow-2xl">
          <div class="relative z-10">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Valor Total de Mercado</p>
            <h2 class="text-4xl font-bold text-white tracking-tighter">
              {{ formatCurrency(totalGeral) }}
            </h2>
          </div>
          <div class="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
             <div class="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm">
               <span class="text-3xl opacity-80">📊</span>
             </div>
          </div>
        </div>

        <div class="space-y-12">
          <section v-for="(grupo, classe) in patrimonioAgrupado" :key="classe" class="bg-[#1a1d2b] rounded-xl border border-slate-800/50 overflow-hidden">
            
            <div class="px-8 py-5 border-b border-slate-800/50 flex justify-between items-center bg-[#1c2030]">
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-7 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                <h3 class="font-bold text-white text-xl">{{ classe }}</h3>
                <span class="text-[10px] font-black px-2 py-0.5 bg-slate-900 text-emerald-500 rounded border border-emerald-900/30 ml-2">
                  {{ ((grupo.totalClasse / totalGeral) * 100).toFixed(1) }}%
                </span>
              </div>
              <span class="text-xl font-bold text-white">{{ formatCurrency(grupo.totalClasse) }}</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/30">
                    <th class="px-8 py-5">Ativo</th>
                    <th class="px-8 py-5">Corretora</th>
                    <th class="px-8 py-5 text-right">Qtd</th>
                    <th class="px-8 py-5 text-right">Cotação</th>
                    <th class="px-8 py-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/30">
                  <tr v-for="item in grupo.itens" :key="item.ativo" class="hover:bg-slate-800/20 transition-all group">
                    <td class="px-8 py-5">
                      <div class="font-bold text-white group-hover:text-emerald-400 transition-colors">{{ item.ativo || '---' }}</div>
                      <div class="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{{ item.description }}</div>
                    </td>
                    <td class="px-8 py-5 text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{{ item.corretora }}</td>
                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400">{{ item.quantidade }}</td>
                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 font-bold">{{ formatCurrency(item.cotacao_atual_brl) }}</td>
                    <td class="px-8 py-5 text-right">
                      <span class="font-bold text-white" :class="{'text-rose-500': item.valor_mercado_brl < 0}">
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

      <div v-else class="flex flex-col items-center justify-center py-20 opacity-50">
         </AsyncLoader>
      </div>   
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useApi } from '../composables/useApi';
import html2pdf from 'html2pdf.js';

const { data: assets, loading, error } = useApi('/assets/patrimonio');

const patrimonioAgrupado = computed(() => {
  if (!assets.value) return {};
  return assets.value.reduce((acc, item) => {
    const cls = item.classe || 'Diversos';
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
    margin: 0,
    filename: 'K-Portfolio-Patrimonio.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f111a' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
};
</script>

<style scoped>
/* Ajuste para garantir que fontes mono fiquem legíveis no escuro */
font-mono {
  font-family: 'JetBrains Mono', monospace;
}

@media print {
  .no-print { display: none !important; }
}
</style>
