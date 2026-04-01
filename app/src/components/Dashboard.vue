<template>
  <DashboardLayout :user="user" @logout="handleLogout">
    <AsyncLoader :loading="loading" :error="!!error">
      <div class="w-full h-full">
        <PendenciasAlert v-if="data.length > 0" :lista="data || []" />
        <Resumo v-else />
      </div>
    </AsyncLoader>
  </DashboardLayout>
</template>

<script setup>
import { useApi } from '../composables/useApi';
import DashboardLayout from './DashboardLayout.vue';
import PendenciasAlert from './PendenciasAlert.vue';
import Resumo from './Resumo.vue';
import AsyncLoader from './AsyncLoader.vue';

defineProps({ userId: [String, Number], user: Object });
const { data, loading, error } = useApi(`/dashboard/pendencias`);

const handleLogout = () => {
  localStorage.removeItem('user_token');
  window.location.reload();
};
</script>