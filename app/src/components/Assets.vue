<template>
  <div class="w-full">
    <AsyncLoader :loading="loading" :error="!!error">
      
      <div v-if="!loading && assets && assets.length > 0" id="report-container" class="max-w-[1400px] mx-auto space-y-10">
        
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

        <div class="bg-[#1a1d2b] rounded-xl p-8 border border-slate-800/50 relative overflow-hidden shadow-2xl">
          <div class="relative z-10">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Valor Total de Mercado</p>
            <h2 class="text-4xl font-bold text-white tracking-tighter">
              {{ formatCurrency(totalGeral) }}
            </h2>
          </div>
          <div class="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
             <div class="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm">
               <span class="text-3xl opacity-80">📊</span>
             </div>
          </div>
        </div>

        <div class="space-y-12 pb-10">
          <section v-for="(grupo, classe) in patrimonioAgrupado" :key="classe" class="bg-[#1a1d2b] rounded-xl border border-slate-800/50 overflow-hidden shadow-sm">
            
            <div class="px-8 py-6 border-b border-slate-800/50 bg-[#1c2030]">
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

            <!-- Mantemos a div com overflow-x-auto nativa para a experiência responsiva em telas móveis e monitores -->
            <div class="overflow-x-auto pdf-table-wrapper">
              <table class="w-full min-w-[900px] md:min-w-0 table-fixed-layout">
                <thead>
                  <tr class="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/30">
                    <th class="px-8 py-5 col-ativo">Ativo</th>
                    <th class="px-8 py-5 col-inst">Instituição</th>
                    <th class="px-8 py-5 text-right font-bold text-emerald-500/80 col-val">Valor</th>
                    <th class="px-8 py-5 text-right col-qtd">Quantidade</th>
                    <th class="px-8 py-5 text-right col-pm">Preço Médio</th>
                    <th class="px-8 py-5 text-right col-cot">Cotação</th>
                    <th class="px-8 py-5 text-right col-res">Resultado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/30">
                  <tr v-for="item in grupo.itens" :key="item.ativo" class="hover:bg-slate-800/20 transition-all group">
                    
                    <td class="px-8 py-5 col-ativo">
                      <div class="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                        {{ item.ativo || '---' }}
                      </div>
                      <div class="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{{ item.description }}</div>
                    </td>
                    
                    <td class="px-8 py-5 text-[11px] text-slate-400 uppercase tracking-tighter col-inst">{{ item.corretora }}</td>
                    
                    <td class="px-8 py-5 text-right col-val">
                      <span class="font-bold text-white" :class="{'text-rose-500': item.valor_mercado_brl < 0}">
                        {{ formatCurrency(item.valor_mercado_brl) }}
                      </span>
                    </td>

                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 col-qtd">
                      {{ item.quantidade ? Number(item.quantidade).toFixed(2) : '0.00' }}
                    </td>
                    
                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 col-pm">
                      {{ formatCurrency(item.preco_medio_brl) }}
                    </td>

                    <td class="px-8 py-5 text-right font-mono text-[12px] text-slate-400 col-cot">
                      {{ formatCurrency(item.cotacao_atual_brl) }}
                    </td>
                    
                    <td class="px-8 py-5 text-right font-mono text-[12px] col-res">
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
import { computed } from 'vue';
import { useApi } from '../composables/useApi';
import AsyncLoader from './AsyncLoader.vue';
import html2pdf from 'html2pdf.js';

const { data: assets, loading, error } = useApi('/assets/patrimonio');

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

  // 1. Criação do Clone Profundo na Memória para isolamento total do escopo de tela
  const clonedElement = originalElement.cloneNode(true);

  // 2. Remove componentes de interface irrelevantes para o relatório impresso
  const noPrintItems = clonedElement.querySelectorAll('.no-print');
  noPrintItems.forEach(el => el.remove());

  // 3. Sobrescrita Cirúrgica de Layout para dimensionamento A4 estrito (Evita cortes laterais)
  clonedElement.style.width = '840px'; 
  clonedElement.style.maxWidth = '840px';
  clonedElement.style.padding = '10px';
  clonedElement.style.margin = '0';

  // 4. Tratamento dos wrappers de tabela para remover restrições de rolagem lateral (overflow)
  const wrappers = clonedElement.querySelectorAll('.pdf-table-wrapper');
  wrappers.forEach(w => {
    w.style.overflowX = 'visible';
    w.style.width = '100%';
    w.style.maxWidth = '100%';
  });

  // 5. Configuração estrita de proporção de colunas e quebras de página
  const tables = clonedElement.querySelectorAll('.table-fixed-layout');
  tables.forEach(t => {
    t.style.tableLayout = 'fixed';
    t.style.width = '100%';
    t.style.minWidth = '100%';
    
    // Otimização das células para compressão segura de dados financeiros
    const cells = t.querySelectorAll('th, td');
    cells.forEach(c => {
      c.style.paddingLeft = '6px';
      c.style.paddingRight = '6px';
      c.style.fontSize = '11px';
      c.style.wordBreak = 'break-all';
      c.style.whiteSpace = 'normal';
    });

    // Injeção inline de larguras relativas baseadas nas classes dinâmicas
    t.querySelectorAll('.col-ativo').forEach(el => el.style.width = '16%');
    t.querySelectorAll('.col-inst').forEach(el => el.style.width = '16%');
    t.querySelectorAll('.col-val').forEach(el => el.style.width = '16%');
    t.querySelectorAll('.col-qtd').forEach(el => el.style.width = '13%');
    t.querySelectorAll('.col-pm').forEach(el => el.style.width = '13%');
    t.querySelectorAll('.col-cot').forEach(el => el.style.width = '13%');
    t.querySelectorAll('.col-res').forEach(el => el.style.width = '13%');
  });

  // Força quebras de página limpas entre blocos de ativos
  const sections = clonedElement.querySelectorAll('section');
  sections.forEach(s => {
    s.style.pageBreakInside = 'avoid';
    s.style.breakInside = 'avoid';
    s.style.marginBottom = '25px';
  });

  const opt = {
    margin: [12, 10, 12, 10],
    filename: 'K-Portfolio-Ativos.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#0f111a',
      logging: false,
      letterRendering: true,
      width: 840 // Garante que a captura fotográfica case exatamente com a largura do clone
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Passa o clone em memória diretamente para renderização e efetua o download do arquivo estruturado
  html2pdf().set(opt).from(clonedElement).save().then(() => {
    clonedElement.remove(); // Desaloca o nó clonado da memória
  });
};
</script>

<style scoped>
.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

/* Garante o comportamento correto das tabelas responsivas no dashboard (Ecrã) */
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