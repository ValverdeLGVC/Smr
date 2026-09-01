"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
// Validador do JWT e tipo anexado à requisição.
const security_1 = require("../utils/security");
function authMiddleware(req, res, next) {
    // Obtém o cabeçalho Authorization enviado pelo frontend.
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'Token não fornecido' });
        return; // Retornamos para parar a execução
    }
    const [, token] = authHeader.split(' '); // Separa "Bearer" do "Token..."
    try {
        // Verifica assinatura e validade temporal do token.
        const decoded = (0, security_1.verifyToken)(token);
        req.user = decoded; // Injeta os dados do usuário logado na requisição
        next(); // Passa para o próximo controlador
    }
    catch (err) {
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}
