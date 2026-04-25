<template>
  <DashboardLayout 
    :user="user" 
    :activePage="currentTab"
    @logout="handleLogout"
    @navigate="currentTab = $event"
  >
    <div class="w-full flex flex-col items-center min-h-full">
      <div class="w-full max-w-[1400px] flex-1">
        
        <transition name="fade-layout" mode="out-in">
          <div :key="currentTab" class="w-full h-full">

            <template v-if="currentTab === 'dashboard'">
              <AsyncLoader :loading="loading" :error="!!error">
                <div class="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <PendenciasAlert v-if="data?.length > 0" :lista="data" />
                  <Resumo v-else />
                </div>
              </AsyncLoader>
            </template>

            <template v-else-if="currentTab === 'transacoes'">
              <div class="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                <TransactionView /> 
              </div>
            </template>

            <template v-else-if="currentTab === 'ativos'">
              <div class="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                <div class="bg-slate-800 p-6 rounded-full mb-6">
                  <span class="text-5xl">🏗️</span>
                </div>
                <h3 class="text-white font-bold text-2xl mb-2">Meus Ativos</h3>
                <p class="text-slate-400 max-w-md mx-auto">
                  Estamos integrando sua custódia para exibir a rentabilidade detalhada de cada ativo em tempo real.
                </p>
                <button 
                  @click="currentTab = 'dashboard'" 
                  class="mt-8 text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                >
                  ← Voltar para o Dashboard
                </button>
              </div>
            </template>

          </div>
        </transition>

      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useApi } from '../composables/useApi';
import DashboardLayout from './DashboardLayout.vue';
import PendenciasAlert from './PendenciasAlert.vue';
import Resumo from './Resumo.vue';
import AsyncLoader from './AsyncLoader.vue';
import TransactionView from './Transactions.vue';

defineProps({ 
  userId: [String, Number], 
  user: Object 
});

const currentTab = ref('dashboard');

// Chamada da API para as pendências (específico da Dashboard)
const { data, loading, error } = useApi(`/dashboard/pendencias`);

const handleLogout = () => {
  localStorage.removeItem('user_token');
  window.location.reload();
};
</script>

<style scoped>
/* Animação de transição entre abas: 
   Evita o "pulo" brusco ao trocar de tela.
*/
.fade-layout-enter-active,
.fade-layout-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-layout-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-layout-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Força a largura estável para o container do slot */
.w-full {
  max-width: 100%;
}
</style>
