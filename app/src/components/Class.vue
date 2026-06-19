<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '../composables/useApi'; 
import { useToast } from 'vue-toastification';

const toast = useToast();

// Estado do formulário
const form = ref({
  id: null,
  name: '',
  targetPercent: 0,
  color: '#008FFB'
});

// URL reativa para listagem
const apiUrl = computed(() => '/classes');
const { data: classesList, loading: carregandoLista, fetchData: buscarClasses } = useApi(apiUrl, { immediate: true });

const salvando = ref(false);
const loadingGlobal = computed(() => carregandoLista.value || salvando.value);

// Modo de operação do formulário
const isEditing = computed(() => form.value.id !== null);

// Extrai a lista de forma segura (tratando se vem envelopada ou array puro)
const safeClassesList = computed(() => {
  if (!classesList.value) return [];
  return classesList.value.investment_classes || classesList.value;
});

// Cálculo do percentual total planejado (Soma dos Target Percents)
const totalTargetPercent = computed(() => {
  const lista = safeClassesList.value;
  if (!Array.isArray(lista)) return 0;
  return lista.reduce((acc, curr) => acc + Number(curr.targetPercent || 0), 0);
});

// Seleciona uma classe da lista para edição
const selecionarClasse = (classe) => {
  form.value = {
    id: classe.id,
    name: classe.name,
    targetPercent: Number(classe.targetPercent || 0),
    color: classe.color || '#008FFB'
  };
};

// Limpa o formulário voltando para o modo de Criação
const resetarFormulario = () => {
  form.value = {
    id: null,
    name: '',
    targetPercent: 0,
    color: '#008FFB'
  };
};

// Submissão (Create ou Update)
const salvarClasse = async () => {
  if (!form.value.name) {
    toast.warning('O nome da classe é obrigatório.');
    return;
  }

  try {
    salvando.value = true;
    const url = isEditing.value ? `/classes/${form.value.id}` : '/classes';
    const method = isEditing.value ? 'PUT' : 'POST';

    const apiAcao = useApi(url, {
      method: method,
      data: {
        name: form.value.name,
        targetPercent: form.value.targetPercent,
        color: form.value.color
      },
      immediate: false
    });

    await apiAcao.fetchData();
    toast.success(isEditing.value ? 'Classe atualizada com sucesso!' : 'Classe criada com sucesso!');
    resetarFormulario();
    await buscarClasses(); // Atualiza a lista lateral
  } catch (err) {
    console.error(err);
  } finally {
    salvando.value = false;
  }
};

// Exclusão de classe
const deletarClasse = async (id) => {
  if (!id) {
    toast.error('ID da classe inválido para exclusão.');
    return;
  }
  
  if (!confirm('Deseja realmente remover esta classe? Isso pode afetar a exibição de seus ativos vinculados.')) return;

  try {
    salvando.value = true;

    // Resgatamos o token do localStorage exatamente como o useApi faz internamente
    const token = localStorage.getItem('token'); 

    // Disparamos o fetch nativo para isolar o escopo e garantir que nenhuma configuração antiga interfira
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://portfolio-api-b1ml.onrender.com'}/classes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    const resultado = await response.json().catch(() => ({}));

    if (response.ok) {
      toast.success('Classe removida com sucesso do sistema.');
      
      // Se a classe deletada estava selecionada no formulário, limpa ele
      if (form.value.id === id) resetarFormulario();
      
      // Atualiza a tabela chamando a listagem limpa
      await buscarClasses();
    } else {
      // Se o back retornou um erro estruturado, exibe na tela
      toast.error(resultado.error || resultado.message || 'Erro ao tentar excluir a classe.');
    }

  } catch (err) {
    console.error('Falha na exclusão lógica do registro:', err);
    toast.error('Erro de conectividade ao tentar excluir.');
  } finally {
    salvando.value = false;
  }
};

onMounted(() => {
  buscarClasses();
});
</script>

<template>
  <div class="flex flex-col bg-[#0b0f17] text-slate-300 font-sans p-6 overflow-hidden w-full h-full relative">
    
    <div v-if="loadingGlobal" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-30 flex items-center justify-center">
      <div class="relative flex items-center justify-center w-20 h-20">
        <div class="w-20 h-20 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
        <div class="absolute flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-xl shadow-lg">
          <span class="text-black font-black text-xl select-none">K</span>
        </div>
      </div>
    </div>

    <header class="shrink-0 mb-4">
      <h1 class="text-3xl font-bold text-white tracking-tight leading-none">Classes de Investimento</h1>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
      
      <section class="lg:col-span-7 flex flex-col min-h-0">
        <div class="bg-[#161b26] rounded-xl border border-white/5 shadow-xl flex flex-col h-full overflow-hidden">
          
          <div class="p-4 bg-[#1b2230]/40 border-b border-white/5 flex justify-between items-center shrink-0">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Classes Estruturadas</span>
            <div class="text-right">
              <span class="text-[9px] font-black text-slate-500 uppercase block">Total Alocado</span>
              <span class="text-sm font-mono font-bold" :class="totalTargetPercent === 100 ? 'text-emerald-400' : 'text-amber-400'">
                {{ totalTargetPercent.toFixed(2) }}% / 100%
              </span>
            </div>
          </div>

          <div class="flex-1 overflow-auto custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-[#1b2230] z-10 border-b border-white/5">
                <tr class="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th class="p-4 w-12 text-center">Cor</th>
                  <th class="p-4">Classe</th>
                  <th class="p-4 text-right">Alvo (%)</th>
                  <th class="p-4 text-center w-24">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr 
                  v-for="item in safeClassesList" 
                  :key="item.id" 
                  class="hover:bg-white/[0.02] cursor-pointer group"
                  :class="{'bg-emerald-500/5': form.id === item.id}"
                  @click="selecionarClasse(item)"
                >
                  <td class="p-4 text-center">
                    <div class="w-4 h-4 rounded-full mx-auto border border-white/10 shadow-inner" :style="{ backgroundColor: item.color || '#8884d8' }"></div>
                  </td>
                  <td class="p-4">
                    <span class="text-sm font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                      {{ item.name }}
                    </span>
                  </td>
                  <td class="p-4 text-right font-mono text-sm text-slate-300 font-bold">
                    {{ item.targetPercent ? Number(item.targetPercent).toFixed(2) : '0.00' }}%
                  </td>
                  <td class="p-4 text-center" @click.stop>
                    <button 
                      @click="deletarClasse(item.id)" 
                      class="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-md transition-all text-xs"
                      title="Excluir Classe"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
                <tr v-if="!carregandoLista && safeClassesList.length === 0">
                  <td colspan="4" class="p-10 text-center text-slate-600 uppercase text-[10px] font-black">
                    Nenhuma classe configurada.
                  </td>
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
                {{ isEditing ? '📝 Editar Classe' : '➕ Nova Classe de Ativo' }}
              </h3>
              <p class="text-[11px] text-slate-500 mt-0.5">Defina os parâmetros de distribuição do seu portfólio.</p>
            </div>
            <button 
              v-if="isEditing" 
              @click="resetarFormulario" 
              class="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20"
            >
              Novo
            </button>
          </div>

          <form @submit.prevent="salvarClasse" class="space-y-5 flex-1 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="space-y-1.5 text-left">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Nome da Classe</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required
                  placeholder="Ex: Ações, FIIs, Cripto..."
                  class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500/30 transition-all" 
                />
              </div>

              <div class="space-y-1.5 text-left">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Alocação Objetivo (%)</label>
                <input 
                  v-model.number="form.targetPercent" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="100"
                  required
                  class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm font-mono text-white outline-none focus:border-emerald-500/30 transition-all" 
                />
              </div>

              <div class="space-y-1.5 text-left">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Cor de Identificação no Dashboard</label>
                <div class="flex gap-3">
                  <input 
                    v-model="form.color" 
                    type="color" 
                    class="w-12 h-11 bg-[#0b0f17] border border-white/5 rounded-lg p-1 cursor-pointer outline-none"
                  />
                  <input 
                    v-model="form.color" 
                    type="text" 
                    pattern="^#([A-Fa-f0-9]{6})$"
                    placeholder="#000000"
                    class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm font-mono text-white uppercase outline-none focus:border-emerald-500/30 transition-all" 
                  />
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-white/5 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                @click="resetarFormulario"
                class="px-4 py-3 bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/5"
              >
                Limpar
              </button>
              <button 
                type="submit" 
                class="px-5 py-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-emerald-500/20 shadow-lg"
              >
                {{ isEditing ? 'Atualizar Dados' : 'Gravar Classe' }}
              </button>
            </div>
          </form>
        </div>
      </section>

    </div>
  </div>
</template>