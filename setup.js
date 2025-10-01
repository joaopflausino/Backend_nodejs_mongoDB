// ==================================================
// SCRIPT DE CRIAÇÃO DO BANCO MONGODB
// Nome do Banco: microblogging
// Projeto: Sistema de Microblogging com Análise de Sentimento
// ==================================================

const { MongoClient } = require('mongodb');

// Configuração da conexão
const url = 'mongodb://localhost:27017';
const dbName = 'microblogging';

async function setupDatabase() {
    const client = new MongoClient(url);
    
    try {
        // 1. Conectar ao banco de dados
        console.log('🔌 Conectando ao MongoDB...');
        await client.connect();
        console.log('✅ Conectado ao MongoDB com sucesso!');
        
        const db = client.db(dbName);
        
        // ==================================================
        // 2. CRIAÇÃO DAS COLEÇÕES COM VALIDAÇÃO DE SCHEMA
        // ==================================================
        
        console.log('\n📝 Criando coleções com validação de schema...');
        
        // ---- COLEÇÃO: users ----
        try {
            await db.createCollection("users", {
                validator: {
                    $jsonSchema: {
                        bsonType: "object",
                        required: ["username", "email"],
                        properties: {
                            username: {
                                bsonType: "string",
                                minLength: 3,
                                maxLength: 30,
                                description: "Username deve ter entre 3-30 caracteres e é obrigatório"
                            },
                            email: {
                                bsonType: "string",
                                pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                                description: "Email deve ter formato válido e é obrigatório"
                            },
                            displayName: {
                                bsonType: "string",
                                maxLength: 50,
                                description: "Nome para exibição"
                            },
                            bio: {
                                bsonType: "string",
                                maxLength: 500,
                                description: "Biografia limitada a 500 caracteres"
                            },
                            profilePicture: {
                                bsonType: "string",
                                description: "URL da foto de perfil"
                            },
                            verified: {
                                bsonType: "bool",
                                description: "Conta verificada"
                            },
                            followers: {
                                bsonType: "int",
                                minimum: 0,
                                description: "Número de seguidores"
                            },
                            following: {
                                bsonType: "int",
                                minimum: 0,
                                description: "Número de pessoas seguindo"
                            },
                            postsCount: {
                                bsonType: "int",
                                minimum: 0,
                                description: "Número total de posts"
                            },
                            createdAt: {
                                bsonType: "date",
                                description: "Data de criação da conta"
                            },
                            updatedAt: {
                                bsonType: "date",
                                description: "Data da última atualização"
                            },
                            isActive: {
                                bsonType: "bool",
                                description: "Conta ativa ou não"
                            }
                        }
                    }
                }
            });
            console.log('✅ Coleção "users" criada com sucesso');
        } catch (error) {
            if (error.code === 48) {
                console.log('ℹ️  Coleção "users" já existe');
            } else {
                throw error;
            }
        }
        
        // ---- COLEÇÃO: posts ----
        try {
            await db.createCollection("posts", {
                validator: {
                    $jsonSchema: {
                        bsonType: "object",
                        required: ["userId", "content"],
                        properties: {
                            userId: {
                                bsonType: "objectId",
                                description: "ID do autor (referência para users)"
                            },
                            content: {
                                bsonType: "string",
                                maxLength: 280,
                                minLength: 1,
                                description: "Conteúdo do post (máximo 280 caracteres)"
                            },
                            images: {
                                bsonType: "array",
                                items: {
                                    bsonType: "string"
                                },
                                description: "Array de URLs de imagens"
                            },
                            hashtags: {
                                bsonType: "array",
                                items: {
                                    bsonType: "string"
                                },
                                description: "Array de hashtags"
                            },
                            mentions: {
                                bsonType: "array",
                                items: {
                                    bsonType: "objectId"
                                },
                                description: "Array de IDs de usuários mencionados"
                            },
                            likes: {
                                bsonType: "int",
                                minimum: 0,
                                description: "Número de curtidas"
                            },
                            retweets: {
                                bsonType: "int",
                                minimum: 0,
                                description: "Número de retweets"
                            },
                            comments: {
                                bsonType: "int",
                                minimum: 0,
                                description: "Número de comentários"
                            },
                            sentiment: {
                                bsonType: "object",
                                required: ["sentiment", "confidence"],
                                properties: {
                                    sentiment: {
                                        bsonType: "string",
                                        enum: ["positive", "negative", "neutral"],
                                        description: "Classificação do sentimento"
                                    },
                                    confidence: {
                                        bsonType: "double",
                                        minimum: 0,
                                        maximum: 1,
                                        description: "Confiança da análise (0 a 1)"
                                    },
                                    scores: {
                                        bsonType: "object",
                                        properties: {
                                            positive: {
                                                bsonType: "int",
                                                minimum: 0,
                                                description: "Contagem de palavras positivas"
                                            },
                                            negative: {
                                                bsonType: "int",
                                                minimum: 0,
                                                description: "Contagem de palavras negativas"
                                            },
                                            neutral: {
                                                bsonType: "int",
                                                minimum: 0,
                                                description: "Contagem de palavras neutras"
                                            }
                                        }
                                    },
                                    analyzedAt: {
                                        bsonType: "date",
                                        description: "Data da análise"
                                    }
                                }
                            },
                            originalPost: {
                                bsonType: "objectId",
                                description: "Post original (para retweets)"
                            },
                            isRetweet: {
                                bsonType: "bool",
                                description: "Se é um retweet"
                            },
                            createdAt: {
                                bsonType: "date",
                                description: "Data de criação"
                            },
                            updatedAt: {
                                bsonType: "date",
                                description: "Data de atualização"
                            },
                            isDeleted: {
                                bsonType: "bool",
                                description: "Se foi deletado"
                            }
                        }
                    }
                }
            });
            console.log('✅ Coleção "posts" criada com sucesso');
        } catch (error) {
            if (error.code === 48) {
                console.log('ℹ️  Coleção "posts" já existe');
            } else {
                throw error;
            }
        }
        
        // ---- COLEÇÃO: userrelationships ----
        try {
            await db.createCollection("userrelationships", {
                validator: {
                    $jsonSchema: {
                        bsonType: "object",
                        required: ["follower", "following"],
                        properties: {
                            follower: {
                                bsonType: "objectId",
                                description: "ID do usuário que segue"
                            },
                            following: {
                                bsonType: "objectId",
                                description: "ID do usuário que é seguido"
                            },
                            createdAt: {
                                bsonType: "date",
                                description: "Data que começou a seguir"
                            },
                            isActive: {
                                bsonType: "bool",
                                description: "Relacionamento ativo"
                            }
                        }
                    }
                }
            });
            console.log('✅ Coleção "userrelationships" criada com sucesso');
        } catch (error) {
            if (error.code === 48) {
                console.log('ℹ️  Coleção "userrelationships" já existe');
            } else {
                throw error;
            }
        }
        
        // ---- COLEÇÃO: postinteractions ----
        try {
            await db.createCollection("postinteractions", {
                validator: {
                    $jsonSchema: {
                        bsonType: "object",
                        required: ["userId", "postId", "type"],
                        properties: {
                            userId: {
                                bsonType: "objectId",
                                description: "ID do usuário que interagiu"
                            },
                            postId: {
                                bsonType: "objectId",
                                description: "ID do post"
                            },
                            type: {
                                bsonType: "string",
                                enum: ["like", "retweet", "comment"],
                                description: "Tipo de interação"
                            },
                            comment: {
                                bsonType: "object",
                                properties: {
                                    content: {
                                        bsonType: "string",
                                        maxLength: 280,
                                        description: "Conteúdo do comentário"
                                    },
                                    sentiment: {
                                        bsonType: "object",
                                        properties: {
                                            sentiment: {
                                                bsonType: "string",
                                                enum: ["positive", "negative", "neutral"]
                                            },
                                            confidence: {
                                                bsonType: "double",
                                                minimum: 0,
                                                maximum: 1
                                            },
                                            analyzedAt: {
                                                bsonType: "date"
                                            }
                                        }
                                    }
                                }
                            },
                            createdAt: {
                                bsonType: "date",
                                description: "Data da interação"
                            }
                        }
                    }
                }
            });
            console.log('✅ Coleção "postinteractions" criada com sucesso');
        } catch (error) {
            if (error.code === 48) {
                console.log('ℹ️  Coleção "postinteractions" já existe');
            } else {
                throw error;
            }
        }
        
        // ---- COLEÇÃO: logs (para tratamento de erros) ----
        try {
            await db.createCollection("logs", {
                validator: {
                    $jsonSchema: {
                        bsonType: "object",
                        required: ["level", "message", "timestamp"],
                        properties: {
                            level: {
                                bsonType: "string",
                                enum: ["error", "warning", "info", "debug"],
                                description: "Nível do log"
                            },
                            message: {
                                bsonType: "string",
                                description: "Mensagem do log"
                            },
                            context: {
                                bsonType: "object",
                                description: "Contexto adicional (dados do erro, etc.)"
                            },
                            stackTrace: {
                                bsonType: "string",
                                description: "Stack trace do erro"
                            },
                            timestamp: {
                                bsonType: "date",
                                description: "Data e hora do log"
                            },
                            userId: {
                                bsonType: "objectId",
                                description: "ID do usuário relacionado (opcional)"
                            },
                            action: {
                                bsonType: "string",
                                description: "Ação que gerou o log"
                            },
                            method: {
                                bsonType: "string",
                                description: "Método/função que gerou o log"
                            }
                        }
                    }
                }
            });
            console.log('✅ Coleção "logs" criada com sucesso');
        } catch (error) {
            if (error.code === 48) {
                console.log('ℹ️  Coleção "logs" já existe');
            } else {
                throw error;
            }
        }
        
        // ==================================================
        // 3. CRIAÇÃO DOS ÍNDICES
        // ==================================================
        
        console.log('\n🔍 Criando índices para melhor performance...');
        
        // Índices para users
        try {
            await db.collection('users').createIndex({ "username": 1 }, { unique: true, name: "idx_username_unique" });
            console.log('✅ Índice único para username criado');
        } catch (error) {
            if (error.code === 85) {
                console.log('ℹ️  Índice username já existe');
            } else {
                throw error;
            }
        }
        
        try {
            await db.collection('users').createIndex({ "email": 1 }, { unique: true, name: "idx_email_unique" });
            console.log('✅ Índice único para email criado');
        } catch (error) {
            if (error.code === 85) {
                console.log('ℹ️  Índice email já existe');
            } else {
                throw error;
            }
        }
        
        await db.collection('users').createIndex({ "createdAt": -1 }, { name: "idx_users_created" });
        await db.collection('users').createIndex({ "isActive": 1 }, { name: "idx_users_active" });
        
        // Índices para posts
        await db.collection('posts').createIndex({ "userId": 1, "createdAt": -1 }, { name: "idx_posts_user_date" });
        await db.collection('posts').createIndex({ "hashtags": 1 }, { name: "idx_posts_hashtags" });
        await db.collection('posts').createIndex({ "sentiment.sentiment": 1 }, { name: "idx_posts_sentiment" });
        await db.collection('posts').createIndex({ "createdAt": -1 }, { name: "idx_posts_date" });
        await db.collection('posts').createIndex({ "isDeleted": 1 }, { name: "idx_posts_deleted" });
        await db.collection('posts').createIndex({ "mentions": 1 }, { name: "idx_posts_mentions" });
        await db.collection('posts').createIndex({ "originalPost": 1 }, { name: "idx_posts_original" });
        await db.collection('posts').createIndex({ "content": "text" }, { name: "idx_posts_content_text" });
        
        // Índices para userrelationships
        try {
            await db.collection('userrelationships').createIndex(
                { "follower": 1, "following": 1 }, 
                { unique: true, name: "idx_relationship_unique" }
            );
            console.log('✅ Índice único para relacionamentos criado');
        } catch (error) {
            if (error.code === 85) {
                console.log('ℹ️  Índice relacionamento já existe');
            } else {
                throw error;
            }
        }
        
        await db.collection('userrelationships').createIndex({ "following": 1 }, { name: "idx_following" });
        await db.collection('userrelationships').createIndex({ "follower": 1 }, { name: "idx_follower" });
        
        // Índices para postinteractions
        try {
            await db.collection('postinteractions').createIndex(
                { "userId": 1, "postId": 1, "type": 1 }, 
                { unique: true, name: "idx_interaction_unique" }
            );
            console.log('✅ Índice único para interações criado');
        } catch (error) {
            if (error.code === 85) {
                console.log('ℹ️  Índice interação já existe');
            } else {
                throw error;
            }
        }
        
        await db.collection('postinteractions').createIndex({ "postId": 1, "type": 1 }, { name: "idx_post_interactions" });
        await db.collection('postinteractions').createIndex({ "userId": 1, "type": 1 }, { name: "idx_user_interactions" });
        await db.collection('postinteractions').createIndex({ "createdAt": -1 }, { name: "idx_interactions_date" });
        
        // Índices para logs
        await db.collection('logs').createIndex({ "timestamp": -1 }, { name: "idx_logs_timestamp" });
        await db.collection('logs').createIndex({ "level": 1 }, { name: "idx_logs_level" });
        await db.collection('logs').createIndex({ "userId": 1 }, { name: "idx_logs_user" });
        await db.collection('logs').createIndex({ "action": 1 }, { name: "idx_logs_action" });
        
        console.log('✅ Todos os índices criados com sucesso');
        
        // ==================================================
        // 4. INSERÇÃO DE DADOS DE EXEMPLO (OPCIONAL)
        // ==================================================
        
        console.log('\n📊 Inserindo dados de exemplo...');
        
        // Verificar se já existem usuários
        const userCount = await db.collection('users').countDocuments();
        
        if (userCount === 0) {
            // Usuários de exemplo
            const user1 = await db.collection('users').insertOne({
                username: "joao_dev",
                email: "joao@microblog.com",
                displayName: "João Developer",
                bio: "Desenvolvedor apaixonado por tecnologia e análise de sentimento",
                verified: false,
                followers: 0,
                following: 0,
                postsCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true
            });
            
            const user2 = await db.collection('users').insertOne({
                username: "maria_tech",
                email: "maria@microblog.com",
                displayName: "Maria Tech",
                bio: "Entusiasta de IA e Machine Learning aplicado a redes sociais",
                verified: true,
                followers: 0,
                following: 0,
                postsCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true
            });
            
            const user3 = await db.collection('users').insertOne({
                username: "carlos_data",
                email: "carlos@microblog.com",
                displayName: "Carlos Data",
                bio: "Cientista de dados especializado em análise de sentimento",
                verified: false,
                followers: 0,
                following: 0,
                postsCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true
            });
            
            console.log('✅ Usuários de exemplo criados');
            
            // Posts de exemplo com diferentes sentimentos
            const posts = [
                {
                    userId: user1.insertedId,
                    content: "Meu primeiro post no microblog! Muito animado com este projeto incrível 😊 #nodejs #mongodb",
                    hashtags: ["nodejs", "mongodb"],
                    mentions: [],
                    likes: 0,
                    retweets: 0,
                    comments: 0,
                    sentiment: {
                        sentiment: "positive",
                        confidence: 0.9,
                        scores: { positive: 3, negative: 0, neutral: 0 },
                        analyzedAt: new Date()
                    },
                    isRetweet: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isDeleted: false
                },
                {
                    userId: user2.insertedId,
                    content: "Que frustração com esses bugs... o sistema está terrível hoje 😤",
                    hashtags: [],
                    mentions: [],
                    likes: 0,
                    retweets: 0,
                    comments: 0,
                    sentiment: {
                        sentiment: "negative",
                        confidence: 0.85,
                        scores: { positive: 0, negative: 2, neutral: 0 },
                        analyzedAt: new Date()
                    },
                    isRetweet: false,
                    createdAt: new Date(Date.now() - 3600000), // 1 hora atrás
                    updatedAt: new Date(Date.now() - 3600000),
                    isDeleted: false
                },
                {
                    userId: user3.insertedId,
                    content: "Hoje foi um dia normal de trabalho. Nada muito especial aconteceu.",
                    hashtags: [],
                    mentions: [],
                    likes: 0,
                    retweets: 0,
                    comments: 0,
                    sentiment: {
                        sentiment: "neutral",
                        confidence: 0.7,
                        scores: { positive: 0, negative: 0, neutral: 2 },
                        analyzedAt: new Date()
                    },
                    isRetweet: false,
                    createdAt: new Date(Date.now() - 7200000), // 2 horas atrás
                    updatedAt: new Date(Date.now() - 7200000),
                    isDeleted: false
                },
                {
                    userId: user1.insertedId,
                    content: "JavaScript é uma linguagem fantástica! Amo resolver problemas complexos 💻",
                    hashtags: ["javascript", "programming"],
                    mentions: [],
                    likes: 0,
                    retweets: 0,
                    comments: 0,
                    sentiment: {
                        sentiment: "positive",
                        confidence: 0.95,
                        scores: { positive: 3, negative: 0, neutral: 0 },
                        analyzedAt: new Date()
                    },
                    isRetweet: false,
                    createdAt: new Date(Date.now() - 10800000), // 3 horas atrás
                    updatedAt: new Date(Date.now() - 10800000),
                    isDeleted: false
                }
            ];
            
            await db.collection('posts').insertMany(posts);
            console.log('✅ Posts de exemplo criados');
            
        } else {
            console.log('ℹ️  Dados de exemplo já existem no banco');
        }
        
        // Log de inicialização
        await db.collection('logs').insertOne({
            level: "info",
            message: "Banco de dados configurado com sucesso",
            context: {
                database: dbName,
                collections: ["users", "posts", "userrelationships", "postinteractions", "logs"],
                indexes: "Todos os índices criados",
                sampleData: "Dados de exemplo inseridos"
            },
            timestamp: new Date(),
            action: "database_setup",
            method: "setupDatabase"
        });
        
        // ==================================================
        // 5. VERIFICAÇÃO DAS COLEÇÕES CRIADAS
        // ==================================================
        
        console.log('\n📋 === RESUMO DA CRIAÇÃO ===');
        console.log(`🗄️  Banco de dados: ${dbName}`);
        console.log('📁 Coleções criadas:');
        
        const collections = await db.listCollections().toArray();
        collections.forEach(collection => {
            console.log(`   - ${collection.name}`);
        });
        
        console.log('\n🔍 === VERIFICAÇÃO DOS ÍNDICES ===');
        
        // Verificar índices das principais coleções
        const userIndexes = await db.collection('users').indexes();
        console.log(`📊 Índices na coleção users (${userIndexes.length}):`);
        userIndexes.forEach(index => {
            console.log(`   - ${index.name}`);
        });
        
        const postIndexes = await db.collection('posts').indexes();
        console.log(`📊 Índices na coleção posts (${postIndexes.length}):`);
        postIndexes.forEach(index => {
            console.log(`   - ${index.name}`);
        });
        
        // Estatísticas das coleções
        console.log('\n📈 === ESTATÍSTICAS DAS COLEÇÕES ===');
        const userCount2 = await db.collection('users').countDocuments();
        const postCount = await db.collection('posts').countDocuments();
        const logCount = await db.collection('logs').countDocuments();
        
        console.log(`👥 Usuários: ${userCount2}`);
        console.log(`📝 Posts: ${postCount}`);
        console.log(`📋 Logs: ${logCount}`);
        
        console.log('\n✅ === CONFIGURAÇÃO CONCLUÍDA ===');
        console.log('🎉 Banco de dados pronto para uso!');
        console.log('✅ Coleções criadas com validação de schema');
        console.log('✅ Índices otimizados para performance');
        console.log('✅ Dados de exemplo inseridos');
        console.log('✅ Sistema de logs configurado');
        
        console.log('\n🚀 === PRÓXIMOS PASSOS ===');
        console.log('1. Execute: npm start');
        console.log('2. Ou execute: node index.js');
        console.log('3. Para exemplos avançados: node examples/advanced-usage.js');
        console.log('4. Para testes simples: node test/simple-tests.js');
        
    } catch (error) {
        console.error('❌ Erro durante a configuração do banco de dados:', error);
        throw error;
    } finally {
        // Fechar conexão
        await client.close();
        console.log('\n🔌 Conexão com MongoDB fechada');
    }
}

// ==================================================
// 6. COMANDOS ÚTEIS PARA VERIFICAÇÃO
// ==================================================

/*
COMANDOS ÚTEIS PARA TESTAR NO MONGOSH:

// Conectar ao banco
mongosh "mongodb://localhost:27017/microblogging"

// Ver todas as coleções
show collections

// Ver documentos de uma coleção
db.users.find().pretty()
db.posts.find().pretty()
db.logs.find().pretty()

// Verificar índices
db.users.getIndexes()
db.posts.getIndexes()

// Estatísticas da coleção
db.users.stats()
db.posts.stats()

// Contar documentos
db.users.countDocuments()
db.posts.countDocuments()

// Buscar posts por sentimento
db.posts.find({"sentiment.sentiment": "positive"}).pretty()
db.posts.find({"sentiment.sentiment": "negative"}).pretty()

// Buscar posts por usuário
db.posts.find({"userId": objectId.createFromHexString("...")}).pretty()

// Ver logs de erro
db.logs.find({"level": "error"}).pretty()

// Verificar validação de schema
db.runCommand({collMod: "users", validator: {}, validationLevel: "strict"})

*/

// Executar setup se este arquivo for chamado diretamente
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('\n🎊 Setup do banco de dados concluído com sucesso!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Erro fatal no setup:', error);
            process.exit(1);
        });
}

module.exports = { setupDatabase };