// Tipos HTTP usados pelo controller.
import { Request, Response } from 'express';
// Cliente compartilhado para consultar usuários.
import { prisma } from '../config/prisma';
// Funções responsáveis por senha e token.
import { comparePassword, generateToken } from '../utils/security';

// Controller responsável pelo login.
export class AuthController {
    async login(req: Request, res: Response) {
        try {
            // Extrai as credenciais enviadas pelo frontend.
            const { email, password } = req.body;

            // Busca o usuário pelo email único.
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Compara a senha informada com o hash salvo.
            const isPasswordValid = await comparePassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Cria um JWT com a identidade e o papel do usuário.
            const token = generateToken({ id: user.id, role: user.role });

            res.json({
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}