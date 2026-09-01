"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
// Serviço que concentra as regras de empresas.
const CompanyService_1 = require("../services/CompanyService");
// Reutiliza uma instância do serviço para atender as rotas.
const companyService = new CompanyService_1.CompanyService();
// Converte requisições HTTP de empresas em respostas JSON.
class CompanyController {
    // Cria uma empresa e responde com HTTP 201.
    async create(req, res) {
        try {
            const company = await companyService.createCompany(req.body);
            res.status(201).json(company);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Lista empresas e responde com HTTP 200.
    async getAll(req, res) {
        try {
            const companies = await companyService.getAll();
            res.json(companies);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Atualiza uma empresa usando o identificador informado na URL.
    async update(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const company = await companyService.updateCompany(id, req.body);
            res.json(company);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Exclui uma empresa sem computadores relacionados.
    async delete(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const result = await companyService.deleteCompany(id);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.CompanyController = CompanyController;
