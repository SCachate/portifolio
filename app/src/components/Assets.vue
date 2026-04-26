<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8" id="report-container">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Patrimônio Consolidado</h1>
        <p class="text-slate-500 font-medium">Visão estratégica por classe de ativos</p>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="generatePDF" 
          class="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm font-semibold text-sm"
        >
          <span class="text-blue-500 text-lg">📄</span> Exportar PDF
        </button>
      </div>
    </div>

    <div class="max-w-6xl mx-auto">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Total de Mercado</p>
          <h2 class="text-3xl font-black text-slate-900">{{ formatCurrency(totalGeral) }}</h2>
        </div>
        <div class="hidden md:block bg-blue-50 p-4 rounded-full">
          <span class="text-2xl">📊</span>
        </div>
      </div>

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
      </div>

      <div v-else class="space-y-8">
        <section v-for="(grupo, classe) in patrimonioAgrupado" :key="classe" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div class="w-2 h-6 bg-blue-500 rounded-full"></div>
              <h3 class="font-bold text-slate-800 text-lg">{{ classe }}</h3>
              <span class="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded-md ml-2">
                {{ ((grupo.totalClasse / totalGeral) * 100).toFixed(1) }}%
              </span>
            </div>
            <span class="text-lg font-bold text-slate-900">{{ formatCurrency(grupo.totalClasse) }}</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-50">
                  <th class="px-6 py-4 font-black">Ativo / Descrição</th>
                  <th class="px-6 py-4 font-black">Instituição</th>
                  <th class="px-6 py-4 font-black text-right">Qtd</th>
                  <th class="px-6 py-4 font-black text-right">Cotação (R$)</th>
                  <th class="px-6 py-4 font-black text-right">Posição (R$)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="item in grupo.itens" :key="item.ativo" class="hover:bg-blue-50/30 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{{ item.ativo || '---' }}</div>
                    <div class="text-xs text-slate-400 truncate max-w-[200px]">{{ item.description }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600 font-medium">{{ item.corretora }}</td>
                  <td class="px-6 py-4 text-right font-mono text-sm text-slate-600">{{ item.quantidade }}</td>
                  <td class="px-6 py-4 text-right font-mono text-sm text-slate-600">{{ formatCurrency(item.cotacao_atual_brl) }}</td>
                  <td class="px-6 py-4 text-right">
                    <span class="font-bold text-slate-900" :class="{'text-red-500': item.valor_mercado_brl < 0}">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import html2pdf from 'html2pdf.js';

const assets = ref([]);
const loading = ref(true);

const fetchPatrimonio = async () => {
  try {
    const response = await api.get('/assets/patrimonio');
    assets.value = response.data;
  } catch (err) {
    console.error("K-Portfolio Error:", err);
  } finally {
    loading.value = false;
  }
};

const patrimonioAgrupado = computed(() => {
  return assets.value.reduce((acc, item) => {
    const cls = item.classe || 'Diversos';
    if (!acc[cls]) acc[cls] = { itens: [], totalClasse: 0 };
    acc[cls].itens.push(item);
    acc[cls].totalClasse += parseFloat(item.valor_mercado_brl);
    return acc;
  }, {});
});

const totalGeral = computed(() => {
  return assets.value.reduce((sum, item) => sum + parseFloat(item.valor_mercado_brl), 0);
});

const formatCurrency = (v) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
};

const generatePDF = () => {
  const element = document.getElementById('report-container');
  const opt = {
    margin: 5,
    filename: 'K-Portfolio-Consolidado.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
};

onMounted(fetchPatrimonio);
</script>

<style scoped>
/* Estilização refinada para a fonte mono nas tabelas de valores */
font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

@media print {
  .no-print { display: none !important; }
  #report-container { background: white !important; p: 0 !important; }
}
</style>
