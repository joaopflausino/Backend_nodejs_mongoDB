const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'microblogging-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de Microblogging com Express.js',
        version: '2.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me'
            },
            users: {
                list: 'GET /api/users',
                getById: 'GET /api/users/:id',
                getByEmail: 'GET /api/users/email/:email',
                delete: 'DELETE /api/users/:id (requer autenticação)'
            },
            posts: {
                create: 'POST /api/posts (requer autenticação)',
                list: 'GET /api/posts',
                getById: 'GET /api/posts/:id',
                getByUser: 'GET /api/posts/user/:userId',
                getBySentiment: 'GET /api/posts/sentiment/:sentiment',
                search: 'GET /api/posts/search?q=texto',
                delete: 'DELETE /api/posts/:id (requer autenticação)'
            },
            health: 'GET /health'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada'
    });
});

app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err);

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Erro interno do servidor'
    });
});

app.listen(PORT, () => {
    console.log(` Servidor Express rodando na porta ${PORT}`);
    console.log(` http://localhost:${PORT}`);
    console.log('\n=== ROTAS DISPONÍVEIS ===');
    console.log('\n--- Autenticação ---');
    console.log('POST   /api/auth/register - Registrar novo usuário');
    console.log('POST   /api/auth/login - Login');
    console.log('POST   /api/auth/logout - Logout');
    console.log('GET    /api/auth/me - Obter usuário atual');
    console.log('\n--- Usuários ---');
    console.log('GET    /api/users - Listar todos os usuários');
    console.log('GET    /api/users/:id - Buscar usuário por ID');
    console.log('GET    /api/users/email/:email - Buscar usuário por email');
    console.log('DELETE /api/users/:id - Deletar usuário (requer autenticação)');
    console.log('\n--- Posts ---');
    console.log('POST   /api/posts - Criar post (requer autenticação)');
    console.log('GET    /api/posts - Listar todos os posts');
    console.log('GET    /api/posts/:id - Buscar post por ID');
    console.log('GET    /api/posts/user/:userId - Buscar posts por usuário');
    console.log('GET    /api/posts/sentiment/:sentiment - Buscar posts por sentimento');
    console.log('GET    /api/posts/search?q=texto - Buscar posts por conteúdo');
    console.log('DELETE /api/posts/:id - Deletar post (requer autenticação)');
    console.log('\n--- Outros ---');
    console.log('GET    /health - Health check');
    console.log('GET    / - Informações da API');
    console.log('\n========================\n');
});

module.exports = app;
