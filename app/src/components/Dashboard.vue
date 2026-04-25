<template>
  <DashboardLayout 
    :user="user" 
    :activePage="currentTab"
    @logout="handleLogout"
    @navigate="currentTab = $event"
  >
    <div class="w-full min-h-[calc(100vh-120px)] flex flex-col">
      
      <transition name="fade-slide" mode="out-in">
        
        <div :key="currentTab" class="w-full flex-1">
          
          <template v-if="currentTab === 'dashboard'">
            <AsyncLoader :loading="loading" :error="!!error">
              <div class="space-y-6">
                <PendenciasAlert v-if="data?.length > 0" :lista="data" />
                <Resumo v-else />
              </div>
            </AsyncLoader>
          </template>

          <template v-else-if="currentTab === 'transacoes'">
            <TransactionView /> 
          </template>

          <template v-else-if="currentTab === 'ativos'">
            <div class="bg-slate-900/50 border border-white/10 rounded-2xl p-12 text-center">
              <span class="text-4xl mb-4 block">🏗️</span>
              <h3 class="text-white font-bold text-xl">Meus Ativos</h3>
              <p class="text-slate-400">Esta funcionalidade está sendo construída para você.</p>
            </div>
          </template>

        </div>
      </transition>

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

defineProps({ userId: [String, Number], user: Object });

const currentTab = ref('dashboard');

// Buscamos as pendências apenas para a dashboard
const { data, loading, error } = useApi(`/dashboard/pendencias`);

const handleLogout = () => {
  localStorage.removeItem('user_token');
  window.location.reload();
};
</script>

<style scoped>
/* Animação que suaviza a troca de telas e evita o movimento brusco */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Garante que o container não mude de tamanho durante a troca */
.w-full {
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
