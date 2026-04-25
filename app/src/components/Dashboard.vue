<template>
  <DashboardLayout 
    :user="user" 
    :activePage="currentTab"
    @logout="handleLogout"
    @navigate="currentTab = $event"
  >
    <div class="w-full flex justify-center px-4 md:px-8 bg-[#0a0f18] min-h-screen">
      
      <div class="w-full max-w-[1400px] flex flex-col">
        
        <transition name="fade-fast" mode="out-in">
          <div :key="currentTab" class="w-full">

            <template v-if="currentTab === 'dashboard'">
              <AsyncLoader :loading="loading" :error="!!error">
                <div class="w-full space-y-6 pt-4">
                  <PendenciasAlert v-if="data?.length > 0" :lista="data" />
                  <Resumo v-else />
                </div>
              </AsyncLoader>
            </template>

            <template v-else-if="currentTab === 'transacoes'">
              <div class="w-full pt-4">
                <TransactionView /> 
              </div>
            </template>

            <template v-else-if="currentTab === 'ativos'">
              <div class="w-full pt-4 bg-slate-900/40 border border-white/5 rounded-3xl p-20 text-center">
                 <p class="text-slate-500 font-medium italic">Módulo de Ativos em desenvolvimento...</p>
              </div>
            </template>

          </div>
        </transition>

      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Transição ultra rápida para não dar tempo de perceber a troca */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.15s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
</style>
