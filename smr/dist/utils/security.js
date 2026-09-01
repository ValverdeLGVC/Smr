"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
// Biblioteca para criar e comparar hashes de senha.
const bcrypt_1 = __importDefault(require("bcrypt"));
// Biblioteca para assinar e verificar tokens JWT.
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Lê a chave do ambiente; o fallback serve apenas para desenvolvimento.
const JWT_SECRET = process.env.JWT_SECRET || 'secret_fallback';
// Define o custo computacional do hash bcrypt.
const SALT_ROUNDS = 10;
// Cria o hash da senha
async function hashPassword(password) {
    // Gera um hash não reversível para armazenamento.
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
}
// Compara a senha digitada com o hash salvo no banco
async function comparePassword(password, hash) {
    // Verifica a senha sem revelar o hash original.
    return bcrypt_1.default.compare(password, hash);
}
// Gera o Token JWT válido por 8 horas
function generateToken(payload) {
    // Assina os dados e limita sua validade a oito horas.
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}
// Verifica e decodifica o Token JWT
function verifyToken(token) {
    // Valida o token e converte seu conteúdo para a tipagem da aplicação.
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
