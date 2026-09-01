// Importa o cliente gerado pelo schema Prisma.
import { PrismaClient } from '@prisma/client';

// Evita o esgotamento de conexões em ambiente de desenvolvimento devido ao hot-reload
// Reserva uma propriedade global para reutilização durante o hot-reload.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Reutiliza o cliente existente ou cria uma instância com logs de problemas.
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['warn', 'error'],
    });

// Mantém a instância global somente fora de produção.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;