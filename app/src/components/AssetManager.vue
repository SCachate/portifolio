<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '../composables/useApi';
import { useToast } from 'vue-toastification';

const toast = useToast();
const filtroBusca = ref('');
const salvando = ref(false);

const form = ref({
  id: null,
  ticket: '',
  description: '',
  assetType: 'B3',
  apiCode: '',
  defaultClassId: '',
  strategyId: '',
  currencyAssetId: '',
  is_liquidity: false
});

// URLs Reativas usando o padrão do K-Portfolio
const assetsUrl = computed(() => '/assets');
const classesUrl = computed(() => '/classes');
const strategiesUrl = computed(() => '/strategies');

const { data: assetsList, loading: loadingAssets, fetchData: buscarAtivos } = useApi(assetsUrl, { immediate: true });
const { data: classesList } = useApi(classesUrl, { immediate: true });
const { data: strategiesList } = useApi(strategiesUrl, { immediate: true });

const isEditing = computed(() => form.value.id !== null);
const loadingGlobal = computed(() => loadingAssets.value || salvando.value);

// Tipos válidos mapeados do Schema do Banco
const assetTypes = ['B3', 'EUA', 'RENDA_FIXA', 'FII', 'TESOURO DIRETO', 'MOEDA'];

const safeAssetsList = computed(() => {
  if (!assetsList.value) return [];
  const list = Array.isArray(assetsList.value) ? assetsList.value : [];
  
  if (!filtroBusca.value) return list;
  const busca = filtroBusca.value.toLowerCase();
  return list.filter(a => 
    (a.ticket && a.ticket.toLowerCase().includes(busca)) || 
    (a.description && a.description.toLowerCase().includes(busca))
  );
});

// Filtra as moedas disponíveis para vincular como par cambial (ex: USD)
const moedasDisponiveis = computed(() => {
  if (!assetsList.value) return [];
  return Array.isArray(assetsList.value) ? assetsList.value.filter(a => a.assetType === 'MOEDA') : [];
});

// Reatividade dependente: Filtra as sub-estratégias baseando-se na classe macro escolhida no form
const estrategiasFiltradas = computed(() => {
  if (!strategiesList.value || !form.value.defaultClassId) return [];
  const list = Array.isArray(strategiesList.value) ? strategiesList.value : [];
  return list.filter(s => s.classId === form.value.defaultClassId);
});

// Reseta a estratégia se o usuário mudar a classe macro do ativo
watch(() => form.value.defaultClassId, () => {
  if (!isEditing.value) form.value.strategyId = '';
});

const selecionarAtivo = (asset) => {
  form.value = {
    id: asset.id,
    ticket: asset.ticket || '',
    description: asset.description,
    assetType: asset.assetType,
    apiCode: asset.apiCode || '',
    defaultClassId: asset.defaultClassId,
    strategyId: asset.strategyId || '',
    currencyAssetId: asset.currencyAssetId || '',
    is_liquidity: asset.is_liquidity === 1
  };
};

const resetarFormulario = () => {
  form.value = { id: null, ticket: '', description: '', assetType: 'B3', apiCode: '', defaultClassId: '', strategyId: '', currencyAssetId: '', is_liquidity: false };
};

const salvarAtivo = async () => {
  if (!form.value.description || !form.value.defaultClassId) {
    toast.warning('Preencha a descrição e selecione a classe macro.');
    return;
  }

  try {
    salvando.value = true;
    const url = isEditing.value ? `/assets/${form.value.id}` : '/assets';
    const method = isEditing.value ? 'PUT' : 'POST';

    const apiAcao = useApi(url, {
      method,
      data: { ...form.value },
      immediate: false
    });

    await apiAcao.fetchData();
    toast.success(isEditing.value ? 'Ativo atualizado!' : 'Novo ativo catalogado!');
    resetarFormulario();
    await buscarAtivos();
  } catch (err) {
    console.error(err);
  } finally {
    salvando.value = false;
  }
};

const deletarAtivo = async (id) => {
  if (!id || !confirm('Remover este ativo pode impactar transações vinculadas. Confirmar?')) return;

  try {
    salvando.value = true;
    const apiDeletar = useApi(`/assets/${id}`, { method: 'DELETE', data: {}, immediate: false });
    await apiDeletar.fetchData();
    toast.success('Ativo deletado do sistema.');
    if (form.value.id === id) resetarFormulario();
    await buscarAtivos();
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

    <header class="shrink-0 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Dicionário de Ativos</h3>
        <h1 class="text-3xl font-bold text-white tracking-tight">Cadastro de Ativos</h1>
      </div>
      <input v-model="filtroBusca" type="text" placeholder="🔍 Buscar por ticket ou descrição..." class="bg-[#161b26] border border-white/5 rounded-lg px-4 py-2 text-sm text-white outline-none w-full md:w-72 focus:border-emerald-500/30 transition-all" />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
      
      <!-- Tabela Dinâmica de Ativos -->
      <section class="lg:col-span-8 flex flex-col min-h-0">
        <div class="bg-[#161b26] rounded-xl border border-white/5 shadow-xl flex flex-col h-full overflow-hidden">
          <div class="flex-1 overflow-auto custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-[#161b26] z-10 border-b border-white/5">
                <tr class="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th class="p-4 w-28">Ticket</th>
                  <th class="p-4">Descrição</th>
                  <th class="p-4 w-28">Mercado</th>
                  <th class="p-4 w-36">Classe Macro</th>
                  <th class="p-4 text-center w-20">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr 
                  v-for="asset in safeAssetsList" 
                  :key="asset.id" 
                  class="hover:bg-white/[0.02] cursor-pointer group"
                  :class="{'bg-emerald-500/5': form.id === asset.id}"
                  @click="selecionarAtivo(asset)"
                >
                  <td class="p-4 font-mono font-bold text-white text-sm">
                    {{ asset.ticket || '—' }}
                    <span v-if="asset.is_liquidity" class="block text-[8px] font-black uppercase text-emerald-400 tracking-wider">Liquidez</span>
                  </td>
                  <td class="p-4 text-sm text-slate-300">
                    <div class="font-medium text-slate-200">{{ asset.description }}</div>
                    <div class="text-[11px] text-slate-500 font-mono" v-if="asset.strategyName">↳ {{ asset.strategyName }}</div>
                  </td>
                  <td class="p-4">
                    <span class="text-[9px] px-2 py-0.5 rounded font-black border uppercase tracking-wider bg-slate-900 border-white/5 text-slate-400">
                      {{ asset.assetType }}
                    </span>
                  </td>
                  <td class="p-4 text-xs font-bold text-slate-400">
                    {{ asset.className }}
                    <span v-if="asset.currencyTicket" class="block font-mono text-[10px] text-amber-500">💵 {{ asset.currencyTicket }}</span>
                  </td>
                  <td class="p-4 text-center" @click.stop>
                    <button @click="deletarAtivo(asset.id)" class="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-md text-xs transition-colors">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Formulário de Criação/Edição -->
      <section class="lg:col-span-4 flex flex-col min-h-0">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-5 shadow-2xl flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <div class="mb-4 border-b border-white/5 pb-3 flex justify-between items-center">
            <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider">
              {{ isEditing ? '📝 Alterar Ativo' : '➕ Novo Ativo' }}
            </h3>
            <button v-if="isEditing" @click="resetarFormulario" class="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Cancelar</button>
          </div>

          <form @submit.prevent="salvarAtivo" class="space-y-4 flex flex-col justify-between h-full">
            <div class="space-y-3 text-left">
              
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Ticket</label>
                  <input v-model="form.ticket" type="text" placeholder="PETR4, AAPL..." class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm font-mono text-white outline-none focus:border-emerald-500/30 uppercase" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Tipo de Mercado</label>
                  <select v-model="form.assetType" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none">
                    <option v-for="t in assetTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Descrição do Ativo</label>
                <input v-model="form.description" type="text" required placeholder="Ex: CDB Banco C6 Consignado..." class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none focus:border-emerald-500/30" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Classe Macro (Pai)</label>
                  <select v-model="form.defaultClassId" required class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none">
                    <option value="" disabled>Selecione...</option>
                    <option v-for="c in classesList" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Sub-Estratégia</label>
                  <select v-model="form.strategyId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none" :disabled="!form.defaultClassId">
                    <option value="">Nenhuma</option>
                    <option v-for="s in estrategiasFiltradas" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Código da API (Cotação)</label>
                  <input v-model="form.apiCode" type="text" placeholder="Ex: MXRF11.SA" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm font-mono text-white outline-none" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Par Cambial (Moeda)</label>
                  <select v-model="form.currencyAssetId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-2.5 text-sm text-white outline-none">
                    <option value="">BRL (Padrão)</option>
                    <option v-for="m in moedasDisponiveis" :key="m.id" :value="m.id">{{ m.ticket || m.description }}</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-2">
                <input v-model="form.is_liquidity" type="checkbox" id="liq" class="accent-emerald-500 rounded" />
                <label for="liq" class="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">Ativo de Liquidez Imediata (Reserva)</label>
              </div>

            </div>

            <div class="pt-4 border-t border-white/5 flex justify-end gap-2">
              <button type="submit" class="w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white text-[10px] font-black uppercase rounded-lg border border-emerald-500/20 transition-all">
                {{ isEditing ? 'Atualizar Ativo' : 'Salvar Ativo' }}
              </button>
            </div>
          </form>
        </div>
      </section>

    </div>
  </div>
</template>