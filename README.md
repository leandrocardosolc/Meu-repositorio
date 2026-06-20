# Aboa — Aplicativo de Recomendação de Restaurantes

O Aboa é um aplicativo desenvolvido com foco em facilitar a vida de pessoas que querem encontrar restaurantes próximos, descobrir novos lugares e visualizar cardápios completos antes mesmo de chegar ao estabelecimento. O sistema permite que usuários encontrem opções variadas e que restaurantes ganhem mais visibilidade, podendo cadastrar seus dados, fotos e itens de cardápio de forma simples.

O Aboa é composto por:

- **Front-end Web:** React + Vite (pasta `aboa-react`)
- **Back-end:** Node.js + Express + MongoDB (pasta `backend`)
- **App Mobile:** Android Studio (desenvolvido na disciplina de Desenvolvimento de Dispositivos Móveis I)

Este documento explica como instalar, configurar e rodar o sistema em qualquer computador.

---

## 🔗 Acesse o projeto online

O front-end Web está publicado e disponível em produção na Vercel:

**https://aboa-kboajg7q3-jhow-s-projects3.vercel.app/**

> 📸 **Espaço para print:** adicione aqui uma captura de tela do app em execução no link de produção (Vercel).
>
> `![App em produção - Vercel](./docs/prints/vercel-producao.png)`

---

## Sobre este README

Este arquivo reúne toda a documentação técnica necessária para colocar o projeto em funcionamento: requisitos, tecnologias, instruções de instalação do back-end e do front-end, estrutura de pastas, testes automatizados, solução de erros comuns e o passo a passo para rodar o sistema completo.

A ideia é que qualquer pessoa — colega, professor avaliador ou novo integrante do grupo — consiga clonar o repositório e colocar o Aboa rodando localmente apenas seguindo os passos descritos aqui.

> 📸 **Espaço para print:** adicione aqui uma captura de tela deste README.md sendo exibido no GitHub.
>
> `![README no GitHub](./docs/prints/readme-github.png)`

---

## 1. Requisitos Obrigatórios

Antes de rodar o projeto, é necessário instalar na máquina:

### ✔ Node.js (versão 18+)
Download: https://nodejs.org/

### ✔ NPM (vem junto com o Node)

### ✔ MongoDB Community Server
Download: https://www.mongodb.com/try/download/community

Após instalar, verificar se está funcionando:

```
mongod
```

Se o servidor iniciar, o Mongo está OK.

---

## 2. Estrutura do Projeto

```
/backend        → Servidor Node.js + Express + MongoDB
/aboa-react     → Front-end Web React + Vite
/aboa-android   → App Mobile Android Studio (disciplina de Dispositivos Móveis I)
```

---

## 3. Instalação das Tecnologias do Backend

Todas as tecnologias abaixo já estão declaradas no `package.json`. Não é preciso instalar nada manualmente além de rodar:

```
npm install
```

na pasta `backend`.

Mas segue a lista para documentação:

### ✔ Node.js
Já instalado pelo requisito inicial.

### ✔ Express
Framework do servidor.
Instalação (já embutida):
```
npm install express
```

### ✔ MongoDB + Mongoose
Banco de dados + ORM.
```
npm install mongoose
```

### ✔ Multer (upload de imagens)
Responsável por salvar fotos enviadas pelo usuário.
```
npm install multer
```

### ✔ JWT (Json Web Token) – Autenticação
```
npm install jsonwebtoken
```

### ✔ Bcrypt – Criptografia de senhas
```
npm install bcrypt
```

### ✔ CORS – Permitir comunicação com o frontend
```
npm install cors
```

### ✔ Dotenv – Leitura de variáveis do .env
```
npm install dotenv
```

---

## 4. Como Rodar o Back-end

Acesse a pasta:

```
cd backend
```

Instale as dependências:

```
npm install
```

### 4.1 Criar o arquivo `.env`

Dentro da pasta **backend**, crie um arquivo chamado `.env` e coloque dentro:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/aboa
JWT_SECRET=uma_chave_qualquer
JWT_EXPIRES_IN=1d
```

Essas variáveis **são obrigatórias**. Sem esse arquivo o back-end não conecta ao MongoDB.

### 4.2 Rodar o servidor

```
npm run dev
```

Se tudo estiver correto, aparecerão mensagens como:

```
Servidor rodando na porta 5000
MongoDB conectado com sucesso!
```

---

## 5. Como Rodar o Front-end (Web)

Acesse a pasta:

```
cd aboa-react
```

Instale as dependências:

```
npm install
```

Inicie o React:

```
npm run dev
```

O Vite abrirá o projeto em:

```
http://localhost:5173
```

> 📸 **Espaço para print:** adicione aqui uma captura de tela da tela inicial do front-end Web em execução.
>
> `![Tela inicial Web](./docs/prints/web-home.png)`

---

## 6. App Mobile (Android Studio)

Além da versão Web, o Aboa possui uma versão complementar desenvolvida em **Android Studio**, criada como parte da disciplina de **Desenvolvimento de Dispositivos Móveis I**. O app mobile consome a mesma API RESTful do back-end Node.js/Express, reaproveitando as rotas de autenticação (JWT), busca de estabelecimentos e cardápios.

### Como abrir o projeto

1. Abra o **Android Studio**;
2. Selecione **Open** e aponte para a pasta `aboa-android`;
3. Aguarde a sincronização do Gradle;
4. Configure a URL base da API (apontando para o back-end em execução) no arquivo de configuração do app;
5. Execute em um emulador ou dispositivo físico através do botão **Run**.

> 📸 **Espaço para print:** adicione aqui a captura de tela do aplicativo Android em execução (ex.: tela inicial, login ou busca de estabelecimentos).
>
> `![App Android](./docs/prints/android-app.png)`

---

## 7. Testes Automatizados (Jest + Supertest)

O back-end possui testes automatizados implementados com **Jest** (testes unitários e de integração) e **Supertest** (simulação de requisições HTTP às rotas da API), cobrindo autenticação, cadastro de estabelecimentos e os principais endpoints da API REST.

### Como executar os testes

Acesse a pasta do back-end e rode:

```
cd backend
npm test
```

Os testes estão localizados na pasta `backend/__tests__` e incluem, entre outros:

- `auth.test.js` — autenticação e geração de token JWT;
- `health.test.js` — verificação de disponibilidade da API;
- `restaurant.test.js` — operações de CRUD de estabelecimentos.

> 📸 **Espaço para print:** adicione aqui a captura de tela do terminal mostrando a execução e o resultado dos testes com Jest e Supertest.
>
> `![Testes Jest e Supertest](./docs/prints/jest-supertest.png)`

---

## 8. Tecnologias Utilizadas

### Back-end
- Node.js
- Express
- MongoDB + Mongoose
- Multer (upload de imagens)
- JWT (autenticação)
- Bcrypt
- CORS
- Dotenv
- Jest + Supertest (testes automatizados)

### Front-end Web
- React
- Vite
- React Router DOM
- CSS Modules
- Fetch API (para chamadas ao backend)
- Deploy em produção: **Vercel** ([acessar](https://aboa-kboajg7q3-jhow-s-projects3.vercel.app/))

### App Mobile
- Android Studio
- Consumo da API RESTful do backend (JWT)

---

## 9. Estrutura de pastas

```
📦
└─ ABOA - lllSEM
   ├─ aboa-react
   │  ├─ index.html
   │  ├─ package.json
   │  ├─ public
   │  ├─ src
   │  │  ├─ App.jsx
   │  │  ├─ assets
   │  │  ├─ components
   │  │  ├─ main.jsx
   │  │  ├─ pages
   │  │  └─ styles
   │  └─ vite.config.js
   └─ backend
      ├─ config
      ├─ middleware
      ├─ models
      ├─ routes
      ├─ __tests__
      ├─ server.js
      ├─ uploads
      └─ package.json
```

---

## 10. Erros Comuns e Como Resolver

### ❌ Erro:
```
MongooseError: The uri parameter to openUri() must be a string, got "undefined"
```

### ✔ Solução:
O arquivo `.env` está faltando ou escrito incorretamente. Confirme se existe `backend/.env` e se contém:
```
MONGO_URI=mongodb://127.0.0.1:27017/aboa
```

### ❌ Erro: MongoDB não inicia

Solução:
- O MongoDB não está instalado;
- O serviço não está ativo;
- Porta 27017 ocupada.

Verifique com:
```
mongod
```

### ❌ Front-end não encontra o back-end

O back-end deve estar rodando na porta **5000** e o front-end deve fazer requisições para `http://localhost:5000`.

---

## 11. Como Rodar o Projeto Completo

**Passo 1 — Iniciar o MongoDB**
```
mongod
```

**Passo 2 — Iniciar o backend**
```
cd backend
npm run dev
```

**Passo 3 — Iniciar o frontend Web**
```
cd aboa-react
npm run dev
```

Acesse no navegador:
```
http://localhost:5173
```

**Passo 4 — (Opcional) Abrir o app mobile**

Abra a pasta `aboa-android` no Android Studio e execute em um emulador ou dispositivo físico, conforme descrito na seção 6.

---

## 12. Conclusão

Seguindo essas instruções:

1. Instalar Node;
2. Instalar MongoDB;
3. Criar o `.env` dentro de `/backend`;
4. Rodar `npm install` nas pastas `backend` e `aboa-react`;
5. Iniciar backend e frontend Web;
6. (Opcional) Abrir o app mobile no Android Studio.

O projeto funcionará perfeitamente.

---

# Projeto Integrador IV — ABOA
