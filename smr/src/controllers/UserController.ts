// Tipos de requisição e resposta usados nos handlers.
import { Request, Response } from 'express';
// Serviço que concentra as regras de usuários.
import { UserService } from '../services/UserService';

// Reutiliza uma instância do serviço de usuários.
const userService = new UserService();

// Converte operações de usuários em respostas HTTP JSON.
export class UserController {
    // Lista somente usuários administradores.
    async getAll(req: Request, res: Response) {
        try {
            const users = await userService.getAll();
            res.json(users);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Cadastra um novo administrador.
    async create(req: Request, res: Response) {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Atualiza dados e, opcionalmente, a senha do administrador.
    async update(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const user = await userService.updateUser(id, req.body);
            res.json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Remove um administrador respeitando suas relações históricas.
    async delete(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const requesterId = req.user?.id || '';
            const result = await userService.deleteUser(id, requesterId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
