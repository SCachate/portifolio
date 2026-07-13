<template>
  <div class="w-full">
    <AsyncLoader :loading="loading" :error="!!error">
      
      <div v-if="!loading && assets && assets.length > 0" id="report-container" class="max-w-[1400px] mx-auto space-y-10">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print mt-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Patrimônio vs Meta em {{ dataReferencia }}</h1>
            <p class="text-slate-500 text-sm italic">Análise de rebalanceamento estratégico</p>
          </div>
          
          <button 
            @click="generatePDF" 
            :disabled="isExporting"
            class="flex items-center gap-2 bg-[#1a1d2b] border border-slate-800 text-slate-300 px-4 py-2 rounded-md hover:bg-[#252a3d] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-sm font-medium"
          >
            <template v-if="isExporting">
              <svg class="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Gerando Relatório...</span>
            </template>
            <template v-else>
              <span class="text-emerald-500">📄</span> 
              <span>Exportar PDF</span>
            </template>
          </button>
        </div>

        <div class="bg-[#1a1d2b] rounded-xl p-8 border border-slate-800/50 relative overflow-hidden shadow-2xl total-card">
          <div class="relative z-10">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Valor Total de Mercado</p>
            <h2 class="text-4xl font-bold text-white tracking-tighter total-val-text">
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
                  <div class="w-1.5 h-10 bg-emerald-500 rounded-full indicator-bar shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                  <div>
                    <h3 class="font-bold text-white text-xl uppercase tracking-tight class-title">{{ classe }}</h3>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 meta-text">
                      Meta: {{ grupo.target }}% | 
                      <span :class="getStatusColor(grupo.percentualAtual, grupo.target)" class="diff-text">
                        Diferença: {{ (grupo.percentualAtual - grupo.target).toFixed(1) }}%
                      </span>
                    </p>
                  </div>
                </div>
                
                <div class="text-right">
                  <span class="text-xl font-bold text-white font-mono block leading-none class-total-text">
                    {{ formatCurrency(grupo.totalClasse) }}
                  </span>
                  <span class="inline-block mt-2 text-[10px] font-black text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-tighter badge-atual">
                    Atual: {{ grupo.percentualAtual.toFixed(1) }}%
                  </span>
                </div>
              </div>

              <div class="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 progress-bg">
                <div 
                  class="h-full transition-all duration-1000 ease-out progress-bar"
                  :class="grupo.percentualAtual > grupo.target ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'"
                  :style="{ width: `${Math.min(grupo.percentualAtual, 100)}%` }"
                ></div>
                
                <div 
                  class="absolute top-0 h-full w-0.5 bg-white z-20 target-line shadow-[0_0_8px_white]"
                  :style="{ left: `${grupo.target}%` }"
                ></div>
              </div>
            </div>

            <div class="overflow-x-auto pdf-table-wrapper">
              <table class="w-full min-w-[900px] md:min-w-0 table-fixed-layout">
                <thead>
                  <tr class="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/30 table-header-row">
                    <th class="px-8 py-5 col-ativo">Ativo</th>
                    <th class="px-8 py-5 col-inst">Instituição</th>
                    <th class="px-8 py-5 text-right font-bold text-emerald-500/80 col-val">Valor</th>
                    <th class="px-8 py-5 text-right col-qtd">Quantidade</th>
                    <th class="px-8 py-5 text-right col-pm">Preço Médio</th>
                    <th class="px-8 py-5 text-right col-cot">Cotação</th>
                    <th class="px-8 py-5 text-right col-res">Resultado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/30 table-body">
                  <tr v-for="item in grupo.itens" :key="item.ativo" class="hover:bg-slate-800/20 transition-all group table-row">
                    
                    <td class="px-8 py-5 col-ativo cell-data">
                      <div class="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight asset-ticker">
                        {{ item.ativo || '---' }}
                      </div>
                      <div class="text-[10px] text-slate-500 font-medium uppercase mt-0.5 asset-desc">{{ item.description }}</div>
                    </td>
                    
                    <td class="px-8 py-5 text-[11px] text-slate-400 uppercase tracking-tighter col-inst cell-data inst-text">{{ item.corretora }}</td>
                    
                    <td class="px-8 py-5 text-right col-val cell-data val-text">
                      <span class="font-bold text-white" :class="item.valor_mercado_brl < 0 ? 'text-rose-500 custom-negative' : 'custom-positive'">
                        {{ formatCurrency(item.valor_mercado_brl) }}
                      </span>
                    </td>

                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 col-qtd cell-data numeric-text">
                      {{ item.quantidade ? Number(item.quantidade).toFixed(2) : '0.00' }}
                    </td>
                    
                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 col-pm cell-data numeric-text">
                      {{ formatCurrency(item.preco_medio_brl) }}
                    </td>

                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 col-cot cell-data numeric-text">
                      {{ formatCurrency(item.cotacao_atual_brl) }}
                    </td>
                    
                    <td class="px-8 py-5 text-right font-mono text-[12px] col-res cell-data result-cell">
                      <span 
                        v-if="item.preco_medio_brl && item.preco_medio_brl > 0"
                        :class="((item.cotacao_atual_brl / item.preco_medio_brl) - 1) * 100 >= 0 ? 'text-emerald-400 custom-positive-pct' : 'text-rose-400 custom-negative-pct'"
                      >
                        {{ (((item.cotacao_atual_brl / item.preco_medio_brl) - 1) * 100).toFixed(2) }}%
                      </span>
                      <span v-else class="text-slate-600 null-text">---</span>
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

// Estado reativo para controlar o feedback de carregamento da exportação
const isExporting = ref(false);

const dataReferencia = computed(() => {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  return `${mes}/${ano}`;
});

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
  const originalElement = document.getElementById('report-container');
  if (!originalElement) return;

  // Ativa o feedback visual imediatamente no clique
  isExporting.value = true;

  // 1. Criação do Clone para isolamento do escopo gráfico
  const clonedElement = originalElement.cloneNode(true);

  // 2. Remove componentes decorativos e botões
  clonedElement.querySelectorAll('.no-print').forEach(el => el.remove());

  // 3. Reconfiguração estrita de dimensões A4 base
  clonedElement.style.width = '840px'; 
  clonedElement.style.maxWidth = '840px';
  clonedElement.style.padding = '15px';
  clonedElement.style.margin = '0';

  // =========================================================================
  // CUSTOMIZAÇÃO DO MODO PAPER CLEAN (FONTE BRANCA -> GRAFITE)
  // =========================================================================
  
  const totalCard = clonedElement.querySelector('.total-card');
  if (totalCard) {
    totalCard.style.backgroundColor = '#f8fafc';
    totalCard.style.borderColor = '#cbd5e1';
    totalCard.style.padding = '1.5rem';
    
    const totalValText = totalCard.querySelector('.total-val-text');
    if (totalValText) totalValText.style.color = '#0f172a';
  }
  
  const iconBox = clonedElement.querySelector('.icon-box');
  if (iconBox) iconBox.remove();

  clonedElement.querySelectorAll('.section-block').forEach(section => {
    section.style.backgroundColor = '#ffffff';
    section.style.borderColor = '#cbd5e1';
    section.style.boxShadow = 'none';
    section.style.marginBottom = '20px';
    
    // 🌟 RESOLUÇÃO DO ESPAÇAMENTO EXCESSIVO: 
    // Removemos a proibição de quebra na section inteira para evitar que blocos grandes pulem de página
    section.style.pageBreakInside = 'auto';
    section.style.breakInside = 'auto';

    const headerBlock = section.querySelector('.header-block');
    if (headerBlock) {
      headerBlock.style.backgroundColor = '#f1f5f9';
      headerBlock.style.borderColor = '#cbd5e1';
      headerBlock.style.padding = '1rem 1.25rem';
      // 🌟 Evita que apenas o cabeçalho da classe fique órfão no fim de uma página
      headerBlock.style.pageBreakAfter = 'avoid';
      headerBlock.style.breakAfter = 'avoid';
      
      const classTitle = headerBlock.querySelector('.class-title');
      if (classTitle) classTitle.style.color = '#0f172a';

      const classTotalText = headerBlock.querySelector('.class-total-text');
      if (classTotalText) classTotalText.style.color = '#0f172a';

      const metaText = headerBlock.querySelector('.meta-text');
      if (metaText) metaText.style.color = '#475569';

      const badgeAtual = headerBlock.querySelector('.badge-atual');
      if (badgeAtual) {
        badgeAtual.style.backgroundColor = '#e2e8f0';
        badgeAtual.style.borderColor = '#cbd5e1';
        badgeAtual.style.color = '#334155';
      }
    }

    const progressBg = section.querySelector('.progress-bg');
    if (progressBg) {
      progressBg.style.backgroundColor = '#cbd5e1';
      progressBg.style.borderColor = '#94a3b8';
      
      const targetLine = progressBg.querySelector('.target-line');
      if (targetLine) targetLine.style.backgroundColor = '#0f172a';
    }

    const tableWrapper = section.querySelector('.pdf-table-wrapper');
    if (tableWrapper) {
      tableWrapper.style.overflowX = 'visible';
      tableWrapper.style.width = '100%';
    }

    const table = section.querySelector('.table-fixed-layout');
    if (table) {
      table.style.tableLayout = 'fixed';
      table.style.width = '100%';
      table.style.minWidth = '100%';

      const thRow = table.querySelector('.table-header-row');
      if (thRow) {
        thRow.style.borderColor = '#cbd5e1';
        // 🌟 Força o cabeçalho da tabela a não desgrudar da primeira linha
        thRow.style.pageBreakAfter = 'avoid';
        thRow.style.breakAfter = 'avoid';
        thRow.querySelectorAll('th').forEach(th => {
          th.style.color = '#475569';
        });
      }

      table.querySelectorAll('.table-row').forEach((row, rowIndex) => {
        row.style.borderColor = '#e2e8f0';
        // 🌟 Protege cada linha de ativo para não ser "cortada ao meio" horizontalmente entre páginas
        row.style.pageBreakInside = 'avoid';
        row.style.breakInside = 'avoid';

        if (rowIndex % 2 === 1) {
          row.style.backgroundColor = '#f8fafc';
        }

        row.querySelectorAll('.cell-data').forEach(cell => {
          cell.style.paddingLeft = '6px';
          cell.style.paddingRight = '6px';
          cell.style.paddingTop = '0.75rem';
          cell.style.paddingBottom = '0.75rem';
          cell.style.fontSize = '11px';
          cell.style.wordBreak = 'break-all';
          cell.style.whiteSpace = 'normal';
          cell.style.color = '#334155';
        });

        const assetTicker = row.querySelector('.asset-ticker');
        if (assetTicker) assetTicker.style.color = '#0f172a';

        const assetDesc = row.querySelector('.asset-desc');
        if (assetDesc) 285; assetDesc.style.color = '#64748b';

        const instText = row.querySelector('.inst-text');
        if (instText) instText.style.color = '#475569';

        const numericTexts = row.querySelectorAll('.numeric-text');
        numericTexts.forEach(nt => { nt.style.color = '#334155'; });

        const posElement = row.querySelector('.custom-positive');
        if (posElement) posElement.style.color = '#0f172a';

        const negElement = row.querySelector('.custom-negative');
        if (negElement) negElement.style.color = '#b91c1c';

        const posPct = row.querySelector('.custom-positive-pct');
        if (posPct) posPct.style.color = '#047857';

        const negPct = row.querySelector('.custom-negative-pct');
        if (negPct) negPct.style.color = '#b91c1c';

        const nullText = row.querySelector('.null-text');
        if (nullText) nullText.style.color = '#94a3b8';
      });

      table.querySelectorAll('.col-ativo').forEach(el => el.style.width = '16%');
      table.querySelectorAll('.col-inst').forEach(el => el.style.width = '16%');
      table.querySelectorAll('.col-val').forEach(el => el.style.width = '16%');
      table.querySelectorAll('.col-qtd').forEach(el => el.style.width = '13%');
      table.querySelectorAll('.col-pm').forEach(el => el.style.width = '13%');
      table.querySelectorAll('.col-cot').forEach(el => el.style.width = '13%');
      table.querySelectorAll('.col-res').forEach(el => el.style.width = '13%');
    }
  });

  const opt = {
    margin: [12, 10, 12, 10],
    filename: 'K-Portfolio-Ativos.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#ffffff',
      logging: false,
      letterRendering: true,
      width: 840
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Renderização assíncrona do PDF
  html2pdf()
    .set(opt)
    .from(clonedElement)
    .save()
    .then(() => {
      clonedElement.remove(); // Desaloca a cópia do DOM
      isExporting.value = false; // Desativa o Loader imediatamente após concluir o download
    })
    .catch((err) => {
      console.error('Erro ao gerar relatório:', err);
      isExporting.value = false;
    });
};
</script>

<style scoped>
.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

.table-fixed-layout {
  table-layout: fixed;
  width: 100%;
}

.col-ativo { width: 18%; }
.col-inst  { width: 16%; }
.col-val   { width: 16%; }
.col-qtd   { width: 12%; }
.col-pm    { width: 13%; }
.col-cot   { width: 13%; }
.col-res   { width: 12%; }

@media print {
  .no-print { display: none !important; }
}
</style>