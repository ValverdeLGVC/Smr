"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceService = void 0;
// Cliente de persistência usado pelas operações de manutenção.
const prisma_1 = require("../config/prisma");
// Regra de cálculo do novo vencimento.
const dateUtils_1 = require("../utils/dateUtils");
// Implementa o ciclo de vida de uma manutenção.
class MaintenanceService {
    // 1. INICIAR MANUTENÇÃO
    async startMaintenance(computerId, userId, initialObservations) {
        // Altera o status do PC para EM_MANUTENCAO (para travar contadores)
        // Marca o computador como em manutenção antes de criar o histórico.
        await prisma_1.prisma.computer.update({
            where: { id: computerId },
            data: { status: 'EM_MANUTENCAO' }
        });
        // Cria o registro da manutenção
        // Cria o registro com status em andamento e horário atual.
        return prisma_1.prisma.maintenance.create({
            data: {
                computer_id: computerId,
                user_id: userId,
                status: 'EM_ANDAMENTO',
                started_at: new Date(),
                initial_observations: initialObservations
            }
        });
    }
    // 2. CONCLUIR MANUTENÇÃO (REGRA CENTRAL DE TEMPO)
    async completeMaintenance(maintenanceId, proceduresDone, issuesFound) {
        // Carrega a manutenção e o computador para aplicar a regra de prazo.
        const maintenance = await prisma_1.prisma.maintenance.findUnique({
            where: { id: maintenanceId },
            include: { Computer: true }
        });
        if (!maintenance)
            throw new Error('Manutenção não encontrada');
        const now = new Date();
        // Atualiza a manutenção para concluída
        // Fecha o registro e salva procedimentos e problemas encontrados.
        await prisma_1.prisma.maintenance.update({
            where: { id: maintenanceId },
            data: {
                status: 'CONCLUIDA',
                completed_at: now,
                procedures_done: proceduresDone,
                issues_found: issuesFound
            }
        });
        // Busca configuração do sistema para ver intervalo
        // Lê o intervalo padrão caso o computador não tenha um personalizado.
        const systemConfig = await prisma_1.prisma.systemSetting.findFirst();
        // Intervalo do PC ou o Global
        const intervalMonths = maintenance.Computer.custom_interval_months
            || systemConfig?.default_interval_months
            || 6;
        // REGRA DE OURO: Calcula a nova data baseada na data de conclusão atual (now),
        // somando os meses parametrizados. Não reseta tempos antigos.
        const newNextMaintenance = (0, dateUtils_1.calculateNextMaintenance)(now, intervalMonths);
        // Atualiza o PC
        // Atualiza datas e devolve o computador ao status em dia.
        await prisma_1.prisma.computer.update({
            where: { id: maintenance.Computer.id },
            data: {
                last_maintenance_date: now,
                next_maintenance_date: newNextMaintenance,
                status: 'EM_DIA' // Volta a ficar em dia
            }
        });
        return { message: 'Manutenção concluída com sucesso!' };
    }
}
exports.MaintenanceService = MaintenanceService;
