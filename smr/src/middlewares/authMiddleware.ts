// Tipos necessários para um middleware Express.
import { Request, Response, NextFunction } from 'express';
// Validador do JWT e tipo anexado à requisição.
import { verifyToken, TokenPayload } from '../utils/security';

// Estendemos a tipagem do Request do Express para aceitar nosso user
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Obtém o cabeçalho Authorization enviado pelo frontend.
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Token não fornecido' });
        return; // Retornamos para parar a execução
    }

    const [, token] = authHeader.split(' '); // Separa "Bearer" do "Token..."

    try {
        // Verifica assinatura e validade temporal do token.
        const decoded = verifyToken(token);
        req.user = decoded; // Injeta os dados do usuário logado na requisição
        next(); // Passa para o próximo controlador
    } catch (err) {
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}