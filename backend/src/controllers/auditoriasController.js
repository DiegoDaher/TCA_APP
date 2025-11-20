import { 
  AuditoriaRegistros, 
  AuditoriaEliminados,
  auditoriaRegistrosFunctions,
  auditoriaEliminadosFunctions
} from '../models/auditoriasModel.js';

// ============================================
// CONTROLADORES PARA AUDITORIA_REGISTROS
// ============================================

// Obtener un registro de auditoría por ID
const getAuditoriaRegistroById = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const entry = await auditoriaRegistrosFunctions.get(id);
    res.status(200).json({ message: 'Registro de auditoría obtenido exitosamente', data: entry });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

// Consultar el registro original asociado a una auditoría
const consultarRegistroAuditado = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const resultado = await auditoriaRegistrosFunctions.consultarRegistro(id);
    res.status(200).json({ 
      message: 'Registro consultado exitosamente', 
      data: resultado 
    });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

// Listar registros de auditoría con paginación y filtros
const getAuditoriaRegistros = async (req, res) => {
  const { page = 1, limit = 10, tabla_afectada, usuario, fecha_desde, fecha_hasta } = req.query;

  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  if (isNaN(parsedPage) || parsedPage < 1) {
    return res.status(400).json({ error: 'El parámetro "page" debe ser un número entero positivo.' });
  }
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    return res.status(400).json({ error: 'El parámetro "limit" debe ser un número entero positivo.' });
  }

  try {
    const { total, data } = await auditoriaRegistrosFunctions.findAll({ 
      page: parsedPage, 
      limit: parsedLimit, 
      tabla_afectada, 
      usuario, 
      fecha_desde, 
      fecha_hasta 
    });
    const totalPages = Math.ceil(total / parsedLimit);
    
    res.status(200).json({
      message: 'Registros de auditoría obtenidos exitosamente',
      data,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CONTROLADORES PARA AUDITORIA_ELIMINADOS
// ============================================

// Obtener un registro eliminado de auditoría por ID
const getAuditoriaEliminadoById = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const entry = await auditoriaEliminadosFunctions.get(id);
    res.status(200).json({ message: 'Registro eliminado de auditoría obtenido exitosamente', data: entry });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

// Consultar el registro original asociado a una auditoría de eliminados
const consultarRegistroEliminado = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const resultado = await auditoriaEliminadosFunctions.consultarRegistro(id);
    res.status(200).json({ 
      message: 'Registro eliminado consultado exitosamente', 
      data: resultado 
    });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

// Listar registros eliminados de auditoría con paginación y filtros
const getAuditoriaEliminados = async (req, res) => {
  const { page = 1, limit = 10, tabla_afectada, usuario, fecha_desde, fecha_hasta } = req.query;

  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  if (isNaN(parsedPage) || parsedPage < 1) {
    return res.status(400).json({ error: 'El parámetro "page" debe ser un número entero positivo.' });
  }
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    return res.status(400).json({ error: 'El parámetro "limit" debe ser un número entero positivo.' });
  }

  try {
    const { total, data } = await auditoriaEliminadosFunctions.findAll({ 
      page: parsedPage, 
      limit: parsedLimit, 
      tabla_afectada, 
      usuario, 
      fecha_desde, 
      fecha_hasta 
    });
    const totalPages = Math.ceil(total / parsedLimit);
    
    res.status(200).json({
      message: 'Registros eliminados de auditoría obtenidos exitosamente',
      data,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  // Auditoría de Registros
  getAuditoriaRegistroById,
  consultarRegistroAuditado,
  getAuditoriaRegistros,
  
  // Auditoría de Eliminados
  getAuditoriaEliminadoById,
  consultarRegistroEliminado,
  getAuditoriaEliminados,
};
