// Cliente de persistência usado pelas operações de manutenção.
import { prisma } from '../config/prisma';
// Regra de cálculo do novo vencimento.
import { calculateNextMaintenance } from '../utils/dateUtils';

// Implementa o ciclo de vida de uma manutenção.
export class MaintenanceService {

    // 1. INICIAR MANUTENÇÃO
    async startMaintenance(computerId: string, userId: string, initialObservations?: string) {
        // Altera o status do PC para EM_MANUTENCAO (para travar contadores)
        // Marca o computador como em manutenção antes de criar o histórico.
        await prisma.computer.update({
            where: { id: computerId },
            data: { status: 'EM_MANUTENCAO' }
        });

        // Cria o registro da manutenção
        // Cria o registro com status em andamento e horário atual.
        return prisma.maintenance.create({
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
    async completeMaintenance(maintenanceId: string, proceduresDone: string, issuesFound?: string) {
        // Carrega a manutenção e o computador para aplicar a regra de prazo.
        const maintenance = await prisma.maintenance.findUnique({
            where: { id: maintenanceId },
            include: { Computer: true }
        });

        if (!maintenance) throw new Error('Manutenção não encontrada');

        const now = new Date();

        // Atualiza a manutenção para concluída
        // Fecha o registro e salva procedimentos e problemas encontrados.
        await prisma.maintenance.update({
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
        const systemConfig = await prisma.systemSetting.findFirst();

        // Intervalo do PC ou o Global
        const intervalMonths = maintenance.Computer.custom_interval_months
            || systemConfig?.default_interval_months
            || 6;

        // REGRA DE OURO: Calcula a nova data baseada na data de conclusão atual (now),
        // somando os meses parametrizados. Não reseta tempos antigos.
        const newNextMaintenance = calculateNextMaintenance(now, intervalMonths);

        // Atualiza o PC
        // Atualiza datas e devolve o computador ao status em dia.
        await prisma.computer.update({
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