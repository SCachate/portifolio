<template>
  <DashboardLayout 
    :user="user" 
    :activePage="currentTab"
    @logout="handleLogout"
    @navigate="currentTab = $event"
  >
    <div class="w-full min-h-screen bg-[#0a0f18] p-4 md:p-8 flex justify-center">
      
      <div class="w-full max-w-[1400px]">
        
        <transition name="fade-page" mode="out-in">
          <div :key="currentTab" class="w-full">

            <template v-if="currentTab === 'dashboard'">
              <AsyncLoader :loading="loading" :error="!!error">
                <div class="w-full space-y-6">
                  <PendenciasAlert v-if="data?.length > 0" :lista="data" />
                  <Resumo v-else />
                </div>
              </AsyncLoader>
            </template>

            <template v-else-if="currentTab === 'transacoes'">
              <div class="w-full">
                <TransactionView /> 
              </div>
            </template>

            <template v-else-if="currentTab === 'ativos'">
              <div class="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
                <div class="bg-slate-800 p-6 rounded-full mb-6">
                  <span class="text-4xl">🏗️</span>
                </div>
                <h3 class="text-white font-bold text-2xl mb-2">Meus Ativos</h3>
                <p class="text-slate-500 max-w-sm">Esta funcionalidade está sendo construída para você.</p>
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
const { data, loading, error } = useApi(`/dashboard/pendencias`);

const handleLogout = () => {
  localStorage.removeItem('user_token');
  window.location.reload();
};
</script>

<style scoped>
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.2s ease;
}
.fade-page-enter-from,
.fade-page-leave-to {
  opacity: 0;
}
</style>
