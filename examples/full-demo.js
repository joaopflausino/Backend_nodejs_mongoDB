const { BackendNodeMongoDB } = require('../src/index');

async function fullDemo() {
  console.log('🚀 Demonstração Completa - Backend Node.js MongoDB\n');

  const backend = new BackendNodeMongoDB({
    mongoUrl: 'mongodb://localhost:27017/full_demo',
    httpEnabled: true,
    httpPort: 3001,
    cliEnabled: false
  });

  try {
    await backend.init();
    const services = backend.getServices();
    const httpServer = backend.getHTTPServer();

    await backend.clearDatabase();

    console.log('1. 👥 Criando usuários da comunidade...');
    const users = [];
    const userProfiles = [
      {
        username: 'dev_alice',
        displayName: 'Alice Desenvolvedora',
        email: 'alice@devs.com',
        password: 'alice123',
        bio: 'Full-stack developer | JavaScript | React | Node.js'
      },
      {
        username: 'designer_bob',
        displayName: 'Bob Designer',
        email: 'bob@design.com',
        password: 'bob123',
        bio: 'UI/UX Designer | Figma specialist | Design systems'
      },
      {
        username: 'data_carol',
        displayName: 'Carol Cientista',
        email: 'carol@data.com',
        password: 'carol123',
        bio: 'Data Scientist | Python | Machine Learning | AI'
      },
      {
        username: 'product_dave',
        displayName: 'Dave Product',
        email: 'dave@pm.com',
        password: 'dave123',
        bio: 'Product Manager | Agile | Strategy | Growth'
      },
      {
        username: 'startup_eve',
        displayName: 'Eve Empreendedora',
        email: 'eve@startup.com',
        password: 'eve123',
        bio: 'Startup founder | Innovation | Tech leadership'
      }
    ];

    for (const profile of userProfiles) {
      const result = await services.user.create(profile);
      if (result.success) {
        users.push(result.data);
        console.log(`   ✅ ${profile.username} criado`);
      }
    }

    console.log('\n2. 🤝 Criando relacionamentos...');
    const relationships = [
      [0, 1], [0, 2], [1, 0], [1, 3], [2, 0], [2, 4], [3, 1], [3, 4], [4, 2], [4, 3]
    ];

    for (const [followerIndex, followingIndex] of relationships) {
      const result = await services.userRelationship.follow(
        users[followerIndex]._id,
        users[followingIndex]._id
      );
      if (result.success) {
        console.log(`   ✅ ${users[followerIndex].username} segue ${users[followingIndex].username}`);
      }
    }

    console.log('\n3. 📝 Criando posts diversos...');
    const posts = [];
    const postContents = [
      {
        author: 0,
        content: 'Acabei de lançar meu novo projeto em React! Super animada para receber feedback 🚀 #react #javascript #webdev'
      },
      {
        author: 1,
        content: 'Design systems são fundamentais para escalar produtos digitais. Quem mais trabalha com isso? #design #ux'
      },
      {
        author: 2,
        content: 'Estudando redes neurais hoje. O futuro da IA é realmente fascinante! 🤖 #ai #machinelearning #python'
      },
      {
        author: 3,
        content: 'Retrospectiva da sprint: conseguimos entregar todas as features! Time incrível 💪 #agile #productmanagement'
      },
      {
        author: 4,
        content: 'Levantamos nossa primeira rodada de investimento! Obrigada a todos que acreditaram 🙏 #startup #entrepreneur'
      },
      {
        author: 0,
        content: 'Alguém mais está com problemas no deploy hoje? O servidor está instável... 😕'
      },
      {
        author: 1,
        content: 'Criando um protótipo no Figma. A nova funcionalidade ficou linda! ✨ #figma #prototype'
      },
      {
        author: 2,
        content: 'Dataset limpo, modelo treinado, métricas excelentes. Que sensação boa! 📊 #datascience'
      },
      {
        author: 3,
        content: 'Reunião com stakeholders cancelada. Pelo menos tenho tempo para focar no roadmap.'
      },
      {
        author: 4,
        content: 'Contratamos nosso primeiro desenvolvedor! A equipe está crescendo 🎉 #hiring #team'
      }
    ];

    for (const postData of postContents) {
      const result = await services.post.create({
        author: users[postData.author]._id,
        content: postData.content
      });
      if (result.success) {
        posts.push(result.data);
        const sentiment = result.data.sentiment;
        console.log(`   ✅ Post de ${users[postData.author].username}`);
        console.log(`      Sentimento: ${sentiment.label} (${Math.round(sentiment.confidence * 100)}%)`);
      }
    }

    console.log('\n4. 💬 Criando interações...');

    for (let i = 0; i < 15; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomPost = posts[Math.floor(Math.random() * posts.length)];

      if (Math.random() > 0.5) {
        await services.postInteraction.likePost(randomUser._id, randomPost._id);
      } else {
        const comments = [
          'Muito interessante!',
          'Parabéns pelo trabalho!',
          'Concordo totalmente',
          'Ótima iniciativa 👏',
          'Adorei a abordagem',
          'Isso me inspirou muito!',
          'Excelente ponto de vista',
          'Vou testar isso também'
        ];
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        await services.postInteraction.commentPost(randomUser._id, randomPost._id, randomComment);
      }
    }
    console.log('   ✅ 15 interações aleatórias criadas');

    console.log('\n5. 📊 Análise da comunidade...');

    const allUsersResult = await services.user.list({}, 10, 0);
    if (allUsersResult.success) {
      console.log(`   👥 Total de usuários: ${allUsersResult.total}`);
    }

    const allPostsResult = await services.post.list({}, 20, 0);
    if (allPostsResult.success) {
      console.log(`   📝 Total de posts: ${allPostsResult.total}`);
    }

    const sentimentStats = await services.post.getSentimentStats();
    if (sentimentStats.success) {
      const stats = sentimentStats.data;
      console.log('   😊 Análise de sentimentos:');
      console.log(`      Positivos: ${stats.positive.count} posts`);
      console.log(`      Neutros: ${stats.neutral.count} posts`);
      console.log(`      Negativos: ${stats.negative.count} posts`);
    }

    console.log('\n6. 🔥 Hashtags em alta...');
    const trendingResult = await services.post.getTrending(5);
    if (trendingResult.success && trendingResult.data.length > 0) {
      trendingResult.data.forEach((item, index) => {
        console.log(`   ${index + 1}. #${item.hashtag} (${item.count} posts)`);
      });
    } else {
      console.log('   ℹ️  Nenhuma hashtag em alta encontrada');
    }

    console.log('\n7. 🏠 Exemplo de feeds personalizados...');
    for (let i = 0; i < 3; i++) {
      const user = users[i];
      const feedResult = await services.post.getFeed(user._id, 3, 0);
      if (feedResult.success) {
        console.log(`   📱 Feed de ${user.username} (${feedResult.data.length} posts):`);
        feedResult.data.forEach((post, index) => {
          const author = post.authorData?.username || 'Unknown';
          const preview = post.content.substring(0, 40) + (post.content.length > 40 ? '...' : '');
          console.log(`      ${index + 1}. @${author}: ${preview}`);
        });
      }
    }

    console.log('\n8. 🔍 Testando busca...');
    const searchTerms = ['react', 'design', 'startup'];
    for (const term of searchTerms) {
      const searchResult = await services.post.search(term, 5);
      if (searchResult.success) {
        console.log(`   🔍 Busca por "${term}": ${searchResult.data.length} resultados`);
        searchResult.data.forEach((post, index) => {
          const author = post.authorData?.username || 'Unknown';
          console.log(`      ${index + 1}. @${author}: ${post.content.substring(0, 50)}...`);
        });
      }
    }

    console.log('\n9. 🌐 Servidor HTTP em execução...');
    const serverInfo = httpServer.getInfo();
    console.log(`   📡 Servidor ativo em: http://${serverInfo.host}:${serverInfo.port}`);
    console.log('   📋 Endpoints disponíveis:');
    console.log('      GET  /                    - Informações da API');
    console.log('      GET  /health              - Status do servidor');
    console.log('      GET  /users               - Listar usuários');
    console.log('      GET  /posts               - Listar posts');
    console.log('      GET  /trending            - Hashtags em alta');
    console.log('      GET  /feed/:userId        - Feed do usuário');

    console.log('\n10. 💾 Dados de teste...');
    const testData = await backend.createTestData();
    console.log(`    ✅ Criados ${testData.users.length} usuários adicionais de teste`);
    console.log(`    ✅ Criados ${testData.posts.length} posts adicionais de teste`);

    console.log('\n🎉 Demonstração completa finalizada!');
    console.log('\n💡 Para interagir com a API:');
    console.log(`   curl http://localhost:${serverInfo.port}/`);
    console.log(`   curl http://localhost:${serverInfo.port}/users`);
    console.log(`   curl http://localhost:${serverInfo.port}/posts`);
    console.log(`   curl http://localhost:${serverInfo.port}/trending`);

    console.log('\n⏸️  Pressione Ctrl+C para parar o servidor...');

    process.on('SIGINT', async () => {
      console.log('\n\n🔄 Finalizando demonstração...');
      await backend.stop();
      process.exit(0);
    });

    while (true) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log(`⏰ Servidor ativo - ${new Date().toLocaleTimeString()}`);
    }

  } catch (error) {
    console.error('❌ Erro na demonstração:', error.message);
    await backend.stop();
  }
}

if (require.main === module) {
  fullDemo().catch(console.error);
}

module.exports = fullDemo;