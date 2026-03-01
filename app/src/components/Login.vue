<template>
  <div class="min-h-screen bg-[#0a0f18] font-sans text-white relative overflow-x-hidden">
    
    <div class="min-h-screen flex relative z-10">
      <div class="hidden lg:flex lg:w-3/5 p-16 flex-col justify-between">
        <div>
          <div class="flex items-center gap-3 mb-12">
            <div class="bg-emerald-500 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span class="text-white text-2xl font-bold tracking-tight">K-Portfolio</span>
          </div>

          <div class="mt-20">
            <h2 class="text-7xl font-extrabold text-white leading-tight">
              Domine seus <br/>
              <span class="text-emerald-500">Investimentos.</span>
            </h2>
            <p class="text-slate-400 mt-8 text-xl max-w-md leading-relaxed">
              Uma visão consolidada de sua liberdade financeira. Ações, FIIs e ativos globais em um só lugar.
            </p>
          </div>
        </div>

        <div class="flex gap-4">
          <div v-for="ticker in ['IBOV +1.2%', 'S&P500 +0.8%', 'BTC +2.4%']" :key="ticker" 
               class="text-xs font-mono text-emerald-400 bg-emerald-400/5 px-3 py-1 rounded-full border border-emerald-400/10">
            {{ ticker }}
          </div>
        </div>
      </div>

      <div class="w-full lg:w-2/5 flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-3xl border-l border-white/5">
        <div class="w-full max-w-md bg-slate-800/40 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl text-center">
          <h3 class="text-3xl font-bold text-white mb-2">Bem-vindo</h3>
          <p class="text-slate-400 mb-10 text-sm">Acesse sua conta para gerenciar sua carteira.</p>
          
          <AsyncLoader :loading="loading" :error="error">
            <div class="py-8 bg-white/5 rounded-3xl border border-white/10 mb-8 shadow-inner flex justify-center">            
                <GoogleLogin @success="$emit('success', $event)" />
            </div>
          </AsyncLoader>
          <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Segurança Google Ativada
          </p>
        </div>
      </div>
    </div>

    <div class="absolute inset-0 opacity-20 pointer-events-none z-0">
        <svg viewBox="0 0 1440 320" class="absolute bottom-0 w-full h-full text-emerald-500" preserveAspectRatio="none">
            <path fill="currentColor" fill-opacity="0.05" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
    </div>
  </div>
</template>

<script setup>
import GoogleLogin from './GoogleLogin.vue';
import AsyncLoader from './AsyncLoader.vue';

defineProps({
  loading: Boolean,
  error: Boolean
});

defineEmits(['success']);
</script>


