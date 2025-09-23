const { BackendNodeMongoDB } = require('../src/index');

async function basicUsageExample() {
  console.log('🚀 Exemplo de Uso Básico - Backend Node.js MongoDB\n');

  const backend = new BackendNodeMongoDB({
    mongoUrl: 'mongodb://localhost:27017/social_network_example',
    httpEnabled: false,
    cliEnabled: false
  });

  try {
    await backend.init();

    const services = backend.getServices();

    console.log('1. Criando usuários...');
    const user1Result = await services.user.create({
      username: 'joao123',
      displayName: 'João Silva',
      email: 'joao@example.com',
      bio: 'Desenvolvedor apaixonado por tecnologia'
    });

    const user2Result = await services.user.create({
      username: 'maria456',
      displayName: 'Maria Santos',
      email: 'maria@example.com',
      bio: 'Designer e criadora de conteúdo'
    });

    if (!user1Result.success || !user2Result.success) {
      throw new Error('Erro ao criar usuários');
    }

    const user1 = user1Result.data;
    const user2 = user2Result.data;
    console.log(`✅ Usuários criados: ${user1.username} e ${user2.username}`);

    console.log('\n2. Criando posts...');
    const post1Result = await services.post.create({
      author: user1._id,
      content: 'Olá mundo! Estou aprendendo Node.js com MongoDB 😊'
    });

    const post2Result = await services.post.create({
      author: user2._id,
      content: 'Design é sobre resolver problemas, não apenas fazer coisas bonitas'
    });

    if (!post1Result.success || !post2Result.success) {
      throw new Error('Erro ao criar posts');
    }

    const post1 = post1Result.data;
    const post2 = post2Result.data;
    console.log(`✅ Posts criados com análise de sentimento:`);
    console.log(`   - Post 1: ${post1.sentiment.label} (${Math.round(post1.sentiment.confidence * 100)}%)`);
    console.log(`   - Post 2: ${post2.sentiment.label} (${Math.round(post2.sentiment.confidence * 100)}%)`);

    console.log('\n3. Criando relacionamento (seguir)...');
    const followResult = await services.userRelationship.follow(user1._id, user2._id);
    if (followResult.success) {
      console.log(`✅ ${user1.username} agora segue ${user2.username}`);
    }

    console.log('\n4. Interações com posts...');

    const likeResult = await services.postInteraction.likePost(user2._id, post1._id);
    if (likeResult.success) {
      console.log(`✅ ${user2.username} curtiu o post de ${user1.username}`);
    }

    const commentResult = await services.postInteraction.commentPost(
      user2._id,
      post1._id,
      'Que legal! Também estou aprendendo essas tecnologias 👍'
    );
    if (commentResult.success) {
      console.log(`✅ ${user2.username} comentou no post de ${user1.username}`);
      console.log(`   Sentimento do comentário: ${commentResult.data.comment.sentiment.label}`);
    }

    console.log('\n5. Buscando feed do usuário...');
    const feedResult = await services.post.getFeed(user1._id, 5, 0);
    if (feedResult.success) {
      console.log(`✅ Feed de ${user1.username} (${feedResult.data.length} posts):`);
      feedResult.data.forEach((post, index) => {
        const author = post.authorData?.username || 'Unknown';
        console.log(`   ${index + 1}. @${author}: ${post.content.substring(0, 50)}...`);
        console.log(`      👍 ${post.likes} 💬 ${post.comments} 😊 ${post.sentiment.label}`);
      });
    }

    console.log('\n6. Estatísticas de sentimento...');
    const sentimentStats = await services.post.getSentimentStats();
    if (sentimentStats.success) {
      const stats = sentimentStats.data;
      console.log('✅ Estatísticas de sentimento dos posts:');
      console.log(`   😊 Positivo: ${stats.positive.count} posts`);
      console.log(`   😐 Neutro: ${stats.neutral.count} posts`);
      console.log(`   😞 Negativo: ${stats.negative.count} posts`);
    }

    console.log('\n7. Hashtags em alta...');
    const trendingResult = await services.post.getTrending(5);
    if (trendingResult.success && trendingResult.data.length > 0) {
      console.log('✅ Hashtags em alta:');
      trendingResult.data.forEach((item, index) => {
        console.log(`   ${index + 1}. #${item.hashtag} (${item.count} posts)`);
      });
    } else {
      console.log('ℹ️  Nenhuma hashtag encontrada');
    }

    console.log('\n✅ Exemplo concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no exemplo:', error.message);
  } finally {
    await backend.stop();
  }
}

if (require.main === module) {
  basicUsageExample().catch(console.error);
}

module.exports = basicUsageExample;