import express from 'express';
import diarioOficialController from '../controllers/diarioOficialController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.post('/add', authenticate, diarioOficialController.createDiarioOficial);
router.put('/:id', authenticate, diarioOficialController.update);
router.put('/deactivate/:id', authenticate, diarioOficialController.deactivate);
router.put('/restore/:id', authenticate, diarioOficialController.restore);

// Rutas públicas (no requieren autenticación)
router.get('/', diarioOficialController.getDiarioOficial);
router.get('/byId/:id', diarioOficialController.getById);
router.get('/columns', diarioOficialController.getAvailableColumns);

export default router;