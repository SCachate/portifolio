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

      <div class="chart-card flex-col-container">
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

      <div class="chart-card block clear-both">
        <h3 class="chart-title mb-4">Resultado por Classe (Histórico)</h3>
        
        <AsyncLoader :loading="loadingHistorico" :error="errorHistorico">
          <div style="display: block; width: 100%; height: 230px; position: relative;">
            <apexchart 
              v-if="historicoPronto"
              type="bar" 
              height="230" 
              width="100%"
              :options="historicoResultadoOptions" 
              :series="historicoResultadoSeries" 
            />
            <div v-else class="flex items-center justify-center h-full text-slate-500 text-xs">
              Carregando histórico...
            </div>
          </div>
        </AsyncLoader>
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
          <apexchart type="bar" height="100%" :options="barOptionsDia" :series="diaSeries" />
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
          <apexchart type="bar" height="100%" :options="barOptionsMes" :series="mesSeries" />
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
          <apexchart type="bar" height="100%" :options="barOptionsAno" :series="anoSeries" />
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
import { ref, computed } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue';
import ModalDetalhamento from './ModalDetalhamento.vue';

const modalAberto = ref(false);
const filtrosAtivos = ref({ classe: '', tipo: '' });

const abrirPeloGrafico = (dados) => {
  filtrosAtivos.value = { ...dados };
  modalAberto.value = true;
};

// 1. Chamadas de API do Dashboard
const { data, loading, error, fetchData: fetchResumo } = useApi(`/dashboard/resumo`);

const { 
  data: dadosResultado, 
  loading: loadingResultado, 
  error: errorResultado,
  fetchData: fetchResultado
} = useApi(`/dashboard/resultado`);

const anoVisualizado = ref(new Date().getFullYear());
const urlEvolucao = computed(() => `/dashboard/evolucao?ano=${anoVisualizado.value}`);

const { 
  data: dadosEvolucao, 
  loading: loadingEvolucao, 
  error: errorEvolucao,
  fetchData: fetchEvolucao
} = useApi(urlEvolucao);

// INTERLIGAÇÃO DO HISTÓRICO COM O BACKEND REAL:
const {
  data: dadosHistorico,
  loading: loadingHistorico,
  error: errorHistorico,
  fetchData: fetchHistorico
} = useApi(`/dashboard/historico`);


const formatCurrency = (val) => {
  if (val === undefined || val === null) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Atualiza todos os blocos do dashboard, incluindo o novo histórico
const atualizarTudo = async () => {
  try {
    await Promise.all([
      fetchResumo(),
      fetchEvolucao(),
      fetchResultado(),
      fetchHistorico() // Atualização do histórico real
    ]);
  } catch (error) {
    console.error("Erro na atualização global:", error);
  }
};

const mudarAno = (delta) => { anoVisualizado.value += delta; };

// --- PROPRIEDADES COMPUTADAS DO DONUT E BARRAS DO DIA/MÊS/ANO ---
const series = computed(() => data.value?.map(item => Number(item.valor)) || []);

const chartOptions = computed(() => ({
  chart: { type: 'donut' },
  labels: data.value?.map(item => item.classe) || [],
  colors: data.value?.map(item => item.color) || [],
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
              return w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
          },
          value: {
            show: true,
            color: '#fff',
            formatter: (val) => parseFloat(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          }
        }
      }
    }
  },
  tooltip: { y: { formatter: (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) } }
}));

const evolucaoSeries = computed(() => (dadosEvolucao.value && Array.isArray(dadosEvolucao.value)) ? dadosEvolucao.value : []);
const diaSeries = computed(() => [{ name: 'Resultado', data: dadosResultado.value?.map(item => item.dia) || [] }]);
const mesSeries = computed(() => [{ name: 'Resultado', data: dadosResultado.value?.map(item => item.mes) || [] }]);
const anoSeries = computed(() => [{ name: 'Resultado', data: dadosResultado.value?.map(item => item.ano) || [] }]);

const totaisResultado = computed(() => {
  if (!dadosResultado.value || !Array.isArray(dadosResultado.value)) return { dia: 0, mes: 0, ano: 0 };
  return dadosResultado.value.reduce((acc, item) => {
    acc.dia += Number(item.dia) || 0; acc.mes += Number(item.mes) || 0; acc.ano += Number(item.ano) || 0;
    return acc;
  }, { dia: 0, mes: 0, ano: 0 });
});

const baseBarOptions = computed(() => {
  const coresBackend = dadosResultado.value?.map(item => item.cor) || ['#10b981'];
  return {
    chart: { toolbar: { show: false }, parentHeightOffset: 0 },   
    grid: { padding: { top: 0, right: 10, bottom: 10, left: 10 } },
    colors: coresBackend,
    plotOptions: { bar: { borderRadius: 4, distributed: true, columnWidth: '70%' } },
    fill: { type: 'solid', colors: coresBackend },
    xaxis: {
      categories: dadosResultado.value?.map(item => item.classe) || [], 
      labels: { show: true, rotate: -45, rotateAlways: true, style: { colors: '#94a3b8', fontSize: '9px' } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    legend: { show: false }, yaxis: { show: false }, dataLabels: { enabled: false }
  };
});

const generateBarOptionsForType = (tipo) => ({
  ...baseBarOptions.value,
  chart: {
    ...baseBarOptions.value.chart,
    events: {
      dataPointSelection: (event, chartContext, config) => {
        const item = dadosResultado.value[config.dataPointIndex];
        if (item) abrirPeloGrafico({ classe: item.classe, tipo });
      }
    }
  },
  tooltip: {
    theme: 'dark',
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      const val = series[seriesIndex][dataPointIndex];
      const label = w.globals.labels[dataPointIndex];
      const statusColor = val >= 0 ? '#10b981' : '#f87171';
      return `<div style="background: #1a1c24; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">${label}</div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColor};"></span>
                  <span style="color: #f1f5f9; font-size: 12px;">Resultado: ${formatCurrency(val)}</span>
                </div>
              </div>`;
    }
  }
});

const barOptionsDia = computed(() => generateBarOptionsForType('dia'));
const barOptionsMes = computed(() => generateBarOptionsForType('mes'));
const barOptionsAno = computed(() => generateBarOptionsForType('ano'));

// --- PROCESSAMENTO DO HISTÓRICO COM DADOS DO BACKEND ---
const historicoResultadoProcessado = computed(() => {
  // MUDANÇA: Agora consome de dadosHistorico.value vindo da API
  const dadosFonte = dadosHistorico.value || [];
  if (dadosFonte.length === 0) return { meses: [], series: [], cores: [] };

  const mesesSet = new Set();
  dadosFonte.forEach(item => { if (item.yearMonth) mesesSet.add(item.yearMonth); });
  const mesesOrdenados = Array.from(mesesSet).sort();

  const classesMap = new Map();
  dadosFonte.forEach(item => {
    if (!item.name) return;
    if (!classesMap.has(item.name)) {
      classesMap.set(item.name, { name: item.name, color: item.color || '#10b981', valoresPorMes: new Map() });
    }
    classesMap.get(item.name).valoresPorMes.set(item.yearMonth, Number(item.netResult) || 0);
  });

  const seriesGeradas = [];
  const coresGeradas = [];
  classesMap.forEach(classeData => {
    const dataAlinhada = mesesOrdenados.map(mes => classeData.valoresPorMes.get(mes) || 0);
    seriesGeradas.push({ name: classeData.name, data: dataAlinhada });
    coresGeradas.push(classeData.color);
  });

  return { meses: mesesOrdenados, series: seriesGeradas, cores: coresGeradas };
});

const historicoResultadoSeries = computed(() => historicoResultadoProcessado.value.series);

const historicoPronto = computed(() => {
  return historicoResultadoSeries.value && 
         historicoResultadoSeries.value.length > 0 && 
         historicoResultadoProcessado.value.meses.length > 0;
});

const historicoResultadoOptions = computed(() => ({
  chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
  colors: historicoResultadoProcessado.value.cores,
  grid: { borderColor: '#334155', strokeDashArray: 4, padding: { left: 10, right: 10, bottom: 0, top: 10 } },
  xaxis: { 
    type: 'category',
    categories: historicoResultadoProcessado.value.meses,
    labels: { style: { colors: '#94a3b8', fontSize: '9px' } }
  },
  yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px' }, formatter: (v) => Math.round(v).toLocaleString('pt-BR') } },
  legend: { show: false }, 
  dataLabels: { enabled: false },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '65%' } },
  tooltip: { theme: 'dark', shared: true, intersect: false, y: { formatter: (val) => formatCurrency(val) } }
}));

const evolucaoOptions = computed(() => ({
  chart: { stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
  stroke: { width: [0, 0, 0, 0, 0, 3], curve: 'smooth' },
  colors: ['#A78BFA', '#F472B6', '#FBBF24', '#60A5FA', '#34D399', '#F87171'],
  grid: { borderColor: '#334155', strokeDashArray: 4, padding: { left: 10, right: 10, bottom: 0, top: 10 } },
  xaxis: { categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
  yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
  legend: { position: 'top', horizontalAlign: 'center', labels: { colors: '#f1f5f9' }, fontSize: '11px' },
  dataLabels: { enabled: false },
  tooltip: {
    theme: 'dark', shared: true,
    custom: function({ series, dataPointIndex, w }) {
      let total = 0;
      let html = `<div class="custom-tooltip-box"><div class="tooltip-header">${w.globals.categoryLabels[dataPointIndex]} ${anoVisualizado.value}</div><div class="tooltip-body">`;
      w.config.series.forEach((s, idx) => {
        const val = series[idx][dataPointIndex];
        if (s.type === 'column') total += val;
        html += `<div class="tooltip-row"><span class="dot" style="background:${w.globals.colors[idx]}"></span><span>${s.name}:</span><span class="value">${formatCurrency(val)}</span></div>`;
      });
      return html + `<div class="tooltip-total"><span>TOTAL:</span><span>${formatCurrency(total)}</span></div></div></div>`;
    }
  }
}));
</script>
