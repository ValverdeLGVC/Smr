"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importa o roteador HTTP do Express.
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const CompanyController_1 = require("../controllers/CompanyController");
const ComputerController_1 = require("../controllers/ComputerController");
const MaintenanceController_1 = require("../controllers/MaintenanceController");
const UserController_1 = require("../controllers/UserController");
// Importa a proteção das rotas privadas.
const authMiddleware_1 = require("../middlewares/authMiddleware");
// Cria o roteador exportado para a aplicação.
const router = (0, express_1.Router)();
// Cria os controllers usados nos handlers abaixo.
const authController = new AuthController_1.AuthController();
const companyController = new CompanyController_1.CompanyController();
const computerController = new ComputerController_1.ComputerController();
const maintenanceController = new MaintenanceController_1.MaintenanceController();
const userController = new UserController_1.UserController();
// Rotas públicas: não exigem token.
router.post('/auth/login', (req, res) => authController.login(req, res));
// A Rota que o celular acessa via QR Code para ler os dados do PC deve ser pública
router.get('/computers/code/:code', (req, res) => computerController.getByCode(req, res));
// ------------- ROTAS PROTEGIDAS ABAIXO -------------
router.use(authMiddleware_1.authMiddleware);
// Empresas
router.get('/companies', (req, res) => companyController.getAll(req, res));
router.post('/companies', (req, res) => companyController.create(req, res));
router.put('/companies/:id', (req, res) => companyController.update(req, res));
router.delete('/companies/:id', (req, res) => companyController.delete(req, res));
// Usuários administradores
router.get('/users', (req, res) => userController.getAll(req, res));
router.post('/users', (req, res) => userController.create(req, res));
router.put('/users/:id', (req, res) => userController.update(req, res));
router.delete('/users/:id', (req, res) => userController.delete(req, res));
// Configuração de manutenção preventiva
router.get('/settings/maintenance', (req, res) => computerController.getSettings(req, res));
router.put('/settings/maintenance', (req, res) => computerController.updateSettings(req, res));
// Computadores
router.get('/computers', (req, res) => computerController.getAll(req, res));
router.post('/computers', (req, res) => computerController.create(req, res));
router.put('/computers/:id', (req, res) => computerController.update(req, res));
router.delete('/computers/:id', (req, res) => computerController.delete(req, res));
router.get('/computers/:code/qrcode', (req, res) => computerController.getQRCode(req, res));
// Manutenções
router.post('/maintenances/start', (req, res) => maintenanceController.start(req, res));
router.post('/maintenances/:id/complete', (req, res) => maintenanceController.complete(req, res));
exports.default = router;
