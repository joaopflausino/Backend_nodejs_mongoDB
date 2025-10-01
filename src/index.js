const User = require('./models/User');
const Post = require('./models/Post');
const SentimentAnalysis = require('./models/SentimentAnalysis');

class MicrobloggingApp {

    async demonstrateApp() {
        try {
            console.log('=== DEMONSTRAÇÃO DO SISTEMA DE MICROBLOGGING ===');

            console.log('1. Criando usuários...');
            
            const user1 = new User({
                username: 'joao1_silva',
                email: 'joao1@email.com'
            });
            
            const user2 = new User({
                username: 'maria1_santos',
                email: 'maria1@email.com'
            });

            const userId1 = await user1.save();
            const userId2 = await user2.save();

            console.log(`Usuários criados: ${userId1}, ${userId2}`);

            console.log('2. Criando posts...');
            console.log(userId1.length)
            const post1 = new Post({
                userId: userId1.toHexString(),
                content: 'Que dia maravilhoso! Estou muito feliz com minha conquista!'
            });

            const post2 = new Post({
                userId: userId2.toHexString(),
                content: 'Que tristeza... hoje foi um dia terrível e frustrante.'
            });

            const post3 = new Post({
                userId: userId1.toHexString(),
                content: 'Hoje o tempo está normal, nada demais aconteceu.'
            });

            await post1.save();
            await post2.save();
            await post3.save();

            console.log('3. Buscando posts por usuário...');
            const postsUser1 = await Post.findByUserId(userId1.toHexString());
            console.log(`Posts do usuário 1 (${postsUser1.length} posts):`, 
                       postsUser1.map(p => ({ content: p.content, sentiment: p.sentiment.sentiment })));

            console.log('4. Buscando posts positivos...');
            const positivePosts = await Post.findBySentiment('positive');
            console.log('Posts positivos:', positivePosts.map(p => p.content));

            console.log('5. Buscando posts negativos...');
            const negativePosts = await Post.findBySentiment('negative');
            console.log('Posts negativos:', negativePosts.map(p => p.content));

            console.log('6. Buscando posts que contêm "dia"...');
            const searchResults = await Post.searchByContent('dia');
            console.log('Resultados da busca:', searchResults.map(p => p.content));

            console.log('7. Testando análise de sentimento...');
            const analyzer = new SentimentAnalysis();
            
            const testTexts = [
                'Estou extremamente feliz e grato!',
                'Que raiva, estou muito frustrado',
                'O clima está normal hoje'
            ];

            testTexts.forEach(text => {
                const analysis = analyzer.analyzeSentiment(text);
                console.log(`Texto: "${text}"`);
                console.log(`Sentimento: ${analysis.sentiment} (confiança: ${analysis.confidence})`);
                console.log('---');
            });

            console.log('8. Listando todos os usuários...');
            const allUsers = await User.getAllUsers();
            console.log('Usuários:', allUsers.map(u => ({ username: u.username, email: u.email })));

            console.log('9. Listando todos os posts...');
            const allPosts = await Post.getAllPosts();
            console.log('Todos os posts:', allPosts.map(p => ({
                content: p.content,
                sentiment: p.sentiment.sentiment,
                confidence: p.sentiment.confidence
            })));

            console.log('=== DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO ===');

        } catch (error) {
            console.error('Erro durante a demonstração', error);
        }
    }

    async demonstrateErrorHandling() {
        try {
            console.log('=== DEMONSTRAÇÃO DE TRATAMENTO DE ERROS ===');

            try {
                const invalidUser = new User({
                    username: '',
                    email: 'email-inválido'
                });
                await invalidUser.save();
            } catch (error) {
                console.log('Erro capturado: Usuário inválido');
            }

            try {
                const longPost = new Post({
                    userId: '507f1f77bcf86cd799439011',
                    content: 'a'.repeat(300)
                });
                await longPost.save();
            } catch (error) {
                console.log('Erro capturado: Post muito longo');
            }

            try {
                await User.findById('507f1f77bcf86cd799439999');
            } catch (error) {
                console.log('Erro capturado: Usuário não encontrado');
            }

            console.log('=== DEMONSTRAÇÃO DE ERROS CONCLUÍDA ===');

        } catch (error) {
            console.error('Erro inesperado no tratamento de erros', error);
        }
    }

    async run() {
        await this.demonstrateApp();
        await this.demonstrateErrorHandling();
    }
}

if (require.main === module) {
    const app = new MicrobloggingApp();
    app.run().then(() => {
        console.log('Aplicação finalizada. Verifique os logs para mais detalhes.');
        process.exit(0);
    }).catch(error => {
        console.error('Erro fatal na aplicação:', error);
        process.exit(1);
    });
}

module.exports = MicrobloggingApp;
