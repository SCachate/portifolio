<template>
  <div class="min-h-screen bg-[#0b0f17] text-slate-300 font-sans p-8 pt-6 max-w-[1600px] mx-auto">
    
    <!-- MODAL NOVO ATIVO -->
    <div v-if="showNovoAtivoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div class="bg-[#161b26] border border-white/5 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h3 class="text-lg font-bold text-white mb-6">Cadastrar Novo Ativo</h3>
        <div class="space-y-4">
          <input v-model="novoAtivoForm.nome" placeholder="Nome/Ticker" class="w-full bg-[#0b0f17] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500" />
          <select v-model="novoAtivoForm.tipo" class="w-full bg-[#0b0f17] border border-white/10 rounded-lg p-3 text-white outline-none">
            <option value="Ações">Ações</option>
            <option value="FII">FII</option>
            <option value="Renda fixa">Renda fixa</option>
            <option value="Internacional">Internacional</option>
          </select>
          <div class="flex gap-3 pt-4">
            <button @click="showNovoAtivoModal = false" class="flex-1 py-2 text-slate-500 font-medium">Cancelar</button>
            <button @click="salvarNovoAtivo" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all">Salvar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- CABEÇALHO (Conforme image_8eda9c.png) -->
    <header class="mb-8 space-y-2">
      <h3 class="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Transações</h3>
      <h1 class="text-3xl font-bold text-white tracking-tight">Histórico de Movimentações</h1>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- COLUNA ESQUERDA: CADASTRO -->
      <section class="lg:col-span-4 space-y-4">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 space-y-6">
          
          <label class="flex flex-col items-center justify-center w-full h-28 border border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all bg-[#0b0f17]/50 group">
            <input type="file" class="hidden" @change="handleFileUpload" accept="application/pdf" />
            <span class="text-[10px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest text-center px-4">
              {{ fileName || 'Importar Nota de Corretagem' }}
            </span>
          </label>

          <div class="space-y-4">
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">
                <label>Ativo</label>
                <button @click="showNovoAtivoModal = true" class="text-emerald-500 hover:brightness-125">+ Adicionar</button>
              </div>
              <select v-model="form.assetId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none appearance-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="a in ativosParaSelect" :key="a.assetId" :value="a.assetId">{{ a.ticket || a.description }}</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1 block">Corretora</label>
              <select v-model="form.brokerId" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none appearance-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="b in brokersParaSelect" :key="b.brokerId" :value="b.brokerId">{{ b.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">Quantidade</label>
                <input v-model.number="form.quantity" type="number" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider px-1">Preço Unit.</label>
                <input v-model.number="form.priceUnit" type="number" step="0.01" class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none" />
              </div>
            </div>

            <button @click="registrarTransacao" :disabled="!isFormValid" class="w-full py-4 bg-[#1e293b] hover:bg-[#2d3a4f] disabled:opacity-30 text-white font-bold rounded-lg transition-all text-sm mt-2">
              Registrar Transação
            </button>
          </div>
        </div>
      </section>

      <!-- COLUNA DIREITA: FILTROS E TABELA -->
      <section class="lg:col-span-8 space-y-4">
        
        <!-- Filtros Reativos -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-5 flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px] space-y-2">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Período</label>
            <div class="flex gap-2">
              <input v-model="filtros.dataInicio" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
              <input v-model="filtros.dataFim" type="date" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none" />
            </div>
          </div>
          <div class="flex-1 min-w-[150px] space-y-2">
            <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Instituição</label>
            <select v-model="filtros.brokerId" class="bg-[#0b0f17] border border-white/5 rounded-md p-2 text-[11px] text-white w-full outline-none">
              <option value="">Todas</option>
              <option v-for="b in brokersParaSelect" :key="b.brokerId" :value="b.brokerId">{{ b.name }}</option>
            </select>
          </div>
        </div>

        <!-- Tabela com dados reais -->
        <div class="bg-[#161b26] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
          <div v-if="loading" class="p-20 text-center text-slate-500 animate-pulse uppercase text-xs font-black tracking-widest">
            Carregando transações...
          </div>
          <table v-else class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                <th class="p-4">Data</th>
                <th class="p-4">Ativo / Descrição</th>
                <th class="p-4">Instituição</th>
                <th class="p-4 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="(t, index) in transacoesFiltradas" :key="index" class="hover:bg-white/[0.01]">
                <td class="p-4 text-xs font-mono text-slate-500">{{ formatDate(t.date) }}</td>
                <td class="p-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-white">{{ t.ticket || 'Renda Fixa' }}</span>
                    <span class="text-[9px] text-slate-600 font-black uppercase truncate max-w-[200px]">{{ t.description }}</span>
                  </div>
                </td>
                <td class="p-4 text-xs text-slate-500">{{ t.name }}</td>
                <td class="p-4 text-right font-mono text-white text-sm">
                  R$ {{ Number(t.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// --- ESTADOS ---
const transacoesBrutas = ref([]);
const loading = ref(true);
const showNovoAtivoModal = ref(false);
const fileName = ref('');
const getHoje = () => new Date().toISOString().split('T')[0];

const form = ref({ assetId: '', brokerId: '', quantity: null, priceUnit: null, date: getHoje() });
const novoAtivoForm = ref({ nome: '', tipo: 'Ações' });
const filtros = ref({ dataInicio: '2024-01-01', dataFim: getHoje(), brokerId: '' });

// --- MOCK DA API (Substitua pela chamada real) ---
const fetchTransacoes = async () => {
  loading.value = true;
  try {
    // Simulação do seu JSON real
    const data = {
      "query_gerada_pelo_banco": [
        { "assetId": 1, "description": "Vitreo urânio", "ticket": null, "brokerId": 3, "name": "BTG", "quantity": 100.0, "priceUnit": 1.0, "fees": 0.0, "total": 100.0, "pm": 1.0, "date": "2025-12-31" },
        { "assetId": 2, "description": "Debenture Litoral Sul", "ticket": "LSUL", "brokerId": 1, "name": "XP INVESTIMENTOS", "quantity": 17489.41, "priceUnit": 1.0, "fees": 0.0, "total": 17489.41, "pm": 1.0, "date": "2026-02-18" },
        { "assetId": 7, "description": "CDB BMG IPCA+7.57", "ticket": "IPCA757", "brokerId": 1, "name": "XP INVESTIMENTOS", "quantity": 8258.35, "priceUnit": 1.0, "fees": 0.0, "total": 8258.35, "pm": 1.0, "date": "2026-02-18" }
      ]
    };
    
    const key = Object.keys(data)[0];
    transacoesBrutas.value = data[key];
  } catch (e) {
    console.error("Erro ao buscar dados", e);
  } finally {
    loading.value = false;
  }
};

// --- COMPUTED PROPERTIES ---
const isFormValid = computed(() => form.value.assetId && form.value.quantity > 0 && form.value.priceUnit > 0);

const transacoesFiltradas = computed(() => {
  return transacoesBrutas.value.filter(t => {
    const matchData = t.date >= filtros.value.dataInicio && t.date <= filtros.value.dataFim;
    const matchBroker = filtros.value.brokerId ? t.brokerId === filtros.value.brokerId : true;
    return matchData && matchBroker;
  });
});

// Helpers para os selects de cadastro (pegando do que já existe no histórico para exemplo)
const ativosParaSelect = computed(() => {
  const únicos = [...new Map(transacoesBrutas.value.map(item => [item.assetId, item])).values()];
  return únicos;
});

const brokersParaSelect = computed(() => {
  const únicos = [...new Map(transacoesBrutas.value.map(item => [item.brokerId, item])).values()];
  return únicos;
});

// --- AÇÕES ---
const registrarTransacao = () => {
  console.log("Enviando para o Back-end:", form.value);
  // Aqui entraria o axios.post('/transactions', form.value)
  alert("Pronto para enviar ao back-end!");
};

const salvarNovoAtivo = () => {
  showNovoAtivoModal.value = false;
  alert(`Ativo ${novoAtivoForm.value.nome} cadastrado com sucesso!`);
};

const formatDate = (s) => s ? s.split('-').reverse().join('/') : '---';

onMounted(fetchTransacoes);
</script>
