import express from 'express';
import librosController from '../controllers/librosController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.post('/add', authenticate, librosController.createLibro);
router.put('/:id', authenticate, librosController.update);
router.put('/deactivate/:id', authenticate, librosController.deactivate);
router.put('/restore/:id', authenticate, librosController.restore);

// Rutas públicas (no requieren autenticación)
router.get('/', librosController.getLibros);
router.get('/byId/:id', librosController.getById);
router.get('/columns', librosController.getAvailableColumns);

export default router;