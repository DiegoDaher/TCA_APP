import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/db.js';
import ColeccionDurango from './coleccionDurangoModel.js';
import DiarioOficial from './diarioOficialModel.js';
import Libros from './librosModel.js';
import Periodicos from './periodicosModel.js';

// Definición de campos comunes para ambas tablas de auditoría
const auditoriaFields = {
  id_auditoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tabla_afectada: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  id_registro: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  titulo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Periodo: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  Año: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  Tema_general: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  fecha_auditoria: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  usuario: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
};

// Factory function para crear modelos de auditoría
const createAuditoriaModel = (modelName, tableName) => {
  return sequelize.define(
    modelName,
    auditoriaFields,
    {
      timestamps: false,
      tableName: tableName,
    }
  );
};

// Crear ambos modelos usando la factory
const AuditoriaRegistros = createAuditoriaModel('AuditoriaRegistros', 'auditoria_registros');
const AuditoriaEliminados = createAuditoriaModel('AuditoriaEliminados', 'auditoria_eliminados');


// Factory function para crear métodos genéricos
const createAuditoriaFunctions = (Model) => {
  // Método para buscar un registro de auditoría por ID
  const get = async (id) => {
    try {
      const entry = await Model.findByPk(id);
      if (!entry) {
        throw new Error('Registro de auditoría no encontrado');
      }
      return entry;
    } catch (error) {
      throw new Error(`Error al buscar el registro de auditoría: ${error.message}`);
    }
  };

  // Método para consultar el registro en la tabla afectada
  const consultarRegistro = async (id_auditoria) => {
    try {
      const auditoria = await Model.findByPk(id_auditoria);
      if (!auditoria) {
        throw new Error('Registro de auditoría no encontrado');
      }

      const { tabla_afectada, id_registro } = auditoria;

      if (!tabla_afectada || !id_registro) {
        throw new Error('Información insuficiente para consultar el registro (tabla_afectada o id_registro es nulo)');
      }

      let modelo;
      switch (tabla_afectada.toLowerCase()) {
        case 'coleccion_durango':
          modelo = ColeccionDurango;
          break;
        case 'libros':
        case 'coleccion':
          modelo = Libros;
          break;
        case 'diario_oficial':
          modelo = DiarioOficial;
          break;
        case 'periodicos':
          modelo = Periodicos;
          break;
        default:
          throw new Error(`Tabla afectada '${tabla_afectada}' no está soportada`);
      }

      const registro = await modelo.findByPk(id_registro);
      if (!registro) {
        throw new Error(`Registro con ID ${id_registro} no encontrado en la tabla ${tabla_afectada}`);
      }

      return {
        auditoria,
        registro,
      };
    } catch (error) {
      throw new Error(`Error al consultar el registro: ${error.message}`);
    }
  };

  // Método para listar registros con paginación y filtros
  const findAll = async ({ page = 1, limit = 10, tabla_afectada = null, usuario = null, fecha_desde = null, fecha_hasta = null }) => {
    try {
      const offset = (page - 1) * limit;
      let where = {};

      if (tabla_afectada) {
        where.tabla_afectada = { [Op.like]: `%${tabla_afectada}%` };
      }

      if (usuario) {
        where.usuario = { [Op.like]: `%${usuario}%` };
      }

      if (fecha_desde && fecha_hasta) {
        where.fecha_auditoria = {
          [Op.between]: [fecha_desde, fecha_hasta],
        };
      } else if (fecha_desde) {
        where.fecha_auditoria = { [Op.gte]: fecha_desde };
      } else if (fecha_hasta) {
        where.fecha_auditoria = { [Op.lte]: fecha_hasta };
      }

      const { count, rows } = await Model.findAndCountAll({
        where,
        offset,
        limit,
        order: [['fecha_auditoria', 'DESC']],
      });

      return { total: count, data: rows };
    } catch (error) {
      throw new Error(`Error al listar registros de auditoría: ${error.message}`);
    }
  };

  return { get, consultarRegistro, findAll };
};

// Crear funciones para cada modelo
const auditoriaRegistrosFunctions = createAuditoriaFunctions(AuditoriaRegistros);
const auditoriaEliminadosFunctions = createAuditoriaFunctions(AuditoriaEliminados);

// Sincronización de tablas
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("Tabla 'auditoria_registros' sincronizada correctamente");
    console.log("Tabla 'auditoria_eliminados' sincronizada correctamente");
  })
  .catch((err) => console.error("Error al sincronizar las tablas de auditoría:", err));

// Exportar modelos y funciones
export default AuditoriaRegistros;
export { 
  AuditoriaRegistros, 
  AuditoriaEliminados,
  auditoriaRegistrosFunctions,
  auditoriaEliminadosFunctions
};