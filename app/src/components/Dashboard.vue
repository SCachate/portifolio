<template>
  <DashboardLayout 
    :user="user" 
    :activePage="currentTab"
    @logout="handleLogout"
    @navigate="currentTab = $event"
  >
    <AsyncLoader :loading="loading" :error="!!error">
      <div class="w-full h-full">
        
        <template v-if="currentTab === 'dashboard'">
          <PendenciasAlert v-if="data.length > 0" :lista="data || []" />
          <Resumo v-else />
        </template>

        <template v-else-if="currentTab === 'transacoes'">
          <TransactionView /> 
        </template>

        <template v-else-if="currentTab === 'ativos'">
          <div class="text-white p-8">Página de Ativos em construção...</div>
        </template>

      </div>
    </AsyncLoader>
  </DashboardLayout>
</template>

<script setup>
import { ref } from 'vue'; // Importar ref para o estado
import { useApi } from '../composables/useApi';
import DashboardLayout from './DashboardLayout.vue';
import PendenciasAlert from './PendenciasAlert.vue';
import Resumo from './Resumo.vue';
import AsyncLoader from './AsyncLoader.vue';
import TransactionView from './Transactions.vue'; // 3. Importar a sua nova tela

defineProps({ userId: [String, Number], user: Object });

// Estado para controlar qual aba está visível
const currentTab = ref('dashboard');

const { data, loading, error } = useApi(`/dashboard/pendencias`);

const handleLogout = () => {
  localStorage.removeItem('user_token');
  window.location.reload();
};
</script>
