// Tipos HTTP usados pelos métodos do controller.
import { Request, Response } from 'express';
// Serviço que implementa as regras de computadores.
import { ComputerService } from '../services/ComputerService';

// Instância compartilhada do serviço.
const computerService = new ComputerService();

// Converte chamadas HTTP em operações de computadores.
export class ComputerController {

    // Retorna as configurações globais de manutenção.
    async getSettings(req: Request, res: Response) {
        try {
            res.json(await computerService.getMaintenanceSettings());
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Salva as configurações globais de manutenção.
    async updateSettings(req: Request, res: Response) {
        try {
            res.json(await computerService.updateMaintenanceSettings(req.body));
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Cria um computador com os dados recebidos no corpo.
    async create(req: Request, res: Response) {
        try {
            const pc = await computerService.createComputer(req.body);
            res.status(201).json(pc);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Lista computadores para o dashboard.
    async getAll(req: Request, res: Response) {
        try {
            const pcs = await computerService.getAll();
            res.json(pcs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Atualiza um computador selecionado na tabela.
    async update(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            res.json(await computerService.updateComputer(id, req.body));
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Exclui um computador e o histórico em cascata definido no Prisma.
    async delete(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            res.json(await computerService.deleteComputer(id));
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Consulta um computador pelo código público.
    async getByCode(req: Request, res: Response) {
        try {
            const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
            const pc = await computerService.getByUniqueCode(code);
            res.json(pc);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    // Gera o QR Code de um computador.
    async getQRCode(req: Request, res: Response) {
        try {
            const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
            // Pega a URL do servidor (ex: http://localhost:3000)
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const qrData = await computerService.generateQRCode(code, baseUrl);
            res.json(qrData);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}