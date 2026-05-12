<template>
  <!-- Modal para Novo Ativo -->
  <div v-if="showNovoAtivoModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl w-full max-w-md shadow-2xl">
      <h3 class="text-xl font-black text-white mb-6 uppercase tracking-tighter">Cadastrar Novo Ativo</h3>
      <div class="space-y-4">
        <input v-model="novoAtivoForm.nome" placeholder="Nome do Ativo (Ticker ou Título)" class="w-full bg-slate-800 border-none rounded-xl text-white p-3" />
        <select v-model="novoAtivoForm.tipo" class="w-full bg-slate-800 border-none rounded-xl text-white p-3 text-sm">
          <option value="RENDA_VARIAVEL">Renda Variável (Ações/FIIs)</option>
          <option value="RENDA_FIXA">Renda Fixa (CDB/Tesouro)</option>
          <option value="CRIPTO">Criptoativos</option>
        </select>
        <div class="flex gap-3 pt-4">
          <button @click="showNovoAtivoModal = false" class="flex-1 py-3 text-slate-400 font-bold uppercase text-xs">Cancelar</button>
          <button @click="salvarNovoAtivo" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase text-xs">Cadastrar</button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto p-4 lg:p-8 space-y-8 text-slate-200">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- FORMULÁRIO DE TRANSAÇÃO -->
      <section class="lg:col-span-5 space-y-6">
        <div class="bg-slate-900/60 border border-white/5 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Nova Movimentação</h3>
          
          <div class="space-y-4">
            <!-- Seletor de Ativo com Opção de Cadastro -->
            <div class="space-y-1">
              <div class="flex justify-between items-center ml-2">
                <label class="text-[10px] font-bold text-slate-500 uppercase">Ativo</label>
                <button @click="showNovoAtivoModal = true" class="text-[9px] text-emerald-500 font-bold uppercase hover:underline">+ Novo Ativo</button>
              </div>
              <select v-model="form.ativoId" class="w-full bg-slate-800 border-none rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500">
                <option value="" disabled>Selecione o ativo...</option>
                <option v-for="ativo in ativosCadastrados" :key="ativo.id" :value="ativo.id">
                  {{ ativo.nome }} ({{ ativo.tipo }})
                </option>
              </select>
            </div>

            <!-- Demais campos (Instituição, Qtd, Preço, Data) permanecem similares -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Instituição</label>
              <select v-model="form.cnpjInstituicao" class="w-full bg-slate-800 border-none rounded-xl text-sm text-white">
                <option v-for="inst in instituicoes" :key="inst.cnpj" :value="inst.cnpj">{{ inst.nome }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <input v-model.number="form.quantidade" type="number" placeholder="Qtd" class="bg-slate-800 border-none rounded-xl text-white p-3" />
              <input v-model.number="form.preco" type="number" step="0.01" placeholder="Preço" class="bg-slate-800 border-none rounded-xl text-white p-3" />
            </div>

            <button @click="adicionarTransacao" :disabled="!isFormValid" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs rounded-2xl transition-all shadow-lg shadow-emerald-900/20">
              Salvar Transação
            </button>
          </div>
        </div>
      </section>

      <!-- LISTAGEM (Read) -->
      <section class="lg:col-span-7">
        <!-- Tabela com a lógica de buscar o nome do ativo pelo ID -->
        <div class="bg-slate-900/80 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <table class="w-full text-left">
            <thead class="bg-white/5 text-[9px] text-slate-500 uppercase tracking-widest">
              <tr>
                <th class="p-5">Ativo</th>
                <th class="p-5">Tipo</th>
                <th class="p-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="item in transacoes" :key="item.id">
                <td class="p-5">
                  <span class="font-black text-white">{{ getAtivoNome(item.ativoId) }}</span>
                </td>
                <td class="p-5">
                  <span class="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold uppercase">
                    {{ getAtivoTipo(item.ativoId) }}
                  </span>
                </td>
                <td class="p-5 text-right font-mono text-white">
                  R$ {{ (item.quantidade * item.preco).toLocaleString() }}
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

// --- ATIVOS CADASTRADOS ---
const ativosCadastrados = ref([
  { id: 1, nome: 'PETR4', tipo: 'RENDA_VARIAVEL' },
  { id: 2, nome: 'CDB BANCO INTER', tipo: 'RENDA_FIXA' }
]);

const showNovoAtivoModal = ref(false);
const novoAtivoForm = ref({ nome: '', tipo: 'RENDA_VARIAVEL' });

const salvarNovoAtivo = () => {
  if (!novoAtivoForm.value.nome) return;
  const novoId = ativosCadastrados.value.length + 1;
  ativosCadastrados.value.push({ ...novoAtivoForm.value, id: novoId });
  
  // Opcional: Já seleciona o novo ativo no form principal
  form.value.ativoId = novoId;
  
  showNovoAtivoModal.value = false;
  novoAtivoForm.value = { nome: '', tipo: 'RENDA_VARIAVEL' };
};

// --- TRANSAÇÕES ---
const transacoes = ref([]);
const form = ref({ ativoId: '', cnpjInstituicao: '', quantidade: null, preco: null, data: '' });

const adicionarTransacao = () => {
  transacoes.value.unshift({ ...form.value, id: Date.now() });
  // reset form...
};

// Helpers para a tabela
const getAtivoNome = (id) => ativosCadastrados.value.find(a => a.id === id)?.nome || '---';
const getAtivoTipo = (id) => ativosCadastrados.value.find(a => a.id === id)?.tipo || '---';

const isFormValid = computed(() => form.value.ativoId && form.value.quantidade > 0);
</script>
