<template>
  <div class="min-h-screen bg-[#0b0f17] text-slate-300 font-sans">
    
    <!-- MODAL NOVO ATIVO (Estilo image_8ee1c2.png) -->
    <div v-if="showNovoAtivoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div class="bg-[#161b26] border border-white/5 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h3 class="text-lg font-bold text-white mb-6">Cadastrar Novo Ativo</h3>
        <div class="space-y-4">
          <input v-model="novoAtivoForm.nome" placeholder="Nome/Ticker" class="w-full bg-[#0b0f17] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" />
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

    <!-- TÍTULO SUPERIOR (Conforme image_8ee1c2.png) -->
    <div class="border-b border-white/5 px-8 py-4">
      <h1 class="text-sm font-bold text-white uppercase tracking-wider">Transações</h1>
    </div>

    <div class="p-8 max-w-[1600px] mx-auto space-y-8">
      
      <!-- TÍTULO DA SEÇÃO -->
      <div class="flex justify-between items-end">
        <h2 class="text-2xl font-bold text-white">Histórico de Movimentações</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- CARD DE CADASTRO (Lado Esquerdo) -->
        <section class="lg:col-span-4 space-y-4">
          <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 space-y-6">
            
            <!-- Botão Importar PDF (Sutil) -->
            <label class="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all bg-[#0b0f17]/50 group">
              <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" />
              <span class="text-xs font-bold text-slate-500 group-hover:text-emerald-500 transition-colors uppercase">
                {{ fileName || 'Importar Nota de Corretagem' }}
              </span>
            </label>

            <div class="space-y-4">
              <div class="space-y-1">
                <div class="flex justify-between text-[11px] font-bold uppercase text-slate-500">
                  <label>Ativo</label>
                  <button @click="showNovoAtivoModal = true" class="text-emerald-500 hover:underline">+ Adicionar</button>
                </div>
                <select v-model="form.ativoId" class="w-full bg-[#0b0f17] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500">
                  <option value="" disabled>Selecione...</option>
                  <option v-for="a in ativosCadastrados" :key="a.id" :value="a.id">{{ a.nome }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-[11px] font-bold uppercase text-slate-500">Corretora</label>
                <select v-model="form.cnpjInstituicao" class="w-full bg-[#0b0f17] border border-white/10 rounded-lg p-3 text-sm text-white outline-none">
                  <option v-for="i in instituicoes" :key="i.cnpj" :value="i.cnpj">{{ i.nome }}</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[11px] font-bold uppercase text-slate-500">Quantidade</label>
                  <input v-model.number="form.quantidade" type="number" class="w-full bg-[#0b0f17] border border-white/10 rounded-lg p-3 text-sm text-white" />
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-bold uppercase text-slate-500">Preço Unit.</label>
                  <input v-model.number="form.preco" type="number" step="0.01" class="w-full bg-[#0b0f17] border border-white/10 rounded-lg p-3 text-sm text-white" />
                </div>
              </div>

              <button @click="adicionarTransacao" :disabled="!isFormValid" class="w-full py-3 bg-[#3b82f6] hover:bg-blue-600 disabled:bg-slate-800 text-white font-bold rounded-lg transition-all shadow-lg">
                Registrar Transação
              </button>
            </div>
          </div>
        </section>

        <!-- LISTA E FILTROS (Lado Direito) -->
        <section class="lg:col-span-8 space-y-4">
          
          <!-- Filtros Reativos -->
          <div class="bg-[#161b26] rounded-xl border border-white/5 p-4 flex flex-wrap gap-4">
            <div class="flex-1 min-w-[140px]">
              <label class="text-[10px] font-bold text-slate-600 uppercase block mb-1">Período</label>
              <div class="flex gap-2">
                <input v-input v-model="filtros.dataInicio" type="date" class="bg-[#0b0f17] border border-white/5 rounded p-2 text-[11px] w-full" />
                <input v-input v-model="filtros.dataFim" type="date" class="bg-[#0b0f17] border border-white/5 rounded p-2 text-[11px] w-full" />
              </div>
            </div>
            <div class="flex-1 min-w-[140px]">
              <label class="text-[10px] font-bold text-slate-600 uppercase block mb-1">Instituição</label>
              <select v-model="filtros.cnpj" class="bg-[#0b0f17] border border-white/5 rounded p-2 text-[11px] w-full text-white">
                <option value="">Todas</option>
                <option v-for="i in instituicoes" :key="i.cnpj" :value="i.cnpj">{{ i.nome }}</option>
              </select>
            </div>
            <div class="flex-1 min-w-[140px]">
              <label class="text-[10px] font-bold text-slate-600 uppercase block mb-1">Ativo</label>
              <select v-model="filtros.ativoId" class="bg-[#0b0f17] border border-white/5 rounded p-2 text-[11px] w-full text-white">
                <option value="">Todos</option>
                <option v-for="a in ativosCadastrados" :key="a.id" :value="a.id">{{ a.nome }}</option>
              </select>
            </div>
          </div>

          <!-- Tabela Estilo Premium Dark -->
          <div class="bg-[#161b26] rounded-xl border border-white/5 overflow-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/5 bg-white/[0.02]">
                  <th class="p-4 text-[11px] font-bold text-slate-500 uppercase">Data</th>
                  <th class="p-4 text-[11px] font-bold text-slate-500 uppercase">Ativo / Tipo</th>
                  <th class="p-4 text-[11px] font-bold text-slate-500 uppercase">Instituição</th>
                  <th class="p-4 text-[11px] font-bold text-slate-500 uppercase text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="item in transacoesFiltradas" :key="item.id" class="hover:bg-white/[0.01] transition-colors">
                  <td class="p-4 text-sm text-slate-400 font-mono">{{ formatDate(item.data) }}</td>
                  <td class="p-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-white">{{ getAtivoNome(item.ativoId) }}</span>
                      <span class="text-[10px] text-slate-600 font-bold">{{ getAtivoTipo(item.ativoId) }}</span>
                    </div>
                  </td>
                  <td class="p-4 text-sm text-slate-500">{{ getInstituicaoNome(item.cnpjInstituicao) }}</td>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- MOCKS ---
const instituicoes = [
  { nome: 'XP Investimentos', cnpj: '02.332.886/0001-04' },
  { nome: 'BTG Pactual', cnpj: '30.306.294/0001-45' },
  { nome: 'Banco Inter', cnpj: '18.945.670/0001-46' }
];

const ativosCadastrados = ref([
  { id: 1, nome: 'PETR4', tipo: 'Ações' },
  { id: 2, nome: 'CDB INTER 102%', tipo: 'Renda fixa' }
]);

// --- ESTADOS ---
const transacoes = ref([]);
const showNovoAtivoModal = ref(false);
const fileName = ref('');
const getHoje = () => new Date().toISOString().split('T')[0];

const form = ref({ ativoId: '', cnpjInstituicao: '', quantidade: null, preco: null, data: getHoje() });
const novoAtivoForm = ref({ nome: '', tipo: 'Ações' });
const filtros = ref({ dataInicio: '2024-01-01', dataFim: getHoje(), ativoId: '', cnpj: '' });

// --- LÓGICA ---
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

const getAtivoNome = (id) => ativosCadastrados.value.find(a => a.id === id)?.nome || '---';
const getAtivoTipo = (id) => ativosCadastrados.value.find(a => a.id === id)?.tipo || '---';
const getInstituicaoNome = (cnpj) => instituicoes.find(i => i.cnpj === cnpj)?.nome || '---';
const formatDate = (s) => s.split('-').reverse().join('/');
</script>

<style>
/* Reset básico para combinar com a imagem */
body { background-color: #0b0f17; margin: 0; padding: 0; }
</style>
