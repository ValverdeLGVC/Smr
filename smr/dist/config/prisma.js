"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Importa o cliente gerado pelo schema Prisma.
const client_1 = require("@prisma/client");
// Evita o esgotamento de conexões em ambiente de desenvolvimento devido ao hot-reload
// Reserva uma propriedade global para reutilização durante o hot-reload.
const globalForPrisma = global;
// Reutiliza o cliente existente ou cria uma instância com logs de problemas.
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: ['warn', 'error'],
    });
// Mantém a instância global somente fora de produção.
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
