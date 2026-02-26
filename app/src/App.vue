<template>
  <div class="min-h-screen bg-[#0a0f18] flex relative overflow-hidden font-sans">
    
    <div class="hidden lg:flex lg:w-3/5 p-12 flex-col justify-between relative z-10">
      <div>
        <div class="flex items-center gap-3 mb-10">
          <div class="bg-emerald-500 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span class="text-white text-2xl font-bold tracking-tight">K-Portfolio</span>
        </div>

        <div class="mt-20">
          <h2 class="text-6xl font-extrabold text-white leading-tight">
            Domine seus <br/>
            <span class="text-emerald-500">Investimentos.</span>
          </h2>
          <p class="text-slate-400 mt-6 text-xl max-w-md leading-relaxed">
            Uma visão consolidada de sua liberdade financeira. Ações, FIIs e ativos globais em um só lugar.
          </p>
        </div>
      </div>

      <div class="flex gap-8 border-t border-white/10 pt-8">
        <div v-for="ticker in ['IBOV +1.2%', 'S&P500 +0.8%', 'BTC +2.4%']" :key="ticker" 
             class="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
          {{ ticker }}
        </div>
      </div>
    </div>

    <div class="w-full lg:w-2/5 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-3xl border-l border-white/5 relative z-20">
      <div class="max-w-sm w-full">
        <div class="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <div class="mb-10 text-center lg:text-left">
            <h3 class="text-2xl font-bold text-white">Bem-vindo de volta</h3>
            <p class="text-slate-400 mt-2">Acesse sua conta para gerenciar sua carteira.</p>
          </div>

          <div class="space-y-6">
            <div class="group transition-all duration-300 transform hover:-translate-y-1">
              <div class="flex justify-center bg-white rounded-xl py-1">
                 <GoogleLogin :callback="callback" text="signin_with" label="continuar_com" />
              </div>
            </div>
            
            <div class="relative flex items-center py-4">
              <div class="flex-grow border-t border-white/10"></div>
              <span class="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-widest">Segurança Google</span>
              <div class="flex-grow border-t border-white/10"></div>
            </div>

            <p class="text-[10px] text-center text-slate-500 px-4">
              Ao entrar, você concorda com nossos termos de proteção de dados financeiros.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute inset-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 1440 320" class="absolute bottom-0 w-full h-full text-emerald-500" preserveAspectRatio="none">
            <path fill="currentColor" fill-opacity="0.05" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'

const callback = async (response) => {
  try {
    const res = await axios.post('https://supreme-acorn-gpxrgxr74v4hv45w-3000.app.github.dev/auth/google', {
      token: response.credential
    });
    if (res.data.success) {
      alert(`Bem-vindo, ${res.data.user.name}!`);
    }
  } catch (error) {
    alert("Erro na conexão com o K-Portfolio.");
    alert(error);
  }
}
</script>