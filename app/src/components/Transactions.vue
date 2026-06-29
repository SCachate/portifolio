<template>
  <div class="p-6 bg-gray-900 min-h-screen text-gray-100">
    <!-- Cabeçalho e Ações -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Gestão de Transações</h1>
        <p class="text-gray-400 text-sm">Gerencie suas compras, vendas e importações de notas</p>
      </div>
      
      <div class="flex gap-3">
        <!-- Input de PDF Oculto -->
        <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" accept="application/pdf" />
        <button @click="$refs.fileInput.click()" :disabled="loadingPDF"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white rounded-lg transition-all shadow-lg active:scale-95">
          <span v-if="loadingPDF" class="animate-spin text-lg">↻</span>
          <span>{{ loadingPDF ? 'Processando PDF...' : 'Importar Nota (PDF)' }}</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Lado Esquerdo: Histórico de Transações -->
      <div class="lg:col-span-3 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
        <div class="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
          <h2 class="font-semibold text-gray-200">Histórico Recente</h2>
          <span class="text-xs text-gray-500">{{ transactions.length }} registros encontrados</span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-xs uppercase text-gray-500 bg-gray-900/50">
                <th class="px-6 py-4 font-medium">Data</th>
                <th class="px-6 py-4 font-medium">Ativo</th>
                <th class="px-6 py-4 font-medium">Tipo</th>
                <th class="px-6 py-4 font-medium text-right">Qtd</th>
                <th class="px-6 py-4 font-medium text-right">Preço Unit.</th>
                <th class="px-6 py-4 font-medium text-right">Custos</th>
                <th class="px-6 py-4 font-medium text-right">Total</th>
                <th class="px-6 py-4 font-medium">Corretora</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="t in transactions" :key="t.id" class="hover:bg-gray-750 transition-colors text-sm">
                <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(t.date) }}</td>
                <td class="px-6 py-4">
                  <div class="font-bold text-blue-400">{{ t.ticket }}</div>
                  <div class="text-xs text-gray-500 truncate max-w-[150px]">{{ t.assetDescription }}</div>
                </td>
                <td class="px-6 py-4">
                  <span :class="t.quantity > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'" 
                    class="px-2 py-1 rounded text-xs font-bold uppercase">
                    {{ t.quantity > 0 ? 'Compra' : 'Venda' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right tabular-nums">{{ Math.abs(t.quantity).toLocaleString() }}</td>
                <td class="px-6 py-4 text-right tabular-nums">R$ {{ parseFloat(t.priceUnit).toFixed(2) }}</td>
                <td class="px-6 py-4 text-right tabular-nums text-gray-400">R$ {{ parseFloat(t.fees).toFixed(2) }}</td>
                <td class="px-6 py-4 text-right tabular-nums font-semibold">R$ {{ t.total.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</td>
                <td class="px-6 py-4 text-gray-400 text-xs">{{ t.brokerName }}</td>
              </tr>
              <tr v-if="transactions.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500 italic">
                  Nenhuma transação encontrada no período.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lado Direito: Formulário Manual -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
          <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>➕</span> Adicionar Manual
          </h2>
          
          <form @submit.prevent="saveManual" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1 uppercase">Ativo</label>
              <select v-model="form.assetId" required class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="" disabled>Selecione um Ativo</option>
                <option v-for="asset in allAssets" :key="asset.id" :value="asset.id">
                  {{ asset.ticket }} - {{ asset.description }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1 uppercase">Instituição / Corretora</label>
              <select v-model="form.brokerId" required class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="" disabled>Selecione a Instituição</option>
                <option v-for="broker in allBrokers" :key="broker.id" :value="broker.id">
                  {{ broker.name }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1 uppercase">Quantidade</label>
                <input v-model.number="form.quantity" type="number" step="any" required 
                  class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                <p class="text-[10px] mt-1 text-gray-500">Venda use negativo (-)</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1 uppercase">Preço Unit.</label>
                <input v-model.number="form.priceUnit" type="number" step="0.000001" required 
                  class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1 uppercase">Custos (R$)</label>
                <input v-model.number="form.custos_operacionais" type="number" step="0.01" 
                  class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1 uppercase">Data</label>
                <input v-model="form.date" type="date" required 
                  class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <button type="submit" :disabled="loadingSave"
              class="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold rounded-lg transition-all shadow-lg active:scale-95 mt-4">
              {{ loadingSave ? 'Gravando...' : 'Salvar Transação' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Configuração de API (Ajuste conforme seu ambiente)
const API_URL = ''; // Se estiver usando proxy, deixe vazio

// Estados Reativos
const transactions = ref([]);
const allAssets = ref([]);
const allBrokers = ref([]);
const loadingPDF = ref(false);
const loadingSave = ref(false);

const form = ref({
  assetId: '',
  brokerId: '',
  quantity: null,
  priceUnit: null,
  custos_operacionais: 0,
  date: new Date().toISOString().split('T')
});

// Busca Listas de Apoio (Metadados Globais)
const fetchMetadata = async () => {
  try {
    // Busca ativos do AssetController [4-8]
    const assetsRes = await axios.get(`${API_URL}/assets`);
    allAssets.value = assetsRes.data;

    // Busca corretoras do brokerController criado no backend
    const brokersRes = await axios.get(`${API_URL}/brokers`);
    allBrokers.value = brokersRes.data;
  } catch (error) {
    console.error("Erro ao carregar metadados:", error);
  }
};

// Busca Histórico de Transações [9]
const fetchTransactions = async () => {
  try {
    const res = await axios.get(`${API_URL}/transactions`);
    if (res.data.success) {
      transactions.value = res.data.data;
    }
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
  }
};

// Salvar Manualmente [2, 10]
const saveManual = async () => {
  loadingSave.value = true;
  try {
    const res = await axios.post(`${API_URL}/transactions/manual`, form.value);
    if (res.data.success) {
      alert("Transação registrada!");
      resetForm();
      await fetchTransactions(); // Atualiza a lista
    }
  } catch (error) {
    alert(error.response?.data?.error || "Erro ao salvar transação");
  } finally {
    loadingSave.value = false;
  }
};

// Importar PDF (Gemini AI) [3, 11]
const handleFileUpload = async (event) => {
  const file = event.target.files;
  if (!file) return;

  const formData = new FormData();
  formData.append('nota', file);

  loadingPDF.value = true;
  try {
    const res = await axios.post(`${API_URL}/transactions/addPDF`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // Aqui você pode decidir se abre um modal com os dados extraídos pelo Gemini 
    // ou se já insere direto. No seu backend, addPDF apenas retorna o JSON.
    console.log("Dados extraídos pelo Gemini:", res.data);
    alert("Nota processada com sucesso! Verifique os dados extraídos.");
    
    // Resetar o input
    event.target.value = '';
    await fetchTransactions();
  } catch (error) {
    alert(error.response?.data?.error || "Falha ao processar PDF");
  } finally {
    loadingPDF.value = false;
  }
};

// Utilitários
const resetForm = () => {
  form.value = {
    assetId: '',
    brokerId: '',
    quantity: null,
    priceUnit: null,
    custos_operacionais: 0,
    date: new Date().toISOString().split('T')
  };
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

onMounted(() => {
  fetchMetadata();
  fetchTransactions();
});
</script>

<style scoped>
.bg-gray-750 { background-color: #252d3d; }
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>