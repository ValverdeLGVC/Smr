"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Resolve o caminho absoluto dos arquivos públicos.
const path_1 = __importDefault(require("path"));
// Importa o Express e os tipos usados nos handlers HTTP.
const express_1 = __importDefault(require("express"));
// Permite requisições entre origens.
const cors_1 = __importDefault(require("cors"));
// Adiciona cabeçalhos de segurança HTTP.
const helmet_1 = __importDefault(require("helmet"));
// Importa as rotas de negócio da API.
const api_1 = __importDefault(require("./routes/api"));
// Cria a aplicação Express que será configurada abaixo.
const app = (0, express_1.default)();
// Registra Helmet com a política de conteúdo aceita pelo frontend.
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
}));
// Habilita chamadas CORS.
app.use((0, cors_1.default)());
// Interpreta corpos JSON em req.body.
app.use(express_1.default.json());
// Interpreta formulários URL-encoded em req.body.
app.use(express_1.default.urlencoded({ extended: true }));
// Serve HTML, CSS, JavaScript e imagens de public/.
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Endpoint usado para verificar a saúde da API.
app.get('/api/health', (req, res) => {
    // Devolve um status fixo e o horário atual.
    res.json({ status: 'OK', timestamp: new Date() });
});
// Coloca as rotas de negócio sob o prefixo /api.
app.use('/api', api_1.default);
// Trata erros que escaparam dos controllers.
app.use((err, req, res, next) => {
    // Registra detalhes no servidor para diagnóstico.
    console.error('Erro Capturado no Backend:', err);
    // Devolve uma mensagem genérica ao cliente.
    res.status(500).json({ error: 'Erro Interno do Servidor' });
});
// Exporta a aplicação para o ponto de entrada e para testes.
exports.default = app;
