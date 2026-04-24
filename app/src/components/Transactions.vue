<template>
  <div class="space-y-6">
    <section class="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <span>✨</span> Importação Inteligente
          </h3>
          <p class="text-slate-400 text-sm">Arraste sua nota de corretagem em PDF para processar via Gemini AI</p>
        </div>
        <span class="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-emerald-500/30">
          Gemini 1.5 Flash Ativo
        </span>
      </div>

      <div class="flex flex-col md:flex-row gap-4 items-center">
        <label class="w-full md:w-auto flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all p-8 rounded-xl cursor-pointer group">
          <input type="file" class="hidden" @change="onFileChange" accept="application/pdf" />
          <span class="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</span>
          <span class="text-slate-300 font-medium">{{ fileName || 'Selecionar Nota de Corretagem' }}</span>
        </label>

        <button 
          @click="uploadNota"
          :disabled="!selectedFile || isProcessing"
          class="w-full md:w-48 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="isProcessing" class="animate-spin">🔄</span>
          {{ isProcessing ? 'Processando...' : 'Processar PDF' }}
        </button>
      </div>
    </section>

    <section class="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
      <div class="p-6 border-b border-white/10 flex justify-between items-center">
        <h3 class="text-white font-semibold text-lg">Histórico de Operações</h3>
        <button class="text-slate-400 hover:text-white text-sm">Ver tudo →</button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-slate-500 text-xs uppercase bg-white/5">
              <th class="px-6 py-4">Data</th>
              <th class="px-6 py-4">Ativo</th>
              <th class="px-6 py-4">Tipo</th>
              <th class="px-6 py-4">Quantidade</th>
              <th class="px-6 py-4">Preço Unit.</th>
              <th class="px-6 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300">
            <tr class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-4">24/04/2026</td>
              <td class="px-6 py-4 font-bold text-white">ITUB4</td>
              <td class="px-6 py-4">
                <span class="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs">Compra</span>
              </td>
              <td class="px-6 py-4">100</td>
              <td class="px-6 py-4">R$ 32,50</td>
              <td class="px-6 py-4 text-right font-medium text-white">R$ 3.250,00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedFile = ref(null);
const fileName = ref('');
const isProcessing = ref(false);

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    fileName.value = file.name;
  }
};

const uploadNota = async () => {
  isProcessing.value = true;
  // Lógica de envio para o Backend que configuramos antes...
  setTimeout(() => { isProcessing.value = false; }, 3000); // Simulação
};
</script>
