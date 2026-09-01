// Importa o roteador HTTP do Express.
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { CompanyController } from '../controllers/CompanyController';
import { ComputerController } from '../controllers/ComputerController';
import { MaintenanceController } from '../controllers/MaintenanceController';
import { UserController } from '../controllers/UserController';
// Importa a proteção das rotas privadas.
import { authMiddleware } from '../middlewares/authMiddleware';

// Cria o roteador exportado para a aplicação.
const router = Router();

// Cria os controllers usados nos handlers abaixo.
const authController = new AuthController();
const companyController = new CompanyController();
const computerController = new ComputerController();
const maintenanceController = new MaintenanceController();
const userController = new UserController();

// Rotas públicas: não exigem token.
router.post('/auth/login', (req, res) => authController.login(req, res));

// A Rota que o celular acessa via QR Code para ler os dados do PC deve ser pública
router.get('/computers/code/:code', (req, res) => computerController.getByCode(req, res));

// ------------- ROTAS PROTEGIDAS ABAIXO -------------
router.use(authMiddleware);

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

export default router;