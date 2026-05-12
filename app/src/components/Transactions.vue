<template>
  <div class="min-h-screen bg-[#0b0f17] text-slate-300 font-sans p-8 pt-6 max-w-[1600px] mx-auto">
    
    <!-- MODAL NOVO ATIVO -->
    <div v-if="showNovoAtivoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div class="bg-[#161b26] border border-white/5 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h3 class="text-lg font-bold text-white mb-6">Cadastrar Novo Ativo</h3>
        <div class="space-y-4">
          <input v-model="novoAtivoForm.nome" placeholder="Nome/Ticker" class="w-full bg-[#0b0f17] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500" />
          <select v-model="novoAtivoForm.tipo" class="w-full bg-[#0b0f17] border border-white/10 rounded-lg p-3 text-white outline-none">
            <option value="Ações">Ações</option>
            <option value="FII">FII</option>
            <option value="Renda fixa">Renda fixa</option>
            <option value="Internacional">Internacional</option>
          </select>
          <div class="flex gap-3 pt-4">
            <button @click="showNovoAtivoModal = false" class="flex-1 py-2 text-slate-500 font-medium">Cancelar</button>
            <button @click="salvarNovoAtivo" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all">Salvar</button>
          </div>
        </div>
      </div>
    </div>
    <header class="mb-8 space-y-2">
      <h1 class="text-3xl font-bold text-white tracking-tight">Histórico de Movimentações</h1>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- COLUNA ESQUERDA: CADASTRO -->
      <section class="lg:col-span-4 space-y-4">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 space-y-6">
          
          <!-- Área de Upload -->
          <label class="flex flex-col items-center justify-center w-full h-28 border border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all bg-[#0b0f17]/50 group">
            <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" />
            <span class="text-[10px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest text-center px-4">
              {{ fileName || 'Importar Nota de Corretagem' }}
            </span>
          </label>

          <div class="space-y-4">
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">
                <label>Ativo</label>
                <button @click="showNovoAtivoModal = true" class="text-emerald-500 hover:brightness-125">+ Adicionar</button>
              </div>
              <select v-model="form.ativoId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500/50 appearance-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="a in ativosCadastrados" :key="a.id" :value="a.id">{{ a.nome }}</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1 block">Corretora</label>
              <select v-model="form.cnpjInstituicao" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none appearance-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="i in instituicoes" :key="i.cnpj" :value="i.cnpj">{{ i.nome }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">Quantidade</label>
                <input v-model.number="form.quantidade" type="number" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">Preço Unit.</label>
                <input v-model.number="form.preco" type="number" step="0.01" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none" />
              </div>
            </div>

            <button @click="adicionarTransacao" :disabled="!isFormValid" class="w-full py-4 bg-[#1e293b] hover:bg-[#2d3a4f] disabled:opacity-30 text-white font-bold rounded-lg transition-all text-sm mt-2">
              Registrar Transação
            </button>
          </div>
        </div>
      </section>

      <!-- COLUNA DIREITA: FILTROS E TABELA -->
      <section class="lg:col-span-8 space-y-4">
        
        <!-- Filtros (Alinhados com o design da imagem) -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-5 flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px] space-y-2">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Período</label>
            <div class="flex gap-2">
              <input v-model="filtros.dataInicio" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
              <input v-model="filtros.dataFim" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
            </div>
          </div>
          <div class="flex-1 min-w-[150px] space-y-2">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Instituição</label>
            <select v-model="filtros.cnpj" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none">
              <option value="">Todas</option>
              <option v-for="i in instituicoes" :key="i.cnpj" :value="i.cnpj">{{ i.nome }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-[150px] space-y-2">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ativo</label>
            <select v-model="filtros.ativoId" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none">
              <option value="">Todos</option>
              <option v-for="a in ativosCadastrados" :key="a.id" :value="a.id">{{ a.nome }}</option>
            </select>
          </div>
        </div>

        <!-- Tabela -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                <th class="p-4">Data</th>
                <th class="p-4">Ativo / Tipo</th>
                <th class="p-4">Instituição</th>
                <th class="p-4 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="item in transacoesFiltradas" :key="item.id" class="hover:bg-white/[0.01]">
                <td class="p-4 text-xs font-mono text-slate-500">{{ formatDate(item.data) }}</td>
                <td class="p-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-white">{{ getAtivoNome(item.ativoId) }}</span>
                    <span class="text-[9px] text-slate-600 font-black uppercase">{{ getAtivoTipo(item.ativoId) }}</span>
                  </div>
                </td>
                <td class="p-4 text-xs text-slate-500">{{ getInstituicaoNome(item.cnpjInstituicao) }}</td>
                <td class="p-4 text-right font-mono text-white text-sm">
                  R$ {{ (item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
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

const instituicoes = [
  { nome: 'XP Investimentos', cnpj: '02.332.886/0001-04' },
  { nome: 'BTG Pactual', cnpj: '30.306.294/0001-45' },
  { nome: 'Banco Inter', cnpj: '18.945.670/0001-46' }
];

const ativosCadastrados = ref([
  { id: 1, nome: 'PETR4', tipo: 'Ações' },
  { id: 2, nome: 'CDB INTER 102%', tipo: 'Renda fixa' }
]);

const transacoes = ref([]);
const showNovoAtivoModal = ref(false);
const fileName = ref('');
const getHoje = () => new Date().toISOString().split('T')[0];

const form = ref({ ativoId: '', cnpjInstituicao: '', quantidade: null, preco: null, data: getHoje() });
const novoAtivoForm = ref({ nome: '', tipo: 'Ações' });
const filtros = ref({ dataInicio: '2024-01-01', dataFim: getHoje(), ativoId: '', cnpj: '' });

const isFormValid = computed(() => form.value.ativoId && form.value.quantidade > 0 && form.value.preco > 0);

const transacoesFiltradas = computed(() => {
  return transacoes.value.filter(t => {
    const matchData = t.data >= filtros.value.dataInicio && t.data <= filtros.value.dataFim;
    const matchAtivo = filtros.value.ativoId ? t.ativoId === filtros.value.ativoId : true;
    const matchInst = filtros.value.cnpj ? t.cnpjInstituicao === filtros.value.cnpj : true;
    return matchData && matchAtivo && matchInst;
  }).sort((a, b) => new Date(b.data) - new Date(a.data));
});

const salvarNovoAtivo = () => {
  if (!novoAtivoForm.value.nome) return;
  const novo = { ...novoAtivoForm.value, id: Date.now(), nome: novoAtivoForm.value.nome.toUpperCase() };
  ativosCadastrados.value.push(novo);
  form.value.ativoId = novo.id;
  showNovoAtivoModal.value = false;
  novoAtivoForm.value = { nome: '', tipo: 'Ações' };
};

const adicionarTransacao = () => {
  transacoes.value.unshift({ ...form.value, id: Date.now() });
  form.value = { ativoId: '', cnpjInstituicao: '', quantidade: null, preco: null, data: getHoje() };
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  fileName.value = file.name;
};

const getAtivoNome = (id) => ativosCadastrados.value.find(a => a.id === id)?.nome || '---';
const getAtivoTipo = (id) => ativosCadastrados.value.find(a => a.id === id)?.tipo || '---';
const getInstituicaoNome = (cnpj) => instituicoes.find(i => i.cnpj === cnpj)?.nome || '---';
const formatDate = (s) => s.split('-').reverse().join('/');
</script>
