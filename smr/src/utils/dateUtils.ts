// Importa operações de cálculo de datas e durações.
import { addMonths, differenceInDays, isPast, intervalToDuration, isAfter } from 'date-fns';
// Importa formatação respeitando um fuso horário específico.
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// Define o fuso horário usado nas telas brasileiras.
const TIMEZONE = 'America/Sao_Paulo';

/**
 * Calcula a data da próxima manutenção.
 * Sempre baseada na última manutenção + intervalo configurado.
 * Isso garante que alterar a configuração não reseta o tempo já decorrido.
 */
export function calculateNextMaintenance(lastMaintenance: Date, intervalMonths: number): Date {
    // Soma meses calendáricos sem converter o intervalo em dias fixos.
    // addMonths do date-fns lida perfeitamente com anos bissextos e meses com 28/30/31 dias
    return addMonths(lastMaintenance, intervalMonths);
}

/**
 * Define o status exato do computador baseado na data limite.
 */
export function calculateMaintenanceStatus(
    nextMaintenance: Date,
    nearDueDays: number
): 'EM_DIA' | 'PROXIMO_VENCIMENTO' | 'ATRASADO' {
    // Captura o instante atual para comparar com o vencimento.
    const now = new Date();

    // Se a data atual passou da data da próxima manutenção
    if (isPast(nextMaintenance)) {
        return 'ATRASADO';
    }

    // Verifica quantos dias faltam para a manutenção
    const daysRemaining = differenceInDays(nextMaintenance, now);

    if (daysRemaining <= nearDueDays) {
        return 'PROXIMO_VENCIMENTO';
    }

    return 'EM_DIA';
}

/**
 * Retorna uma string detalhada do tempo restante ou tempo de atraso (Dashboard/QR Code).
 * Ex: "5 meses, 2 dias, 3 horas" ou "ATRASADO HÁ 12 dias..."
 */
export function getTimeRemainingText(targetDate: Date): string {
    // Determina a direção da contagem e o instante de referência.
    const now = new Date();
    const isDelayed = isPast(targetDate);

    // intervalToDuration calcula de forma precisa meses, dias, horas, minutos...
    const duration = intervalToDuration({
        start: isDelayed ? targetDate : now,
        end: isDelayed ? now : targetDate
    });

    // Acumula somente unidades que possuem valor.
    const parts = [];
    if (duration.years) parts.push(`${duration.years} ano(s)`);
    if (duration.months) parts.push(`${duration.months} mês(es)`);
    if (duration.days) parts.push(`${duration.days} dia(s)`);
    if (duration.hours) parts.push(`${duration.hours} hora(s)`);
    if (duration.minutes) parts.push(`${duration.minutes} minuto(s)`);

    // Para precisão fina requerida na tela do QR Code
    if (parts.length === 0 || (!duration.years && !duration.months)) {
        if (duration.seconds) parts.push(`${duration.seconds} segundo(s)`);
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
export function formatDateBr(date: Date | null | undefined): string {
    // Representa ausência de data de forma explícita.
    if (!date) return 'N/A';
    return formatInTimeZone(date, TIMEZONE, 'dd/MM/yyyy HH:mm');
}