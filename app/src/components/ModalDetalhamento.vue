<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-[#1a1c24] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        
        <div class="flex justify-between items-start p-6 border-b border-slate-700">
          <div class="flex-grow">
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detalhamento de Ativos</h3>
            
            <div class="flex items-center gap-3">
              <select 
                :value="classeSelecionada" 
                @change="$emit('update:classe', $event.target.value)"
                class="bg-slate-800 border border-slate-600 text-white text-lg font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 px-3 transition-all cursor-pointer hover:bg-slate-700"
              >
                <option v-for="opt in listaClasses" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>

              <span class="text-slate-400 text-sm mt-1">• {{ subtitle }}</span>
            </div>
          </div>

          <button @click="$emit('update:modelValue', false)" class="text-slate-400 hover:text-white transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  classeSelecionada: String, // A classe que está ativa no momento
  listaClasses: Array,       // Array com ['Ações', 'FIIs', 'Cripto', ...]
  subtitle: String
});
defineEmits(['update:modelValue', 'update:classe']);
</script>