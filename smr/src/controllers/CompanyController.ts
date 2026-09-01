// Tipos de requisição e resposta usados nos handlers.
import { Request, Response } from 'express';
// Serviço que concentra as regras de empresas.
import { CompanyService } from '../services/CompanyService';

// Reutiliza uma instância do serviço para atender as rotas.
const companyService = new CompanyService();

// Converte requisições HTTP de empresas em respostas JSON.
export class CompanyController {
    // Cria uma empresa e responde com HTTP 201.
    async create(req: Request, res: Response) {
        try {
            const company = await companyService.createCompany(req.body);
            res.status(201).json(company);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Lista empresas e responde com HTTP 200.
    async getAll(req: Request, res: Response) {
        try {
            const companies = await companyService.getAll();
            res.json(companies);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Atualiza uma empresa usando o identificador informado na URL.
    async update(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const company = await companyService.updateCompany(id, req.body);
            res.json(company);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Exclui uma empresa sem computadores relacionados.
    async delete(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const result = await companyService.deleteCompany(id);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
