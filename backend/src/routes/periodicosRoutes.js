import express from 'express';
import periodicosController from '../controllers/periodicosController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas (solo GET - no requieren autenticación)
router.get('/', periodicosController.getPeriodicos);
router.get('/byId/:id', periodicosController.getById);
router.get('/columns', periodicosController.getAvailableColumns);

// Rutas protegidas (requieren autenticación)
router.post('/add', authenticate, periodicosController.createPeriodicos);
router.put('/:id', authenticate, periodicosController.update);
router.put('/deactivate/:id', authenticate, periodicosController.deactivate);
router.put('/restore/:id', authenticate, periodicosController.restore);

export default router;