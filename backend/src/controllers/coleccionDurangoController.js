import ColeccionDurango, { create, findAll, findById, update, getColumns } from '../models/coleccionDurangoModel.js';

// Método para crear un nuevo registro
const createColeccionDurango = async (req, res) => {
  const { Letra,Titulo, Autor, Año, Editorial, Edición, ISBN, Ejemplares, Fecha_de_creacion, Status } = req.body;

  // Validaciones requeridas
  if(!Letra || typeof Letra !== 'string' || Letra.length !== 1){
    return res.status(400).json({ error: 'El campo "Letra" es requerido y debe ser una cadena de texto de un solo carácter.' });
  }
  if (!Titulo || typeof Titulo !== 'string') {
    return res.status(400).json({ error: 'El campo "Titulo" es requerido y debe ser una cadena de texto.' });
  }
  if (Autor && (typeof Autor !== 'string' || Autor.length > 100)) {
    return res.status(400).json({ error: 'El campo "Autor" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (!Año || typeof Año !== 'string') {
    return res.status(400).json({ error: 'El campo "Año" es requerido y debe ser una cadena de texto.' });
  }
  if (Año.length > 16) {
    return res.status(400).json({ error: 'El campo "Año" no puede exceder los 16 caracteres.' });
  }
  if (Editorial && (typeof Editorial !== 'string' || Editorial.length > 100)) {
    return res.status(400).json({ error: 'El campo "Editorial" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (typeof Edición !== 'string' || Edición.length > 100) {
    return res.status(400).json({ error: 'El campo "Edición" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (ISBN && (typeof ISBN !== 'string' || ISBN.length > 100)) {
    return res.status(400).json({ error: 'El campo "ISBN" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (Ejemplares && (typeof Ejemplares !== 'number' || !Number.isInteger(Ejemplares))) {
    return res.status(400).json({ error: 'El campo "Ejemplares" debe ser un número entero.' });
  }
  if (Fecha_de_creacion && isNaN(Date.parse(Fecha_de_creacion))) {
    return res.status(400).json({ error: 'El campo "Fecha_de_creacion" debe ser una fecha válida (formato YYYY-MM-DD).' });
  }
  if (Status !== undefined && typeof Status !== 'boolean') {
    return res.status(400).json({ error: 'El campo "Status" debe ser un booleano (true/false).' });
  }

  try {
    const newEntry = await ColeccionDurango.create({
      Letra,
      Titulo,
      Autor,
      Año: Año || null, // Sequelize maneja null si no se envía
      Editorial: Editorial || null,
      Edición: Edición || null,
      ISBN: ISBN || null,
      Ejemplares,
      Fecha_de_creacion, // Usa default en DB si no se envía
      Status, // Usa default en DB si no se envía
    });
    res.status(201).json({ message: 'Registro agregado exitosamente', data: newEntry });
  } catch (error) {
    res.status(500).json({ error: `Error al crear el registro: ${error.message}` });
  }
};

// Método para obtener un registro por ID
const getById = async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un número entero
  if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const entry = await findById(id);
    res.status(200).json({ message: 'Registro obtenido exitosamente', data: entry });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

// Método para actualizar un registro por ID
const updateColeccionDurango = async (req, res) => {
  const { id } = req.params;
  const { Letra, Titulo, Autor, Año, Editorial, Edición, ISBN, Ejemplares, Fecha_de_creacion, Status } = req.body;

  // Validaciones solo si los campos están presentes en el body
  if (Letra !== undefined && (typeof Letra !== 'string' || Letra.length !== 1)) {
    return res.status(400).json({ error: 'El campo "Letra" debe ser una cadena de texto de un solo carácter.' });
  }
  if (Titulo !== undefined && typeof Titulo !== 'string') {
    return res.status(400).json({ error: 'El campo "Titulo" debe ser una cadena de texto.' });
  }
  if (Autor !== undefined && (typeof Autor !== 'string' || Autor.length > 100)) {
    return res.status(400).json({ error: 'El campo "Autor" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (Año !== undefined && (typeof Año !== 'string' || Año.length > 16)) {
    return res.status(400).json({ error: 'El campo "Año" debe ser una cadena de texto y no puede exceder los 16 caracteres.' });
  }
  if (Editorial !== undefined && (typeof Editorial !== 'string' || Editorial.length > 100)) {
    return res.status(400).json({ error: 'El campo "Editorial" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (typeof Edición !== 'string' || Edición.length > 100) {
    return res.status(400).json({ error: 'El campo "Edición" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (ISBN !== undefined && (typeof ISBN !== 'string' || ISBN.length > 100)) {
    return res.status(400).json({ error: 'El campo "ISBN" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (Ejemplares !== undefined && (typeof Ejemplares !== 'number' || !Number.isInteger(Ejemplares))) {
    return res.status(400).json({ error: 'El campo "Ejemplares" debe ser un número entero.' });
  }
  if (Fecha_de_creacion !== undefined && isNaN(Date.parse(Fecha_de_creacion))) {
    return res.status(400).json({ error: 'El campo "Fecha_de_creacion" debe ser una fecha válida (formato YYYY-MM-DD).' });
  }
  if (Status !== undefined && typeof Status !== 'boolean') {
    return res.status(400).json({ error: 'El campo "Status" debe ser un booleano (true/false).' });
  }

  // Solo incluimos los campos enviados en el body
  const updateData = {};
  if (Letra !== undefined) updateData.Letra = Letra;
  if (Titulo !== undefined) updateData.Titulo = Titulo;
  if (Autor !== undefined) updateData.Autor = Autor;
  if (Año !== undefined) updateData.Año = Año;
  if (Editorial !== undefined) updateData.Editorial = Editorial;
  if (Edición !== undefined) updateData.Edición = Edición;
  if (ISBN !== undefined) updateData.ISBN = ISBN;
  if (Ejemplares !== undefined) updateData.Ejemplares = Ejemplares;
  if (Fecha_de_creacion !== undefined) updateData.Fecha_de_creacion = Fecha_de_creacion;
  if (Status !== undefined) updateData.Status = Status;

  try {
    const updatedEntry = await update(id, updateData);
    res.status(200).json({ message: 'Registro actualizado exitosamente', data: updatedEntry });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

const getColeccionDurango = async (req, res) => {
  const { page = 1, limit = 10, column, value, q,  } = req.query;

  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  if (isNaN(parsedPage) || parsedPage < 1) {
    return res.status(400).json({ error: 'El parámetro "page" debe ser un número entero positivo.' });
  }
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    return res.status(400).json({ error: 'El parámetro "limit" debe ser un número entero positivo.' });
  }

  try {
    const { total, data } = await findAll({ page: parsedPage, limit: parsedLimit, column, value, q, filters: { Status: true } });
    const totalPages = Math.ceil(total / parsedLimit);
    res.status(200).json({
      message: 'Registros obtenidos exitosamente',
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

// Método para obtener columnas
const getAvailableColumns = async (req, res) => {
  try {
    const columns = getColumns();
    res.status(200).json({ message: 'Columnas disponibles obtenidas exitosamente', columns });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener columnas: ${error.message}` });
  }
};

//Metodo para desactivar (Status = 0)
const deactivate = async (req, res) => {
  const { id } = req.params;

  // Validación básica del ID
  if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const updatedEntry = await update(id, { Status: false }); // false para BOOLEAN (equivalente a 0 en TINYINT(1))
    res.status(200).json({ message: 'Registro dado de baja exitosamente (Status cambiado a 0)', data: updatedEntry });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

// Nuevo método para restaurar (Status = 1)
const restore = async (req, res) => {
  const { id } = req.params;

  // Validación básica del ID
  if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const updatedEntry = await update(id, { Status: true }); // true para BOOLEAN (equivalente a 1 en TINYINT(1))
    res.status(200).json({ message: 'Registro restaurado exitosamente (Status cambiado a 1)', data: updatedEntry });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

export default { createColeccionDurango, getColeccionDurango, getById, update: updateColeccionDurango, getAvailableColumns, deactivate, restore };