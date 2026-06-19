<script setup>
import { ref, computed } from 'vue';
import { useApi } from '../composables/useApi'; 
import { useToast } from 'vue-toastification';

const toast = useToast();

// Estado da Classe Selecionada no Filtro Master
const classeAtivaId = ref(null);

const form = ref({
  id: null,
  name: '',
  targetPercent: 0
});

const salvando = ref(false);

// Endpoints padrão do K-Portfolio
const strategiesUrl = computed(() => '/strategies');
const classesUrl = computed(() => '/classes');

const { data: strategiesList, loading: loadingStr, fetchData: buscarEstrategias } = useApi(strategiesUrl, { immediate: true });
const { data: classesList, loading: loadingCls } = useApi(classesUrl, { immediate: true });

const loadingGlobal = computed(() => loadingStr.value || loadingCls.value || salvando.value);
const isEditing = computed(() => form.value.id !== null);

// Normalização das listas contra objetos aninhados ou nulos
const safeClassesList = computed(() => {
  if (!classesList.value) return [];
  return Array.isArray(classesList.value) ? classesList.value : [];
});

const safeStrategiesList = computed(() => {
  if (!strategiesList.value) return [];
  const list = Array.isArray(strategiesList.value) ? strategiesList.value : (strategiesList.value.investment_strategies || []);
  
  // 🟢 Se não houver classe selecionada ainda, escolhe a primeira automaticamente
  if (!classeAtivaId.value && safeClassesList.value.length > 0) {
    classeAtivaId.value = safeClassesList.value[0].id;
  }

  // 🟢 FILTRO DINÂMICO: Só mostra na tabela as estratégias da classe ativa!
  return list.filter(item => item.classId === classeAtivaId.value);
});

// Calcula o total alocado da classe selecionada para ajudar o investidor a fechar os 100%
const totalAlocadoClasse = computed(() => {
  return safeStrategiesList.value.reduce((acc, curr) => acc + Number(curr.targetPercent || 0), 0);
});

const mudarClasseAtiva = (id) => {
  classeAtivaId.value = id;
  resetarFormulario();
};

const selecionarEstrategia = (est) => {
  form.value = {
    id: est.id,
    name: est.name,
    targetPercent: Number(est.targetPercent || 0)
  };
};

const resetarFormulario = () => {
  form.value = { id: null, name: '', targetPercent: 0 };
};

const salvarEstrategia = async () => {
  if (!form.value.name || !classeAtivaId.value) {
    toast.warning('Defina o nome da estratégia e certifique-se de ter uma classe selecionada.');
    return;
  }

  try {
    salvando.value = true;
    const url = isEditing.value ? `/strategies/${form.value.id}` : '/strategies';
    const method = isEditing.value ? 'PUT' : 'POST';

    const apiAcao = useApi(url, {
      method,
      data: {
        name: form.value.name,
        classId: classeAtivaId.value, // Injeta automaticamente a classe selecionada no topo
        targetPercent: form.value.targetPercent
      },
      immediate: false
    });

    await apiAcao.fetchData();
    toast.success(isEditing.value ? 'Estratégia modificada!' : 'Estratégia incluída com sucesso!');
    resetarFormulario();
    await buscarEstrategias();
  } catch (err) {
    console.error(err);
  } finally {
    salvando.value = false;
  }
};

const deletarEstrategia = async (id) => {
  if (!id) return;
  if (!confirm('Deseja realmente remover esta estratégia?')) return;

  try {
    salvando.value = true;
    const apiDeletar = useApi(`/strategies/${id}`, { 
      method: 'delete',
      data: {},
      immediate: false 
    });

    await apiDeletar.fetchData();
    toast.success('Estratégia removida do sistema.');
    
    if (form.value.id === id) resetarFormulario();
    
    setTimeout(async () => {
      await buscarEstrategias();
    }, 300);
  } catch (err) {
    console.error(err);
  } finally {
    salvando.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col bg-[#0b0f17] text-slate-300 font-sans p-6 overflow-hidden w-full h-full relative">
    
    <div v-if="loadingGlobal" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-30 flex items-center justify-center">
      <div class="w-16 h-16 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>

    <header class="shrink-0 mb-6">
      <h1 class="text-3xl font-bold text-white tracking-tight">Estratégias por Classe</h1>
    </header>

    <div class="shrink-0 flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/5 custom-scrollbar">
      <button 
        v-for="cls in safeClassesList" 
        :key="cls.id"
        @click="mudarClasseAtiva(cls.id)"
        class="px-4 py-2 text-xs font-bold rounded-lg transition-all border whitespace-nowrap"
        :class="classeAtivaId === cls.id 
          ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-950/50' 
          : 'bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800'"
      >
        {{ cls.name }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
      
      <section class="lg:col-span-7 flex flex-col min-h-0">
        <div class="bg-[#161b26] rounded-xl border border-white/5 shadow-xl flex flex-col h-full overflow-hidden">
          
          <div class="bg-[#1b2230] px-4 py-3 border-b border-white/5 flex justify-between items-center shrink-0">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sub-estratégias Vinculadas</span>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 mr-2">Total Alocado na Classe:</span>
              <span class="font-mono text-sm font-bold" :class="totalAlocadoClasse > 100 ? 'text-rose-500' : 'text-emerald-400'">
                {{ totalAlocadoClasse.toFixed(2) }}% / 100%
              </span>
            </div>
          </div>

          <div class="flex-1 overflow-auto custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-[#161b26] z-10 border-b border-white/5">
                <tr class="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th class="p-4">Nome da Estratégia</th>
                  <th class="p-4 text-right">Alvo Objetivo (%)</th>
                  <th class="p-4 text-center w-24">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr 
                  v-for="item in safeStrategiesList" 
                  :key="item.id" 
                  class="hover:bg-white/[0.02] cursor-pointer group"
                  :class="{'bg-emerald-500/5': form.id === item.id}"
                  @click="selecionarEstrategia(item)"
                >
                  <td class="p-4">
                    <span class="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {{ item.name }}
                    </span>
                  </td>
                  <td class="p-4 text-right font-mono text-sm text-slate-300 font-bold">
                    {{ Number(item.targetPercent).toFixed(2) }}%
                  </td>
                  <td class="p-4 text-center" @click.stop>
                    <button @click="deletarEstrategia(item.id)" class="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-md text-xs">✕</button>
                  </td>
                </tr>
                <tr v-if="safeStrategiesList.length === 0">
                  <td colspan="3" class="p-10 text-center text-slate-600 uppercase text-[10px] font-black">Nenhuma estratégia para esta classe macro.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="lg:col-span-5 flex flex-col min-h-0 h-full">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 shadow-2xl flex flex-col flex-1 min-h-0">
          <div class="mb-6 border-b border-white/5 pb-4 flex justify-between items-center">
            <div>
              <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider">
                {{ isEditing ? '📝 Modificar Parâmetro' : '➕ Adicionar na Classe Ativa' }}
              </h3>
            </div>
            <button v-if="isEditing" @click="resetarFormulario" class="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Nova</button>
          </div>

          <form @submit.prevent="salvarEstrategia" class="space-y-5 flex-1 flex flex-col justify-between">
            <div class="space-y-4">
              
              <div class="space-y-1.5 text-left">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Nome da Sub-Estratégia</label>
                <input v-model="form.name" type="text" required placeholder="Ex: Pós-fixado, Tijolo, Dividendos..." class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500/30 transition-all" />
              </div>

              <div class="space-y-1.5 text-left">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Alocação Alvo (%)</label>
                <input v-model.number="form.targetPercent" type="number" step="0.01" min="0" max="100" required class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm font-mono text-white outline-none" />
              </div>

            </div>

            <div class="pt-4 border-t border-white/5 flex justify-end gap-3 shrink-0">
              <button type="button" @click="resetarFormulario" class="px-4 py-3 bg-white/[0.02] text-slate-400 text-[10px] font-black uppercase rounded-lg border border-white/5">Limpar</button>
              <button type="submit" class="px-5 py-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white text-[10px] font-black uppercase rounded-lg border border-emerald-500/20 shadow-lg">
                {{ isEditing ? 'Atualizar Parâmetro' : 'Gravar na Classe' }}
              </button>
            </div>
          </form>
        </div>
      </section>

    </div>
  </div>
</template>