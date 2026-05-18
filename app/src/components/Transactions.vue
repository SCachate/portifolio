<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '../composables/useApi'; 
import { useToast } from 'vue-toastification';

const toast = useToast();

const dataAtual = new Date();
const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).toISOString().split('T')[0];
const hoje = dataAtual.toISOString().split('T')[0];

const fileName = ref('');
const form = ref({ assetId: '', brokerId: '', quantity: null, priceUnit: null, date: hoje });

const filtros = ref({ 
  dataInicio: primeiroDiaMes, 
  dataFim: hoje, 
  brokerId: '',
  assetId: ''
});

const paginaAtual = ref(1);
const itensPorPagina = 6;

// --- NOVOS ESTADOS REATIVOS PARA A ÁREA DE REVISÃO DA IA ---
const modoRevisao = ref(false);
const transacoesParaRevisar = ref([]);

const apiUrl = computed(() => {
  if (!filtros.value.dataInicio || !filtros.value.dataFim) return null;
  const params = new URLSearchParams({
    startDate: filtros.value.dataInicio,
    endDate: filtros.value.dataFim,
    brokerId: filtros.value.brokerId || '',
    assetId: filtros.value.assetId || ''
  });
  return `/transactions?${params.toString()}`;
});

const { data: apiResponse, loading, fetchData } = useApi(apiUrl, { immediate: true });

watch(apiUrl, (newUrl) => {
  if (newUrl) {
    paginaAtual.value = 1;
    fetchData(); 
  }
}, { deep: true });

const transacoesTotal = computed(() => apiResponse.value?.data || []);

const transacoesPaginadas = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  return transacoesTotal.value.slice(inicio, fim);
});

const totalPaginas = computed(() => 
  Math.max(1, Math.ceil(transacoesTotal.value.length / itensPorPagina))
);

const ativosParaSelect = computed(() => {
  const unicos = [...new Map(
    transacoesTotal.value
      .filter(item => item?.assetId)
      .map(item => [item.assetId, { assetId: item.assetId, ticket: item.ticket, description: item.assetDescription }])
  ).values()];
  return unicos.sort((a, b) => (a.ticket || '').localeCompare(b.ticket || ''));
});

const brokersParaSelect = computed(() => {
  const unicos = [...new Map(
    transacoesTotal.value
      .filter(item => item?.brokerId)
      .map(item => [item.brokerId, { brokerId: item.brokerId, name: item.brokerName }])
  ).values()];
  return unicos.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
});

const formatDate = (dateString) => {
  if (!dateString) return '---';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (val) => 
  Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


// --- FUNÇÃO DE UPLOAD AJUSTADA EXCLUSIVAMENTE NA VALIDAÇÃO DO IF ---
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileName.value = file.name;

  const formData = new FormData();
  formData.append('nota', file); 

  try {
    loading.value = true; // Ativa o "K" girando na tela principal

    // Instanciamos o useApi de forma isolada
    const apiInstancia = useApi('/transactions/addPDF', {
      method: 'POST',
      data: formData,
      immediate: false, 
      headers: {
        'Content-Type': undefined 
      }
    });

    // Executamos a requisição do upload
    await apiInstancia.fetchData();

    // Lemos o dado retornado pelo backend
    const resposta = apiInstancia.data.value;

    console.log("Objeto de teste no Vue:", resposta);

    // Validação corrigida para checar a chave "transacoes" gerada pelo seu backend
    if (resposta && (resposta.transacoes || Array.isArray(resposta))) {
      transacoesParaRevisar.value = resposta.transacoes || resposta;
      modoRevisao.value = true; // Força a tela a mudar para o Modo Revisão
      toast.success('Nota lida com sucesso! Revise os dados abaixo antes de salvar.');
    } else {
      toast.error('O backend respondeu, mas a chave "transacoes" não foi encontrada.');
    }

  } catch (err) {
    console.error('Falha crítica ao importar arquivo no front:', err);
  } finally {
    loading.value = false; // Desliga o "K" girando
    event.target.value = ''; // Limpa o input de arquivo
  }
};

// Funções de controle da área de revisão
const cancelarRevisao = () => {
  modoRevisao.value = false;
  transacoesParaRevisar.value = [];
  fileName.value = '';
};

const salvarDadosRevisados = () => {
  toast.info('Pronto para enviar ao banco os dados revisados!');
  console.log('Dados prontos para o banco:', transacoesParaRevisar.value);
};
</script>

<template>
  <div class="flex flex-col bg-[#0b0f17] text-slate-300 font-sans p-6 overflow-hidden w-full h-full">
    
    <header class="shrink-0 mb-4">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kaxatapi Finance</h3>
      <h1 class="text-3xl font-bold text-white tracking-tight leading-none">Histórico de Movimentações</h1>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
      
      <section class="lg:col-span-4 flex flex-col min-h-0">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 space-y-6 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-xl">
          <label class="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all bg-[#0b0f17]/50 group shrink-0">
            <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" />
            <span class="text-[10px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest text-center px-4">
              {{ fileName || 'IMPORTAR NOTA DE CORRETAGEM' }}
            </span>
          </label>

          <div class="space-y-4 flex-grow">
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-black uppercase text-slate-500">
                <label>Ativo</label>
                <button class="text-emerald-500 hover:brightness-125">+ Novo</button>
              </div>
              <select v-model="form.assetId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket || a.description }}</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-black uppercase text-slate-500 block">Corretora</label>
              <select v-model="form.brokerId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="b in brokersParaSelect" :key="b.brokerId" :value="b.brokerId">{{ b.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-500">Qtd.</label>
                <input v-model.number="form.quantity" type="number" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-500">Custo Unit.</label>
                <input v-model.number="form.priceUnit" type="number" step="0.01" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-white outline-none" />
              </div>
            </div>
          </div>

          <button class="w-full py-4 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white font-black uppercase tracking-widest rounded-lg transition-all text-xs border border-emerald-500/20 shrink-0">
            Registrar Transação
          </button>
        </div>
      </section>

      <section class="lg:col-span-8 flex flex-col min-h-0 h-full">
        
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-5 flex flex-wrap gap-4 items-end shrink-0 mb-4">
          <div class="flex-1 min-w-[180px] space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Período</label>
            <div class="flex gap-2">
              <input v-model="filtros.dataInicio" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
              <input v-model="filtros.dataFim" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
            </div>
          </div>
          <div class="flex-1 min-w-[120px] space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ativo</label>
            <select v-model="filtros.assetId" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none">
              <option value="">Todos</option>
              <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket || a.description }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-[150px] space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Instituição</label>
            <select v-model="filtros.brokerId" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none">
              <option value="">Todas</option>
              <option v-for="b in brokersParaSelect" :key="b.brokerId" :value="b.brokerId">{{ b.name }}</option>
            </select>
          </div>
        </div>

        <div class="bg-[#161b26] rounded-xl border border-white/5 shadow-2xl flex flex-col flex-1 min-h-0 overflow-hidden relative">
          
          <div v-if="loading" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-30 flex items-center justify-center">
            <div class="relative flex items-center justify-center w-20 h-20">
              <div class="w-20 h-20 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
              <div class="absolute flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-xl shadow-lg">
                <span class="text-black font-black text-xl select-none">K</span>
              </div>
            </div>
          </div>

          <div v-if="modoRevisao" class="flex flex-col flex-1 min-h-0 bg-[#121722]">
            <div class="p-4 bg-emerald-950/20 border-b border-emerald-500/10 flex justify-between items-center shrink-0">
              <span class="text-xs font-black text-emerald-400 uppercase tracking-wider">
                🤖 REVISÃO DA INTELIGÊNCIA ARTIFICIAL (Ajuste se necessário)
              </span>
              <div class="flex gap-2">
                <button @click="cancelarRevisao" class="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-md transition-all">
                  Cancelar
                </button>
                <button @click="salvarDadosRevisados" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-lg transition-all">
                  Confirmar e Salvar no Banco
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-auto">
              <table class="w-full text-left border-collapse">
                <thead class="sticky top-0 bg-[#161b26] z-10 border-b border-white/5">
                  <tr class="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    <th class="p-3">Data</th>
                    <th class="p-3">Ticker</th>
                    <th class="p-3">Operação</th>
                    <th class="p-3">Quantidade</th>
                    <th class="p-3">Preço Unitário</th>
                    <th class="p-3">Taxas / Custos</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-for="(t, idx) in transacoesParaRevisar" :key="idx" class="hover:bg-white/[0.01]">
                    <td class="p-2"><input v-model="t.data" type="date" class="bg-[#0b0f17] border border-white/5 rounded p-1 text-xs text-white font-mono outline-none w-full" /></td>
                    <td class="p-2"><input v-model="t.ticker" type="text" class="bg-[#0b0f17] border border-white/5 rounded p-1 text-xs text-white font-bold uppercase outline-none w-full" /></td>
                    <td class="p-2">
                      <select v-model="t.tipo" class="bg-[#0b0f17] border border-white/5 rounded p-1 text-xs text-white outline-none w-full">
                        <option value="C">C - Compra</option>
                        <option value="V">V - Venda</option>
                      </select>
                    </td>
                    <td class="p-2"><input v-model.number="t.quantidade" type="number" class="bg-[#0b0f17] border border-white/5 rounded p-1 text-xs text-slate-300 font-mono outline-none w-full" /></td>
                    <td class="p-2"><input v-model.number="t.preco_unitario" type="number" step="0.01" class="bg-[#0b0f17] border border-white/5 rounded p-1 text-xs text-slate-300 font-mono outline-none w-full" /></td>
                    <td class="p-2"><input v-model.number="t.custos_operacionais" type="number" step="0.01" class="bg-[#0b0f17] border border-white/5 rounded p-1 text-xs text-slate-300 font-mono outline-none w-full" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="flex flex-col flex-1 min-h-0">
            <div class="flex-1 overflow-x-auto overflow-y-hidden flex flex-col">
              <table class="w-full text-left border-collapse">
                <thead class="sticky top-0 bg-[#1b2230] z-20">
                  <tr class="text-[10px] font-black text-slate-500 uppercase border-b border-white/5">
                    <th class="p-4 bg-[#1b2230]">Data</th>
                    <th class="p-4 bg-[#1b2230]">Ativo / Descrição</th>
                    <th class="p-4 bg-[#1b2230]">Instituição</th>
                    <th class="p-4 bg-[#1b2230]">Qtd.</th>
                    <th class="p-4 bg-[#1b2230]">Preço Unit.</th>
                    <th class="p-4 bg-[#1b2230] text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-for="(t, index) in transacoesPaginadas" :key="index" class="hover:bg-white/[0.02]">
                    <td class="p-4 text-[11px] font-mono text-slate-500">{{ formatDate(t?.date) }}</td>
                    <td class="p-4">
                      <div class="flex flex-col">
                        <span class="text-sm font-bold text-white tracking-tight">{{ t?.ticket || '---' }}</span>
                        <span class="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[150px]">{{ t?.assetDescription }}</span>
                      </div>
                    </td>
                    <td class="p-4 text-[10px] text-slate-400 font-bold uppercase tracking-tight">{{ t?.brokerName || '---' }}</td>
                    <td class="p-4 text-xs font-mono text-slate-400 font-bold">{{ Number(t?.quantity || 0).toLocaleString('pt-BR') }}</td>
                    <td class="p-4 text-xs font-mono text-slate-400">R$ {{ formatCurrency(t?.priceUnit) }}</td>
                    <td class="p-4 text-right font-mono text-white text-sm font-bold">R$ {{ formatCurrency(t?.total) }}</td>
                  </tr>
                </tbody>
              </table>

              <div v-if="!loading && transacoesTotal.length === 0" class="p-10 text-center text-slate-600 uppercase text-[10px] font-black">
                Nenhuma movimentação no período.
              </div>
            </div>

            <div class="p-4 border-t border-white/5 flex justify-between items-center bg-[#1b2230]/30 shrink-0">
              <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Página {{ paginaAtual }} de {{ totalPaginas }} ({{ transacoesTotal.length }} registros)
              </span>
              <div class="flex gap-2">
                <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="px-4 py-2 bg-[#0b0f17] border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-emerald-500 disabled:opacity-20 transition-all">
                  Anterior
                </button>
                <button @click="paginaAtual++" :disabled="paginaAtual >= totalPaginas" class="px-4 py-2 bg-[#0b0f17] border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-emerald-500 disabled:opacity-20 transition-all">
                  Próximo
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  </div>
</template>
