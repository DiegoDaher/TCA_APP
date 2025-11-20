import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import sequelize from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiala_en_produccion';

export const authenticate = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Acceso denegado. No se proporcionó un token de autenticación.' 
      });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Buscar el usuario en la base de datos
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado. Token inválido.' 
      });
    }

    if (user.Status !== 1) {
      return res.status(401).json({ 
        error: 'Usuario inactivo. Contacta al administrador.' 
      });
    }

    // Obtener los roles del usuario
    const roles = await sequelize.query(`
      SELECT r.id, r.nombre, r.slug, r.descripcion
      FROM roles r
      JOIN rolUsuarios ru ON r.id = ru.rol_id
      WHERE ru.usuario_id = :usuario_id
    `, {
      replacements: { usuario_id: user.Id },
      type: sequelize.QueryTypes.SELECT,
    });

    // Agregar el usuario al objeto request para uso posterior
    req.user = {
      id: user.Id,
      Nombres: user.Nombres,
      Apellidos: user.Apellidos,
      Correo_Electronico: user.Correo_Electronico,
      Status: user.Status,
      roles: roles.map(r => ({
        id: r.id,
        nombre: r.nombre,
        slug: r.slug,
        descripcion: r.descripcion
      })),
      roleSlugs: roles.map(r => r.slug), // Array de slugs para fácil verificación
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Por favor, inicia sesión nuevamente.' });
    }
    return res.status(500).json({ error: `Error en la autenticación: ${error.message}` });
  }
};
