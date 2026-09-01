"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
// Serviço que concentra as regras de usuários.
const UserService_1 = require("../services/UserService");
// Reutiliza uma instância do serviço de usuários.
const userService = new UserService_1.UserService();
// Converte operações de usuários em respostas HTTP JSON.
class UserController {
    // Lista somente usuários administradores.
    async getAll(req, res) {
        try {
            const users = await userService.getAll();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Cadastra um novo administrador.
    async create(req, res) {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Atualiza dados e, opcionalmente, a senha do administrador.
    async update(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const user = await userService.updateUser(id, req.body);
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Remove um administrador respeitando suas relações históricas.
    async delete(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const requesterId = req.user?.id || '';
            const result = await userService.deleteUser(id, requesterId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.UserController = UserController;
