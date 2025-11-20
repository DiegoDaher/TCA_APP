import Libros, { create, findAll, findById, update, getColumns } from '../models/librosModel.js';

// Método para crear un nuevo registro
const createLibro = async (req, res) => {
  const { 
    Idioma, 
    Autor, 
    Autor_Corporativo, 
    Autor_Uniforme, 
    Titulo, 
    Edicion, 
    Lugar_Publicacion, 
    Descripcion, 
    Serie, 
    Notas, 
    Encuadernado_con, 
    Bibliografia, 
    Contenido, 
    Tema_general, 
    Coautor_personal, 
    Memorico_2020, 
    Memorico_2024, 
    Coleccion, 
    Fecha_de_creacion, 
    Status 
  } = req.body;

  
  // Validaciones opcionales
  if (Idioma !== undefined && (typeof Idioma !== 'string' || Idioma.length > 20)) {
    return res.status(400).json({ error: 'El campo "Idioma" debe ser una cadena de texto de máximo 20 caracteres.' });
  }
  if (Autor !== undefined && (typeof Autor !== 'string' || Autor.length > 100)) {
    return res.status(400).json({ error: 'El campo "Autor" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (Autor_Corporativo !== undefined && (typeof Autor_Corporativo !== 'string' || Autor_Corporativo.length > 100)) {
    return res.status(400).json({ error: 'El campo "Autor_Corporativo" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (Autor_Uniforme !== undefined && typeof Autor_Uniforme !== 'string') {
    return res.status(400).json({ error: 'El campo "Autor_Uniforme" debe ser una cadena de texto.' });
  }
  if (Titulo !== undefined && typeof Titulo !== 'string') {
    return res.status(400).json({ error: 'El campo "Titulo" debe ser una cadena de texto.' });
  }
  // MFN ya no es requerido en el body, se asignará igual a Id después de crear el registro
  if (Lugar_Publicacion !== undefined && typeof Lugar_Publicacion !== 'string') {
    return res.status(400).json({ error: 'El campo "Lugar_Publicacion" debe ser una cadena de texto.' });
  }
  if (Descripcion !== undefined && typeof Descripcion !== 'string') {
    return res.status(400).json({ error: 'El campo "Descripcion" debe ser una cadena de texto.' });
  }
  if (Serie !== undefined && typeof Serie !== 'string') {
    return res.status(400).json({ error: 'El campo "Serie" debe ser una cadena de texto.' });
  }
  if (Notas !== undefined && typeof Notas !== 'string') {
    return res.status(400).json({ error: 'El campo "Notas" debe ser una cadena de texto.' });
  }
  if (Encuadernado_con !== undefined && typeof Encuadernado_con !== 'string') {
    return res.status(400).json({ error: 'El campo "Encuadernado_con" debe ser una cadena de texto.' });
  }
  if (Bibliografia !== undefined && typeof Bibliografia !== 'string') {
    return res.status(400).json({ error: 'El campo "Bibliografia" debe ser una cadena de texto.' });
  }
  if (Contenido !== undefined && typeof Contenido !== 'string') {
    return res.status(400).json({ error: 'El campo "Contenido" debe ser una cadena de texto.' });
  }
  if (Tema_general !== undefined && (typeof Tema_general !== 'string' || Tema_general.length > 100)) {
    return res.status(400).json({ error: 'El campo "Tema_general" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (Coautor_personal !== undefined && typeof Coautor_personal !== 'string') {
    return res.status(400).json({ error: 'El campo "Coautor_personal" debe ser una cadena de texto.' });
  }
  if (Memorico_2020 !== undefined && typeof Memorico_2020 !== 'string') {
    return res.status(400).json({ error: 'El campo "Memorico_2020" debe ser una cadena de texto.' });
  }
  if (Memorico_2024 !== undefined && typeof Memorico_2024 !== 'string') {
    return res.status(400).json({ error: 'El campo "Memorico_2024" debe ser una cadena de texto.' });
  }
  if (Coleccion !== undefined && typeof Coleccion !== 'string') {
    return res.status(400).json({ error: 'El campo "Coleccion" debe ser una cadena de texto.' });
  }
  if (Fecha_de_creacion !== undefined && isNaN(Date.parse(Fecha_de_creacion))) {
    return res.status(400).json({ error: 'El campo "Fecha_de_creacion" debe ser una fecha válida (formato YYYY-MM-DD).' });
  }
  if (Status !== undefined && typeof Status !== 'boolean') {
    return res.status(400).json({ error: 'El campo "Status" debe ser un booleano (true/false).' });
  }

  try {
    // Crear el libro sin MFN (para que Id se genere)
    const newEntry = await Libros.create({
      Idioma: Idioma || null,
      Autor: Autor || null,
      Autor_Corporativo: Autor_Corporativo || null,
      Autor_Uniforme: Autor_Uniforme || null,
      Titulo: Titulo || null,
      Edicion: Edicion || null,
      Lugar_Publicacion: Lugar_Publicacion || null,
      Descripcion: Descripcion || null,
      Serie: Serie || null,
      Notas: Notas || null,
      Encuadernado_con: Encuadernado_con || null,
      Bibliografia: Bibliografia || null,
      Contenido: Contenido || null,
      Tema_general: Tema_general || null,
      Coautor_personal: Coautor_personal || null,
      Memorico_2020: Memorico_2020 || null,
      Memorico_2024: Memorico_2024 || null,
      Coleccion: Coleccion || null,
      Fecha_de_creacion,
      Status,
    });
    // Actualizar MFN con el valor de Id
    await newEntry.update({ MFN: newEntry.Id });
    // Obtener el registro actualizado
    const updatedEntry = await Libros.findByPk(newEntry.Id);
    res.status(201).json({ message: 'Registro agregado exitosamente', data: updatedEntry });
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
const updateLibro = async (req, res) => {
  const { id } = req.params;
  const { 
    MFN, 
    Idioma, 
    Autor, 
    Autor_Corporativo, 
    Autor_Uniforme, 
    Titulo, 
    Edicion, 
    Lugar_Publicacion, 
    Descripcion, 
    Serie, 
    Notas, 
    Encuadernado_con, 
    Bibliografia, 
    Contenido, 
    Tema_general, 
    Coautor_personal, 
    Memorico_2020, 
    Memorico_2024, 
    Coleccion, 
    Fecha_de_creacion, 
    Status 
  } = req.body;

  // Validaciones solo si los campos están presentes en el body
  if (MFN !== undefined && (typeof MFN !== 'number' || !Number.isInteger(MFN))) {
    return res.status(400).json({ error: 'El campo "MFN" debe ser un número entero.' });
  }
  if (Idioma !== undefined && (typeof Idioma !== 'string' || Idioma.length > 20)) {
    return res.status(400).json({ error: 'El campo "Idioma" debe ser una cadena de texto de máximo 20 caracteres.' });
  }
  if (Autor !== undefined && (typeof Autor !== 'string' || Autor.length > 100)) {
    return res.status(400).json({ error: 'El campo "Autor" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (Autor_Corporativo !== undefined && (typeof Autor_Corporativo !== 'string' || Autor_Corporativo.length > 100)) {
    return res.status(400).json({ error: 'El campo "Autor_Corporativo" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (Autor_Uniforme !== undefined && typeof Autor_Uniforme !== 'string') {
    return res.status(400).json({ error: 'El campo "Autor_Uniforme" debe ser una cadena de texto.' });
  }
  if (Titulo !== undefined && typeof Titulo !== 'string') {
    return res.status(400).json({ error: 'El campo "Titulo" debe ser una cadena de texto.' });
  }
  if (Edicion !== undefined && typeof Edicion !== 'string') {
    return res.status(400).json({ error: 'El campo "Edicion" debe ser una cadena de texto.' });
  }
  if (Lugar_Publicacion !== undefined && typeof Lugar_Publicacion !== 'string') {
    return res.status(400).json({ error: 'El campo "Lugar_Publicacion" debe ser una cadena de texto.' });
  }
  if (Descripcion !== undefined && typeof Descripcion !== 'string') {
    return res.status(400).json({ error: 'El campo "Descripcion" debe ser una cadena de texto.' });
  }
  if (Serie !== undefined && typeof Serie !== 'string') {
    return res.status(400).json({ error: 'El campo "Serie" debe ser una cadena de texto.' });
  }
  if (Notas !== undefined && typeof Notas !== 'string') {
    return res.status(400).json({ error: 'El campo "Notas" debe ser una cadena de texto.' });
  }
  if (Encuadernado_con !== undefined && typeof Encuadernado_con !== 'string') {
    return res.status(400).json({ error: 'El campo "Encuadernado_con" debe ser una cadena de texto.' });
  }
  if (Bibliografia !== undefined && typeof Bibliografia !== 'string') {
    return res.status(400).json({ error: 'El campo "Bibliografia" debe ser una cadena de texto.' });
  }
  if (Contenido !== undefined && typeof Contenido !== 'string') {
    return res.status(400).json({ error: 'El campo "Contenido" debe ser una cadena de texto.' });
  }
  if (Tema_general !== undefined && (typeof Tema_general !== 'string' || Tema_general.length > 100)) {
    return res.status(400).json({ error: 'El campo "Tema_general" debe ser una cadena de texto de máximo 100 caracteres.' });
  }
  if (Coautor_personal !== undefined && typeof Coautor_personal !== 'string') {
    return res.status(400).json({ error: 'El campo "Coautor_personal" debe ser una cadena de texto.' });
  }
  if (Memorico_2020 !== undefined && typeof Memorico_2020 !== 'string') {
    return res.status(400).json({ error: 'El campo "Memorico_2020" debe ser una cadena de texto.' });
  }
  if (Memorico_2024 !== undefined && typeof Memorico_2024 !== 'string') {
    return res.status(400).json({ error: 'El campo "Memorico_2024" debe ser una cadena de texto.' });
  }
  if (Coleccion !== undefined && typeof Coleccion !== 'string') {
    return res.status(400).json({ error: 'El campo "Coleccion" debe ser una cadena de texto.' });
  }
  if (Fecha_de_creacion !== undefined && isNaN(Date.parse(Fecha_de_creacion))) {
    return res.status(400).json({ error: 'El campo "Fecha_de_creacion" debe ser una fecha válida (formato YYYY-MM-DD).' });
  }
  if (Status !== undefined && typeof Status !== 'boolean') {
    return res.status(400).json({ error: 'El campo "Status" debe ser un booleano (true/false).' });
  }

  // Solo incluimos los campos enviados en el body
  const updateData = {};
  if (MFN !== undefined) updateData.MFN = MFN;
  if (Idioma !== undefined) updateData.Idioma = Idioma;
  if (Autor !== undefined) updateData.Autor = Autor;
  if (Autor_Corporativo !== undefined) updateData.Autor_Corporativo = Autor_Corporativo;
  if (Autor_Uniforme !== undefined) updateData.Autor_Uniforme = Autor_Uniforme;
  if (Titulo !== undefined) updateData.Titulo = Titulo;
  if (Edicion !== undefined) updateData.Edicion = Edicion;
  if (Lugar_Publicacion !== undefined) updateData.Lugar_Publicacion = Lugar_Publicacion;
  if (Descripcion !== undefined) updateData.Descripcion = Descripcion;
  if (Serie !== undefined) updateData.Serie = Serie;
  if (Notas !== undefined) updateData.Notas = Notas;
  if (Encuadernado_con !== undefined) updateData.Encuadernado_con = Encuadernado_con;
  if (Bibliografia !== undefined) updateData.Bibliografia = Bibliografia;
  if (Contenido !== undefined) updateData.Contenido = Contenido;
  if (Tema_general !== undefined) updateData.Tema_general = Tema_general;
  if (Coautor_personal !== undefined) updateData.Coautor_personal = Coautor_personal;
  if (Memorico_2020 !== undefined) updateData.Memorico_2020 = Memorico_2020;
  if (Memorico_2024 !== undefined) updateData.Memorico_2024 = Memorico_2024;
  if (Coleccion !== undefined) updateData.Coleccion = Coleccion;
  if (Fecha_de_creacion !== undefined) updateData.Fecha_de_creacion = Fecha_de_creacion;
  if (Status !== undefined) updateData.Status = Status;

  try {
    const updatedEntry = await update(id, updateData);
    res.status(200).json({ message: 'Registro actualizado exitosamente', data: updatedEntry });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

// Método para obtener todos los registros con paginación
const getLibros = async (req, res) => {
  const { page = 1, limit = 10, column, value, q } = req.query;

  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  if (isNaN(parsedPage) || parsedPage < 1) {
    return res.status(400).json({ error: 'El parámetro "page" debe ser un número entero positivo.' });
  }
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    return res.status(400).json({ error: 'El parámetro "limit" debe ser un número entero positivo.' });
  }

  try {
    // Agregar filtro para Status: true
    const { total, data } = await findAll({ 
      page: parsedPage, 
      limit: parsedLimit, 
      column, 
      value, 
      q, filters: { Status: true } // Filtro adicional
    });
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

// Método para desactivar (Status = 0)
const deactivate = async (req, res) => {
  const { id } = req.params;

  // Validación básica del ID
  if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const updatedEntry = await update(id, { Status: false });
    res.status(200).json({ message: 'Registro dado de baja exitosamente (Status cambiado a 0)', data: updatedEntry });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

// Método para restaurar (Status = 1)
const restore = async (req, res) => {
  const { id } = req.params;

  // Validación básica del ID
  if (!id || isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'El ID debe ser un número entero.' });
  }

  try {
    const updatedEntry = await update(id, { Status: true });
    res.status(200).json({ message: 'Registro restaurado exitosamente (Status cambiado a 1)', data: updatedEntry });
  } catch (error) {
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({ error: error.message });
  }
};

export default { createLibro, getLibros, getById, update: updateLibro, getAvailableColumns, deactivate, restore };
