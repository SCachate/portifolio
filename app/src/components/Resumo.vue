<template>
  <div class="w-full">
    <h2 class="text-white text-xl font-bold mb-6">Meu Patrimônio</h2>
    
    <div class="charts-grid">
      <div class="chart-card donut-wrapper">
        <h3 class="chart-title text-center w-full">Distribuição</h3>
        <AsyncLoader :loading="loading" :error="error">
          <div class="donut-chart-box">
            <apexchart type="donut" width="100%" :options="chartOptions" :series="series" />
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
        <h3 class="chart-title">Resultado do Dia</h3>
        <AsyncLoader 
          :loading="loadingResultado" 
          :error="errorResultado" 
          class="flex-grow-loader"
        >
          <apexchart type="bar" height="200" :options="barOptions" :series="diaSeries" />
        </AsyncLoader>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">Resultado do Mês</h3>
        <AsyncLoader 
          :loading="loadingResultado" 
          :error="errorResultado" 
          class="flex-grow-loader"
        >
          <apexchart type="bar" height="200" :options="barOptions" :series="mesSeries" />
        </AsyncLoader>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">Resultado do Ano</h3>
        <AsyncLoader 
          :loading="loadingResultado" 
          :error="errorResultado" 
          class="flex-grow-loader"
        >
          <apexchart type="bar" height="200" :options="barOptions" :series="anoSeries" />
        </AsyncLoader>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue';

// 1. Lógica da Distribuição (Donut)
const { data, loading, error, fetchData: fetchResumo } = useApi(`/dashboard/resumo`);
const series = ref([]);

// 2. Lógica da Evolução (API Reativa por Ano)
const anoVisualizado = ref(2026);
const urlEvolucao = computed(() => { return `/dashboard/evolucao?ano=${anoVisualizado.value}`; });

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

let intervalId = null;

const atualizarTudo = () => {
  fetchResumo();
  fetchEvolucao();
  fetchResultado();
};

onMounted(() => {
  intervalId = setInterval(atualizarTudo, 60000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const evolucaoSeries = computed(() => {
  return (dadosEvolucao.value && Array.isArray(dadosEvolucao.value)) 
    ? dadosEvolucao.value 
    : [];
});

const mudarAno = (delta) => { 
  anoVisualizado.value += delta; 
};

const formatCurrency = (val) => {
  return val !== undefined ? `R$ ${val.toLocaleString('pt-BR')}` : '';
};

// Opções do Gráfico de Evolução
const evolucaoOptions = computed(() => ({
  chart: { 
    stacked: true, 
    toolbar: { show: false }, 
    fontFamily: 'inherit'
  },
  stroke: { width: [0, 0, 0, 0, 0, 3], curve: 'smooth' },
  colors: ['#A78BFA', '#F472B6', '#FBBF24', '#60A5FA', '#34D399', '#F87171'],
  grid: { 
    borderColor: '#334155', 
    strokeDashArray: 4,
    padding: { left: 10, right: 10, bottom: 0, top: 10 } 
  },
  xaxis: { 
    categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    labels: { style: { colors: '#94a3b8', fontSize: '10px' } }
  },
  yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
  legend: { 
    position: 'top', 
    horizontalAlign: 'center',
    labels: { colors: '#f1f5f9' },
    fontSize: '11px',
    offsetY: 0
  },
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

// Opções dos Gráficos de Barra (Resultados)
const barOptions = {
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 4, colors: { ranges: [{ from: -9999, to: 0, color: '#f87171' }] } } },
  colors: ['#10b981'],
  xaxis: { categories: ['RF', 'Int', 'Aç', 'FII', 'Mo'], labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
  yaxis: { show: false },
  tooltip: { theme: 'dark' },
  dataLabels: { enabled: false }
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
            // Formata o valor total no centro
            formatter: function (w) {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              return `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
          },
          value: {
            show: true,
            color: '#fff',
            // Formata o valor de cada fatia individual quando selecionada
            formatter: function (val) {
              return `R$ ${parseFloat(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
          }
        }
      }
    }
  },
  // Opcional: formata também o valor que aparece no balãozinho (tooltip)
  tooltip: {
    y: {
      formatter: (val) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }
  }
});

watch(data, (newData) => {
  if (newData?.length > 0) {
    series.value = newData.map(item => Number(item.valor));
    chartOptions.value = { ...chartOptions.value, labels: newData.map(item => item.classe), colors: newData.map(item => item.color)};
  }
}, { immediate: true });

watch(dadosResultado, (newData) => {
  if (newData && Array.isArray(newData) && newData.length > 0) {
    // Atualiza o gráfico do Dia
    diaSeries.value = [{ 
        name: 'Resultado', 
        data: newData.map(item => item.dia) 
    }];

    // Atualiza o gráfico do Mês
    mesSeries.value = [{ 
        name: 'Resultado', 
        data: newData.map(item => item.mes) 
    }];

    // Atualiza o gráfico do Ano
    anoSeries.value = [{ 
        name: 'Resultado', 
        data: newData.map(item => item.ano) 
    }];

    // DICA EXTRA: Atualize as legendas do eixo X caso elas mudem
    barOptions.xaxis.categories = newData.map(item => {
        // Abrevia nomes longos para caber no gráfico pequeno
        if (item.classe === 'Renda fixa') return 'RF';
        if (item.classe === 'Internacional') return 'Int';
        if (item.classe === 'Ações') return 'Aç';
        return item.classe.substring(0, 3);
    });
  }
}, { immediate: true });

</script>

<style scoped>
.charts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%; }
.chart-card { background: #1a1c24; padding: 20px; border-radius: 12px; height: 320px; display: flex; flex-direction: column; overflow: hidden; }
.card-span-2 { grid-column: span 2; }
.chart-title { color: #94a3b8; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

/* Layout Flexbox para os Cards */
.flex-col-container { display: flex; flex-direction: column; }
.header-top-row { flex: 0 0 auto; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.card-body-v2 { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }

/* Correção de Altura do AsyncLoader */
.flex-grow-loader { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; width: 100%; }
:deep(.flex-grow-loader > div) { flex: 1 1 auto; display: flex; flex-direction: column; height: 100%; width: 100%; }

.chart-wrapper-dynamic { flex: 1 1 auto; height: 100%; width: 100%; min-height: 0; }

/* Seletor de Ano */
.year-navigator { display: flex; align-items: center; background: #0f172a; border-radius: 6px; padding: 2px; border: 1px solid #334155; }
.nav-btn { background: transparent; border: none; color: #10b981; padding: 0 10px; cursor: pointer; font-size: 14px; font-weight: bold; }
.nav-btn:disabled { color: #475569; cursor: not-allowed; }
.year-display { color: #fff; font-size: 0.85rem; font-weight: 600; min-width: 45px; text-align: center; border-left: 1px solid #334155; border-right: 1px solid #334155; }

/* Tooltip Customizado */
:deep(.custom-tooltip-box) { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; min-width: 180px; }
:deep(.tooltip-header) { border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 8px; color: #f1f5f9; font-weight: bold; text-align: center; }
:deep(.tooltip-row) { display: flex; justify-content: space-between; font-size: 11px; padding: 1px 0; }
:deep(.dot) { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 6px; }
:deep(.tooltip-total) { border-top: 1px solid #475569; margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-weight: 700; color: #34d399; }

@media (max-width: 1100px) { .charts-grid { grid-template-columns: 1fr; } .card-span-2 { grid-column: span 1; } }
</style>