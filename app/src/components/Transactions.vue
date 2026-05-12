<template>
  <div class="max-w-6xl mx-auto p-4 lg:p-6 space-y-8 text-slate-200">
    <!-- Header -->
    <header class="flex flex-col gap-1">
      <h2 class="text-3xl font-black text-white tracking-tight">Portfólio Intelligence</h2>
      <p class="text-slate-500 text-sm">Controle de transações com filtros avançados.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Coluna Esquerda: Cadastro (Create) -->
      <section class="lg:col-span-4 space-y-6">
        <!-- [O código do formulário e upload permanece o mesmo do passo anterior] -->
        <div class="bg-slate-900/50 border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Nova Transação</h3>
          <!-- ... (inputs de data, cnpj, ativo, qtd, preco) ... -->
           <div class="space-y-4">
            <select v-model="form.cnpjInstituicao" class="w-full bg-slate-800 border-none rounded-xl text-white">
              <option value="" disabled>Corretora...</option>
              <option v-for="inst in instituicoes" :key="inst.cnpj" :value="inst.cnpj">{{ inst.nome }}</option>
            </select>
            <input v-model="form.ativo" type="text" placeholder="Ativo" class="w-full bg-slate-800 border-none rounded-xl text-white uppercase" />
            <div class="grid grid-cols-2 gap-4">
              <input v-model.number="form.quantidade" type="number" placeholder="Qtd" class="w-full bg-slate-800 border-none rounded-xl text-white" />
              <input v-model.number="form.preco" type="number" step="0.01" placeholder="Preço" class="w-full bg-slate-800 border-none rounded-xl text-white" />
            </div>
            <input v-model="form.data" type="date" class="w-full bg-slate-800 border-none rounded-xl text-white" />
            <button @click="adicionarTransacao" :disabled="!isFormValid" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs transition-all">Salvar</button>
          </div>
        </div>
      </section>

      <!-- Coluna Direita: Listagem com Filtros (Read) -->
      <section class="lg:col-span-8 space-y-4">
        
        <!-- Barra de Filtros -->
        <div class="bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 class="font-bold text-white flex items-center gap-2">
              <span>🔍</span> Filtros de Busca
            </h3>
            <button @click="limparFiltros" class="text-[10px] text-slate-500 hover:text-white uppercase font-bold transition-colors">Limpar Filtros</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <!-- Data Início (Obrigatório) -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase">Início</label>
              <input v-model="filtros.dataInicio" type="date" class="bg-slate-800 border-none rounded-lg text-xs text-white focus:ring-emerald-500" />
            </div>

            <!-- Data Fim (Obrigatório) -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase">Fim</label>
              <input v-model="filtros.dataFim" type="date" class="bg-slate-800 border-none rounded-lg text-xs text-white focus:ring-emerald-500" />
            </div>

            <!-- Instituição (Opcional) -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase">Instituição</label>
              <select v-model="filtros.cnpj" class="bg-slate-800 border-none rounded-lg text-xs text-white focus:ring-emerald-500">
                <option value="">Todas</option>
                <option v-for="inst in instituicoes" :key="inst.cnpj" :value="inst.cnpj">{{ inst.nome }}</option>
              </select>
            </div>

            <!-- Ativo (Opcional) -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase">Ativo</label>
              <input v-model="filtros.ativo" type="text" placeholder="Filtrar ticker..." class="bg-slate-800 border-none rounded-lg text-xs text-white placeholder:text-slate-600 focus:ring-emerald-500 uppercase" />
            </div>
          </div>
        </div>

        <!-- Tabela Resultante -->
        <div class="bg-slate-900/80 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-white/5 text-[9px] text-slate-500 uppercase tracking-widest">
                <tr>
                  <th class="p-4">Data</th>
                  <th class="p-4">Instituição</th>
                  <th class="p-4">Ativo</th>
                  <th class="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="item in transacoesFiltradas" :key="item.id" class="hover:bg-white/[0.02] transition-colors group">
                  <td class="p-4 text-xs font-mono text-slate-400">{{ formatDate(item.data) }}</td>
                  <td class="p-4">
                    <span class="text-[10px] font-bold text-slate-300 block uppercase">{{ getInstituicaoNome(item.cnpjInstituicao) }}</span>
                  </td>
                  <td class="p-4">
                    <span class="font-black text-emerald-400 uppercase">{{ item.ativo }}</span>
                  </td>
                  <td class="p-4 text-right font-mono font-bold text-white text-sm">
                    R$ {{ (item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                  </td>
                </tr>
                <tr v-if="transacoesFiltradas.length === 0">
                  <td colspan="4" class="p-12 text-center text-slate-600 italic text-sm">
                    Nenhuma transação encontrada para este período/filtros.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Mock de Instituições
const instituicoes = [
  { nome: 'XP Investimentos', cnpj: '02.332.886/0001-04' },
  { nome: 'BTG Pactual', cnpj: '30.306.294/0001-45' },
  { nome: 'NuInvest', cnpj: '62.169.848/0001-73' }
];

const transacoes = ref([]); // Lista original (o CRUD)

// --- LÓGICA DE FILTROS ---

// Helper para pegar primeiro dia do mês atual
const getPrimeiroDiaMes = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

// Helper para pegar hoje
const getHoje = () => new Date().toISOString().split('T')[0];

const filtros = ref({
  dataInicio: getPrimeiroDiaMes(),
  dataFim: getHoje(),
  cnpj: '',
  ativo: ''
});

// A "Mágica" do Read Filtrado
const transacoesFiltradas = computed(() => {
  return transacoes.value.filter(t => {
    const matchData = t.data >= filtros.value.dataInicio && t.data <= filtros.value.dataFim;
    const matchInstituicao = filtros.value.cnpj ? t.cnpjInstituicao === filtros.value.cnpj : true;
    const matchAtivo = filtros.value.ativo ? t.ativo.toLowerCase().includes(filtros.value.ativo.toLowerCase()) : true;
    
    return matchData && matchInstituicao && matchAtivo;
  }).sort((a, b) => new Date(b.data) - new Date(a.data)); // Ordena por data (mais recente primeiro)
});

const limparFiltros = () => {
  filtros.value = {
    dataInicio: getPrimeiroDiaMes(),
    dataFim: getHoje(),
    cnpj: '',
    ativo: ''
  };
};

// --- RESTO DA LÓGICA (CREATE) ---

const form = ref({
  data: getHoje(),
  cnpjInstituicao: '',
  ativo: '',
  quantidade: null,
  preco: null,
  tipo: 'COMPRA'
});

const isFormValid = computed(() => form.value.ativo && form.value.cnpjInstituicao && form.value.quantidade > 0);

const adicionarTransacao = () => {
  transacoes.value.push({ ...form.value, id: Date.now(), ativo: form.value.ativo.toUpperCase() });
  form.value = { data: getHoje(), cnpjInstituicao: '', ativo: '', quantidade: null, preco: null, tipo: 'COMPRA' };
};

const getInstituicaoNome = (cnpj) => instituicoes.find(i => i.cnpj === cnpj)?.nome || 'Outra';
const formatDate = (s) => s.split('-').reverse().join('/');
</script>
