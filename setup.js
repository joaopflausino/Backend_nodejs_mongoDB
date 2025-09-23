// ==================================================
// SCRIPT DE CRIAÇÃO DO BANCO MONGODB
// Nome do Banco: Backend_nodejs_mongoDB
// ==================================================

// 1. Conectar ao banco de dados
// Rode com mongosh "mongodb://localhost:27017/Backend_nodejs_mongoDB"

// ==================================================
// 2. CRIAÇÃO DAS COLEÇÕES COM VALIDAÇÃO DE SCHEMA
// ==================================================

// ---- COLEÇÃO: users ----
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password"],
      properties: {
        username: {
          bsonType: "string",
          description: "Username deve ser uma string e é obrigatório"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email deve ter formato válido e é obrigatório"
        },
        password: {
          bsonType: "string",
          minLength: 6,
          description: "Password deve ter pelo menos 6 caracteres"
        },
        displayName: {
          bsonType: "string",
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
})

// ---- COLEÇÃO: posts ----
db.createCollection("posts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["author", "content"],
      properties: {
        author: {
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
          properties: {
            score: {
              bsonType: "double",
              minimum: -1,
              maximum: 1,
              description: "Score do sentimento (-1 a 1)"
            },
            label: {
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
})

// ---- COLEÇÃO: userrelationships ----
db.createCollection("userrelationships", {
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
        }
      }
    }
  }
})

// ---- COLEÇÃO: postinteractions ----
db.createCollection("postinteractions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user", "post", "type"],
      properties: {
        user: {
          bsonType: "objectId",
          description: "ID do usuário que interagiu"
        },
        post: {
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
                score: {
                  bsonType: "double",
                  minimum: -1,
                  maximum: 1
                },
                label: {
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
})

// ---- COLEÇÃO: logs (para tratamento de erros) ----
db.createCollection("logs", {
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
        }
      }
    }
  }
})

// ==================================================
// 3. CRIAÇÃO DOS ÍNDICES
// ==================================================

print("Criando índices para melhor performance...")

// Índices para users
db.users.createIndex({ "username": 1 }, { unique: true, name: "idx_username_unique" })
db.users.createIndex({ "email": 1 }, { unique: true, name: "idx_email_unique" })
db.users.createIndex({ "createdAt": -1 }, { name: "idx_users_created" })
db.users.createIndex({ "isActive": 1 }, { name: "idx_users_active" })

// Índices para posts
db.posts.createIndex({ "author": 1, "createdAt": -1 }, { name: "idx_posts_author_date" })
db.posts.createIndex({ "hashtags": 1 }, { name: "idx_posts_hashtags" })
db.posts.createIndex({ "sentiment.label": 1 }, { name: "idx_posts_sentiment" })
db.posts.createIndex({ "createdAt": -1 }, { name: "idx_posts_date" })
db.posts.createIndex({ "isDeleted": 1 }, { name: "idx_posts_deleted" })
db.posts.createIndex({ "mentions": 1 }, { name: "idx_posts_mentions" })
db.posts.createIndex({ "originalPost": 1 }, { name: "idx_posts_original" })

// Índices para userrelationships
db.userrelationships.createIndex(
  { "follower": 1, "following": 1 }, 
  { unique: true, name: "idx_relationship_unique" }
)
db.userrelationships.createIndex({ "following": 1 }, { name: "idx_following" })
db.userrelationships.createIndex({ "follower": 1 }, { name: "idx_follower" })

// Índices para postinteractions
db.postinteractions.createIndex(
  { "user": 1, "post": 1, "type": 1 }, 
  { unique: true, name: "idx_interaction_unique" }
)
db.postinteractions.createIndex({ "post": 1, "type": 1 }, { name: "idx_post_interactions" })
db.postinteractions.createIndex({ "user": 1, "type": 1 }, { name: "idx_user_interactions" })
db.postinteractions.createIndex({ "createdAt": -1 }, { name: "idx_interactions_date" })

// Índices para logs
db.logs.createIndex({ "timestamp": -1 }, { name: "idx_logs_timestamp" })
db.logs.createIndex({ "level": 1 }, { name: "idx_logs_level" })
db.logs.createIndex({ "userId": 1 }, { name: "idx_logs_user" })

// ==================================================
// 4. INSERÇÃO DE DADOS DE EXEMPLO (OPCIONAL)
// ==================================================

print("Inserindo dados de exemplo...")

// Usuário de exemplo
const user1 = db.users.insertOne({
  username: "joao_dev",
  email: "joao@example.com",
  password: "$2b$10$hashedpassword", // Password hasheado
  displayName: "João Developer",
  bio: "Desenvolvedor apaixonado por tecnologia",
  verified: false,
  followers: 0,
  following: 0,
  postsCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
})

const user2 = db.users.insertOne({
  username: "maria_tech",
  email: "maria@example.com",
  password: "$2b$10$hashedpassword2",
  displayName: "Maria Tech",
  bio: "Entusiasta de IA e Machine Learning",
  verified: true,
  followers: 0,
  following: 0,
  postsCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
})

// Post de exemplo
db.posts.insertOne({
  author: user1.insertedId,
  content: "Meu primeiro post no microblog! Muito animado com este projeto 😊 #nodejs #mongodb",
  hashtags: ["nodejs", "mongodb"],
  mentions: [],
  likes: 0,
  retweets: 0,
  comments: 0,
  sentiment: {
    score: 0.8,
    label: "positive",
    confidence: 0.9,
    analyzedAt: new Date()
  },
  isRetweet: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false
})

// Log de exemplo
db.logs.insertOne({
  level: "info",
  message: "Banco de dados criado com sucesso",
  context: {
    database: "Backend_nodejs_mongoDB",
    collections: ["users", "posts", "userrelationships", "postinteractions", "logs"]
  },
  timestamp: new Date(),
  action: "database_setup"
})

// ==================================================
// 5. VERIFICAÇÃO DAS COLEÇÕES CRIADAS
// ==================================================

print("=== RESUMO DA CRIAÇÃO ===")
print("Banco de dados: Backend_nodejs_mongoDB")
print("Coleções criadas:")
db.getCollectionNames().forEach(function(collection) {
    print("- " + collection)
})

print("\n=== VERIFICAÇÃO DOS ÍNDICES ===")
print("Índices na coleção users:")
db.users.getIndexes().forEach(function(index) {
    print("- " + index.name)
})

print("\nÍndices na coleção posts:")
db.posts.getIndexes().forEach(function(index) {
    print("- " + index.name)
})

print("\n=== CONFIGURAÇÃO CONCLUÍDA ===")
print("✅ Banco de dados pronto para uso!")
print("✅ Coleções criadas com validação de schema")
print("✅ Índices otimizados para performance")
print("✅ Dados de exemplo inseridos")

// ==================================================
// 6. COMANDOS ÚTEIS PARA VERIFICAÇÃO
// ==================================================

/*
COMANDOS ÚTEIS PARA TESTAR:

// Ver todas as coleções
show collections

// Ver documentos de uma coleção
db.users.find().pretty()
db.posts.find().pretty()

// Verificar índices
db.users.getIndexes()
db.posts.getIndexes()

// Estatísticas da coleção
db.users.stats()

// Verificar validação de schema
db.runCommand({collMod: "users", validator: {}, validationLevel: "strict"})

*/