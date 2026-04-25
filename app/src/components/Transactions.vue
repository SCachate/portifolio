<template>
  <div class="w-full flex-1 flex flex-col space-y-6 animate-in fade-in duration-500">
    
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-2xl font-bold text-white tracking-tight">Histórico de Transações</h2>
    </div>

    <section class="w-full bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <span class="text-emerald-500">✨</span> Importação Inteligente
          </h3>
          <p class="text-slate-400 text-sm mt-1">
            Envie sua nota de corretagem (PDF) para processamento via Gemini AI
          </p>
        </div>
        <div class="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <span class="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">AI Online</span>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-4 items-stretch">
        <label 
          class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all p-10 rounded-2xl cursor-pointer group"
        >
          <input type="file" class="hidden" @change="onFileChange" accept="application/pdf" />
          <div class="bg-slate-800 p-4 rounded-full mb-3">
            <span class="text-3xl">📄</span>
          </div>
          <span class="text-slate-300 font-semibold text-lg">{{ fileName || 'Selecionar Nota de Corretagem' }}</span>
        </label>

        <button 
          @click="uploadNota"
          :disabled="!selectedFile || isProcessing"
          class="lg:w-64 flex flex-col items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl transition-all p-6 gap-2"
        >
          <span v-if="isProcessing" class="animate-spin text-2xl">🔄</span>
          <span v-else class="text-2xl">🚀</span>
          <span class="font-bold text-lg">{{ isProcessing ? 'Lendo...' : 'Ler com Gemini' }}</span>
        </button>
      </div>
    </section>

    <transition name="list">
      <section v-if="dadosExtraidos" class="w-full bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div class="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h3 class="text-white font-bold text-lg">Conferência de Operações</h3>
          <button @click="salvarNoBanco" class="bg-emerald-500 text-slate-900 px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest">
            Confirmar e Salvar
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="text-slate-500 text-xs uppercase bg-white/5">
              <tr>
                <th class="px-6 py-4">Data</th>
                <th class="px-6 py-4">Ticker</th>
                <th class="px-6 py-4">Tipo</th>
                <th class="px-6 py-4">Qtd</th>
                <th class="px-6 py-4">Preço</th>
                <th class="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-slate-300">
              <tr v-for="(t, i) in dadosExtraidos.transacoes" :key="i" class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4">{{ t.data }}</td>
                <td class="px-6 py-4 font-mono text-white">{{ t.ticker }}</td>
                <td class="px-6 py-4">
                   <span :class="t.tipo === 'C' ? 'text-emerald-400' : 'text-red-400'" class="font-bold uppercase text-xs">
                     {{ t.tipo === 'C' ? 'Compra' : 'Venda' }}
                   </span>
                </td>
                <td class="px-6 py-4">{{ t.quantidade }}</td>
                <td class="px-6 py-4">R$ {{ Number(t.preco_unitario).toLocaleString('pt-BR') }}</td>
                <td class="px-6 py-4 text-right font-bold text-white">R$ {{ (t.quantidade * t.preco_unitario).toLocaleString('pt-BR') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useApi } from '../composables/useApi';
import { useToast } from 'vue-toastification';

const toast = useToast();
const selectedFile = ref(null);
const fileName = ref('');
const isProcessing = ref(false);
const dadosExtraidos = ref(null);

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    fileName.value = file.name;
    dadosExtraidos.value = null;
  }
};

const uploadNota = async () => {
  if (!selectedFile.value) return;
  isProcessing.value = true;
  
  const formData = new FormData();
  formData.append('nota', selectedFile.value);

  const { fetchData, data, error } = useApi('/transactions/addPDF', {
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    immediate: false 
  });

  await fetchData();

  if (!error.value && data.value) {
    dadosExtraidos.value = data.value;
    toast.success("Processado com sucesso!");
  }
  isProcessing.value = false;
};
</script>
