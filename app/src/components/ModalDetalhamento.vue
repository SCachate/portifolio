<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-[#1a1c24] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        
        <div class="flex justify-between items-center p-6 border-b border-slate-700">
          <div>
            <h3 class="text-xl font-bold text-white">{{ title }}</h3>
            <p v-if="subtitle" class="text-sm text-slate-400">{{ subtitle }}</p>
          </div>
          <button @click="$emit('update:modelValue', false)" class="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <slot></slot>
        </div>

        <div class="bg-slate-800/30 p-4 flex justify-end">
          <button @click="$emit('update:modelValue', false)" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            Fechar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: String,
  subtitle: String
});
defineEmits(['update:modelValue']);
</script>