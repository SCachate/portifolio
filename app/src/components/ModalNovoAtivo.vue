<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '../composables/useApi';
import { useToast } from 'vue-toastification';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'salvo']);
const toast = useToast();

const salvandoAtivo = ref(false);
const assetTypes = ['B3', 'EUA', 'RENDA_FIXA', 'FII', 'TESOURO DIRETO', 'MOEDA'];

const formAtivoInicial = {
  ticket: '',
  description: '',
  assetType: 'B3',
  apiCode: '',
  defaultClassId: '',
  strategyId: '',
  currencyAssetId: '',
  is_liquidity: false
};

const formAtivo = ref({ ...formAtivoInicial });

// Buscas independentes do modal (Desacoplamento total da tela pai)
const { data: classesResponse } = useApi('/classes', { immediate: true });
const { data: strategiesResponse } = useApi('/strategies', { immediate: true });
const { data: moedasResponse } = useApi('/assets', { immediate: true });

// Extração segura dos dados vindos do backend
const classesList = computed(() => Array.isArray(classesResponse.value?.data) ? classesResponse.value.data : (classesResponse.value || []));
const strategiesList = computed(() => Array.isArray(strategiesResponse.value?.data) ? strategiesResponse.value.data : (strategiesResponse.value || []));
const moedasDisponiveis = computed(() => Array.isArray(moedasResponse.value?.data) ? moedasResponse.value.data.filter(a => a.assetType === 'MOEDA') : (moedasResponse.value || []));

// Filtro reativo: Só exibe estratégias da Classe Macro selecionada
const estrategiasFiltradas = computed(() => {
  if (!formAtivo.value.defaultClassId) return [];
  return strategiesList.value.filter(s => s.classId === formAtivo.value.defaultClassId);
});

// Limpa a sub-estratégia se a classe macro mudar
watch(() => formAtivo.value.defaultClassId, () => {
  formAtivo.value.strategyId = '';
});

const fecharModal = () => {
  formAtivo.value = { ...formAtivoInicial };
  emit('close');
};

const handleSalvarAtivo = async () => {
  if (!formAtivo.value.description || !formAtivo.value.defaultClassId) {
    toast.warning('Preencha a descrição e selecione a classe macro.');
    return;
  }

  try {
    salvandoAtivo.value = true;
    const api = useApi('/assets', {
      method: 'POST',
      data: { ...formAtivo.value },
      immediate: false
    });
    
    await api.fetchData();
    
    // Assumindo que seu backend retorne o ativo criado (ex: { data: { id: 10, ticket: '...' } })
    const ativoCriado = api.data.value?.data || api.data.value; 
    
    toast.success('Ativo cadastrado com sucesso!');
    emit('salvo', ativoCriado); // Envia o novo ativo para a tela pai
    fecharModal();
  } catch (err) {
    console.error(err);
    toast.error('Erro ao cadastrar ativo.');
  } finally {
    salvandoAtivo.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-[#161b26] border border-white/5 p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar relative">
      
      <div class="mb-6 border-b border-white/5 pb-3 flex justify-between items-center">
        <h3 class="text-sm font-black text-emerald-400 uppercase tracking-widest">➕ Novo Ativo</h3>
        <button @click="fecharModal" class="text-slate-500 hover:text-white transition-colors">✕</button>
      </div>

      <form @submit.prevent="handleSalvarAtivo" class="space-y-4">
        
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-left">Ticket</label>
            <input v-model="formAtivo.ticket" type="text" placeholder="PETR4..." class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm font-mono text-white outline-none focus:border-emerald-500/30 uppercase" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-left">Tipo de Mercado</label>
            <select v-model="formAtivo.assetType" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none">
              <option v-for="t in assetTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-left">Descrição do Ativo *</label>
          <input v-model="formAtivo.description" type="text" required class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none focus:border-emerald-500/30" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-left">Classe Macro *</label>
            <select v-model="formAtivo.defaultClassId" required class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none">
              <option value="" disabled>Selecione...</option>
              <option v-for="c in classesList" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-left">Sub-Estratégia</label>
            <select v-model="formAtivo.strategyId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none" :disabled="!formAtivo.defaultClassId">
              <option value="">Nenhuma</option>
              <option v-for="s in estrategiasFiltradas" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-left">Código da API</label>
            <input v-model="formAtivo.apiCode" type="text" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm font-mono text-white outline-none" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-left">Par Cambial</label>
            <select v-model="formAtivo.currencyAssetId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none">
              <option value="">BRL (Padrão)</option>
              <option v-for="m in moedasDisponiveis" :key="m.id" :value="m.id">{{ m.ticket || m.description }}</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input v-model="formAtivo.is_liquidity" type="checkbox" id="liq-modal" class="accent-emerald-500 rounded w-4 h-4" />
          <label for="liq-modal" class="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">Ativo de Liquidez Imediata</label>
        </div>

        <div class="pt-6 border-t border-white/5 flex gap-3">
          <button type="button" @click="fecharModal" class="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase rounded-lg transition-all">
            Cancelar
          </button>
          <button type="submit" :disabled="salvandoAtivo" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50">
            {{ salvandoAtivo ? 'Salvando...' : 'Confirmar Cadastro' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
</style>