# Backend_nodejs_mongoDB
trabalho da faculdade usando nodejs mongo DB e mais algumass traquinagens


## Iniciar o Servidor

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

---

## Rotas de Usuários

### 1. Criar Usuário
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "joao_silva", "email": "joao@example.com"}'
```

**Resposta:**
```json
{
  "success": true,
  "userId": "68dd8ef39daefb5e02046719"
}
```

### 2. Listar Todos os Usuários
```bash
curl http://localhost:3000/api/users
```

### 3. Buscar Usuário por ID
```bash
curl http://localhost:3000/api/users/68dd8ef39daefb5e02046719
```

### 4. Buscar Usuário por Email
```bash
curl http://localhost:3000/api/users/email/joao@example.com
```

### 5. Deletar Usuário
```bash
curl -X DELETE http://localhost:3000/api/users/68dd8ef39daefb5e02046719
```

---

## Rotas de Posts

### 1. Criar Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"userId": "68dd8ef39daefb5e02046719", "content": "Estou muito feliz hoje!"}'
```

**Resposta:**
```json
{
  "success": true,
  "postId": "68dd8f099daefb5e0204671a"
}
```

### 2. Listar Todos os Posts
```bash
curl http://localhost:3000/api/posts
```

### 3. Buscar Post por ID
```bash
curl http://localhost:3000/api/posts/68dd8f099daefb5e0204671a
```

### 4. Buscar Posts por Usuário
```bash
curl http://localhost:3000/api/posts/user/68dd8ef39daefb5e02046719
```

### 5. Buscar Posts por Sentimento
```bash
# Sentimentos possíveis: positive, negative, neutral
curl http://localhost:3000/api/posts/sentiment/positive
curl http://localhost:3000/api/posts/sentiment/negative
curl http://localhost:3000/api/posts/sentiment/neutral
```

### 6. Buscar Posts por Conteúdo (Search)
```bash
curl "http://localhost:3000/api/posts/search?q=feliz"
```

### 7. Deletar Post
```bash
curl -X DELETE http://localhost:3000/api/posts/68dd8f099daefb5e0204671a
```

---

**Resposta:**
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2025-10-01T20:28:35.910Z"
}
```

---

## Exemplos com JavaScript (fetch)

### Criar Usuário
```javascript
fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'maria_silva',
    email: 'maria@example.com'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Criar Post
```javascript
fetch('http://localhost:3000/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '68dd8ef39daefb5e02046719',
    content: 'Que dia maravilhoso!'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Buscar Posts Positivos
```javascript
fetch('http://localhost:3000/api/posts/sentiment/positive')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Estrutura de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { ... }
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

---

## Análise de Sentimento

A análise de sentimento é feita **automaticamente** ao criar um post. O sistema classifica o post em:

- **positive**: Posts com palavras positivas (feliz, alegre, ótimo, etc.)
- **negative**: Posts com palavras negativas (triste, ruim, terrível, etc.)
- **neutral**: Posts neutros ou sem palavras identificadas

**Exemplo de resposta com análise de sentimento:**
```json
{
  "_id": "68dd8f099daefb5e0204671a",
  "userId": "68dd8ef39daefb5e02046719",
  "content": "Estou muito feliz hoje!",
  "sentiment": {
    "sentiment": "positive",
    "confidence": 1.0,
    "scores": {
      "positive": 1,
      "negative": 0,
      "neutral": 0
    },
    "analyzedAt": "2025-10-01T20:28:57.976Z"
  }
}
```
