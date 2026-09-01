"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNextMaintenance = calculateNextMaintenance;
exports.calculateMaintenanceStatus = calculateMaintenanceStatus;
exports.getTimeRemainingText = getTimeRemainingText;
exports.formatDateBr = formatDateBr;
// Importa operações de cálculo de datas e durações.
const date_fns_1 = require("date-fns");
// Importa formatação respeitando um fuso horário específico.
const date_fns_tz_1 = require("date-fns-tz");
// Define o fuso horário usado nas telas brasileiras.
const TIMEZONE = 'America/Sao_Paulo';
/**
 * Calcula a data da próxima manutenção.
 * Sempre baseada na última manutenção + intervalo configurado.
 * Isso garante que alterar a configuração não reseta o tempo já decorrido.
 */
function calculateNextMaintenance(lastMaintenance, intervalMonths) {
    // Soma meses calendáricos sem converter o intervalo em dias fixos.
    // addMonths do date-fns lida perfeitamente com anos bissextos e meses com 28/30/31 dias
    return (0, date_fns_1.addMonths)(lastMaintenance, intervalMonths);
}
/**
 * Define o status exato do computador baseado na data limite.
 */
function calculateMaintenanceStatus(nextMaintenance, nearDueDays) {
    // Captura o instante atual para comparar com o vencimento.
    const now = new Date();
    // Se a data atual passou da data da próxima manutenção
    if ((0, date_fns_1.isPast)(nextMaintenance)) {
        return 'ATRASADO';
    }
    // Verifica quantos dias faltam para a manutenção
    const daysRemaining = (0, date_fns_1.differenceInDays)(nextMaintenance, now);
    if (daysRemaining <= nearDueDays) {
        return 'PROXIMO_VENCIMENTO';
    }
    return 'EM_DIA';
}
/**
 * Retorna uma string detalhada do tempo restante ou tempo de atraso (Dashboard/QR Code).
 * Ex: "5 meses, 2 dias, 3 horas" ou "ATRASADO HÁ 12 dias..."
 */
function getTimeRemainingText(targetDate) {
    // Determina a direção da contagem e o instante de referência.
    const now = new Date();
    const isDelayed = (0, date_fns_1.isPast)(targetDate);
    // intervalToDuration calcula de forma precisa meses, dias, horas, minutos...
    const duration = (0, date_fns_1.intervalToDuration)({
        start: isDelayed ? targetDate : now,
        end: isDelayed ? now : targetDate
    });
    // Acumula somente unidades que possuem valor.
    const parts = [];
    if (duration.years)
        parts.push(`${duration.years} ano(s)`);
    if (duration.months)
        parts.push(`${duration.months} mês(es)`);
    if (duration.days)
        parts.push(`${duration.days} dia(s)`);
    if (duration.hours)
        parts.push(`${duration.hours} hora(s)`);
    if (duration.minutes)
        parts.push(`${duration.minutes} minuto(s)`);
    // Para precisão fina requerida na tela do QR Code
    if (parts.length === 0 || (!duration.years && !duration.months)) {
        if (duration.seconds)
            parts.push(`${duration.seconds} segundo(s)`);
    }
    const timeString = parts.join(', ');
    if (isDelayed) {
        return `ATRASADO HÁ: ${timeString}`;
    }
    return timeString || 'Vence agora';
}
/**
 * Formata a data de forma amigável para o padrão brasileiro (DD/MM/YYYY HH:mm)
 * garantindo o fuso horário correto.
 */
function formatDateBr(date) {
    // Representa ausência de data de forma explícita.
    if (!date)
        return 'N/A';
    return (0, date_fns_tz_1.formatInTimeZone)(date, TIMEZONE, 'dd/MM/yyyy HH:mm');
}
