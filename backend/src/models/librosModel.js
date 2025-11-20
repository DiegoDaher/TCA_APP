import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/db.js';

const Libros = sequelize.define(
  'Libros',
  {
    MFN: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permitir nulo al crear
    },
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Idioma: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Autor: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Autor_Corporativo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Autor_Uniforme: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Titulo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Edicion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Lugar_Publicacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Serie: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Encuadernado_con: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Bibliografia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Contenido: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Tema_general: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Coautor_personal: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Memorico_2020: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Memorico_2024: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Coleccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Fecha_de_creacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    Status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: false,
    tableName: 'libros',
  }
);

const create = async (data) => {
  return await Libros.create(data);
};

const getColumns = () => {
  return Object.keys(Libros.rawAttributes);
};

const findAll = async ({ page = 1, limit = 10, column = null, value = null, q = null, filters = {}  }) => {
  try {
    const offset = (page - 1) * limit;
    let where = {...filters};

    if (column && value) {
      const normalizedColumn = column.trim();
      switch (normalizedColumn) {
        case 'MFN':
          const mfnNum = parseInt(value);
          if (!isNaN(mfnNum)) where.MFN = mfnNum;
          break;
        case 'Id':
          const idNum = parseInt(value);
          if (!isNaN(idNum)) where.Id = idNum;
          break;
        case 'Idioma':
          where.Idioma = { [Op.like]: `%${value}%` };
          break;
        case 'Autor':
          where.Autor = { [Op.like]: `%${value}%` };
          break;
        case 'Autor_Corporativo':
          where.Autor_Corporativo = { [Op.like]: `%${value}%` };
          break;
        case 'Autor_Uniforme':
          where.Autor_Uniforme = { [Op.like]: `%${value}%` };
          break;
        case 'Titulo':
          where.Titulo = { [Op.like]: `${value}%` };
          break;
        case 'Edicion':
          where.Edicion = { [Op.like]: `%${value}%` };
          break;
        case 'Lugar_Publicacion':
          where.Lugar_Publicacion = { [Op.like]: `%${value}%` };
          break;
        case 'Descripcion':
          where.Descripcion = { [Op.like]: `%${value}%` };
          break;
        case 'Serie':
          where.Serie = { [Op.like]: `%${value}%` };
          break;
        case 'Notas':
          where.Notas = { [Op.like]: `%${value}%` };
          break;
        case 'Encuadernado_con':
          where.Encuadernado_con = { [Op.like]: `%${value}%` };
          break;
        case 'Bibliografia':
          where.Bibliografia = { [Op.like]: `%${value}%` };
          break;
        case 'Contenido':
          where.Contenido = { [Op.like]: `%${value}%` };
          break;
        case 'Tema_general':
          where.Tema_general = { [Op.like]: `%${value}%` };
          break;
        case 'Coautor_personal':
          where.Coautor_personal = { [Op.like]: `%${value}%` };
          break;
        case 'Memorico_2020':
          where.Memorico_2020 = { [Op.like]: `%${value}%` };
          break;
        case 'Memorico_2024':
          where.Memorico_2024 = { [Op.like]: `%${value}%` };
          break;
        case 'Coleccion':
          where.Coleccion = { [Op.like]: `%${value}%` };
          break;
        case 'Fecha_de_creacion':
          if (!isNaN(Date.parse(value))) where.Fecha_de_creacion = value;
          break;
        case 'Status':
          const statusBool = value === 'true' || value === '1';
          where.Status = statusBool;
          break;
        default:
          break;
      }
    }

    if (q && !column) {
      where = {
        [Op.or]: [
          { Idioma: { [Op.like]: `%${q}%` } },
          { Autor: { [Op.like]: `%${q}%` } },
          { Autor_Corporativo: { [Op.like]: `%${q}%` } },
          { Autor_Uniforme: { [Op.like]: `%${q}%` } },
          { Titulo: { [Op.like]: `%${q}%` } },
          { Edicion: { [Op.like]: `%${q}%` } },
          { Lugar_Publicacion: { [Op.like]: `%${q}%` } },
          { Descripcion: { [Op.like]: `%${q}%` } },
          { Serie: { [Op.like]: `%${q}%` } },
          { Notas: { [Op.like]: `%${q}%` } },
          { Encuadernado_con: { [Op.like]: `%${q}%` } },
          { Bibliografia: { [Op.like]: `%${q}%` } },
          { Contenido: { [Op.like]: `%${q}%` } },
          { Tema_general: { [Op.like]: `%${q}%` } },
          { Coautor_personal: { [Op.like]: `%${q}%` } },
          { Memorico_2020: { [Op.like]: `%${q}%` } },
          { Memorico_2024: { [Op.like]: `%${q}%` } },
          { Coleccion: { [Op.like]: `%${q}%` } },
        ],
      };
    }

    const { count, rows } = await Libros.findAndCountAll({
      where,
      offset,
      limit,
      order: [['Id', 'DESC']],
    });

    return { total: count, data: rows };
  } catch (error) {
    throw new Error(`Error al listar registros: ${error.message}`);
  }
};

const findById = async (id) => {
  try {
    const entry = await Libros.findByPk(id);
    if (!entry) {
      throw new Error('Registro no encontrado');
    }
    return entry;
  } catch (error) {
    throw new Error(`Error al buscar el registro: ${error.message}`);
  }
};

const update = async (id, data) => {
  try {
    const [updated] = await Libros.update(data, {
      where: { Id: id },
    });
    if (updated === 0) {
      throw new Error('Registro no encontrado o sin cambios');
    }
    const updatedEntry = await Libros.findByPk(id);
    return updatedEntry;
  } catch (error) {
    throw new Error(`Error al actualizar el registro: ${error.message}`);
  }
};

sequelize
  .sync({ alter: false })
  .then(() => console.log("Tabla 'libros' sincronizada correctamente"))
  .catch((err) => console.error("Error al sincronizar la tabla 'libros':", err));

export default Libros;
export { create, findAll, update, findById, getColumns };