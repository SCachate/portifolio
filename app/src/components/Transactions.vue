<template>
  <div class="max-w-7xl mx-auto p-4 lg:p-8 space-y-8 text-slate-200">
    
    <!-- MODAL: CADASTRAR NOVO ATIVO -->
    <Transition name="fade">
      <div v-if="showNovoAtivoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="showNovoAtivoModal = false"></div>
        <div class="relative bg-slate-900 border border-emerald-500/30 p-8 rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-black text-white uppercase tracking-tighter">Novo Ativo</h3>
            <span class="text-2xl">🏷️</span>
          </div>
          
          <div class="space-y-4">
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Nome ou Ticker</label>
              <input v-model="novoAtivoForm.nome" placeholder="Ex: PETR4 ou CDB XP 102%" class="w-full bg-slate-800 border-none rounded-2xl text-white p-4 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Categoria</label>
              <select v-model="novoAtivoForm.tipo" class="w-full bg-slate-800 border-none rounded-2xl text-white p-4 text-sm focus:ring-2 focus:ring-emerald-500">
                <option value="RENDA_VARIAVEL">Renda Variável (Ações/FIIs)</option>
                <option value="RENDA_FIXA">Renda Fixa (CDB/Tesouro)</option>
              </select>
            </div>
            <div class="flex gap-3 pt-4">
              <button @click="showNovoAtivoModal = false" class="flex-1 py-4 text-slate-400 font-bold uppercase text-xs hover:text-white transition-colors">Cancelar</button>
              <button @click="salvarNovoAtivo" class="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-emerald-900/40 transition-all">Salvar Ativo</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- HEADER -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 rotate-3">
          <span class="text-2xl">💎</span>
        </div>
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight leading-none">Portfólio Intelligence</h2>
          <p class="text-slate-500 text-sm mt-1">Gestão patrimonial assistida por IA.</p>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- COLUNA ESQUERDA: CADASTRO -->
      <section class="lg:col-span-4 space-y-6">
        
        <!-- Importador PDF -->
        <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-[2.5rem] cursor-pointer transition-all bg-slate-900/40 group overflow-hidden relative">
          <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" :disabled="isProcessing" />
          <div v-if="isProcessing" class="flex flex-col items-center gap-2">
            <span class="animate-spin text-2xl">🔄</span>
            <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">IA analisando nota...</p>
          </div>
          <div v-else class="flex flex-col items-center gap-1">
            <div class="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">📄</div>
            <p class="text-xs font-bold text-slate-400 mt-1">{{ fileName || 'Importar Nota de Corretagem' }}</p>
          </div>
        </label>

        <!-- Formulário de Transação -->
        <div class="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <h3 class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] text-center">Nova Movimentação</h3>
          
          <div class="space-y-4">
            <!-- Ativo -->
            <div class="space-y-2">
              <div class="flex justify-between px-1">
                <label class="text-[10px] font-black text-slate-500 uppercase">Ativo</label>
                <button @click="showNovoAtivoModal = true" class="text-[10px] text-emerald-500 font-black uppercase hover:brightness-125">+ Cadastrar Novo</button>
              </div>
              <select v-model="form.ativoId" class="w-full bg-slate-800/50 border-none rounded-2xl text-sm text-white p-4 focus:ring-2 focus:ring-emerald-500 appearance-none">
                <option value="" disabled>Selecione um ativo...</option>
                <option v-for="a in ativosCadastrados" :key="a.id" :value="a.id">{{ a.nome }}</option>
              </select>
            </div>

            <!-- Instituição -->
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-500 uppercase px-1">Corretora</label>
              <select v-model="form.cnpjInstituicao" class="w-full bg-slate-800/50 border-none rounded-2xl text-sm text-white p-4 appearance-none">
                <option value="" disabled>Onde foi operado?</option>
                <option v-for="i in instituicoes" :key="i.cnpj" :value="i.cnpj">{{ i.nome }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <input v-model.number="form.quantidade" type="number" placeholder="Qtd" class="bg-slate-800/50 border-none rounded-2xl text-white p-4 text-sm" />
              <input v-model.number="form.preco" type="number" step="0.01" placeholder="Preço R$" class="bg-slate-800/50 border-none rounded-2xl text-white p-4 text-sm" />
            </div>

            <input v-model="form.data" type="date" class="w-full bg-slate-800/50 border-none rounded-2xl text-white p-4 text-sm" />

            <button @click="adicionarTransacao" :disabled="!isFormValid" class="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-900/20 mt-2">
              Salvar Registro
            </button>
          </div>
        </div>
      </section>

      <!-- COLUNA DIREITA: LISTA E FILTROS -->
      <section class="lg:col-span-8 space-y-6">
        
        <!-- Barra de Filtros -->
        <div class="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="space-y-1">
              <label class="text-[9px] font-black text-slate-600 uppercase ml-1">Início</label>
              <input v-model="filtros.dataInicio" type="date" class="w-full bg-slate-800 border-none rounded-xl text-[11px] text-white p-2" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black text-slate-600 uppercase ml-1">Fim</label>
              <input v-model="filtros.dataFim" type="date" class="w-full bg-slate-800 border-none rounded-xl text-[11px] text-white p-2" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black text-slate-600 uppercase ml-1">Ativo</label>
              <select v-model="filtros.ativoId" class="w-full bg-slate-800 border-none rounded-xl text-[11px] text-white p-2">
                <option value="">Todos</option>
                <option v-for="a in ativosCadastrados" :key="a.id" :value="a.id">{{ a.nome }}</option>
              </select>
            </div>
            <div class="flex items-end">
              <button @click="resetFiltros" class="w-full py-2 text-[9px] font-black uppercase text-slate-500 hover:text-emerald-500 transition-colors">Limpar Busca</button>
            </div>
          </div>
        </div>

        <!-- Lista Resultante -->
        <div class="bg-slate-900/60 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
          <table class="w-full text-left">
            <thead class="bg-white/5 text-[9px] text-slate-500 uppercase tracking-[0.2em]">
              <tr>
                <th class="p-6">Data / Instituição</th>
                <th class="p-6 text-center">Ativo</th>
                <th class="p-6 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="item in transacoesFiltradas" :key="item.id" class="hover:bg-white/[0.02] transition-colors group">
                <td class="p-6">
                  <div class="flex flex-col gap-1">
                    <span class="text-xs font-mono text-slate-400">{{ formatDate(item.data) }}</span>
                    <span class="text-[9px] font-black text-slate-600 uppercase italic">{{ getInstituicaoNome(item.cnpjInstituicao) }}</span>
                  </div>
                </td>
                <td class="p-6 text-center">
                  <div class="flex flex-col items-center">
                    <span class="font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{{ getAtivoNome(item.ativoId) }}</span>
                    <span class="text-[8px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold mt-1">
                      {{ getAtivoTipo(item.ativoId) }}
                    </span>
                  </div>
                </td>
                <td class="p-6 text-right font-mono font-black text-white">
                  R$ {{ (item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                </td>
              </tr>
              <tr v-if="transacoesFiltradas.length === 0">
                <td colspan="3" class="p-24 text-center text-slate-600 italic text-sm">Nenhum registro encontrado.</td>
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

// --- DATA MOCK INICIAL ---
const instituicoes = [
  { nome: 'XP Investimentos', cnpj: '02.332.886/0001-04' },
  { nome: 'BTG Pactual', cnpj: '30.306.294/0001-45' },
  { nome: 'NuInvest', cnpj: '62.169.848/0001-73' }
];

const ativosCadastrados = ref([
  { id: 1, nome: 'PETR4', tipo: 'RENDA_VARIAVEL' },
  { id: 2, nome: 'CDB INTER 102%', tipo: 'RENDA_FIXA' }
]);

// --- ESTADOS ---
const transacoes = ref([]);
const isProcessing = ref(false);
const fileName = ref('');
const showNovoAtivoModal = ref(false);

const getHoje = () => new Date().toISOString().split('T')[0];
const getPrimeiroDiaMes = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

const form = ref({ ativoId: '', cnpjInstituicao: '', quantidade: null, preco: null, data: getHoje(), tipo: 'COMPRA' });
const novoAtivoForm = ref({ nome: '', tipo: 'RENDA_VARIAVEL' });
const filtros = ref({ dataInicio: getPrimeiroDiaMes(), dataFim: getHoje(), ativoId: '', cnpj: '' });

// --- LÓGICA FILTRADA ---
const isFormValid = computed(() => form.value.ativoId && form.value.cnpjInstituicao && form.value.quantidade > 0);

const transacoesFiltradas = computed(() => {
  return transacoes.value.filter(t => {
    const matchData = t.data >= filtros.value.dataInicio && t.data <= filtros.value.dataFim;
    const matchAtivo = filtros.value.ativoId ? t.ativoId === filtros.value.ativoId : true;
    return matchData && matchAtivo;
  }).sort((a, b) => new Date(b.data) - new Date(a.data));
});

// --- MÉTODOS ---
const salvarNovoAtivo = () => {
  if (!novoAtivoForm.value.nome) return;
  const novo = { ...novoAtivoForm.value, id: Date.now(), nome: novoAtivoForm.value.nome.toUpperCase() };
  ativosCadastrados.value.push(novo);
  form.value.ativoId = novo.id; // Já seleciona o recém criado
  showNovoAtivoModal.value = false;
  novoAtivoForm.value = { nome: '', tipo: 'RENDA_VARIAVEL' };
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  fileName.value = file.name;
  isProcessing.value = true;
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Exemplo: IA detectou PETR4 que já existe (ID 1)
  form.value = {
    ativoId: 1, 
    cnpjInstituicao: '02.332.886/0001-04',
    quantidade: 100,
    preco: 35.20,
    data: getHoje(),
    tipo: 'COMPRA'
  };
  isProcessing.value = false;
};

const adicionarTransacao = () => {
  transacoes.value.unshift({ ...form.value, id: Date.now() });
  form.value = { ativoId: '', cnpjInstituicao: '', quantidade: null, preco: null, data: getHoje(), tipo: 'COMPRA' };
  fileName.value = '';
};

const resetFiltros = () => { filtros.value = { dataInicio: getPrimeiroDiaMes(), dataFim: getHoje(), ativoId: '', cnpj: '' }; };
const getAtivoNome = (id) => ativosCadastrados.value.find(a => a.id === id)?.nome || '---';
const getAtivoTipo = (id) => ativosCadastrados.value.find(a => a.id === id)?.tipo || '---';
const getInstituicaoNome = (cnpj) => instituicoes.find(i => i.cnpj === cnpj)?.nome || 'Outra';
const formatDate = (s) => s.split('-').reverse().join('/');
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #10b981; }
</style>
