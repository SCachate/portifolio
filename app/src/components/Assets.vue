<template>
  <div class="w-full">
    <AsyncLoader :loading="loading" :error="!!error">
      
      <div v-if="!loading && assets && assets.length > 0" id="report-container" class="max-w-[1400px] mx-auto space-y-10">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print mt-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Patrimônio vs Meta</h1>
            <p class="text-slate-500 text-sm italic">Análise de rebalanceamento estratégico</p>
          </div>
          
          <button 
            @click="generatePDF" 
            class="flex items-center gap-2 bg-[#1a1d2b] border border-slate-800 text-slate-300 px-4 py-2 rounded-md hover:bg-[#252a3d] transition-all shadow-lg text-sm font-medium"
          >
            <span class="text-emerald-500">📄</span> Exportar PDF
          </button>
        </div>

        <div class="bg-[#1a1d2b] rounded-xl p-8 border border-slate-800/50 relative overflow-hidden shadow-2xl">
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

        <div class="space-y-12 pb-10">
          <section v-for="(grupo, classe) in patrimonioAgrupado" :key="classe" class="bg-[#1a1d2b] rounded-xl border border-slate-800/50 overflow-hidden shadow-sm">
            
            <div class="px-8 py-6 border-b border-slate-800/50 bg-[#1c2030]">
              <div class="flex justify-between items-start mb-5">
                <div class="flex items-center gap-4">
                  <div class="w-1.5 h-10 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                  <div>
                    <h3 class="font-bold text-white text-xl uppercase tracking-tight">{{ classe }}</h3>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                      Meta: {{ grupo.target }}% | 
                      <span :class="getStatusColor(grupo.percentualAtual, grupo.target)">
                        Diferença: {{ (grupo.percentualAtual - grupo.target).toFixed(1) }}%
                      </span>
                    </p>
                  </div>
                </div>
                
                <div class="text-right">
                  <span class="text-xl font-bold text-white font-mono block leading-none">
                    {{ formatCurrency(grupo.totalClasse) }}
                  </span>
                  <span class="inline-block mt-2 text-[10px] font-black text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-tighter">
                    Atual: {{ grupo.percentualAtual }}%
                  </span>
                </div>
              </div>

              <div class="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                <div 
                  class="h-full transition-all duration-1000 ease-out"
                  :class="parseFloat(grupo.percentualAtual) > parseFloat(grupo.target) ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'"
                  :style="{ width: `${Math.min(grupo.percentualAtual, 100)}%` }"
                ></div>
                
                <div 
                  class="absolute top-0 h-full w-0.5 bg-white z-20 shadow-[0_0_8px_white]"
                  :style="{ left: `${grupo.target}%` }"
                ></div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/30">
                    <th class="px-8 py-5">Ativo</th>
                    <th class="px-8 py-5">Instituição</th>
                    <th class="px-8 py-5 text-right">Qtd</th>
                    <th class="px-8 py-5 text-right">Cotação</th>
                    <th class="px-8 py-5 text-right font-bold text-emerald-500/80">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/30">
                  <tr v-for="item in grupo.itens" :key="item.ativo" class="hover:bg-slate-800/20 transition-all group">
                    <td class="px-8 py-5">
                      <div class="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                        {{ item.ativo || '---' }}
                      </div>
                      <div class="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{{ item.description }}</div>
                    </td>
                    <td class="px-8 py-5 text-[11px] text-slate-400 uppercase tracking-tighter">{{ item.corretora }}</td>
                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400">{{ item.quantidade }}</td>
                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400">
                      {{ formatCurrency(item.cotacao_atual_brl) }}
                    </td>
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

      <template v-else-if="!loading && assets?.length === 0">
        <div class="flex flex-col items-center justify-center py-32 opacity-40">
          <span class="text-5xl mb-4">🔎</span>
          <p class="text-white font-bold tracking-[0.3em] uppercase text-xs">Nenhum ativo encontrado na carteira.</p>
        </div>
      </template>

    </AsyncLoader>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue';
import html2pdf from 'html2pdf.js';

const { data: assets, loading, error } = useApi('/assets/patrimonio');

const totalGeral = computed(() => {
  if (!assets.value) return 0;
  return assets.value.reduce((sum, item) => sum + parseFloat(item.valor_mercado_brl || 0), 0);
});

const patrimonioAgrupado = computed(() => {
  if (!assets.value) return {};
  const total = totalGeral.value;
  
  return assets.value.reduce((acc, item) => {
    const cls = item.classe || 'Diversos';
    if (!acc[cls]) {
      acc[cls] = { 
        itens: [], 
        totalClasse: 0, 
        target: item.target || 0 
      };
    }
    acc[cls].itens.push(item);
    acc[cls].totalClasse += parseFloat(item.valor_mercado_brl || 0);
    acc[cls].percentualAtual = total > 0 ? ((acc[cls].totalClasse / total) * 100).toFixed(1) : 0;
    return acc;
  }, {});
});

const getStatusColor = (atual, alvo) => {
  const diff = atual - alvo;
  if (Math.abs(diff) <= 1.5) return 'text-emerald-500'; 
  return diff > 0 ? 'text-orange-500' : 'text-rose-500';
};

const formatCurrency = (v) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
};

const generatePDF = () => {
  const element = document.getElementById('report-container');
  const opt = {
    margin: 5,
    filename: 'K-Portfolio-Ativos.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f111a' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
};
</script>

<style scoped>
.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
@media print {
  .no-print { display: none !important; }
}
</style>
