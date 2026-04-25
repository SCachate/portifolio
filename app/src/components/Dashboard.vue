<template>
  <DashboardLayout 
    :user="user" 
    :activePage="currentTab"
    @logout="handleLogout"
    @navigate="currentTab = $event"
  >
    <div class="w-full p-6 md:p-10">
      
      <div class="max-w-[1400px] mx-auto">
        
        <transition name="page" mode="out-in">
          <div :key="currentTab">

            <template v-if="currentTab === 'dashboard'">
              <AsyncLoader :loading="loading" :error="!!error">
                <div class="space-y-8">
                  <PendenciasAlert v-if="data?.length > 0" :lista="data" />
                  <Resumo v-else />
                </div>
              </AsyncLoader>
            </template>

            <template v-else-if="currentTab === 'transacoes'">
              <TransactionView /> 
            </template>

            <template v-else-if="currentTab === 'ativos'">
              <div class="w-full min-h-[400px] bg-slate-900/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-10">
                 <div class="text-4xl mb-4">🏗️</div>
                 <h2 class="text-white font-bold text-xl">Módulo em Obras</h2>
                 <p class="text-slate-500 mt-2">Estamos integrando sua custódia em tempo real.</p>
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

const currentTab = ref('dashboard');
const { data, loading, error } = useApi(`/dashboard/pendencias`);

const handleLogout = () => {
  localStorage.removeItem('user_token');
  window.location.href = '/login';
};
</script>

<style scoped>
.page-enter-active, .page-leave-active { transition: all 0.2s ease; }
.page-enter-from { opacity: 0; transform: translateY(5px); }
.page-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
