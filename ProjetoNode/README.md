# StudioBeleza - Adaptado

Sistema Node.js com Handlebars e MySQL (Sequelize).

## Configuração

1. Crie o banco MySQL com nome `studiobeleza` (conforme combinado).
2. Copie as variáveis de ambiente (opcional) ou edite `db/conn.js`:
   - DB_NAME (default: studiobeleza)
   - DB_USER (default: root)
   - DB_PASS (default: empty)
   - DB_HOST (default: localhost)

3. Instale dependências:
```
npm install
```

4. Execute a aplicação:
```
npm start
```

5. Acesse em http://localhost:3000

## Usuários e Posts

- Registro: /register
- Login: /login
- Lista de posts: /posts
- Criar post (precisa estar logado): /posts/create

## Notas
- Senhas armazenadas com hashing (bcryptjs).
- Use o MySQL Workbench para criar o banco e gerenciar.
