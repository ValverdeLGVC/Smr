PREVSYSTEM - SISTEMA DE GESTAO DE MANUTENCAO PREVENTIVA
==========================================================

1. SOBRE O SISTEMA
------------------
O PrevSystem e uma aplicacao web para cadastrar empresas e computadores,
acompanhar a validade da manutencao preventiva e disponibilizar o status do
computador por uma pagina publica acessada pelo QR Code.

O projeto e dividido em:
- Backend: Node.js, Express e TypeScript.
- Banco de dados: MySQL 8.
- ORM: Prisma 5.
- Frontend: HTML, CSS e JavaScript no diretorio public/, com layout responsivo.
- Execucao: Docker e Docker Compose.

2. TECNOLOGIAS UTILIZADAS
-------------------------
- Node.js 20: runtime do JavaScript no servidor.
- TypeScript 5: tipagem e compilacao do backend.
- Express 4: servidor HTTP, rotas e middlewares.
- Prisma 5 e @prisma/client: acesso tipado ao MySQL e geracao do client.
- MySQL 8: persistencia dos dados.
- Docker: empacotamento da aplicacao.
- Docker Compose: orquestracao da API e do banco.
- bcrypt: hash e comparacao segura de senhas.
- jsonwebtoken: autenticacao por token JWT.
- helmet: cabecalhos de seguranca HTTP e CSP.
- cors: configuracao de requisicoes entre origens.
- dotenv: leitura de variaveis de ambiente (dependencia instalada).
- date-fns e date-fns-tz: calculos e formatacao de datas.
- qrcode: geracao de QR Codes em Base64.
- Tailwind CSS via CDN: estilos das telas HTML.
- Google Fonts via CDN: fonte usada no frontend.
- ts-node-dev: servidor de desenvolvimento com reinicio automatico.
- SVG inline: icones visuais da navegacao lateral sem dependencia adicional.

3. PRE-REQUISITOS
-----------------
Instale:
- Node.js 20 ou superior, incluindo npm.
- Docker Desktop com Docker Compose.
- Git e opcional nesta copia, pois a pasta atual nao possui metadados .git.

Verifique as ferramentas:
  node --version
  npm --version
  docker --version
  docker compose version

4. INSTALACAO LOCAL SEM DOCKER
------------------------------
Abra o PowerShell na pasta do projeto:
  cd "c:\Sistemas Pessoais\Replait\smr"

Instale as dependencias declaradas no package.json:
  npm install

Gere o Prisma Client a partir do schema:
  npx prisma generate

Configure o arquivo .env na raiz. Exemplo:
  DATABASE_URL="mysql://root:root123@localhost:3306/prev_maintenance_db"
  JWT_SECRET="troque-por-uma-chave-longa-e-secreta"
  PORT=3000
  TZ="America/Sao_Paulo"

Com um MySQL local em funcionamento, crie/aplique a estrutura do banco.
A opcao recomendada para este projeto e:
  npx prisma db push

Os arquivos Estrutura.SQL e comandos.sql tambem podem ser executados no
MySQL, mas nao se deve executar os dois processos de criacao ao mesmo tempo.
Estrutura.SQL cria tabelas e dados iniciais; comandos.sql apenas insere dados
iniciais e pressupoe que as tabelas ja existem.

Compile o TypeScript:
  npm run build

Inicie em desenvolvimento:
  npm run dev

Ou inicie o JavaScript compilado:
  npm start

O comando npm run dev deve ser usado durante o desenvolvimento, pois observa
alteracoes em src/ e reinicia o servidor. O fluxo de producao e npm run build
seguido de npm start; o build gera os arquivos JavaScript em dist/.

Acesse:
- Login: http://localhost:3000/index.html
- Dashboard: http://localhost:3000/dashboard.html
- Cadastro: http://localhost:3000/computers.html
- Consulta publica: http://localhost:3000/qr-scanner.html?code=PC-ABC-0001
- Health check: http://localhost:3000/api/health

5. INSTALACAO COM DOCKER COMPOSE
--------------------------------
Na pasta raiz, construa e suba os servicos:
  docker compose up --build -d

Sempre use --build depois de alterar src/, public/ ou o Dockerfile. Sem essa
opcao, o Docker pode continuar usando uma imagem antiga e a aplicacao pode
responder com 404 para rotas que ja existem no codigo atual.

Acompanhe os logs:
  docker compose logs -f api
  docker compose logs -f db

Confira os containers:
  docker compose ps

Teste a API:
  curl http://localhost:3000/api/health

Se uma tela mostrar "Unexpected token <", a resposta recebida foi HTML em
vez de JSON. Verifique os logs e reconstrua a imagem:
  docker compose logs --tail=100 api
  docker compose up --build -d

Se o cadastro de computador retornar HTTP 400, confira o intervalo individual.
O campo vazio deve ser enviado como null e um valor preenchido deve ser um
inteiro maior que zero. O frontend e o backend fazem essa conversao para
evitar o erro do Prisma "Expected Int or Null, provided String". O aviso do
Tailwind CDN no console e apenas uma recomendacao de producao e nao causa esse
erro de cadastro.

Pare os containers mantendo os dados:
  docker compose down

Pare os containers e remova tambem o volume MySQL (APAGA OS DADOS):
  docker compose down -v

Entre no container do banco, quando necessario:
  docker compose exec db mysql -uroot -proot123 prev_maintenance_db

O Docker Compose fornece DATABASE_URL apontando para o host interno db.
Por isso, dentro dos containers a URL usa db:3306; fora deles, uma instalacao
local usa localhost:3306.

6. COMO O PROJETO FOI CONSTRUIDO
--------------------------------
1. O package.json declara scripts, dependencias de runtime e ferramentas de
   desenvolvimento.
2. O tsconfig.json define TypeScript estrito, entrada em src/ e saida em dist/.
3. prisma/schema.prisma descreve enums, tabelas, campos e relacionamentos.
4. npx prisma generate gera o cliente usado por src/config/prisma.ts.
5. Express e configurado em src/app.ts com Helmet, CORS, parsing JSON,
   arquivos estaticos e tratamento de erros.
6. src/server.ts testa a conexao Prisma e inicia o servidor na porta 3000.
7. routes/api.ts separa endpoints publicos e endpoints protegidos pelo JWT.
8. Controllers traduzem HTTP em chamadas de services.
9. Services concentram regras de empresas, computadores e manutencoes.
10. public/ implementa login, dashboard, cadastro e consulta por QR Code.
11. O Dockerfile compila em uma imagem builder e executa em uma imagem final.
12. docker-compose.yml inicia a API e o MySQL com volume persistente.

7. ESTRUTURA DE DIRETORIOS
--------------------------
- src/app.ts: configura o Express e seus middlewares.
- src/server.ts: conecta ao banco e inicia o processo HTTP.
- src/config/prisma.ts: cria e reutiliza o PrismaClient.
- src/controllers/: recebe requisicoes e devolve respostas HTTP.
- src/middlewares/authMiddleware.ts: valida o Bearer Token JWT.
- src/routes/api.ts: registra endpoints da API.
- src/services/: regras de negocio e acesso ao Prisma.
- src/utils/security.ts: bcrypt e JWT.
- src/utils/dateUtils.ts: prazos e formatacao de datas.
- prisma/schema.prisma: modelo relacional da aplicacao.
- public/index.html: login.
- public/dashboard.html: resumo de computadores.
- public/computers.html: empresas, computadores e QR Codes.
- public/qr-scanner.html: consulta publica do computador.
- public/js/api.js: cliente HTTP e controle do token no navegador.
- public/css/style.css: estilos compartilhados, sidebar e responsividade mobile.
- Dockerfile: imagem de producao.
- docker-compose.yml: API, MySQL, portas e volume.
- Estrutura.SQL: criacao SQL manual do banco.
- comandos.sql: carga de configuracoes e usuario inicial.
- dist/: saida gerada por npm run build; nao edite manualmente.

Arquivos como package.json, package-lock.json e tsconfig.json usam formatos
estruturados que nao aceitam comentarios sem deixar de ser validos. O .env e
um arquivo de configuracao e ja possui comentarios explicativos. A pasta
dist/ e gerada automaticamente pelo compilador; qualquer comentario nela
seria perdido no proximo npm run build. Por isso a explicacao linha a linha
dessas estruturas esta centralizada neste README, enquanto as fontes que
controlam o comportamento possuem comentarios inline.

8. ENDPOINTS
------------
Publicos:
- POST /api/auth/login: autentica por email e senha.
- GET /api/computers/code/:code: consulta usada pelo QR Code.
- GET /api/health: verifica se a API esta respondendo.

Protegidos por Authorization: Bearer <token>:
- GET /api/companies
- POST /api/companies
- PUT /api/companies/:id
- DELETE /api/companies/:id
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id
- GET /api/computers
- POST /api/computers
- PUT /api/computers/:id
- DELETE /api/computers/:id
- GET /api/computers/:code/qrcode
- GET /api/settings/maintenance
- PUT /api/settings/maintenance
- POST /api/maintenances/start
- POST /api/maintenances/:id/complete

O painel de empresas fica em public/computers.html. A tabela permite editar
nome, CNPJ, contato, telefone, e-mail e endereço. A exclusão pede confirmação
e só acontece quando a empresa não possui computadores vinculados; isso evita
apagar uma empresa que ainda é referenciada pelos ativos.

O mesmo painel possui a tabela de usuários administradores. Novos usuários
são sempre gravados com perfil ADMIN. Na edição, nome e e-mail podem ser
alterados; para trocar a senha é obrigatório informar a senha atual e uma nova
senha com pelo menos seis caracteres. Usuários com histórico de manutenção ou
avaliação técnica não são excluídos, e o usuário logado não pode excluir a si
mesmo.

O gerenciamento de computadores fica na tabela de public/computers.html. O
botão Gerenciar abre o item selecionado e permite alterar nome, empresa, setor,
usuário responsável, status e intervalo preventivo individual em meses. Se o
intervalo individual ficar vazio, o computador usa o intervalo global. A
configuração global também define quantos dias antes do vencimento o sistema
considera o computador próximo do prazo. Os status disponíveis são Em dia,
Próximo do vencimento, Atrasado, Em manutenção e Com problema.

O status preventivo é recalculado sempre que a tabela ou a consulta pública do
QR Code é carregada. Assim, um computador que estiver dentro do limite de dias
configurado muda automaticamente para Próximo do vencimento, mesmo que tenha
sido cadastrado originalmente como Em dia. Os estados Em manutenção e Com
problema são estados manuais e permanecem até serem alterados pelo usuário.

A tabela também possui o botão Excluir. A exclusão exige confirmação e remove
o computador e seus históricos de manutenção e avaliação técnica, pois essas
relações estão configuradas com exclusão em cascata no schema Prisma.

9. CREDENCIAIS E SEGURANCA
--------------------------
Os arquivos de exemplo usam root/root123 no MySQL e admin@admin.com com a
senha admin123. Troque essas credenciais antes de qualquer uso real.
Defina JWT_SECRET por variavel de ambiente e nunca publique um .env real.
O .env deve permanecer fora de controle de versao e os segredos do Compose
devem ser substituidos por secrets ou variaveis protegidas em producao.

10. COMANDOS UTILIZADOS OU NECESSARIOS
---------------------------------------
Instalacao e desenvolvimento:
  npm install
  npx prisma generate
  npx prisma db push
  npm run dev
  npm run build
  npm start

Docker:
  docker compose up --build -d
  docker compose ps
  docker compose logs -f api
  docker compose logs -f db
  docker compose exec db mysql -uroot -proot123 prev_maintenance_db
  docker compose down
  docker compose down -v

Diagnostico:
  node --version
  npm --version
  docker --version
  docker compose version
  curl http://localhost:3000/api/health

11. RESPONSIVIDADE E MENU LATERAL
---------------------------------
As telas administrativas usam uma sidebar com links para Dashboard,
Computadores e QR Scanner. Cada link possui um icone SVG e texto acessivel.
Em desktop, a sidebar fica fixa a esquerda e o conteudo recebe margem lateral.
Em celular, ela fica recolhida fora da tela e aparece pelo botao de hamburguer.
O overlay fecha o menu ao ser tocado, e a tecla Escape tambem deve fecha-lo.
Tabelas recebem rolagem horizontal controlada para preservar a leitura sem
quebrar o viewport mobile. Botoes e cabecalhos quebram linha quando necessario.


