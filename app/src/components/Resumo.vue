<template>
  <div class="resumo-container p-6 bg-gray-900 rounded-xl shadow-xl">
    <!-- Cabeçalho com Título e Botão de Atualização -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-white text-xl font-bold">Meu Patrimônio</h2>
      
      <button 
        @click="atualizarTudo" 
        :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md active:scale-95"
      >
        <!-- Ícone de Carregamento Animado -->
        <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-else>🔄</span>
        <span>{{ loading ? 'Atualizando...' : 'Atualizar Dashboard' }}</span>
      </button>
    </div>

    <!-- Seções de Dados do Dashboard -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Cards de Resultado (Dia, Mês, Ano) -->
      <div class="resultado-cards">
        <p class="text-gray-400">Resultado do Dia</p>
        <p class="text-white font-bold text-lg">R$ {{ resultados.dia }}</p>
      </div>
    </div>
    
    <!-- Gráfico de Evolução Patrimonial -->
    <div class="mt-8">
      <h3 class="text-white mb-4">Evolução Patrimonial</h3>
      <div class="h-64">
        <apexchart 
          type="line" 
          height="100%" 
          :options="evolucaoOptions" 
          :series="evolucaoSeries" 
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResumoPatrimonio',
  data() {
    return {
      loading: false,
      resumoData: [],
      evolucaoSeries: [],
      resultados: { dia: 0, mes: 0, ano: 0 },
      evolucaoOptions: { /* Suas configurações do ApexCharts */ }
    }
  },
  methods: {
    async fetchResumo() {
      // Rota para v_evolucao_por_classe
      const response = await fetch('/dashboard/resumo', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      this.resumoData = await response.json(); [2-4]
    },

    async fetchEvolucao() {
      // Rota para dados do gráfico de evolução
      const response = await fetch('/dashboard/evolucao', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      this.evolucaoSeries = await response.json(); [2, 5]
    },

    async fetchResultado() {
      // Lógica para carregar os cards de resultados baseados no rendimento diário
      // Esta função deve chamar sua nova view de rendimento
    },

    async atualizarTudo() {
      this.loading = true;
      try {
        // O uso do Promise.all garante que o contexto do 'this' seja mantido 
        // e as chamadas ocorram em paralelo para maior performance
        await Promise.all([
          this.fetchResumo(),
          this.fetchEvolucao(),
          this.fetchResultado()
        ]);
      } catch (error) {
        console.error("Erro na atualização global:", error);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    // Carrega os dados iniciais ao montar o componente
    this.atualizarTudo(); [1]
  }
}
</script>