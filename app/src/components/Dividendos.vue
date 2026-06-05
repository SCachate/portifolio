<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

// Estado reativo dos filtros e dados operacionais
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const reportData = ref({ totalGeneral: 0, classes: {} });
const loading = ref(false);
const reportContainer = ref(null);

const months = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
];

// Busca os dados baseados no mês e ano operando com a rota parametrizada
const fetchReport = async () => {
  loading.value = true;
  try {
    const ano = selectedYear.value;
    const mesFormatado = String(selectedMonth.value).padStart(2, '0');
    
    const inicio = `${ano}-${mesFormatado}-01`;
    const ultimoDia = new Date(ano, selectedMonth.value, 0).getDate();
    const termino = `${ano}-${mesFormatado}-${String(ultimoDia).padStart(2, '0')}`;

    // Chamada idêntica à sua estrutura de roteamento do Express (/Dividendos/:inicio/:termino)
    const response = await axios.get(`/api/Dividendos/${inicio}/${termino}`);
    reportData.value = response.data;
  } catch (error) {
    console.error("Erro ao processar dados no ecossistema K-Portfolio:", error);
  } finally {
    loading.value = false;
  }
};

// Chaveamento dinâmico para renderização em White Mode para o arquivo físico
const exportToPDF = () => {
  const element = reportContainer.value;
  element.classList.add('pdf-printing');

  const opt = {
    margin:       [12, 12, 12, 12],
    filename:     `K-Portfolio_Rendimentos_${selectedYear.value}_${String(selectedMonth.value).padStart(2, '0')}.pdf`,
    image:        { type: 'jpeg', quality: 0.99 },
    html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => element.classList.remove('pdf-printing'))
    .catch((err) => {
      console.error("Falha ao compilar relatório PDF:", err);
      element.classList.remove('pdf-printing');
    });
};

// Formatadores com o padrão monetário nacional e precisão fracionária da B3
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatQty = (value) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value);
};

onMounted(fetchReport);
</script>

<template>
  <div class="space-y-6 text-slate-200">
    
    <div class="w-full bg-[#0a0f18] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="text-sm font-medium text-slate-400">
        Selecione o período para consolidação dos proventos point-in-time.
      </div>
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <select 
          v-model="selectedMonth" 
          class="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
        >
          <option v-for="m in months" :key="m.value" :value="m.value" class="bg-[#0a0f18] text-slate-200">{{ m.label }}</option>
        </select>
        
        <select 
          v-model="selectedYear" 
          class="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
        >
          <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y" class="bg-[#0a0f18] text-slate-200">{{ y }}</option>
        </select>

        <button 
          @click="fetchReport" 
          :disabled="loading" 
          class="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#0a0f18] font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
        >
          Filtrar
        </button>

        <button 
          @click="exportToPDF" 
          :disabled="loading || !reportData.totalGeneral" 
          class="bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-40 border border-red-500/20 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
        >
          📄 PDF
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-3">
      <div class="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p class="text-xs text-slate-500 font-mono italic">Mapeando alocações na custódia...</p>
    </div>

    <div v-else ref="reportContainer" class="space-y-6 report-container-root">
      
      <div class="pdf-header-wrapper hidden">
        <div class="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-6">
          <div>
            <h1 class="text-xl font-black text-slate-900 tracking-tight">K-PORTFOLIO</h1>
            <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Extrato Consolidado de Proventos</p>
          </div>
          <div class="text-right text-xs font-mono text-slate-600">
            Competência: {{ months.find(m => m.value === selectedMonth).label }} / {{ selectedYear }}
          </div>
        </div>
      </div>

      <div v-if="!reportData.totalGeneral" class="border border-white/5 border-dashed rounded-2xl p-12 text-center text-slate-500">
        <span class="text-3xl block mb-2">📭</span>
        <p class="text-sm font-medium">Nenhum rendimento ou dividendo distribuído para a sua custódia neste mês.</p>
      </div>

      <div 
        v-for="(classGroup, classId) in reportData.classes" 
        :key="classId" 
        class="bg-[#0a0f18] border border-white/5 rounded-2xl p-6 border-l-4 border-l-emerald-500 shadow-sm page-break-avoid"
      >
        <div class="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <span class="text-emerald-500/70">📁</span> {{ classGroup.className }}
          </h3>
          <span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-3 py-1 rounded-full font-bold text-xs">
            Subtotal: {{ formatCurrency(classGroup.classTotal) }}
          </span>
        </div>

        <div v-for="(brokerGroup, brokerId) in classGroup.brokers" :key="brokerId" class="mb-6 last:mb-0 bg-white/[0.01] border border-white/5 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-slate-400 flex items-center gap-2">
              <span>🏦</span> {{ brokerGroup.brokerName }}
            </h4>
            <span class="text-xs font-mono font-bold text-emerald-500">
              {{ formatCurrency(brokerGroup.brokerTotal) }}
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th class="pb-2 font-semibold">Ativo</th>
                  <th class="pb-2 font-semibold text-center">Tipo</th>
                  <th class="pb-2 font-semibold text-right">Quantidade (Cotas)</th>
                  <th class="pb-2 font-semibold text-right">Valor Recebido</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="asset in brokerGroup.assets" :key="asset.eventId" class="text-sm text-slate-300 group">
                  <td class="py-3 pr-4">
                    <div class="font-bold text-white tracking-wide">{{ asset.ticker }}</div>
                    <div class="text-[11px] text-slate-500 max-w-xs truncate mt-0.5">{{ asset.assetName }}</div>
                  </td>
                  <td class="py-3 text-center">
                    <span class="bg-white/5 border border-white/5 text-slate-400 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wide">
                      {{ asset.eventType }}
                    </span>
                  </td>
                  <td class="py-3 text-right font-mono text-xs text-slate-400">
                    {{ formatQty(asset.quantityReceived) }}
                  </td>
                  <td class="py-3 text-right font-mono font-bold text-emerald-400">
                    {{ formatCurrency(asset.amountTotal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="reportData.totalGeneral" class="bg-slate-950 border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-lg page-break-avoid">
        <div class="text-sm font-bold uppercase tracking-wider text-slate-400">TOTAL CONSOLIDADO RECEBIDO</div>
        <div class="text-2xl font-black font-mono text-emerald-400 tracking-tight">
          {{ formatCurrency(reportData.totalGeneral) }}
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Controle de quebras de página nativas do gerador de PDF */
.page-break-avoid { page-break-inside: avoid; }

/* =======================================================
   INVERSÃO DINÂMICA DE DESIGN - CONVERSÃO PARA WHITE MODE
   ======================================================= */
.report-container-root.pdf-printing {
  background: #ffffff !important;
  color: #0f172a !important;
  padding: 0mm !important;
}

/* Força a exibição do título exclusivo de impressão */
.report-container-root.pdf-printing .pdf-header-wrapper {
  display: block !important;
}

/* Adapta os cards de classe para fundo branco e contorno cinza */
.report-container-root.pdf-printing .page-break-avoid {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  border-left: 5px solid #059669 !important; /* Mantém a identidade esmeralda em tom impresso */
  box-shadow: none !important;
  color: #0f172a !important;
  padding: 14px !important;
  margin-bottom: 20px !important;
}

.report-container-root.pdf-printing .border-b {
  border-bottom-color: #cbd5e1 !important;
}

.report-container-root.pdf-printing h3,
.report-container-root.pdf-printing h4,
.report-container-root.pdf-printing .text-white {
  color: #0f172a !important;
}

/* Emblema de subtotal da classe */
.report-container-root.pdf-printing .total-badge {
  background: #e2e8f0 !important;
  color: #047857 !important;
  border-color: #cbd5e1 !important;
}

/* Caixa das corretoras */
.report-container-root.pdf-printing .bg-white\/\[0\.01\] {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

.report-container-root.pdf-printing .text-slate-400 {
  color: #475569 !important;
}

/* Tratamento da tabela de ativos */
.report-container-root.pdf-printing th {
  color: #64748b !important;
  border-bottom: 1px solid #cbd5e1 !important;
}

.report-container-root.pdf-printing td,
.report-container-root.pdf-printing .divide-y tr {
  border-bottom-color: #e2e8f0 !important;
  color: #334155 !important;
}

.report-container-root.pdf-printing .text-slate-500 {
  color: #64748b !important;
}

.report-container-root.pdf-printing .type-tag {
  background: #e2e8f0 !important;
  color: #475569 !important;
  border-color: #cbd5e1 !important;
}

.report-container-root.pdf-printing .highlight-money,
.report-container-root.pdf-printing .text-emerald-400 {
  color: #059669 !important;
}

/* Adaptação do rodapé geral de totalização */
.report-container-root.pdf-printing .bg-slate-950 {
  background: #f1f5f9 !important;
  border: 2px solid #0f172a !important;
  color: #0f172a !important;
}

.report-container-root.pdf-printing .text-emerald-400 {
  color: #047857 !important;
}
</style>