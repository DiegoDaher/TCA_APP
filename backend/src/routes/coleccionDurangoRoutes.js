import express from 'express';
import coleccionDurangoController from '../controllers/coleccionDurangoController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.post('/add', authenticate, coleccionDurangoController.createColeccionDurango);
router.put('/:id', authenticate, coleccionDurangoController.update);
router.put('/deactivate/:id', authenticate, coleccionDurangoController.deactivate);
router.put('/restore/:id', authenticate, coleccionDurangoController.restore);

// Rutas públicas (no requieren autenticación)
router.get('/', coleccionDurangoController.getColeccionDurango);
router.get('/byId/:id', coleccionDurangoController.getById);
router.get('/columns', coleccionDurangoController.getAvailableColumns);

export default router;