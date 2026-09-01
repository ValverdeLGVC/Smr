// Resolve o caminho absoluto dos arquivos públicos.
import path from 'path';
// Importa o Express e os tipos usados nos handlers HTTP.
import express, { Request, Response, NextFunction } from 'express';
// Permite requisições entre origens.
import cors from 'cors';
// Adiciona cabeçalhos de segurança HTTP.
import helmet from 'helmet';
// Importa as rotas de negócio da API.
import apiRoutes from './routes/api';

// Cria a aplicação Express que será configurada abaixo.
const app = express();

// Registra Helmet com a política de conteúdo aceita pelo frontend.
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "blob:"],
            },
        },
    })
);

// Habilita chamadas CORS.
app.use(cors());
// Interpreta corpos JSON em req.body.
app.use(express.json());
// Interpreta formulários URL-encoded em req.body.
app.use(express.urlencoded({ extended: true }));
// Serve HTML, CSS, JavaScript e imagens de public/.
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint usado para verificar a saúde da API.
app.get('/api/health', (req: Request, res: Response) => {
    // Devolve um status fixo e o horário atual.
    res.json({ status: 'OK', timestamp: new Date() });
});

// Coloca as rotas de negócio sob o prefixo /api.
app.use('/api', apiRoutes);

// Trata erros que escaparam dos controllers.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Registra detalhes no servidor para diagnóstico.
    console.error('Erro Capturado no Backend:', err);
    // Devolve uma mensagem genérica ao cliente.
    res.status(500).json({ error: 'Erro Interno do Servidor' });
});

// Exporta a aplicação para o ponto de entrada e para testes.
export default app;