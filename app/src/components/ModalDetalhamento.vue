<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-[#1a1c24] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
        
        <div class="p-6 border-b border-slate-700">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classe de Ativo</label>
              <select 
                :value="classeSelecionada" 
                @change="$emit('update:classe', $event.target.value)"
                class="bg-slate-800 border border-slate-600 text-white font-bold rounded-lg p-2 px-3 outline-none focus:border-blue-500 transition-all"
              >
                <option v-for="opt in listaClasses" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Início</label>
                <input 
                  type="date" 
                  v-model="dataInicio" 
                  class="bg-slate-800 border border-slate-600 text-white rounded-lg p-2 outline-none focus:border-blue-500 text-sm"
                />
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Término</label>
                <input 
                  type="date" 
                  v-model="dataFim" 
                  class="bg-slate-800 border border-slate-600 text-white rounded-lg p-2 outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <button @click="$emit('update:modelValue', false)" class="text-slate-400 hover:text-white mb-1 ml-4 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="p-6">
          <slot :periodo="{ inicio: dataInicio, fim: dataFim }"></slot>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  classeSelecionada: String,
  listaClasses: Array,
  tipo: String // 'dia', 'mes' ou 'ano'
});

const emit = defineEmits(['update:modelValue', 'update:classe']);

const dataInicio = ref('');
const dataFim = ref('');

// Função para formatar data para o input HTML (YYYY-MM-DD)
const formatDate = (date) => date.toISOString().split('T')[0];

const calcularDatasPadrão = () => {
  const hoje = new Date();
  const hojeStr = formatDate(hoje);
  
  dataFim.value = hojeStr;

  if (props.tipo === 'dia') {
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    dataInicio.value = formatDate(ontem);
  } 
  else if (props.tipo === 'mes') {
    // Último dia do mês anterior
    const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    dataInicio.value = formatDate(ultimoDiaMesAnterior);
  } 
  else if (props.tipo === 'ano') {
    // Último dia do ano anterior
    const ultimoDiaAnoAnterior = new Date(hoje.getFullYear() - 1, 11, 31);
    dataInicio.value = formatDate(ultimoDiaAnoAnterior);
  }
};

// Sempre que o modal abrir ou o tipo mudar, recalcula
watch(() => props.modelValue, (val) => {
  if (val) calcularDatasPadrão();
});

watch(() => props.tipo, () => {
  if (props.modelValue) calcularDatasPadrão();
});
</script>