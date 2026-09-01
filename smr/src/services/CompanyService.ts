// Importa o cliente usado para persistir empresas.
import { prisma } from '../config/prisma';

// Centraliza as regras de negócio de empresas.
export class CompanyService {
    // Valida e cria uma empresa.
    async createCompany(data: any) {
        if (!data?.name || !String(data.name).trim()) {
            throw new Error('Nome da empresa é obrigatório');
        }

        return prisma.company.create({
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
        return prisma.company.findMany({
            orderBy: { name: 'asc' }
        });
    }

    // Atualiza os dados cadastrais de uma empresa existente.
    async updateCompany(id: string, data: any) {
        if (!data?.name || !String(data.name).trim()) {
            throw new Error('Nome da empresa é obrigatório');
        }

        return prisma.company.update({
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
    async deleteCompany(id: string) {
        const computerCount = await prisma.computer.count({
            where: { company_id: id }
        });

        if (computerCount > 0) {
            throw new Error('Não é possível excluir uma empresa que possui computadores vinculados');
        }

        await prisma.company.delete({ where: { id } });
        return { message: 'Empresa excluída com sucesso!' };
    }
}
