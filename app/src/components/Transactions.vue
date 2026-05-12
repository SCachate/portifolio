<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8">
    <!-- Header -->
    <header class="flex flex-col gap-1">
      <h2 class="text-3xl font-black text-white tracking-tight">Portfólio Intelligence</h2>
      <p class="text-slate-500">Gestão de ativos com extração por IA.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Coluna Esquerda: Cadastro (Create) -->
      <section class="lg:col-span-5 space-y-6">
        
        <!-- Importador de PDF -->
        <div class="relative group">
          <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-3xl cursor-pointer transition-all">
            <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" :disabled="isProcessing" />
            
            <div v-if="isProcessing" class="flex flex-col items-center gap-2">
              <span class="animate-spin text-2xl">🔄</span>
              <p class="text-xs font-bold text-emerald-500 uppercase tracking-widest">Gemini lendo nota...</p>
            </div>
            
            <div v-else class="flex flex-col items-center gap-2">
              <span class="text-2xl group-hover:scale-110 transition-transform">📄</span>
              <p class="text-sm text-slate-400">
                {{ fileName || 'Importar Nota de Corretagem' }}
              </p>
              <p class="text-[10px] text-slate-600 uppercase">PDF suportado</p>
            </div>
          </label>
        </div>

        <!-- Formulário Manual/Edição -->
        <div class="bg-slate-900/50 border border-white/5 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider">Dados da Transação</h3>
          
          <div class="space-y-4">
            <!-- Ativo e Tipo -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Ativo</label>
                <input v-model="form.ativo" type="text" placeholder="Ex: PETR4" class="w-full bg-slate-800 border-none rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Operação</label>
                <select v-model="form.tipo" class="w-full bg-slate-800 border-none rounded-xl text-white focus:ring-2 focus:ring-emerald-500">
                  <option value="COMPRA">Compra</option>
                  <option value="VENDA">Venda</option>
                </select>
              </div>
            </div>

            <!-- Qtd e Preço -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Quantidade</label>
                <input v-model.number="form.quantidade" type="number" class="w-full bg-slate-800 border-none rounded-xl text-white focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Preço Unit. (R$)</label>
                <input v-model.number="form.preco" type="number" step="0.01" class="w-full bg-slate-800 border-none rounded-xl text-white focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <!-- Data -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-500 uppercase ml-2">Data da Operação</label>
              <input v-model="form.data" type="date" class="w-full bg-slate-800 border-none rounded-xl text-white focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <button 
            @click="adicionarTransacao"
            :disabled="!isFormValid"
            class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
          >
            Confirmar e Salvar
          </button>
        </div>
      </section>

      <!-- Coluna Direita: Listagem (Read) -->
      <section class="lg:col-span-7">
        <div class="bg-slate-900/80 border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full min-h-[500px]">
          <div class="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 class="font-bold text-white">Histórico de Movimentações</h3>
            <span class="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full font-bold">
              {{ transacoes.length }} registros
            </span>
          </div>

          <!-- Tabela -->
          <div class="overflow-y-auto flex-1">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-slate-900 shadow-sm">
                <tr class="text-[10px] text-slate-500 uppercase tracking-[0.2em]">
                  <th class="p-5 font-bold">Data</th>
                  <th class="p-5 font-bold">Ativo</th>
                  <th class="p-5 font-bold">Qtd</th>
                  <th class="p-5 font-bold">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="item in transacoes" :key="item.id" class="hover:bg-white/[0.02] transition-colors group">
                  <td class="p-5 text-xs text-slate-400 font-mono">{{ formatDate(item.data) }}</td>
                  <td class="p-5">
                    <div class="flex flex-col">
                      <span class="font-black text-white group-hover:text-emerald-400 transition-colors">{{ item.ativo }}</span>
                      <span :class="item.tipo === 'COMPRA' ? 'text-emerald-500' : 'text-rose-500'" class="text-[10px] font-bold">
                        {{ item.tipo }}
                      </span>
                    </div>
                  </td>
                  <td class="p-5 text-sm text-slate-300">{{ item.quantidade }}</td>
                  <td class="p-5">
                    <span class="text-sm font-mono text-white">R$ {{ (item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</span>
                  </td>
                </tr>
                
                <!-- Empty State -->
                <tr v-if="transacoes.length === 0">
                  <td colspan="4" class="p-20 text-center">
                    <p class="text-slate-600 italic">Nenhuma transação encontrada.</p>
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

// --- ESTADO ---
const transacoes = ref([]);
const isProcessing = ref(false);
const fileName = ref('');

const form = ref({
  id: null,
  data: new Date().toISOString().substr(0, 10),
  ativo: '',
  quantidade: null,
  preco: null,
  tipo: 'COMPRA'
});

// --- COMPUTED ---
const isFormValid = computed(() => {
  return form.value.ativo && form.value.quantidade > 0 && form.value.preco > 0;
});

// --- MÉTODOS ---

// Simulação da lógica do Gemini
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  fileName.value = file.name;
  isProcessing.value = true;

  try {
    // Simulando delay da API do Gemini
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock do que a IA retornaria após ler o PDF
    const mockIA = {
      ticker: 'VALE3',
      quantidade: 100,
      preco: 68.50,
      operacao: 'COMPRA',
      data: new Date().toISOString().substr(0, 10)
    };

    // Populando o formulário automaticamente para revisão do usuário
    form.value = {
      ativo: mockIA.ticker,
      quantidade: mockIA.quantidade,
      preco: mockIA.preco,
      tipo: mockIA.operacao,
      data: mockIA.data
    };

    alert("Gemini: Dados extraídos com sucesso! Revise e clique em Salvar.");
  } catch (error) {
    console.error("Erro ao processar PDF", error);
  } finally {
    isProcessing.value = false;
  }
};

const adicionarTransacao = () => {
  if (!isFormValid.value) return;

  // Adiciona ao topo da lista (Read)
  transacoes.value.unshift({
    ...form.value,
    id: Date.now()
  });

  // Limpa o formulário e o arquivo selecionado
  resetForm();
};

const resetForm = () => {
  form.value = {
    data: new Date().toISOString().substr(0, 10),
    ativo: '',
    quantidade: null,
    preco: null,
    tipo: 'COMPRA'
  };
  fileName.value = '';
};

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
</script>

<style scoped>
/* Estilização extra para scrollbars no Chrome/Safari */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.2);
}
</style>
