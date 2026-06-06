<template>
  <div class="w-full text-slate-200">
    
    <div class="w-full bg-[#1a1d2b] border border-slate-800/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print mb-6 shadow-md">
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight">Relatório de Rendimentos</h1>
        <p class="text-slate-500 text-xs italic mt-0.5">Histórico consolidador de fluxo de caixa</p>
      </div>
      
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <select 
          v-model="selectedMonth" 
          class="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
        >
          <option v-for="m in months" :key="m.value" :value="m.value" class="bg-[#0a0f18] text-slate-300">
            {{ m.label }}
          </option>
        </select>
        
        <select 
          v-model="selectedYear" 
          class="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
        >
          <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y" class="bg-[#0a0f18] text-slate-300">
            {{ y }}
          </option>
        </select>

        <button 
          @click="filtrarPeriodo" 
          :disabled="loading" 
          class="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#0a0f18] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
        >
          Filtrar
        </button>

        <button 
          @click="generatePDF" 
          :disabled="isExporting || loading || !dadosProcessados?.totalGeneral" 
          class="flex items-center gap-2 bg-[#1c2030] border border-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:bg-[#252a3d] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium"
        >
          <template v-if="isExporting">
            <svg class="animate-spin h-3.5 w-3.5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Gerando...</span>
          </template>
          <template v-else>
            <span class="text-emerald-500">📄</span> 
            <span>Exportar PDF</span>
          </template>
        </button>
      </div>
    </div>

    <AsyncLoader :loading="loading" :error="!!error">
      
      <div v-if="!loading && dadosProcessados && dadosProcessados.totalGeneral >= 0" id="report-container" class="max-w-[1400px] mx-auto space-y-8">
        
        <div class="bg-[#1a1d2b] rounded-xl p-8 border border-slate-800/50 relative overflow-hidden shadow-2xl total-card">
          <div class="relative z-10">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Geral Recebido no Período</p>
            <h2 class="text-4xl font-bold text-white tracking-tighter total-val-text">
              {{ formatCurrency(dadosProcessados.totalGeneral) }}
            </h2>
          </div>
          <div class="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block icon-box">
             <div class="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm">
               <span class="text-3xl opacity-80">💰</span>
             </div>
          </div>
        </div>

        <div v-if="dadosProcessados.totalGeneral > 0" class="space-y-10 pb-10">
          <section 
            v-for="(classGroup, classId) in dadosProcessados.classes" 
            :key="classId" 
            class="bg-[#1a1d2b] rounded-xl border border-slate-800/50 overflow-hidden shadow-sm section-block"
          >
            <div class="px-8 py-5 border-b border-slate-800/50 bg-[#1c2030] flex justify-between items-center header-block">
              <div class="flex items-center gap-4">
                <div class="w-1.5 h-8 bg-emerald-500 rounded-full indicator-bar shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                <h3 class="font-bold text-white text-lg uppercase tracking-tight class-title">📁 {{ classGroup.className }}</h3>
              </div>
              <div class="text-right">
                <span class="text-base font-bold text-white font-mono block class-total-text">
                  Subtotal: {{ formatCurrency(classGroup.classTotal) }}
                </span>
              </div>
            </div>

            <div class="p-6 space-y-6 broker-wrapper-block">
              <div 
                v-for="(brokerGroup, brokerId) in classGroup.brokers" 
                :key="brokerId" 
                class="bg-slate-900/30 border border-slate-800/40 rounded-lg p-5 broker-sub-card"
              >
                <div class="flex justify-between items-center mb-4 border-b border-slate-800/30 pb-2 broker-header-row">
                  <h4 class="text-sm font-bold text-slate-400 flex items-center gap-2 broker-title">
                    <span>🏦</span> {{ brokerGroup.brokerName }}
                  </h4>
                  <span class="text-sm font-mono font-bold text-emerald-400 broker-total-val">
                    {{ formatCurrency(brokerGroup.brokerTotal) }}
                  </span>
                </div>

                <div class="overflow-x-auto pdf-table-wrapper">
                  <table class="w-full text-left border-collapse table-fixed-layout">
                    <thead>
                      <tr class="text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/30 table-header-row">
                        <th class="pb-3 col-ativo font-semibold">Ativo</th>
                        <th class="pb-3 col-tipo text-center font-semibold">Tipo</th>
                        <th class="pb-3 col-qtd text-right font-semibold">Quantidade</th>
                        <th class="pb-3 col-val text-right font-semibold text-emerald-500/80">Valor Recebido</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/20 table-body">
                      <tr v-for="asset in brokerGroup.assets" :key="asset.eventId" class="hover:bg-slate-800/10 transition-all group table-row">
                        <td class="py-3 col-ativo cell-data">
                          <div class="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight asset-ticker">
                            {{ asset.ticker }}
                          </div>
                          <div class="text-[10px] text-slate-500 font-medium uppercase mt-0.5 max-w-xs truncate asset-desc">
                            {{ asset.assetName || '---' }}
                          </div>
                        </td>
                        <td class="py-3 text-center col-tipo cell-data">
                          <span class="bg-slate-800 border border-slate-700/50 text-slate-400 font-black text-[9px] px-2 py-0.5 rounded tracking-wide type-tag">
                            {{ asset.eventType }}
                          </span>
                        </td>
                        <td class="py-3 text-right font-mono text-xs text-slate-400 col-qtd cell-data numeric-text">
                          {{ formatQty(asset.quantityReceived) }}
                        </td>
                        <td class="py-3 text-right font-mono font-bold text-emerald-400 col-val cell-data highlight-money">
                          {{ formatCurrency(asset.amountTotal) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </section>
        </div>

        <div v-else class="border border-slate-800/40 border-dashed rounded-xl p-16 text-center text-slate-500">
          <span class="text-4xl block mb-3">📭</span>
          <p class="text-sm font-medium tracking-wide">Nenhum provento ou evento corporativo liquidado nesta competência.</p>
        </div>

      </div>
    </AsyncLoader>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue';
import html2pdf from 'html2pdf.js';

// Inicialização reativa dos filtros
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const isExporting = ref(false);

const months = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
];

// Cálculo de intervalo temporal para as rotas parametrizadas do K-Portfolio
const extrairParametrosDatas = (mes, ano) => {
  const mesFormatado = String(mes).padStart(2, '0');
  const inicio = `${ano}-${mesFormatado}-01`;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const termino = `${ano}-${mesFormatado}-${String(ultimoDia).padStart(2, '0')}`;
  return { inicio, termino };
};

const datasIniciais = extrairParametrosDatas(selectedMonth.value, selectedYear.value);

// URL reativa inicial
const urlFiltro = ref(`/assets/Dividendos/${datasIniciais.inicio}/${datasIniciais.termino}`);

// 🔥 CAPTURA DA FUNÇÃO FETCHDATA:
// Destestruturamos 'fetchData' de dentro do seu useApi oficial para chamá-lo sob demanda
const { data: reportData, loading, error, fetchData } = useApi(urlFiltro);

// Função do botão Filtrar -> Atualiza a string reativa e executa o disparo manual
const filtrarPeriodo = () => {
  const { inicio, termino } = extrairParametrosDatas(selectedMonth.value, selectedYear.value);
  urlFiltro.value = `/assets/Dividendos/${inicio}/${termino}`;
  
  // 🔥 Executa o re-fetch imediato com a nova URL
  fetchData();
};

// Mapeamento e normalização inteligente da resposta da API
const dadosProcessados = computed(() => {
  if (!reportData.value) {
    return { totalGeneral: 0, classes: {} };
  }

  // Se o backend já retornar o formato aninhado completo
  if (reportData.value.classes && reportData.value.totalGeneral !== undefined) {
    return reportData.value;
  }

  // Fallback caso seja uma lista plana vinda do banco relacional
  const listaBruta = Array.isArray(reportData.value) ? reportData.value : [];
  
  let totalGeral = 0;
  const classesAgrupadas = {};

  listaBruta.forEach(item => {
    const valor = parseFloat(item.amountTotal || item.valor || 0);
    totalGeral += valor;

    const classeNome = item.className || item.classe || 'Outros';
    const corretoraNome = item.brokerName || item.corretora || 'Não Informada';

    if (!classesAgrupadas[classeNome]) {
      classesAgrupadas[classeNome] = {
        className: classeNome,
        classTotal: 0,
        brokers: {}
      };
    }
    classesAgrupadas[classeNome].classTotal += valor;

    if (!classesAgrupadas[classeNome].brokers[corretoraNome]) {
      classesAgrupadas[classeNome].brokers[corretoraNome] = {
        brokerName: corretoraNome,
        brokerTotal: 0,
        assets: []
      };
    }
    classesAgrupadas[classeNome].brokers[corretoraNome].brokerTotal += valor;

    classesAgrupadas[classeNome].brokers[corretoraNome].assets.push({
      eventId: item.eventId || item.id || Math.random().toString(),
      ticker: item.ticker || item.ativo || '---',
      assetName: item.assetName || item.descricao || '---',
      eventType: item.eventType || item.tipo || 'Rendimento',
      quantityReceived: parseFloat(item.quantityReceived || item.quantidade || 0),
      amountTotal: valor
    });
  });

  return {
    totalGeneral: totalGeral,
    classes: classesAgrupadas
  };
});

// Formatadores visuais padrão BRL
const formatCurrency = (v) => {
  if (v === undefined || v === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
};

const formatQty = (v) => {
  if (!v) return '0,00';
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(v);
};

// GERADOR DE PDF CUSTOMIZADO (Conversão Dark -> White Mode)
const generatePDF = () => {
  const originalElement = document.getElementById('report-container');
  if (!originalElement) return;

  isExporting.value = true;

  const clonedElement = originalElement.cloneNode(true);
  clonedElement.querySelectorAll('.no-print').forEach(el => el.remove());

  clonedElement.style.width = '840px'; 
  clonedElement.style.maxWidth = '840px';
  clonedElement.style.padding = '15px';
  clonedElement.style.margin = '0';

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
    section.style.marginBottom = '24px';
    section.style.pageBreakInside = 'auto';
    section.style.breakInside = 'auto';

    const headerBlock = section.querySelector('.header-block');
    if (headerBlock) {
      headerBlock.style.backgroundColor = '#f1f5f9';
      headerBlock.style.borderColor = '#cbd5e1';
      headerBlock.style.padding = '1rem 1.25rem';
      headerBlock.style.pageBreakAfter = 'avoid';
      headerBlock.style.breakAfter = 'avoid';
      
      const classTitle = headerBlock.querySelector('.class-title');
      if (classTitle) classTitle.style.color = '#0f172a';

      const classTotalText = headerBlock.querySelector('.class-total-text');
      if (classTotalText) classTotalText.style.color = '#0f172a';
    }

    section.querySelectorAll('.broker-sub-card').forEach(brokerCard => {
      brokerCard.style.backgroundColor = '#fdfdfd';
      brokerCard.style.borderColor = '#e2e8f0';
      brokerCard.style.padding = '12px';
      brokerCard.style.marginBottom = '12px';
      brokerCard.style.pageBreakInside = 'avoid';
      brokerCard.style.breakInside = 'avoid';

      const brokerHeader = brokerCard.querySelector('.broker-header-row');
      if (brokerHeader) brokerHeader.style.borderColor = '#e2e8f0';

      const brokerTitle = brokerCard.querySelector('.broker-title');
      if (brokerTitle) brokerTitle.style.color = '#475569';

      const brokerTotalVal = brokerCard.querySelector('.broker-total-val');
      if (brokerTotalVal) brokerTotalVal.style.color = '#059669';

      const tableWrapper = brokerCard.querySelector('.pdf-table-wrapper');
      if (tableWrapper) {
        tableWrapper.style.overflowX = 'visible';
        tableWrapper.style.width = '100%';
      }

      const table = brokerCard.querySelector('.table-fixed-layout');
      if (table) {
        table.style.tableLayout = 'fixed';
        table.style.width = '100%';
        table.style.minWidth = '100%';

        const thRow = table.querySelector('.table-header-row');
        if (thRow) {
          thRow.style.borderColor = '#cbd5e1';
          thRow.querySelectorAll('th').forEach(th => {
            th.style.color = '#475569';
          });
        }

        table.querySelectorAll('.table-row').forEach((row, rowIndex) => {
          row.style.borderColor = '#e2e8f0';
          row.style.pageBreakInside = 'avoid';
          row.style.breakInside = 'avoid';

          if (rowIndex % 2 === 1) {
            row.style.backgroundColor = '#f8fafc';
          }

          row.querySelectorAll('.cell-data').forEach(cell => {
            cell.style.paddingLeft = '6px';
            cell.style.paddingRight = '6px';
            cell.style.paddingTop = '0.6rem';
            cell.style.paddingBottom = '0.6rem';
            cell.style.fontSize = '11px';
            cell.style.color = '#334155';
          });

          const assetTicker = row.querySelector('.asset-ticker');
          if (assetTicker) assetTicker.style.color = '#0f172a';

          const assetDesc = row.querySelector('.asset-desc');
          if (assetDesc) assetDesc.style.color = '#64748b';

          const typeTag = row.querySelector('.type-tag');
          if (typeTag) {
            typeTag.style.backgroundColor = '#e2e8f0';
            typeTag.style.borderColor = '#cbd5e1';
            typeTag.style.color = '#475569';
          }

          const numericTexts = row.querySelectorAll('.numeric-text');
          numericTexts.forEach(nt => { nt.style.color = '#475569'; });

          const highlightMoney = row.querySelector('.highlight-money');
          if (highlightMoney) highlightMoney.style.color = '#059669';
        });

        table.querySelectorAll('.col-ativo').forEach(el => el.style.width = '35%');
        table.querySelectorAll('.col-tipo').forEach(el => el.style.width = '15%');
        table.querySelectorAll('.col-qtd').forEach(el => el.style.width = '25%');
        table.querySelectorAll('.col-val').forEach(el => el.style.width = '25%');
      }
    });
  });

  const opt = {
    margin: [12, 10, 12, 10],
    filename: `K-Portfolio-Rendimentos-${selectedYear.value}-${selectedMonth.value}.pdf`,
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

  html2pdf()
    .set(opt)
    .from(clonedElement)
    .save()
    .then(() => {
      clonedElement.remove();
      isExporting.value = false;
    })
    .catch((err) => {
      console.error('Falha interna ao gerar arquivo PDF:', err);
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

.col-ativo { width: 35%; }
.col-tipo  { width: 15%; }
.col-qtd   { width: 25%; }
.col-val   { width: 25%; }

@media print {
  .no-print { display: none !important; }
}
</style>