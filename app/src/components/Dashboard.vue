<template>
  <DashboardLayout :user="user" @logout="handleLogout">
    <AsyncLoader :loading="loading" :error="!!error">
      <div class="w-full max-w-5xl">
        <PendenciasAlert v-if="data.length > 0" :lista="data || []" />
      </div>
    </AsyncLoader>
  </DashboardLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useApi } from '../composables/useApi';
import DashboardLayout from './DashboardLayout.vue';
import PendenciasAlert from './PendenciasAlert.vue';
import AsyncLoader from './AsyncLoader.vue';

const props = defineProps({
  userId: [String, Number],
  user: Object,
});

const { data, loading, error } = useApi(`/dashboard/pendencias/${props.userId}`);

const handleLogout = () => {
  localStorage.removeItem('user_token');
};
</script>