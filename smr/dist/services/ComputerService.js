"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputerService = void 0;
// Cliente Prisma usado nas consultas e gravações.
const prisma_1 = require("../config/prisma");
// Biblioteca que transforma uma URL em imagem QR.
const qrcode_1 = __importDefault(require("qrcode"));
// Regra compartilhada para calcular o próximo prazo.
const dateUtils_1 = require("../utils/dateUtils");
// Centraliza as regras de computadores e QR Codes.
class ComputerService {
    // Retorna a configuração global usada quando o computador não possui intervalo próprio.
    async getMaintenanceSettings() {
        return prisma_1.prisma.systemSetting.findFirst();
    }
    // Atualiza o intervalo padrão e a quantidade de dias considerada próxima do vencimento.
    async updateMaintenanceSettings(data) {
        const defaultIntervalMonths = Number(data?.default_interval_months);
        const nearDueDays = Number(data?.near_due_days);
        if (!Number.isInteger(defaultIntervalMonths) || defaultIntervalMonths < 1) {
            throw new Error('O intervalo padrão deve ser um número inteiro maior que zero');
        }
        if (!Number.isInteger(nearDueDays) || nearDueDays < 0) {
            throw new Error('Os dias para aviso devem ser um número inteiro igual ou maior que zero');
        }
        const current = await prisma_1.prisma.systemSetting.findFirst();
        return current
            ? prisma_1.prisma.systemSetting.update({
                where: { id: current.id },
                data: { default_interval_months: defaultIntervalMonths, near_due_days: nearDueDays },
            })
            : prisma_1.prisma.systemSetting.create({
                data: { default_interval_months: defaultIntervalMonths, near_due_days: nearDueDays },
            });
    }
    // Criar novo computador
    async createComputer(data) {
        // Busca a configuração global para saber o intervalo padrão
        // Busca o intervalo padrão configurado no sistema.
        const systemConfig = await prisma_1.prisma.systemSetting.findFirst();
        // Converte o campo HTML para inteiro ou null antes de enviá-lo ao Prisma.
        const customInterval = data.custom_interval_months === '' || data.custom_interval_months === null || data.custom_interval_months === undefined
            ? null
            : Number(data.custom_interval_months);
        if (customInterval !== null && (!Number.isInteger(customInterval) || customInterval < 1)) {
            throw new Error('O intervalo individual deve ser um número inteiro maior que zero');
        }
        // Usa o intervalo individual quando informado; caso contrário, usa o global.
        const intervalMonths = customInterval || systemConfig?.default_interval_months || 6;
        // Define a data atual como última manutenção por padrão (computador novo)
        const now = new Date();
        const nextMaintenance = (0, dateUtils_1.calculateNextMaintenance)(now, intervalMonths);
        return prisma_1.prisma.computer.create({
            data: {
                ...data,
                custom_interval_months: customInterval,
                last_maintenance_date: now,
                next_maintenance_date: nextMaintenance,
                status: 'EM_DIA'
            }
        });
    }
    // Buscar todos
    async getAll() {
        // Busca o limite de aviso usado para calcular o status atual.
        const settings = await prisma_1.prisma.systemSetting.findFirst();
        const nearDueDays = settings?.near_due_days ?? 30;
        // Lista computadores e inclui a empresa relacionada.
        const computers = await prisma_1.prisma.computer.findMany({
            include: { Company: true }
        });
        // Recalcula o prazo sem depender do status antigo salvo no banco.
        return computers.map(computer => ({
            ...computer,
            status: this.getCurrentStatus(computer, nearDueDays),
        }));
    }
    // Mantém estados manuais e calcula estados preventivos a partir da data.
    getCurrentStatus(computer, nearDueDays) {
        if (computer.status === 'EM_MANUTENCAO' || computer.status === 'COM_PROBLEMA') {
            return computer.status;
        }
        if (!computer.next_maintenance_date)
            return computer.status;
        return (0, dateUtils_1.calculateMaintenanceStatus)(computer.next_maintenance_date, nearDueDays);
    }
    // Atualiza os dados gerenciáveis de um computador e seu prazo individual.
    async updateComputer(id, data) {
        const computer = await prisma_1.prisma.computer.findUnique({ where: { id } });
        if (!computer)
            throw new Error('Computador não encontrado');
        const updateData = {
            name: data.name,
            company_id: data.company_id,
            department: data.department || null,
            assigned_user: data.assigned_user || null,
            status: data.status || computer.status,
        };
        if (!updateData.name || !updateData.company_id) {
            throw new Error('Nome e empresa do computador são obrigatórios');
        }
        if (data.custom_interval_months !== '' && data.custom_interval_months !== null && data.custom_interval_months !== undefined) {
            const intervalMonths = Number(data.custom_interval_months);
            if (!Number.isInteger(intervalMonths) || intervalMonths < 1) {
                throw new Error('O intervalo individual deve ser um número inteiro maior que zero');
            }
            updateData.custom_interval_months = intervalMonths;
            const baseDate = computer.last_maintenance_date || new Date();
            updateData.next_maintenance_date = (0, dateUtils_1.calculateNextMaintenance)(baseDate, intervalMonths);
        }
        else if (data.custom_interval_months === '' || data.custom_interval_months === null) {
            updateData.custom_interval_months = null;
            const settings = await prisma_1.prisma.systemSetting.findFirst();
            const intervalMonths = settings?.default_interval_months || 6;
            const baseDate = computer.last_maintenance_date || new Date();
            updateData.next_maintenance_date = (0, dateUtils_1.calculateNextMaintenance)(baseDate, intervalMonths);
        }
        return prisma_1.prisma.computer.update({
            where: { id },
            data: updateData,
            include: { Company: true },
        });
    }
    // Exclui o computador e seu histórico relacionado após confirmação no frontend.
    async deleteComputer(id) {
        const computer = await prisma_1.prisma.computer.findUnique({
            where: { id },
            select: { id: true, name: true, unique_code: true },
        });
        if (!computer)
            throw new Error('Computador não encontrado');
        await prisma_1.prisma.computer.delete({ where: { id } });
        return { message: 'Computador excluído com sucesso!' };
    }
    // Buscar detalhes de um computador (usado pelo scanner mobile)
    async getByUniqueCode(uniqueCode) {
        // Busca pelo código único e traz empresa e histórico.
        const pc = await prisma_1.prisma.computer.findUnique({
            where: { unique_code: uniqueCode },
            include: { Company: true, Maintenances: { orderBy: { created_at: 'desc' } } }
        });
        if (!pc)
            throw new Error('Computador não encontrado');
        // Usa a mesma regra da tabela para a consulta pública do QR Code.
        const settings = await prisma_1.prisma.systemSetting.findFirst();
        return {
            ...pc,
            status: this.getCurrentStatus(pc, settings?.near_due_days ?? 30),
        };
    }
    // Gerar o QR Code para colar na máquina
    async generateQRCode(uniqueCode, baseUrl) {
        // A URL que será embutida no QR Code (o link que abrirá no celular)
        // Monta a URL pública que será codificada no QR.
        const scanUrl = `${baseUrl}/qr-scanner.html?code=${uniqueCode}`;
        try {
            // Retorna uma string Base64 da imagem
            const qrCodeDataUri = await qrcode_1.default.toDataURL(scanUrl, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                margin: 2,
                width: 300
            });
            return { url: scanUrl, image: qrCodeDataUri };
        }
        catch (err) {
            throw new Error('Falha ao gerar QR Code');
        }
    }
}
exports.ComputerService = ComputerService;
