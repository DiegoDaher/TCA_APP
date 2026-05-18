// routes/digitalizacionRoutes.js
import express from 'express';
import multer from 'multer';
import { subirDigitalizacion } from '../controllers/digitalizacionController.js';

const router = express.Router();

// Configuración de multer (archivos en memoria)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Validar que sean JPG o PNG
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'), false);
  },
});

// Ruta: POST /api/digitalizaciones/upload
router.post('/upload', upload.array('imagenes', 100), subirDigitalizacion);

export default router;
