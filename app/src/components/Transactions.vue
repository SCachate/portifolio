<template>
  <div class="w-full space-y-8">
    <header class="flex flex-col gap-1">
      <h2 class="text-3xl font-black text-white tracking-tight">Histórico de Transações</h2>
      <p class="text-slate-500">Gerencie suas movimentações e aporte notas de corretagem.</p>
    </header>

    <section class="w-full bg-slate-900/50 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        
        <div class="lg:col-span-2">
          <label class="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-3xl cursor-pointer transition-all">
            <input type="file" class="hidden" @change="onFileChange" accept="application/pdf" />
            
            <div class="flex flex-col items-center gap-3">
              <div class="p-4 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                <span class="text-2xl">📄</span>
              </div>
              <p class="text-slate-300 font-bold">{{ fileName || 'Selecionar Nota de Corretagem' }}</p>
              <p class="text-slate-500 text-xs">Formato PDF suportado</p>
            </div>
          </label>
        </div>

        <button 
          @click="uploadNota"
          :disabled="!selectedFile || isProcessing"
          class="h-48 w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-3xl flex flex-col items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/20"
        >
          <span v-if="isProcessing" class="animate-spin text-3xl">🔄</span>
          <span v-else class="text-3xl">🚀</span>
          <div class="text-center">
            <p class="font-black uppercase tracking-widest text-sm">Ler com Gemini</p>
            <p class="text-[10px] opacity-70">Extração automática de ativos</p>
          </div>
        </button>

      </div>
    </section>

    <div v-if="dadosExtraidos" class="w-full bg-slate-900/80 border border-white/5 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
       <div class="p-8 text-center text-slate-500 italic">Dados extraídos com sucesso. Verifique as transações abaixo.</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useApi } from '../composables/useApi';

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
  // ... sua lógica de API aqui
  isProcessing.value = false;
};
</script>
