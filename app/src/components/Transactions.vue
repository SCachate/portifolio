<template>
  <div class="w-full space-y-6 animate-in fade-in duration-500">
    
    <section class="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
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
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">AI Online</span>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-4 items-stretch">
        <label 
          class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all p-10 rounded-2xl cursor-pointer group"
        >
          <input type="file" class="hidden" @change="onFileChange" accept="application/pdf" />
          
          <div class="bg-slate-800 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <span class="text-3xl">📄</span>
          </div>
          
          <span class="text-slate-300 font-semibold text-lg group-hover:text-white transition-colors">
            {{ fileName || 'Selecionar Nota de Corretagem' }}
          </span>
          <span class="text-slate-500 text-sm mt-1">Formato PDF suportado</span>
        </label>

        <button 
          @click="uploadNota"
          :disabled="!selectedFile || isProcessing"
          class="lg:w-64 flex flex-col items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all p-6 gap-2 group"
        >
          <div v-if="isProcessing" class="animate-spin text-2xl">🔄</div>
          <div v-else class="text-2xl group-hover:bounce">🚀</div>
          
          <span class="font-bold text-lg leading-tight">
            {{ isProcessing ? 'Processando...' : 'Ler com Gemini' }}
          </span>
          <span v-if="!isProcessing" class="text-xs text-emerald-200/70">Extração automática de ativos</span>
        </button>
      </div>
    </section>

    <transition name="list">
      <section v-if="dadosExtraidos" class="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div class="p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 class="text-white font-bold text-lg">Conferência de Operações</h3>
            <p class="text-slate-400 text-xs">Revise os dados antes de consolidar no seu banco de dados</p>
          </div>
          <button 
            @click="salvarNoBanco" 
            class="w-full sm:w-auto bg-emerald-500 text-slate-900 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/20 uppercase tracking-widest"
          >
            Confirmar e Salvar
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="text-slate-500 text-xs uppercase bg-white/5 font-bold">
              <tr>
                <th class="px-6 py-4">Data da Operação</th>
                <th class="px-6 py-4">Ticker</th>
                <th class="px-6 py-4">Tipo</th>
                <th class="px-6 py-4">Quantidade</th>
                <th class="px-6 py-4">Preço Unitário</th>
                <th class="px-6 py-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-slate-300">
              <tr v-for="(t, i) in dadosExtraidos.transacoes" :key="i" class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4">{{ t.data }}</td>
                <td class="px-6 py-4">
                  <span class="bg-slate-800 text-white px-2 py-1 rounded border border-white/10 font-mono">
                    {{ t.ticker }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter"
                    :class="t.tipo === 'C' || t.tipo === 'COMPRA' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'"
                  >
                    {{ t.tipo === 'C' || t.tipo === 'COMPRA' ? 'Compra' : 'Venda' }}
                  </span>
                </td>
                <td class="px-6 py-4 font-medium">{{ t.quantidade }}</td>
                <td class="px-6 py-4">R$ {{ Number(t.preco_unitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</td>
                <td class="px-6 py-4 text-right font-bold text-white">
                  R$ {{ (t.quantidade * t.preco_unitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                </td>
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
    // Limpar resultados anteriores se selecionar novo arquivo
    dadosExtraidos.value = null;
  }
};

const uploadNota = async () => {
  if (!selectedFile.value) return;
  
  isProcessing.value = true;
  const formData = new FormData();
  formData.append('nota', selectedFile.value);

  // Usando o composable padrão do projeto para manter a padronização
  const { fetchData, data, error } = useApi('/transactions/addPDF', {
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    immediate: false 
  });

  await fetchData();

  if (!error.value && data.value) {
    dadosExtraidos.value = data.value;
    toast.success("Gemini processou a nota com sucesso!");
  } else if (error.value) {
    // O useApi já lida com o toast de erro, mas podemos customizar aqui se necessário
    console.error("Falha no upload:", error.value);
  }
  
  isProcessing.value = false;
};

const salvarNoBanco = () => {
  toast.success("Dados enviados para o MySQL!");
  // Aqui chamaremos a API de save final no próximo passo
};
</script>

<style scoped>
/* Animação para a lista de transações aparecer suavemente */
.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.group-hover\:bounce:hover {
  animation: bounce 0.5s infinite;
}
</style>
