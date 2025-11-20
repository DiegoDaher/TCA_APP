import { Router } from 'express';
import { register, login, getProfile, verifyToken, changePassword, getAllUsers, deactivateUser, restoreUser, getUserById } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticate, getProfile);
router.get('/verify', authenticate, verifyToken);
router.put('/change-password', authenticate, changePassword);
router.get('/users', authenticate, getAllUsers);
router.get('/users/:id', authenticate, getUserById);
router.delete('/users/:id', authenticate, deactivateUser);
router.patch('/users/:id/restore', authenticate, restoreUser);

export default router;
