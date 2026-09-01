"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceController = void 0;
// Serviço que contém o ciclo de manutenção.
const MaintenanceService_1 = require("../services/MaintenanceService");
// Instância compartilhada do serviço.
const maintenanceService = new MaintenanceService_1.MaintenanceService();
// Traduz operações de manutenção em respostas HTTP.
class MaintenanceController {
    // Inicia uma manutenção e retorna o registro criado.
    async start(req, res) {
        try {
            const { computerId, initialObservations } = req.body;
            const userId = req.user?.id; // Pegamos do middleware de Auth
            const maintenance = await maintenanceService.startMaintenance(computerId, userId, initialObservations);
            res.status(201).json(maintenance);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Conclui a manutenção e recalcula o próximo vencimento.
    async complete(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const { proceduresDone, issuesFound } = req.body;
            const result = await maintenanceService.completeMaintenance(id, proceduresDone, issuesFound);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.MaintenanceController = MaintenanceController;
