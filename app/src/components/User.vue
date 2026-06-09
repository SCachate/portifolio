<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '../composables/useApi'; 
import { useToast } from 'vue-toastification';

const toast = useToast();

// Estados reativos do formulário
const form = ref({
  name: '',
  email: '',
  CPF: ''
});

// Metadados puramente informativos
const metadata = ref({
  id: null,
  googleId: '',
  createdAt: ''
});

// URL reativa do perfil
const apiUrl = computed(() => '/users/profile');

// Instanciação isolada para a busca inicial (GET imediato)
const { data: apiResponse, loading: carregandoDados, fetchData: carregarPerfilNoBanco } = useApi(apiUrl, { immediate: true });

// Estado de loading local para o botão de salvar, evitando colisão de estados
const salvando = ref(false);

// União dos loadings para disparar o "K" flutuante na tela global
const loadingGlobal = computed(() => carregandoDados.value || salvando.value);

// Filtro visual para aplicar a máscara do CPF brasileiro (###.###.###-##)
const formatCPF = (value) => {
  if (!value) return '';
  const cleanValue = String(value).replace(/\D/g, '');
  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

const handleCPFInput = (event) => {
  form.value.CPF = formatCPF(event.target.value);
};

// Hidratação do formulário após o GET imediato ou reset
const hidratarFormulario = async () => {
  await carregarPerfilNoBanco();
  if (apiResponse.value) {
    form.value.name = apiResponse.value.name || '';
    form.value.email = apiResponse.value.email || '';
    form.value.CPF = formatCPF(apiResponse.value.CPF || '');
    
    metadata.value.id = apiResponse.value.id;
    metadata.value.googleId = apiResponse.value.googleId;
    metadata.value.createdAt = apiResponse.value.createdAt;
  }
};

// Requisição de Mutação (PUT) instanciada sob demanda no envio do submit
const salvarPerfil = async () => {
  if (!form.value.name || !form.value.email) {
    toast.warning('Por favor, preencha os campos obrigatórios.');
    return;
  }

  try {
    salvando.value = true;
    
    // Payload sanitizado eliminando as formatações visuais antes da persistência numérica
    const payload = {
      name: form.value.name,
      email: form.value.email,
      CPF: form.value.CPF.replace(/\D/g, '')
    };

    // Padrão estrito identificado na leitura de notas PDF: Instanciação local para chamadas de ação
    const apiGravar = useApi('/users/profile', {
      method: 'PUT',
      data: payload,
      immediate: false
    });

    await apiGravar.fetchData();
    
    toast.success('Perfil atualizado com sucesso!');
    await hidratarFormulario(); // Sincroniza o estado local com o banco
  } catch (err) {
    console.error('Erro crítico ao salvar alterações de usuário:', err);
  } finally {
    salvando.value = false;
  }
};

onMounted(() => {
  hidratarFormulario();
});
</script>

<template>
  <div class="flex flex-col bg-[#0b0f17] text-slate-300 font-sans p-6 overflow-hidden w-full h-full relative">
    
    <div v-if="loadingGlobal" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-30 flex items-center justify-center">
      <div class="relative flex items-center justify-center w-20 h-20">
        <div class="w-20 h-20 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
        <div class="absolute flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-xl shadow-lg">
          <span class="text-black font-black text-xl select-none">K</span>
        </div>
      </div>
    </div>

    <header class="shrink-0 mb-4">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kaxatapi Finance</h3>
      <h1 class="text-3xl font-bold text-white tracking-tight leading-none">Meu Perfil</h1>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
      
      <section class="lg:col-span-4 flex flex-col min-h-0">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 space-y-6 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-xl">
          <div class="flex flex-col items-center justify-center border-b border-white/5 pb-6 shrink-0">
            <div class="w-16 h-16 rounded-full bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-2xl font-black mb-3">
              {{ form.name ? form.name.charAt(0).toUpperCase() : 'K' }}
            </div>
            <h2 class="text-base font-bold text-white tracking-tight text-center truncate max-w-full px-2">{{ form.name || 'Usuário' }}</h2>
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Conta ID #{{ metadata.id || '---' }}</span>
          </div>

          <div class="space-y-4 flex-grow">
            <div class="space-y-1">
              <span class="text-[10px] font-black uppercase text-slate-500 block">Provedor Identidade (Google)</span>
              <div class="w-full bg-[#0b0f17]/60 border border-white/5 rounded-lg p-3 text-slate-400 font-mono text-xs truncate select-all">
                {{ metadata.googleId || '---' }}
              </div>
            </div>

            <div class="space-y-1">
              <span class="text-[10px] font-black uppercase text-slate-500 block">Criação da Conta</span>
              <div class="w-full bg-[#0b0f17]/60 border border-white/5 rounded-lg p-3 text-slate-400 font-mono text-xs">
                {{ metadata.createdAt || '---' }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="lg:col-span-8 flex flex-col min-h-0 h-full">
        <div class="bg-[#161b26] rounded-xl border border-white/5 p-6 shadow-2xl flex flex-col flex-1 min-h-0">
          <div class="mb-6 border-b border-white/5 pb-4">
            <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider">
              📝 Dados Cadastrais
            </h3>
          </div>

          <form @submit.prevent="salvarPerfil" class="space-y-4 flex-1 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="space-y-1 text-left">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Nome Completo</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required
                  placeholder="Seu nome completo"
                  class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500/30 transition-all" 
                />
              </div>

              <div class="space-y-1 text-left">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">E-mail Vinculado</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  required
                  placeholder="seuemail@provedor.com"
                  class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500/30 transition-all" 
                />
              </div>

              <div class="space-y-1 text-left">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Documento CPF</label>
                <input 
                  :value="form.CPF" 
                  @input="handleCPFInput"
                  type="text" 
                  maxLength="14"
                  placeholder="000.000.000-00"
                  class="w-full bg-[#0b0f17] border border-white/5 rounded-lg p-3 text-sm font-mono text-white outline-none focus:border-emerald-500/30 transition-all" 
                />
              </div>
            </div>

            <div class="pt-4 border-t border-white/5 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                @click="hidratarFormulario"
                class="px-4 py-3 bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/5"
              >
                Resetar
              </button>
              <button 
                type="submit" 
                class="px-5 py-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-emerald-500/20 shadow-lg"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </section>

    </div>
  </div>
</template>