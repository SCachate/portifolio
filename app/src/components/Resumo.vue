<template>
  <div class="w-full">
    <h2 class="text-white text-xl font-bold mb-6">Meu Patrimônio</h2>
    
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
            <button @click="mudarAno(-1)" class="nav-btn" :disabled="loadingEvolucao">&lt;</button>
            <span class="year-display">{{ anoVisualizado }}</span>
            <button @click="mudarAno(1)" class="nav-btn" :disabled="loadingEvolucao">&gt;</button>
          </div>
        </div>
        
        <div class="card-body-v2">
          <AsyncLoader :loading="loadingEvolucao" :error="errorEvolucao" class="flex-grow-loader">
            <div class="chart-wrapper-dynamic">
              <apexchart type="line" height="100%" width="100%" :options="evolucaoOptions" :series="evolucaoSeries" />
            </div>
          </AsyncLoader>
        </div>
      </div>

      <div class="chart-card" v-for="(item, idx) in [ {t:'Dia', s:diaSeries}, {t:'Mês', s:mesSeries}, {t:'Ano', s:anoSeries} ]" :key="idx">
        <h3 class="chart-title">Resultado do {{ item.t }}</h3>
        <AsyncLoader :loading="loadingResultado" :error="errorResultado" class="flex-grow-loader">
          <apexchart type="bar" height="200" :options="barOptions" :series="item.s" />
        </AsyncLoader>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue';

// --- APIS ---
const { data, loading, error, fetchData: fetchResumo } = useApi(`/dashboard/resumo`);
const series = ref([]);

const anoVisualizado = ref(new Date().getFullYear());
const urlEvolucao = computed(() => `/dashboard/evolucao?ano=${anoVisualizado.value}`);
const { data: dadosEvolucao, loading: loadingEvolucao, error: errorEvolucao, fetchData: fetchEvolucao } = useApi(urlEvolucao);

const { data: dadosResultado, loading: loadingResultado, error: errorResultado, fetchData: fetchResultado } = useApi(`/dashboard/resultado`);

// --- ATUALIZAÇÃO AUTOMÁTICA (1 MIN) ---
let intervalId = null;
onMounted(() => { intervalId = setInterval(() => { fetchResumo(); fetchEvolucao(); fetchResultado(); }, 60000); });
onUnmounted(() => { if (intervalId) clearInterval(intervalId); });

// --- LÓGICA DE DADOS ---
const diaSeries = ref([]);
const mesSeries = ref([]);
const anoSeries = ref([]);

const mudarAno = (delta) => { anoVisualizado.value += delta; };
const formatCurrency = (val) => val !== undefined ? `R$ ${val.toLocaleString('pt-BR')}` : '';

// --- CONFIGURAÇÕES GRÁFICOS ---

// Evolução
const evolucaoSeries = computed(() => (dadosEvolucao.value && Array.isArray(dadosEvolucao.value)) ? dadosEvolucao.value : []);
const evolucaoOptions = computed(() => ({
  chart: { stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
  stroke: { width: [0, 0, 0, 0, 0, 3], curve: 'smooth' },
  colors: ['#A78BFA', '#F472B6', '#FBBF24', '#60A5FA', '#34D399', '#F87171'],
  grid: { borderColor: '#334155', strokeDashArray: 4 },
  xaxis: { categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], labels: { style: { colors: '#94a3b8' } } },
  yaxis: { labels: { style: { colors: '#94a3b8' } } },
  legend: { position: 'top', labels: { colors: '#f1f5f9' } },
  dataLabels: { enabled: false },
  tooltip: { theme: 'dark', shared: true }
}));

// Donut Corrigido
const chartOptions = ref({
  chart: { type: 'donut', parentHeightOffset: 0 },
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
            formatter: (w) => `R$ ${w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
        }
      }
    }
  },
  responsive: [{
    breakpoint: 3000,
    options: { chart: { height: 250 } }
  }]
});

// Barras
const barOptions = {
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 4, colors: { ranges: [{ from: -9999, to: 0, color: '#f87171' }] } } },
  colors: ['#10b981'],
  xaxis: { categories: ['RF', 'Int', 'Aç', 'FII', 'Mo'], labels: { style: { colors: '#94a3b8' } } },
  yaxis: { show: false },
  dataLabels: { enabled: false }
};

// --- WATCHERS ---
watch(data, (newData) => {
  if (newData?.length > 0) {
    series.value = newData.map(item => Number(item.valor));
    chartOptions.value = { ...chartOptions.value, labels: newData.map(item => item.classe), colors: newData.map(item => item.color)};
  }
}, { immediate: true });

watch(dadosResultado, (newData) => {
  if (newData?.length > 0) {
    diaSeries.value = [{ name: 'Resultado', data: newData.map(item => item.dia) }];
    mesSeries.value = [{ name: 'Resultado', data: newData.map(item => item.mes) }];
    anoSeries.value = [{ name: 'Resultado', data: newData.map(item => item.ano) }];
  }
}, { immediate: true });
</script>

<style scoped>
.charts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%; }
.chart-card { background: #1a1c24; padding: 20px; border-radius: 12px; height: 320px; display: flex; flex-direction: column; overflow: hidden; }
.card-span-2 { grid-column: span 2; }
.chart-title { color: #94a3b8; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }
.donut-chart-box { flex: 1; max-height: 240px; margin-top: 10px; }
.flex-col-container { display: flex; flex-direction: column; }
.header-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.card-body-v2 { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.flex-grow-loader { flex: 1; display: flex; flex-direction: column; width: 100%; }
.chart-wrapper-dynamic { flex: 1; min-height: 0; }
.year-navigator { display: flex; align-items: center; background: #0f172a; border-radius: 6px; border: 1px solid #334155; }
.nav-btn { color: #10b981; padding: 0 12px; font-weight: bold; }
.year-display { color: #fff; padding: 0 10px; border-left: 1px solid #334155; border-right: 1px solid #334155; }
@media (max-width: 1100px) { .charts-grid { grid-template-columns: 1fr; } .card-span-2 { grid-column: span 1; } }
</style>