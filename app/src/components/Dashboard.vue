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
              <AssetView />
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
import AssetView from './Assets.vue';
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
