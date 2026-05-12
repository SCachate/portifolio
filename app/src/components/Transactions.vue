<template>
  <div class="max-w-7xl mx-auto p-4 lg:p-8 space-y-8 text-slate-200">
    <!-- Header -->
    <header class="flex flex-col gap-1">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span class="text-xl">📈</span>
        </div>
        <h2 class="text-3xl font-black text-white tracking-tight">Portfólio Intelligence</h2>
      </div>
      <p class="text-slate-500 text-sm ml-13">Gestão de ativos com extração inteligente e filtros avançados.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- COLUNA ESQUERDA: ENTRADA (C) -->
      <section class="lg:col-span-4 space-y-6">
        
        <!-- Importador de PDF (O CORAÇÃO DO APP) -->
        <div class="group relative">
          <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-3xl cursor-pointer transition-all bg-slate-900/40">
            <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" :disabled="isProcessing" />
            
            <div v-if="isProcessing" class="flex flex-col items-center gap-2">
              <span class="animate-spin text-2xl">🔄</span>
              <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">
                Gemini está lendo<br/>sua nota de corretagem...
              </p>
            </div>
            
            <div v-else class="flex flex-col items-center gap-2 text-center p-4">
              <div class="p-3 bg-slate-800 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
                <span class="text-xl">✨</span>
              </div>
              <p class="text-sm font-bold text-slate-400">Importar PDF via IA</p>
              <p class="text-[10px] text-slate-600 uppercase">Extração automática de ativos e CNPJ</p>
            </div>
          </label>
        </div>

        <!-- Formulário Manual/Revisão -->
        <div class="bg-slate-900/60 border border-white/5 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Dados do Registro</h3>
          
          <div class="space-y-4">
            <!-- Select de Instituição -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Instituição (CNPJ)</label>
              <select v-model="form.cnpjInstituicao" class="w-full bg-slate-800 border-none rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500">
                <option value="" disabled>Selecione ou use o PDF...</option>
                <option v-for="inst in instituicoes" :key="inst.cnpj" :value="inst.cnpj">
                  {{ inst.nome }}
                </option>
              </select>
            </div>

            <!-- Ativo e Operação -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Ativo</label>
                <input v-model="form.ativo" type="text" placeholder="Ex: PETR4" class="w-full bg-slate-800 border-none rounded-xl text-sm text-white uppercase" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Operação</label>
                <select v-model="form.tipo" class="w-full bg-slate-800 border-none rounded-xl text-sm text-white">
                  <option value="COMPRA">Compra</option>
                  <option value="VENDA">Venda</option>
                </select>
              </div>
            </div>

            <!-- Quantidade e Preço -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Qtd</label>
                <input v-model.number="form.quantidade" type="number" class="w-full bg-slate-800 border-none rounded-xl text-sm text-white" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Preço Unit.</label>
                <input v-model.number="form.preco" type="number" step="0.01" class="w-full bg-slate-800 border-none rounded-xl text-sm text-white" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Data</label>
              <input v-model="form.data" type="date" class="w-full bg-slate-800 border-none rounded-xl text-sm text-white" />
            </div>
          </div>

          <button @click="adicionarTransacao" :disabled="!isFormValid" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-900/20">
            Confirmar Registro
          </button>
        </div>
      </section>

      <!-- COLUNA DIREITA: FILTROS E LISTA (R) -->
      <section class="lg:col-span-8 space-y-6">
        
        <!-- Área de Filtros -->
        <div class="bg-slate-900/80 border border-white/5 rounded-3xl p-6 shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span>🔍</span> Filtros de busca
            </h3>
            <button @click="resetFiltros" class="text-[9px] font-bold text-emerald-500 uppercase hover:underline">Limpar</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div class="space-y-1">
              <label class="text-[9px] text-slate-500 font-bold uppercase ml-1">Início (Obrigatório)</label>
              <input v-model="filtros.dataInicio" type="date" class="w-full bg-slate-800/50 border-none rounded-lg text-[11px] text-white" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] text-slate-500 font-bold uppercase ml-1">Fim (Obrigatório)</label>
              <input v-model="filtros.dataFim" type="date" class="w-full bg-slate-800/50 border-none rounded-lg text-[11px] text-white" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] text-slate-500 font-bold uppercase ml-1">Instituição</label>
              <select v-model="filtros.cnpj" class="w-full bg-slate-800/50 border-none rounded-lg text-[11px] text-white">
                <option value="">Todas</option>
                <option v-for="inst in instituicoes" :key="inst.cnpj" :value="inst.cnpj">{{ inst.nome }}</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-[9px] text-slate-500 font-bold uppercase ml-1">Ativo</label>
              <input v-model="filtros.ativo" type="text" placeholder="Ticker..." class="w-full bg-slate-800/50 border-none rounded-lg text-[11px] text-white uppercase" />
            </div>
          </div>
        </div>

        <!-- Tabela -->
        <div class="bg-slate-900/80 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[450px]">
          <table class="w-full text-left">
            <thead class="bg-white/5 text-[9px] text-slate-500 uppercase tracking-widest">
              <tr>
                <th class="p-5 font-bold">Data/Corretora</th>
                <th class="p-5 font-bold">Ativo</th>
                <th class="p-5 font-bold text-center">Qtd</th>
                <th class="p-5 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="item in transacoesFiltradas" :key="item.id" class="hover:bg-white/[0.02] transition-colors group">
                <td class="p-5">
                  <div class="flex flex-col">
                    <span class="text-xs font-mono text-slate-400">{{ formatDate(item.data) }}</span>
                    <span class="text-[9px] font-bold text-slate-600 uppercase">{{ getInstituicaoNome(item.cnpjInstituicao) }}</span>
                  </div>
                </td>
                <td class="p-5">
                  <div class="flex flex-col">
                    <span class="font-black text-white group-hover:text-emerald-400 transition-colors">{{ item.ativo }}</span>
                    <span :class="item.tipo === 'COMPRA' ? 'text-emerald-500' : 'text-rose-500'" class="text-[9px] font-black italic">
                      {{ item.tipo }}
                    </span>
                  </div>
                </td>
                <td class="p-5 text-center text-sm font-medium text-slate-300">{{ item.quantidade }}</td>
                <td class="p-5 text-right font-mono font-bold text-white text-sm">
                  R$ {{ (item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                </td>
              </tr>
              
              <tr v-if="transacoesFiltradas.length === 0">
                <td colspan="4" class="p-20 text-center text-slate-600 italic text-sm">
                  Nenhuma transação encontrada no período selecionado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- DATA MOCK ---
const instituicoes = [
  { nome: 'XP Investimentos', cnpj: '02.332.886/0001-04' },
  { nome: 'BTG Pactual', cnpj: '30.306.294/0001-45' },
  { nome: 'NuInvest', cnpj: '62.169.848/0001-73' },
  { nome: 'Inter Distribuidora', cnpj: '18.945.670/0001-46' }
];

// --- ESTADOS ---
const transacoes = ref([]);
const isProcessing = ref(false);
const fileName = ref('');

const getPrimeiroDiaMes = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

const getHoje = () => new Date().toISOString().split('T')[0];

const form = ref({
  data: getHoje(),
  cnpjInstituicao: '',
  ativo: '',
  quantidade: null,
  preco: null,
  tipo: 'COMPRA'
});

const filtros = ref({
  dataInicio: getPrimeiroDiaMes(),
  dataFim: getHoje(),
  cnpj: '',
  ativo: ''
});

// --- COMPUTED (A MÁGICA DOS FILTROS) ---
const isFormValid = computed(() => {
  return form.value.ativo && form.value.cnpjInstituicao && form.value.quantidade > 0 && form.value.preco > 0;
});

const transacoesFiltradas = computed(() => {
  return transacoes.value
    .filter(t => {
      const matchData = t.data >= filtros.value.dataInicio && t.data <= filtros.value.dataFim;
      const matchInst = filtros.value.cnpj ? t.cnpjInstituicao === filtros.value.cnpj : true;
      const matchAtivo = filtros.value.ativo ? t.ativo.toUpperCase().includes(filtros.value.ativo.toUpperCase()) : true;
      return matchData && matchInst && matchAtivo;
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data));
});

// --- MÉTODOS ---

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileName.value = file.name;
  isProcessing.value = true;

  try {
    // Simulação da chamada ao Gemini
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Supondo que a IA encontrou o CNPJ da BTG na nota
    const mockIA = {
      cnpj: '30.306.294/0001-45', 
      ticker: 'PETR4',
      qtd: 100,
      preco: 36.50,
      op: 'COMPRA',
      data: getHoje()
    };

    // Alimenta o formulário para revisão do usuário
    form.value = {
      cnpjInstituicao: mockIA.cnpj,
      ativo: mockIA.ticker,
      quantidade: mockIA.qtd,
      preco: mockIA.preco,
      tipo: mockIA.op,
      data: mockIA.data
    };

    alert("Gemini extraiu os dados! Revise os campos antes de confirmar.");
  } finally {
    isProcessing.value = false;
  }
};

const adicionarTransacao = () => {
  transacoes.value.unshift({ 
    ...form.value, 
    id: Date.now(), 
    ativo: form.value.ativo.toUpperCase() 
  });
  
  // Limpar form após salvar
  form.value = { data: getHoje(), cnpjInstituicao: '', ativo: '', quantidade: null, preco: null, tipo: 'COMPRA' };
  fileName.value = '';
};

const resetFiltros = () => {
  filtros.value = { dataInicio: getPrimeiroDiaMes(), dataFim: getHoje(), cnpj: '', ativo: '' };
};

const getInstituicaoNome = (cnpj) => instituicoes.find(i => i.cnpj === cnpj)?.nome || 'Outra';
const formatDate = (s) => s.split('-').reverse().join('/');
</script>

<style scoped>
/* Scrollbar custom para manter o design dark */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #10b981; }
</style>
