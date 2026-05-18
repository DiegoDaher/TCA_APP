// controllers/digitalizacionController.js
import { Digitalizacion, Hoja } from '../models/digitalizacionModel.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const subirDigitalizacion = async (req, res) => {
  const t = await sequelize.transaction(); // Iniciar transacción
  try {
    const { titulo } = req.body;
    const carpetaNombre = titulo.replace(/\s+/g, '_').toLowerCase();
    const rutaCarpeta = path.join(__dirname, '../../public/digitalizaciones', carpetaNombre);

    // Crear carpeta si no existe
    if (!fs.existsSync(rutaCarpeta)) {
      fs.mkdirSync(rutaCarpeta, { recursive: true });
    }

    // 1. Guardar cabecera de la digitalización
    const nuevaDigitalizacion = await Digitalizacion.create({
      titulo,
      carpeta_raiz: `/digitalizaciones/${carpetaNombre}`
    }, { transaction: t });

    // 2. Procesar imágenes una por una
    const hojasData = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const numeroPagina = i + 1;
      const nombreArchivo = `hoja_${String(numeroPagina).padStart(3, '0')}.webp`;
      const rutaFisica = path.join(rutaCarpeta, nombreArchivo);
      const rutaRelativa = `/digitalizaciones/${carpetaNombre}/${nombreArchivo}`;

      // Optimización con Sharp (Transforma JPG -> WebP comprimido)
      await sharp(file.buffer)
        .webp({ quality: 80 })
        .toFile(rutaFisica);

      hojasData.push({
        digitalizacion_id: nuevaDigitalizacion.id,
        ruta_archivo: rutaRelativa,
        numero_pagina: numeroPagina
      });
    }

    // 3. Guardar todas las hojas en la DB
    await Hoja.bulkCreate(hojasData, { transaction: t });

    await t.commit(); // Confirmar cambios
    res.status(201).json({ message: 'Digitalización completada con éxito', id: nuevaDigitalizacion.id });

  } catch (error) {
    await t.rollback(); // Deshacer cambios si hay error
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la digitalización' });
  }
};

export default { subirDigitalizacion };