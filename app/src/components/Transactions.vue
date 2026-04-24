<template>
  <div class="space-y-6">
    <section class="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <span>✨</span> Importação Inteligente
          </h3>
          <p class="text-slate-400 text-sm">Processe sua nota de corretagem PDF via Gemini AI</p>
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-4 items-center">
        <label class="w-full md:w-auto flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all p-8 rounded-xl cursor-pointer group">
          <input type="file" class="hidden" @change="onFileChange" accept="application/pdf" />
          <span class="text-3xl mb-2">📄</span>
          <span class="text-slate-300 font-medium">{{ fileName || 'Selecionar PDF' }}</span>
        </label>

        <button 
          @click="uploadNota"
          :disabled="!selectedFile || isProcessing"
          class="w-full md:w-48 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span v-if="isProcessing" class="animate-spin">🔄</span>
          {{ isProcessing ? 'Lendo PDF...' : 'Processar Agora' }}
        </button>
      </div>
    </section>

    <section v-if="dadosExtraidos" class="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden animate-in fade-in duration-500">
      <div class="p-6 border-b border-white/10 bg-emerald-500/5 flex justify-between items-center">
        <h3 class="text-white font-semibold">Confirme os dados extraídos pelo Gemini</h3>
        <button @click="salvarNoBanco" class="bg-emerald-500 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400">
          Confirmar e Salvar no Banco
        </button>
      </div>
      
      <table class="w-full text-left">
        <thead class="text-slate-500 text-xs uppercase bg-white/5">
          <tr>
            <th class="px-6 py-4">Data</th>
            <th class="px-6 py-4">Ticker</th>
            <th class="px-6 py-4">Operação</th>
            <th class="px-6 py-4">Qtd</th>
            <th class="px-6 py-4">Preço Unit.</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5 text-slate-300">
          <tr v-for="(t, i) in dadosExtraidos.transacoes" :key="i" class="hover:bg-white/5">
            <td class="px-6 py-4">{{ t.data }}</td>
            <td class="px-6 py-4 font-bold text-white">{{ t.ticker }}</td>
            <td class="px-6 py-4">
              <span :class="t.tipo === 'C' || t.tipo === 'COMPRA' ? 'text-emerald-400' : 'text-red-400'">
                {{ t.tipo }}
              </span>
            </td>
            <td class="px-6 py-4">{{ t.quantidade }}</td>
            <td class="px-6 py-4">R$ {{ t.preco_unitario }}</td>
          </tr>
        </tbody>
      </table>
    </section>
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
  }
};

const uploadNota = async () => {
  if (!selectedFile.value) return;
  
  isProcessing.value = true;
  const formData = new FormData();
  formData.append('nota', selectedFile.value);

  // Usamos o useApi do Junior com as opções para upload
  const { fetchData, data, error } = useApi('/transactions/addPDF', {
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    immediate: false // Não executa ao montar, só quando chamarmos fetchData()
  });

  await fetchData();

  if (!error.value && data.value) {
    dadosExtraidos.value = data.value;
    toast.success("Gemini analisou a nota com sucesso!");
  }
  
  isProcessing.value = false;
};

const salvarNoBanco = () => {
  toast.info("Lógica de salvamento no MySQL será o próximo passo!");
};
</script>
