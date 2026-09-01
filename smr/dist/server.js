"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importa a aplicação HTTP configurada.
const app_1 = __importDefault(require("./app"));
// Importa o cliente Prisma compartilhado.
const prisma_1 = require("./config/prisma");
// Lê a porta do ambiente e usa 3000 quando ela não foi definida.
const PORT = process.env.PORT || 3000;
// Conecta ao banco e inicia o servidor.
async function bootstrap() {
    try {
        // Testa a conexão com o banco antes de subir o servidor
        // Confirma a conexão antes de aceitar requisições.
        await prisma_1.prisma.$connect();
        console.log('📦 Conexão com o Banco de Dados (MySQL) estabelecida via Prisma.');
        // Inicia o servidor Express
        // Começa a escutar requisições HTTP.
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🌐 Frontend servido em: http://localhost:${PORT}`);
        });
    }
    catch (error) {
        // Registra a falha e encerra para o ambiente detectar o problema.
        console.error('❌ Falha ao iniciar o servidor:', error);
        process.exit(1);
    }
}
// Executa a inicialização quando o módulo é carregado.
bootstrap();
