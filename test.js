const SimpleBackend = require('./src/index');

async function test() {
  console.log('🚀 Iniciando teste do backend...');

  const backend = new SimpleBackend();

  try {
    // Iniciar o servidor
    await backend.start();

    // Limpar dados antigos (se existirem)
    await backend.clearDatabase();

    // Criar dados de teste
    await backend.createTestData();

    console.log('✅ Teste concluído com sucesso!');
    console.log('🌐 Servidor rodando em: http://localhost:3000');
    console.log('📄 Documentação da API disponível em: http://localhost:3000/docs');

    // Manter o servidor rodando
    console.log('\n⏸️  Pressione Ctrl+C para parar o servidor...');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    await backend.stop();
    process.exit(1);
  }
}

// Lidar com encerramento do processo
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  process.exit(0);
});

test();