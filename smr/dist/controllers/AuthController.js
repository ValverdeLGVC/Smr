"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
// Cliente compartilhado para consultar usuários.
const prisma_1 = require("../config/prisma");
// Funções responsáveis por senha e token.
const security_1 = require("../utils/security");
// Controller responsável pelo login.
class AuthController {
    async login(req, res) {
        try {
            // Extrai as credenciais enviadas pelo frontend.
            const { email, password } = req.body;
            // Busca o usuário pelo email único.
            const user = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            // Compara a senha informada com o hash salvo.
            const isPasswordValid = await (0, security_1.comparePassword)(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            // Cria um JWT com a identidade e o papel do usuário.
            const token = (0, security_1.generateToken)({ id: user.id, role: user.role });
            res.json({
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
