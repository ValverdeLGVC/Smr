// Biblioteca para criar e comparar hashes de senha.
import bcrypt from 'bcrypt';
// Biblioteca para assinar e verificar tokens JWT.
import jwt from 'jsonwebtoken';

// Lê a chave do ambiente; o fallback serve apenas para desenvolvimento.
const JWT_SECRET = process.env.JWT_SECRET || 'secret_fallback';
// Define o custo computacional do hash bcrypt.
const SALT_ROUNDS = 10;

// Tipagem do conteúdo que vai dentro do Token JWT
export interface TokenPayload {
    id: string;
    role: string;
}

// Cria o hash da senha
export async function hashPassword(password: string): Promise<string> {
    // Gera um hash não reversível para armazenamento.
    return bcrypt.hash(password, SALT_ROUNDS);
}

// Compara a senha digitada com o hash salvo no banco
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    // Verifica a senha sem revelar o hash original.
    return bcrypt.compare(password, hash);
}

// Gera o Token JWT válido por 8 horas
export function generateToken(payload: TokenPayload): string {
    // Assina os dados e limita sua validade a oito horas.
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

// Verifica e decodifica o Token JWT
export function verifyToken(token: string): TokenPayload {
    // Valida o token e converte seu conteúdo para a tipagem da aplicação.
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}