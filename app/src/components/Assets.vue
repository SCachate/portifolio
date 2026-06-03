<template>
  <div class="w-full">
    <AsyncLoader :loading="loading" :error="!!error">
      
      <div 
        v-if="!loading && assets && assets.length > 0" 
        id="report-container" 
        ref="pdfContainer"
        class="max-w-[1400px] mx-auto space-y-10"
      >
        
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

        <div class="bg-[#1a1d2b] rounded-xl p-8 border border-slate-800/50 relative overflow-hidden shadow-2xl total-card">
          <div class="relative z-10">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Valor Total de Mercado</p>
            <h2 class="text-4xl font-bold text-white tracking-tighter">
              {{ formatCurrency(totalGeral) }}
            </h2>
          </div>
          <div class="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block icon-box">
             <div class="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm">
               <span class="text-3xl opacity-80">📊</span>
             </div>
          </div>
        </div>

        <div class="space-y-12 pb-10">
          <section v-for="(grupo, classe) in patrimonioAgrupado" :key="classe" class="bg-[#1a1d2b] rounded-xl border border-slate-800/50 overflow-hidden shadow-sm section-block">
            
            <div class="px-8 py-6 border-b border-slate-800/50 bg-[#1c2030] header-block">
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
                    Atual: {{ grupo.percentualAtual.toFixed(1) }}%
                  </span>
                </div>
              </div>

              <div class="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                <div 
                  class="h-full transition-all duration-1000 ease-out"
                  :class="grupo.percentualAtual > grupo.target ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'"
                  :style="{ width: `${Math.min(grupo.percentualAtual, 100)}%` }"
                ></div>
                
                <div 
                  class="absolute top-0 h-full w-0.5 bg-white z-20 shadow-[0_0_8px_white]"
                  :style="{ left: `${grupo.target}%` }"
                ></div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full pdf-table">
                <thead>
                  <tr class="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/30">
                    <th class="px-8 py-5 cell-ativo">Ativo</th>
                    <th class="px-8 py-5 cell-inst">Instituição</th>
                    <th class="px-8 py-5 text-right font-bold text-emerald-500/80 cell-val">Valor</th>
                    <th class="px-8 py-5 text-right cell-qtd">Quantidade</th>
                    <th class="px-8 py-5 text-right cell-pm">Preço Médio</th>
                    <th class="px-8 py-5 text-right cell-cot">Cotação</th>
                    <th class="px-8 py-5 text-right cell-res">Resultado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/30">
                  <tr v-for="item in grupo.itens" :key="item.ativo" class="hover:bg-slate-800/20 transition-all group">
                    
                    <td class="px-8 py-5 cell-ativo">
                      <div class="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                        {{ item.ativo || '---' }}
                      </div>
                      <div class="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{{ item.description }}</div>
                    </td>
                    
                    <td class="px-8 py-5 text-[11px] text-slate-400 uppercase tracking-tighter cell-inst">{{ item.corretora }}</td>
                    
                    <td class="px-8 py-5 text-right cell-val">
                      <span class="font-bold text-white" :class="{'text-rose-500': item.valor_mercado_brl < 0}">
                        {{ formatCurrency(item.valor_mercado_brl) }}
                      </span>
                    </td>

                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 cell-qtd">
                      {{ item.quantidade ? Number(item.quantidade).toFixed(2) : '0.00' }}
                    </td>
                    
                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 cell-pm">
                      {{ formatCurrency(item.preco_medio_brl) }}
                    </td>

                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 cell-cot">
                      {{ formatCurrency(item.cotacao_atual_brl) }}
                    </td>
                    
                    <td class="px-8 py-5 text-right font-mono text-[12px] cell-res">
                      <span 
                        v-if="item.preco_medio_brl && item.preco_medio_brl > 0"
                        :class="((item.cotacao_atual_brl / item.preco_medio_brl) - 1) * 100 >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                      >
                        {{ (((item.cotacao_atual_brl / item.preco_medio_brl) - 1) * 100).toFixed(2) }}%
                      </span>
                      <span v-else class="text-slate-600">---</span>
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
import { computed, ref } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue';
import html2pdf from 'html2pdf.js';

const { data: assets, loading, error } = useApi('/assets/patrimonio');
const pdfContainer = ref(null);

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
        target: Number(item.target || 0),
        percentualAtual: 0
      };
    }
    acc[cls].itens.push(item);
    acc[cls].totalClasse += parseFloat(item.valor_mercado_brl || 0);
    acc[cls].percentualAtual = total > 0 ? (acc[cls].totalClasse / total) * 100 : 0;
    return acc;
  }, {});
});

const getStatusColor = (atual, alvo) => {
  const diff = atual - alvo;
  if (Math.abs(diff) <= 1.5) return 'text-emerald-500'; 
  return diff > 0 ? 'text-orange-500' : 'text-rose-500';
};

const formatCurrency = (v) => {
  if (v === undefined || v === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
};

const generatePDF = () => {
  const element = pdfContainer.value;
  if (!element) return;

  // 🌟 TRUQUE CORPORATIVO: Injetamos uma classe de exportação no elemento antes do print
  element.classList.add('exporting-pdf');

  const opt = {
    margin: [12, 8, 12, 8],
    filename: 'K-Portfolio-Ativos.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#0f111a',
      logging: false,
      letterRendering: true,
      windowWidth: 1250 // Força o motor a criar uma área virtual ampla para que as colunas caibam
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Executamos o html2pdf e removemos a classe logo a seguir para o utilizador não notar alteração no ecrã
  html2pdf().set(opt).from(element).toPdf().get('pdf').then(() => {
    element.classList.remove('exporting-pdf');
  }).save();
};
</script>

<style scoped>
.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

@media print {
  .no-print { 
    display: none !important; 
  }
  
  #report-container {
    width: 100% !important;
    max-w-full !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .section-block {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 20px !important;
  }

  .header-block {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }

  .pdf-table {
    table-layout: fixed !important;
    width: 100% !important;
  }

  /* Redefinição de paddings internos para comprimir a tabela horizontalmente no papel */
  .pdf-table th, 
  .pdf-table td {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
    word-break: break-word !important;
    white-space: normal !important;
  }

  /* Distribuição proporcional exata das colunas para evitar estouro da margem direita */
  .cell-ativo { width: 18% !important; }
  .cell-inst  { width: 16% !important; }
  .cell-val   { width: 15% !important; }
  .cell-qtd   { width: 12% !important; }
  .cell-pm    { width: 13% !important; }
  .cell-cot   { width: 13% !important; }
  .cell-res   { width: 13% !important; }
}
</style>