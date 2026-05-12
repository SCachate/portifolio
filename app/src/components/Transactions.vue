<template>
  <div class="max-w-6xl mx-auto p-4 lg:p-6 space-y-8">
    <!-- Header -->
    <header class="flex flex-col gap-1">
      <h2 class="text-3xl font-black text-white tracking-tight leading-none">Portfólio Intelligence</h2>
      <p class="text-slate-500 text-sm">Gestão de ativos com identificação por CNPJ via IA.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Coluna Esquerda: Cadastro -->
      <section class="lg:col-span-5 space-y-6">
        
        <!-- Importador de PDF -->
        <label class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-3xl cursor-pointer transition-all bg-slate-900/20 group">
          <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" :disabled="isProcessing" />
          
          <div v-if="isProcessing" class="flex flex-col items-center gap-2">
            <span class="animate-spin text-2xl">🔄</span>
            <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">IA analisando CNPJ da nota...</p>
          </div>
          
          <div v-else class="flex flex-col items-center gap-1">
            <span class="text-xl group-hover:scale-110 transition-transform">📄</span>
            <p class="text-sm font-bold text-slate-400">{{ fileName || 'Importar Nota de Corretagem' }}</p>
            <p class="text-[9px] text-slate-600 uppercase tracking-tighter">O Gemini identificará a corretora automaticamente</p>
          </div>
        </label>

        <!-- Formulário -->
        <div class="bg-slate-900/50 border border-white/5 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Dados da Transação</h3>
          
          <div class="space-y-4">
            <!-- Select de Instituição (Baseado no seu feedback) -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Instituição (CNPJ)</label>
              <select v-model="form.cnpjInstituicao" class="w-full bg-slate-800 border-none rounded-xl text-white focus:ring-2 focus:ring-emerald-500 appearance-none">
                <option value="" disabled>Selecione a corretora...</option>
                <option v-for="inst in instituicoes" :key="inst.cnpj" :value="inst.cnpj">
                  {{ inst.nome }} ({{ inst.cnpj }})
                </option>
              </select>
            </div>

            <!-- Ativo e Tipo -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Ativo</label>
                <input v-model="form.ativo" type="text" placeholder="Ex: PETR4" class="w-full bg-slate-800 border-none rounded-xl text-white uppercase" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Operação</label>
                <select v-model="form.tipo" class="w-full bg-slate-800 border-none rounded-xl text-white">
                  <option value="COMPRA">Compra</option>
                  <option value="VENDA">Venda</option>
                </select>
              </div>
            </div>

            <!-- Qtd e Preço -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Quantidade</label>
                <input v-model.number="form.quantidade" type="number" class="w-full bg-slate-800 border-none rounded-xl text-white" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Preço Unit.</label>
                <input v-model.number="form.preco" type="number" step="0.01" class="w-full bg-slate-800 border-none rounded-xl text-white" />
              </div>
            </div>

            <!-- Data -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Data</label>
              <input v-model="form.data" type="date" class="w-full bg-slate-800 border-none rounded-xl text-white" />
            </div>
          </div>

          <button @click="adicionarTransacao" :disabled="!isFormValid" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-900/20">
            Confirmar e Salvar
          </button>
        </div>
      </section>

      <!-- Coluna Direita: Listagem -->
      <section class="lg:col-span-7">
        <div class="bg-slate-900/80 border border-white/5 rounded-3xl shadow-2xl flex flex-col h-full min-h-[550px] overflow-hidden">
          <div class="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
            <h3 class="font-bold text-white">Histórico de Movimentações</h3>
            <span class="text-[10px] text-slate-500 font-mono">UUID: Sessão Ativa</span>
          </div>

          <div class="overflow-y-auto flex-1">
            <table class="w-full text-left">
              <thead class="sticky top-0 bg-slate-900 shadow-sm z-10">
                <tr class="text-[9px] text-slate-500 uppercase tracking-[0.2em]">
                  <th class="p-5">Instituição / CNPJ</th>
                  <th class="p-5">Ativo</th>
                  <th class="p-5">Qtd</th>
                  <th class="p-5 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="item in transacoes" :key="item.id" class="hover:bg-white/[0.02] transition-colors group">
                  <td class="p-5">
                    <div class="flex flex-col">
                      <span class="text-xs font-bold text-slate-200 uppercase">{{ getInstituicaoNome(item.cnpjInstituicao) }}</span>
                      <span class="text-[9px] font-mono text-slate-500">{{ item.cnpjInstituicao }}</span>
                    </div>
                  </td>
                  <td class="p-5">
                    <div class="flex flex-col">
                      <span class="font-black text-emerald-400 uppercase tracking-tight">{{ item.ativo }}</span>
                      <span class="text-[9px] font-bold text-slate-500">{{ formatDate(item.data) }}</span>
                    </div>
                  </td>
                  <td class="p-5 text-sm text-slate-300 font-medium">{{ item.quantidade }}</td>
                  <td class="p-5 text-right font-mono font-bold text-white">
                    R$ {{ (item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
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
import { ref, computed } from 'vue';

// Lista de instituições (Value = CNPJ)
const instituicoes = [
  { nome: 'XP Investimentos', cnpj: '02.332.886/0001-04' },
  { nome: 'BTG Pactual', cnpj: '30.306.294/0001-45' },
  { nome: 'NuInvest', cnpj: '62.169.848/0001-73' },
  { nome: 'Inter Distribuidora', cnpj: '18.945.670/0001-46' }
];

const transacoes = ref([]);
const isProcessing = ref(false);
const fileName = ref('');

const form = ref({
  data: new Date().toISOString().substr(0, 10),
  cnpjInstituicao: '',
  ativo: '',
  quantidade: null,
  preco: null,
  tipo: 'COMPRA'
});

const isFormValid = computed(() => {
  return form.value.ativo && form.value.cnpjInstituicao && form.value.quantidade > 0 && form.value.preco > 0;
});

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileName.value = file.name;
  isProcessing.value = true;

  try {
    // Simulação do Gemini lendo a nota
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockIA = {
      cnpjEncontrado: '02.332.886/0001-04', // IA leu o CNPJ da XP na nota
      ticker: 'VALE3',
      quantidade: 10,
      preco: 72.45,
      operacao: 'COMPRA',
      data: '2023-10-27'
    };

    // Setamos o value do select via CNPJ
    form.value = {
      cnpjInstituicao: mockIA.cnpjEncontrado,
      ativo: mockIA.ticker,
      quantidade: mockIA.quantidade,
      preco: mockIA.preco,
      tipo: mockIA.operacao,
      data: mockIA.data
    };

  } finally {
    isProcessing.value = false;
  }
};

const adicionarTransacao = () => {
  if (!isFormValid.value) return;
  transacoes.value.unshift({ ...form.value, id: Date.now() });
  resetForm();
};

const resetForm = () => {
  form.value = { 
    data: new Date().toISOString().substr(0, 10), 
    cnpjInstituicao: '', 
    ativo: '', 
    quantidade: null, 
    preco: null, 
    tipo: 'COMPRA' 
  };
  fileName.value = '';
};

const getInstituicaoNome = (cnpj) => {
  const inst = instituicoes.find(i => i.cnpj === cnpj);
  return inst ? inst.nome : 'Desconhecida';
};

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
</script>
