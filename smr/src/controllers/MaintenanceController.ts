// Tipos HTTP usados no controller.
import { Request, Response } from 'express';
// Serviço que contém o ciclo de manutenção.
import { MaintenanceService } from '../services/MaintenanceService';

// Instância compartilhada do serviço.
const maintenanceService = new MaintenanceService();

// Traduz operações de manutenção em respostas HTTP.
export class MaintenanceController {

    // Inicia uma manutenção e retorna o registro criado.
    async start(req: Request, res: Response) {
        try {
            const { computerId, initialObservations } = req.body;
            const userId = req.user?.id!; // Pegamos do middleware de Auth

            const maintenance = await maintenanceService.startMaintenance(computerId, userId, initialObservations);
            res.status(201).json(maintenance);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Conclui a manutenção e recalcula o próximo vencimento.
    async complete(req: Request, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { proceduresDone, issuesFound } = req.body;

            const result = await maintenanceService.completeMaintenance(id, proceduresDone, issuesFound);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}