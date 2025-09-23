const { BackendNodeMongoDB } = require('../src/index');

async function sentimentAnalysisDemo() {
  console.log('😊 Demonstração de Análise de Sentimentos\n');

  const backend = new BackendNodeMongoDB({
    mongoUrl: 'mongodb://localhost:27017/sentiment_demo',
    httpEnabled: false,
    cliEnabled: false
  });

  try {
    await backend.init();
    const services = backend.getServices();

    await backend.clearDatabase();

    const user = await services.user.create({
      username: 'sentiment_user',
      displayName: 'Usuário de Teste',
      email: 'test@example.com'
    });

    if (!user.success) {
      throw new Error('Erro ao criar usuário');
    }

    const userId = user.data._id;

    console.log('Criando posts com diferentes sentimentos...\n');

    const testPosts = [
      {
        content: 'Que dia maravilhoso! Estou muito feliz e animado! 😊🎉',
        expectedSentiment: 'positive'
      },
      {
        content: 'Hoje está sendo um dia muito difícil e estressante... 😞',
        expectedSentiment: 'negative'
      },
      {
        content: 'O tempo está nublado hoje.',
        expectedSentiment: 'neutral'
      },
      {
        content: 'Amo programar em JavaScript! É a melhor linguagem do mundo! ❤️',
        expectedSentiment: 'positive'
      },
      {
        content: 'Que projeto terrível, está tudo quebrado e nada funciona!',
        expectedSentiment: 'negative'
      },
      {
        content: 'Reunião às 14h na sala de conferências.',
        expectedSentiment: 'neutral'
      },
      {
        content: 'Parabéns pela conquista! Você merece todo o sucesso! 🏆✨',
        expectedSentiment: 'positive'
      },
      {
        content: 'Estou muito triste com a notícia que recebi hoje...',
        expectedSentiment: 'negative'
      }
    ];

    const results = [];

    for (const testPost of testPosts) {
      const result = await services.post.create({
        author: userId,
        content: testPost.content
      });

      if (result.success) {
        const sentiment = result.data.sentiment;
        const isCorrect = sentiment.label === testPost.expectedSentiment;

        results.push({
          content: testPost.content,
          expected: testPost.expectedSentiment,
          detected: sentiment.label,
          confidence: sentiment.confidence,
          score: sentiment.score,
          correct: isCorrect
        });

        const emoji = isCorrect ? '✅' : '❌';
        const confidencePercent = Math.round(sentiment.confidence * 100);

        console.log(`${emoji} "${testPost.content}"`);
        console.log(`   Esperado: ${testPost.expectedSentiment} | Detectado: ${sentiment.label}`);
        console.log(`   Confiança: ${confidencePercent}% | Score: ${sentiment.score.toFixed(3)}\n`);
      }
    }

    console.log('📊 Resumo da Análise:');
    const correctPredictions = results.filter(r => r.correct).length;
    const accuracy = (correctPredictions / results.length) * 100;

    console.log(`Total de posts: ${results.length}`);
    console.log(`Predições corretas: ${correctPredictions}`);
    console.log(`Precisão: ${accuracy.toFixed(1)}%`);

    console.log('\n📈 Distribuição por Sentimento:');
    const sentimentCounts = results.reduce((acc, result) => {
      acc[result.detected] = (acc[result.detected] || 0) + 1;
      return acc;
    }, {});

    Object.entries(sentimentCounts).forEach(([sentiment, count]) => {
      const emoji = sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😞' : '😐';
      console.log(`${emoji} ${sentiment}: ${count} posts`);
    });

    console.log('\n💬 Testando análise de comentários...');

    const commentTests = [
      'Adorei este post! Muito inspirador! 👏',
      'Não concordo com essa opinião...',
      'Interessante ponto de vista.',
      'Que absurdo! Isso é inaceitável!'
    ];

    const firstPost = results[0];
    const firstPostResult = await services.post.create({
      author: userId,
      content: firstPost.content
    });

    if (firstPostResult.success) {
      const postId = firstPostResult.data._id;

      for (const commentText of commentTests) {
        const commentResult = await services.postInteraction.commentPost(
          userId,
          postId,
          commentText
        );

        if (commentResult.success) {
          const commentSentiment = commentResult.data.comment.sentiment;
          console.log(`💬 "${commentText}"`);
          console.log(`   Sentimento: ${commentSentiment.label} (${Math.round(commentSentiment.confidence * 100)}%)\n`);
        }
      }

      const sentimentStatsResult = await services.postInteraction.getCommentSentimentStats(postId);
      if (sentimentStatsResult.success) {
        console.log('📊 Estatísticas dos comentários:');
        const stats = sentimentStatsResult.data.sentimentBreakdown;
        console.log(`😊 Positivos: ${stats.positive.count}`);
        console.log(`😐 Neutros: ${stats.neutral.count}`);
        console.log(`😞 Negativos: ${stats.negative.count}`);
        console.log(`🎯 Sentimento geral: ${sentimentStatsResult.data.overallSentiment}`);
      }
    }

    console.log('\n✅ Demonstração de análise de sentimentos concluída!');

  } catch (error) {
    console.error('❌ Erro na demonstração:', error.message);
  } finally {
    await backend.stop();
  }
}

if (require.main === module) {
  sentimentAnalysisDemo().catch(console.error);
}

module.exports = sentimentAnalysisDemo;