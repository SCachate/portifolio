<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-white text-xl font-bold">Meu Patrimônio</h2>

      <button 
        @click="atualizarTudo" 
        :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md active:scale-95"
      >
        <svg 
          v-if="!loading"
          xmlns="http://www.w3.org/2000/svg" 
          class="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        
        <svg 
          v-else 
          class="animate-spin h-4 w-4 text-white" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>

        <span>{{ loading ? 'Atualizando...' : 'Atualizar' }}</span>
      </button>
    </div>
    
    <div class="charts-grid">
      <div class="chart-card donut-wrapper flex flex-col items-center">
        <h3 class="chart-title text-center w-full">Distribuição</h3>
        <AsyncLoader :loading="loading" :error="error" class="flex-grow-loader">
          <div class="donut-chart-box flex items-center justify-center w-full h-full overflow-hidden">
            <apexchart 
              type="donut" 
              width="100%" 
              height="250" 
              :options="chartOptions" 
              :series="series" 
            />
          </div>
        </AsyncLoader>
      </div>

      <div class="chart-card card-span-2 flex-col-container">
        <div class="header-top-row">
          <h3 class="chart-title m-0">Evolução Patrimonial</h3>
          <div class="year-navigator">
            <button 
              @click="mudarAno(-1)" 
              class="nav-btn" 
              :disabled="loadingEvolucao"
              title="Ano Anterior"
            >&lt;</button>
            <span class="year-display">{{ anoVisualizado }}</span>
            <button 
              @click="mudarAno(1)" 
              class="nav-btn" 
              :disabled="loadingEvolucao"
              title="Próximo Ano"
            >&gt;</button>
          </div>
        </div>
        
        <div class="card-body-v2">
          <AsyncLoader 
            :loading="loadingEvolucao" 
            :error="errorEvolucao" 
            class="flex-grow-loader"
          >
            <div class="chart-wrapper-dynamic">
              <apexchart 
                type="line" 
                height="100%" 
                width="100%"
                :options="evolucaoOptions" 
                :series="evolucaoSeries" 
              />
            </div>
          </AsyncLoader>
        </div>
      </div>

      <div class="chart-card">
        <AsyncLoader 
          :loading="loadingResultado" 
          :error="errorResultado" 
          class="flex-grow-loader"
        >
          <h3 class="chart-title">Resultado do Dia</h3>
          <span :class="['result-value', totaisResultado.dia >= 0 ? 'text-emerald-400' : 'text-red-400']">
            {{ formatCurrency(totaisResultado.dia) }}
          </span>
          <apexchart type="bar" height="100%" :options="getBarOptions('dia')" :series="diaSeries" />
        </AsyncLoader>
      </div>

      <div class="chart-card">
        <AsyncLoader 
          :loading="loadingResultado" 
          :error="errorResultado" 
          class="flex-grow-loader"
        >
          <h3 class="chart-title">Resultado do Mês</h3>
          <span :class="['result-value', totaisResultado.mes >= 0 ? 'text-emerald-400' : 'text-red-400']">
            {{ formatCurrency(totaisResultado.mes) }}
          </span>
          <apexchart type="bar" height="100%" :options="getBarOptions('mes')" :series="mesSeries" />
        </AsyncLoader>
      </div>

      <div class="chart-card">
        <AsyncLoader 
          :loading="loadingResultado" 
          :error="errorResultado" 
          class="flex-grow-loader"
        >
          <h3 class="chart-title">Resultado do Ano</h3>
          <span :class="['result-value', totaisResultado.ano >= 0 ? 'text-emerald-400' : 'text-red-400']">
            {{ formatCurrency(totaisResultado.ano) }}
          </span>
          <apexchart type="bar" height="100%" :options="getBarOptions('ano')" :series="anoSeries" />
        </AsyncLoader>
      </div>
    </div>
  </div>

  <ModalDetalhamento 
    v-model="modalAberto"
    :tipo="filtrosAtivos.tipo"
    :classeSelecionada="filtrosAtivos.classe"
    :listaClasses="dadosResultado?.map(i => i.classe) || []"
    @update:classe="(v) => filtrosAtivos.classe = v"
  >
    <template #default="{ periodo }">
      <p class="text-slate-400">Exibindo dados de {{ periodo.inicio }} até {{ periodo.fim }}</p>
    </template>
  </ModalDetalhamento>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue';
import ModalDetalhamento from './ModalDetalhamento.vue';

const modalAberto = ref(false);
const filtrosAtivos = ref({ classe: '', tipo: '' });

const abrirPeloGrafico = (dados) => {
  console.log("🟢 Abrindo modal para:", dados); // DEBUG
  filtrosAtivos.value = { ...dados }; // Spread para garantir nova referência
  modalAberto.value = true;
};

// 1. Lógica da Distribuição (Donut)
const { data, loading, error, fetchData: fetchResumo } = useApi(`/dashboard/resumo`);
const series = ref([]);

// 2. Lógica da Evolução (API Reativa por Ano)
const anoVisualizado = ref(new Date().getFullYear());
const urlEvolucao = computed(() => `/dashboard/evolucao?ano=${anoVisualizado.value}`);

const { 
  data: dadosEvolucao, 
  loading: loadingEvolucao, 
  error: errorEvolucao,
  fetchData: fetchEvolucao
} = useApi(urlEvolucao);

const { 
  data: dadosResultado, 
  loading: loadingResultado, 
  error: errorResultado,
  fetchData: fetchResultado
} = useApi(`/dashboard/resultado`);

const formatCurrency = (val) => {
  if (val === undefined || val === null) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const atualizarTudo = async () => {
  try {
    await Promise.all([
      fetchResumo(),
      fetchEvolucao(),
      fetchResultado()
    ]);
  } catch (error) {
    console.error("Erro na atualização global:", error);
  }
};

const evolucaoSeries = computed(() => {
  return (dadosEvolucao.value && Array.isArray(dadosEvolucao.value)) ? dadosEvolucao.value : [];
});

const mudarAno = (delta) => { 
  anoVisualizado.value += delta; 
};

const evolucaoOptions = computed(() => ({
  chart: { stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
  stroke: { width: [0, 0, 0, 0, 0, 3], curve: 'smooth' },
  colors: ['#A78BFA', '#F472B6', '#FBBF24', '#60A5FA', '#34D399', '#F87171'],
  grid: { borderColor: '#334155', strokeDashArray: 4, padding: { left: 10, right: 10, bottom: 0, top: 10 } },
  xaxis: { 
    categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    labels: { style: { colors: '#94a3b8', fontSize: '10px' } }
  },
  yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
  legend: { position: 'top', horizontalAlign: 'center', labels: { colors: '#f1f5f9' }, fontSize: '11px', offsetY: 0 },
  dataLabels: { enabled: false },
  tooltip: {
    theme: 'dark',
    shared: true,
    custom: function({ series, dataPointIndex, w }) {
      let total = 0;
      let html = `<div class="custom-tooltip-box">
                    <div class="tooltip-header">${w.globals.categoryLabels[dataPointIndex]} ${anoVisualizado.value}</div>
                    <div class="tooltip-body">`;
      w.config.series.forEach((s, idx) => {
        const val = series[idx][dataPointIndex];
        if (s.type === 'column') total += val;
        html += `<div class="tooltip-row">
                  <span class="dot" style="background:${w.globals.colors[idx]}"></span>
                  <span>${s.name}:</span>
                  <span class="value">${formatCurrency(val)}</span>
                </div>`;
      });
      html += `<div class="tooltip-total">
                  <span>TOTAL:</span>
                  <span class="text-emerald-400">${formatCurrency(total)}</span>
               </div></div></div>`;
      return html;
    }
  }
}));

const getBarOptions = (tipo) => {
  return {
    chart: { 
      toolbar: { show: false },
      parentHeightOffset: 0,
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const item = dadosResultado.value[config.dataPointIndex];
          if (item) {
            abrirPeloGrafico({
              classe: item.classe,
              tipo: tipo,
            });
          }
        }
      },
    },  
    grid: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    plotOptions: { bar: { borderRadius: 4, colors: { ranges: [{ from: -9999, to: 0, color: '#f87171' }] } } },
    colors: ['#10b981'],
    xaxis: {
      categories: dadosResultado.value?.map(item => item.classe) || [], 
      labels: { rotate: -45, style: { colors: '#94a3b8', fontSize: '10px' } }
    },
    tooltip: { theme: 'dark', y: { formatter: (val) => formatCurrency(val) } },
    yaxis: { show: false },
    dataLabels: { enabled: false }
  }
};

const diaSeries = ref([]);
const mesSeries = ref([]);
const anoSeries = ref([]);

const chartOptions = ref({
  chart: { type: 'donut' },
  labels: [],
  legend: { show: false },
  stroke: { show: false },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'TOTAL',
            color: '#94a3b8',
            formatter: function (w) {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              return `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
          },
          value: {
            show: true,
            color: '#fff',
            formatter: function (val) {
              return `R$ ${parseFloat(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
          }
        }
      }
    }
  },
  tooltip: { y: { formatter: (val) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` } }
});

watch(data, (newData) => {
  if (newData?.length > 0) {
    series.value = newData.map(item => Number(item.valor));
    chartOptions.value = { ...chartOptions.value, labels: newData.map(item => item.classe), colors: newData.map(item => item.color)};
  }
}, { immediate: true });

const totaisResultado = computed(() => {
  if (!dadosResultado.value || !Array.isArray(dadosResultado.value)) return { dia: 0, mes: 0, ano: 0 };
  return dadosResultado.value.reduce((acc, item) => {
    acc.dia += Number(item.dia) || 0;
    acc.mes += Number(item.mes) || 0;
    acc.ano += Number(item.ano) || 0;
    return acc;
  }, { dia: 0, mes: 0, ano: 0 });
});

watch(dadosResultado, (newData) => {
  if (newData && Array.isArray(newData) && newData.length > 0) {
    diaSeries.value = [{ name: 'Resultado', data: newData.map(item => item.dia) }];
    mesSeries.value = [{ name: 'Resultado', data: newData.map(item => item.mes) }];
    anoSeries.value = [{ name: 'Resultado', data: newData.map(item => item.ano) }];
  }
}, { immediate: true });
</script>

<style scoped>
.result-value { font-variant-numeric: tabular-nums; font-family: 'Inter', sans-serif; font-weight: 700; }
.charts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%; }
.chart-card { background: #1a1c24; padding: 20px; border-radius: 12px; height: 320px; display: flex; flex-direction: column; overflow: hidden; }
.card-span-2 { grid-column: span 2; }
.chart-title { color: #94a3b8; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
.flex-col-container { display: flex; flex-direction: column; }
.header-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.card-body-v2 { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.flex-grow-loader { flex: 1; display: flex; flex-direction: column; width: 100%; }
:deep(.flex-grow-loader > div) { flex: 1; display: flex; flex-direction: column; height: 100%; }
.chart-wrapper-dynamic { flex: 1; height: 100%; width: 100%; }
.year-navigator { display: flex; align-items: center; background: #0f172a; border-radius: 6px; padding: 2px; border: 1px solid #334155; }
.nav-btn { background: transparent; border: none; color: #10b981; padding: 0 10px; cursor: pointer; font-size: 14px; font-weight: bold; }
.nav-btn:disabled { color: #475569; }
.year-display { color: #fff; font-size: 0.85rem; font-weight: 600; min-width: 45px; text-align: center; border-left: 1px solid #334155; border-right: 1px solid #334155; }
:deep(.custom-tooltip-box) { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; min-width: 180px; }
:deep(.tooltip-header) { border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 8px; color: #f1f5f9; font-weight: bold; }
:deep(.tooltip-row) { display: flex; justify-content: space-between; font-size: 11px; padding: 2px 0; }
:deep(.dot) { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 6px; }
:deep(.tooltip-total) { border-top: 1px solid #475569; margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-weight: 700; color: #34d399; }
@media (max-width: 1100px) { .charts-grid { grid-template-columns: 1fr; } .card-span-2 { grid-column: span 1; } }
</style>
