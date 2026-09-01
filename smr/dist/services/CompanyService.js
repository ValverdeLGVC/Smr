"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
// Importa o cliente usado para persistir empresas.
const prisma_1 = require("../config/prisma");
// Centraliza as regras de negócio de empresas.
class CompanyService {
    // Valida e cria uma empresa.
    async createCompany(data) {
        if (!data?.name || !String(data.name).trim()) {
            throw new Error('Nome da empresa é obrigatório');
        }
        return prisma_1.prisma.company.create({
            data: {
                name: data.name,
                cnpj: data.cnpj || null,
                contact_name: data.contact_name || null,
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
                active: data.active ?? true,
            }
        });
    }
    async getAll() {
        // Retorna empresas ordenadas pelo nome para o formulário.
        return prisma_1.prisma.company.findMany({
            orderBy: { name: 'asc' }
        });
    }
    // Atualiza os dados cadastrais de uma empresa existente.
    async updateCompany(id, data) {
        if (!data?.name || !String(data.name).trim()) {
            throw new Error('Nome da empresa é obrigatório');
        }
        return prisma_1.prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                cnpj: data.cnpj || null,
                contact_name: data.contact_name || null,
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
                active: data.active ?? true,
            }
        });
    }
    // Exclui uma empresa somente quando ela não possui computadores vinculados.
    async deleteCompany(id) {
        const computerCount = await prisma_1.prisma.computer.count({
            where: { company_id: id }
        });
        if (computerCount > 0) {
            throw new Error('Não é possível excluir uma empresa que possui computadores vinculados');
        }
        await prisma_1.prisma.company.delete({ where: { id } });
        return { message: 'Empresa excluída com sucesso!' };
    }
}
exports.CompanyService = CompanyService;
