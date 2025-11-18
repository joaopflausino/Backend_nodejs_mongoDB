const http = require('http');
const url = require('url');
const User = require('./models/User');
const Post = require('./models/Post');

const PORT = process.env.PORT || 3000;

function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {

    if (req.method === 'OPTIONS') {
        sendJSON(res, 204, {});
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    try {

        if (pathname === '/api/users' && method === 'POST') {
            const body = await getRequestBody(req);
            const user = new User(body);
            const userId = await user.save();
            sendJSON(res, 201, { success: true, userId: userId.toHexString() });
            return;
        }

        if (pathname === '/api/users' && method === 'GET') {
            const users = await User.getAllUsers();
            sendJSON(res, 200, { success: true, data: users });
            return;
        }

        if (pathname.startsWith('/api/users/') && method === 'GET') {
            const id = pathname.split('/')[3];
            const user = await User.findById(id);
            if (user) {
                sendJSON(res, 200, { success: true, data: user });
            } else {
                sendJSON(res, 404, { success: false, error: 'Usuário não encontrado' });
            }
            return;
        }

        if (pathname.startsWith('/api/users/email/') && method === 'GET') {
            const email = decodeURIComponent(pathname.split('/')[4]);
            const user = await User.findByEmail(email);
            if (user) {
                sendJSON(res, 200, { success: true, data: user });
            } else {
                sendJSON(res, 404, { success: false, error: 'Usuário não encontrado' });
            }
            return;
        }

        if (pathname.startsWith('/api/users/') && method === 'DELETE') {
            const id = pathname.split('/')[3];
            const deleted = await User.deleteById(id);
            if (deleted) {
                sendJSON(res, 200, { success: true, message: 'Usuário deletado com sucesso' });
            } else {
                sendJSON(res, 404, { success: false, error: 'Usuário não encontrado' });
            }
            return;
        }

        if (pathname === '/api/posts' && method === 'POST') {
            const body = await getRequestBody(req);
            const post = new Post(body);
            const postId = await post.save();
            sendJSON(res, 201, { success: true, postId: postId.toHexString() });
            return;
        }

        if (pathname === '/api/posts' && method === 'GET') {
            const posts = await Post.getAllPosts();
            sendJSON(res, 200, { success: true, data: posts });
            return;
        }

        if (pathname.startsWith('/api/posts/') && pathname.split('/').length === 4 && method === 'GET') {
            const id = pathname.split('/')[3];
            const post = await Post.findById(id);
            if (post) {
                sendJSON(res, 200, { success: true, data: post });
            } else {
                sendJSON(res, 404, { success: false, error: 'Post não encontrado' });
            }
            return;
        }

        if (pathname.startsWith('/api/posts/user/') && method === 'GET') {
            const userId = pathname.split('/')[4];
            const posts = await Post.findByUserId(userId);
            sendJSON(res, 200, { success: true, data: posts });
            return;
        }

        if (pathname.startsWith('/api/posts/sentiment/') && method === 'GET') {
            const sentiment = pathname.split('/')[4];
            const posts = await Post.findBySentiment(sentiment);
            sendJSON(res, 200, { success: true, data: posts });
            return;
        }

        if (pathname === '/api/posts/search' && method === 'GET') {
            const searchText = parsedUrl.query.q;
            if (!searchText) {
                sendJSON(res, 400, { success: false, error: 'Parâmetro "q" é obrigatório' });
                return;
            }
            const posts = await Post.searchByContent(searchText);
            sendJSON(res, 200, { success: true, data: posts });
            return;
        }

        if (pathname.startsWith('/api/posts/') && pathname.split('/').length === 4 && method === 'DELETE') {
            const id = pathname.split('/')[3];
            const deleted = await Post.deleteById(id);
            if (deleted) {
                sendJSON(res, 200, { success: true, message: 'Post deletado com sucesso' });
            } else {
                sendJSON(res, 404, { success: false, error: 'Post não encontrado' });
            }
            return;
        }

        sendJSON(res, 404, { success: false, error: 'Rota não encontrada' });

    } catch (error) {
        console.error('Erro no servidor:', error);
        sendJSON(res, 500, {
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

server.listen(PORT, () => {
    console.log(` Servidor rodando na porta ${PORT}`);
    console.log(` http://localhost:${PORT}`);
    console.log('\n=== ROTAS DISPONÍVEIS ===');
    console.log('GET    /health - Health check');
    console.log('\n--- Usuários ---');
    console.log('POST   /api/users - Criar usuário');
    console.log('GET    /api/users - Listar todos os usuários');
    console.log('GET    /api/users/:id - Buscar usuário por ID');
    console.log('GET    /api/users/email/:email - Buscar usuário por email');
    console.log('DELETE /api/users/:id - Deletar usuário');
    console.log('\n--- Posts ---');
    console.log('POST   /api/posts - Criar post');
    console.log('GET    /api/posts - Listar todos os posts');
    console.log('GET    /api/posts/:id - Buscar post por ID');
    console.log('GET    /api/posts/user/:userId - Buscar posts por usuário');
    console.log('GET    /api/posts/sentiment/:sentiment - Buscar posts por sentimento');
    console.log('GET    /api/posts/search?q=texto - Buscar posts por conteúdo');
    console.log('DELETE /api/posts/:id - Deletar post');
    console.log('\n========================\n');
});

module.exports = server;
