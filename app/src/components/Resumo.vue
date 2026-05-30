<script setup>
import { ref, watch, computed } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue';
import ModalDetalhamento from './ModalDetalhamento.vue';

const modalAberto = ref(false);
const filtrosAtivos = ref({ classe: '', tipo: '' });

const abrirPeloGrafico = (dados) => {
  filtrosAtivos.value = { ...dados };
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

// --- MOCK DO SEU JSON (Temporário para Desenvolvimento) ---
const dadosMockadosHistorico = ref([
  { "yearMonth": "2025-04", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2025-05", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2025-06", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2025-07", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2025-08", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2025-09", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2025-10", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2025-11", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2025-12", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2026-01", "classId": 2, "netResult": 0.00, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2025-04", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2025-05", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2025-06", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2025-07", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2025-08", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2025-09", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2025-10", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2025-11", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2025-12", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2026-01", "classId": 6, "netResult": 0.00, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2025-04", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2025-05", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2025-06", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2025-07", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2025-08", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2025-09", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2025-10", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2025-11", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2025-12", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2026-01", "classId": 4, "netResult": 0.00, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2025-04", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2025-05", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2025-06", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2025-07", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2025-08", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2025-09", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2025-10", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2025-11", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2025-12", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2026-01", "classId": 5, "netResult": 0.00, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2025-04", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2025-05", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2025-06", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2025-07", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2025-08", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2025-09", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2025-10", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2025-11", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2025-12", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2026-01", "classId": 3, "netResult": 0.00, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2026-02", "classId": 2, "netResult": 2640.69, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2026-02", "classId": 3, "netResult": 26414.53, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2026-02", "classId": 4, "netResult": 18615.97, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2026-02", "classId": 5, "netResult": 6344.11, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2026-02", "classId": 6, "netResult": 6125.87, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2026-03", "classId": 2, "netResult": 479.74, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2026-03", "classId": 3, "netResult": 2195.38, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2026-03", "classId": 4, "netResult": -1779.95, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2026-03", "classId": 5, "netResult": -811.58, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2026-03", "classId": 6, "netResult": -929.58, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2026-04", "classId": 2, "netResult": 148.86, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2026-04", "classId": 3, "netResult": 2148.86, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2026-04", "classId": 4, "netResult": 7565.67, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2026-04", "classId": 5, "netResult": -331.26, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2026-04", "classId": 6, "netResult": -681.27, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2026-04", "classId": 7, "netResult": -57.00, "name": "Opções", "color": "#116651" },
  { "yearMonth": "2026-05", "classId": 2, "netResult": -422.54, "name": "FII", "color": "#FEB019" },
  { "yearMonth": "2026-05", "classId": 3, "netResult": 1359.51, "name": "Renda fixa", "color": "#008FFB" },
  { "yearMonth": "2026-05", "classId": 4, "netResult": -621.46, "name": "Internacional", "color": "#FF4560" },
  { "yearMonth": "2026-05", "classId": 5, "netResult": -234.44, "name": "Moedas", "color": "#775DD0" },
  { "yearMonth": "2026-05", "classId": 6, "netResult": -2498.52, "name": "Ações", "color": "#00E396" },
  { "yearMonth": "2026-05", "classId": 7, "netResult": -327.00, "name": "Opções", "color": "#116651" }
]);

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

// Lógica de Processamento Dinâmico (Lendo os dados Mockados)
const historicoResultadoProcessado = computed(() => {
  // Passa a ler do Mock estático temporariamente
  const dadosFonte = dadosMockadosHistorico.value;

  const mesesSet = new Set();
  dadosFonte.forEach(item => {
    if (item.yearMonth) mesesSet.add(item.yearMonth);
  });
  const mesesOrdenados = Array.from(mesesSet).sort();

  const classesMap = new Map();

  dadosFonte.forEach(item => {
    if (!classesMap.has(item.name)) {
      classesMap.set(item.name, {
        name: item.name,
        color: item.color || '#10b981',
        valoresPorMes: new Map()
      });
    }
    classesMap.get(item.name).valoresPorMes.set(item.yearMonth, Number(item.netResult) || 0);
  });

  const seriesGeradas = [];
  const coresGeradas = [];

  classesMap.forEach(classeData => {
    const dataAlinhada = mesesOrdenados.map(mes => classeData.valoresPorMes.get(mes) || 0);
    seriesGeradas.push({
      name: classeData.name,
      data: dataAlinhada
    });
    coresGeradas.push(classeData.color);
  });

  return {
    meses: mesesOrdenados,
    series: seriesGeradas,
    cores: coresGeradas
  };
});

const historicoResultadoSeries = computed(() => historicoResultadoProcessado.value.series);

const historicoResultadoOptions = computed(() => ({
  chart: { 
    type: 'bar',
    stacked: true, 
    toolbar: { show: false }, 
    fontFamily: 'inherit' 
  },
  colors: historicoResultadoProcessado.value.cores,
  grid: { borderColor: '#334155', strokeDashArray: 4, padding: { left: 10, right: 10, bottom: 0, top: 10 } },
  xaxis: { 
    categories: historicoResultadoProcessado.value.meses,
    labels: { style: { colors: '#94a3b8', fontSize: '9px' } }
  },
  yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
  legend: { show: false }, 
  dataLabels: { enabled: false },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '60%'
    }
  },
  tooltip: {
    theme: 'dark',
    shared: true,
    y: {
      formatter: (val) => formatCurrency(val)
    }
  }
}));

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
  const coresBackend = dadosResultado.value?.map(item => item.cor) || ['#10b981'];

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
    grid: { padding: { top: 0, right: 10, bottom: 10, left: 10 } },
    colors: coresBackend,
    plotOptions: { 
      bar: { 
        borderRadius: 4, 
        distributed: true,
        columnWidth: '70%'
      } 
    },
    fill: {
      type: 'solid',
      colors: coresBackend
    },
    xaxis: {
      categories: dadosResultado.value?.map(item => item.classe) || [], 
      labels: { 
        show: true,
        rotate: -45, 
        rotateAlways: true,
        hideOverlappingLabels: false,
        style: { colors: '#94a3b8', fontSize: '9px' } 
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    legend: { show: false },
    yaxis: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      theme: 'dark',
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const val = series[seriesIndex][dataPointIndex];
        const label = w.globals.labels[dataPointIndex];
        const isPositive = val >= 0;
        const statusColor = isPositive ? '#10b981' : '#f87171';
        return `
          <div style="background: #1a1c24; border: 1px solid #334155; padding: 10px; border-radius: 8px;">
            <div style="color: #94a3b8; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">${label}</div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColor}; display: inline-block;"></span>
              <span style="color: #f1f5f9; font-size: 12px;">Resultado:</span>
              <span style="color: ${statusColor}; font-size: 12px; font-weight: 700;">${formatCurrency(val)}</span>
            </div>
          </div>
        `;
      }
    }
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
