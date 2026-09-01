// Importa o cliente Prisma usado para acessar usuários.
import { prisma } from '../config/prisma';
// Importa hash e comparação segura de senhas.
import { comparePassword, hashPassword } from '../utils/security';

// Centraliza as regras de cadastro e gerenciamento de administradores.
export class UserService {
    // Lista usuários sem expor o hash da senha.
    async getAll() {
        return prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                created_at: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    // Cria sempre um usuário com perfil ADMIN.
    async createUser(data: any) {
        if (!data?.name || !String(data.name).trim()) {
            throw new Error('Nome do usuário é obrigatório');
        }
        if (!data?.email || !String(data.email).trim()) {
            throw new Error('E-mail do usuário é obrigatório');
        }
        if (!data?.password || String(data.password).length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        return prisma.user.create({
            data: {
                name: String(data.name).trim(),
                email: String(data.email).trim().toLowerCase(),
                password_hash: await hashPassword(String(data.password)),
                role: 'ADMIN',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                created_at: true,
            },
        });
    }

    // Atualiza nome/e-mail e troca senha somente com a senha atual correta.
    async updateUser(id: string, data: any) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw new Error('Usuário não encontrado');
        if (!data?.name || !String(data.name).trim()) {
            throw new Error('Nome do usuário é obrigatório');
        }
        if (!data?.email || !String(data.email).trim()) {
            throw new Error('E-mail do usuário é obrigatório');
        }

        const updateData: any = {
            name: String(data.name).trim(),
            email: String(data.email).trim().toLowerCase(),
        };

        if (data.password) {
            if (!data.currentPassword) {
                throw new Error('Informe a senha atual para trocar a senha');
            }
            if (!(await comparePassword(String(data.currentPassword), user.password_hash))) {
                throw new Error('A senha atual está incorreta');
            }
            if (String(data.password).length < 6) {
                throw new Error('A nova senha deve ter pelo menos 6 caracteres');
            }
            updateData.password_hash = await hashPassword(String(data.password));
        }

        return prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                created_at: true,
            },
        });
    }

    // Exclui usuário sem histórico relacionado e impede autoexclusão.
    async deleteUser(id: string, requesterId: string) {
        if (id === requesterId) {
            throw new Error('Você não pode excluir o próprio usuário');
        }

        const [maintenanceCount, evaluationCount] = await Promise.all([
            prisma.maintenance.count({ where: { user_id: id } }),
            prisma.technicalEvaluation.count({ where: { technician_id: id } }),
        ]);

        if (maintenanceCount > 0 || evaluationCount > 0) {
            throw new Error('Não é possível excluir um usuário com histórico relacionado');
        }

        await prisma.user.delete({ where: { id } });
        return { message: 'Usuário excluído com sucesso!' };
    }
}
