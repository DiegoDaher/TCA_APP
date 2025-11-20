# Sistema de Autenticación JWT

## Configuración

### Variables de Entorno
Copia `.env.example` a `.env` y configura las siguientes variables:

```env
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
JWT_EXPIRES_IN=24h
```

#### Generar JWT_SECRET
Ejecuta este comando en tu terminal para generar una clave segura:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Actualización de Base de Datos
⚠️ **IMPORTANTE**: La columna `Contraseña` debe ser VARCHAR(255) para almacenar hashes bcrypt:
```sql
ALTER TABLE usuarios MODIFY COLUMN Contraseña VARCHAR(255);
```

## Endpoints de Autenticación

### 1. Registro de Usuario
**POST** `/api/auth/register`

**Body:**
```json
{
  "Nombres": "Juan",
  "Apellidos": "Pérez García",
  "Correo_Electronico": "juan.perez@example.com",
  "Contraseña": "password123"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "Id": 1,
    "Nombres": "Juan",
    "Apellidos": "Pérez García",
    "Correo_Electronico": "juan.perez@example.com",
    "Status": 1
  }
}
```

### 2. Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "Correo_Electronico": "juan.perez@example.com",
  "Contraseña": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "Id": 1,
    "Nombres": "Juan",
    "Apellidos": "Pérez García",
    "Correo_Electronico": "juan.perez@example.com",
    "Status": 1
  }
}
```

### 3. Obtener Perfil (requiere autenticación)
**GET** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "message": "Perfil obtenido exitosamente",
  "user": {
    "Id": 1,
    "Nombres": "Juan",
    "Apellidos": "Pérez García",
    "Correo_Electronico": "juan.perez@example.com",
    "Fecha_de_Creacion": "2025-11-18",
    "Status": 1
  }
}
```

### 4. Verificar Token (requiere autenticación)
**GET** `/api/auth/verify`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "message": "Token válido",
  "user": {
    "id": 1,
    "Nombres": "Juan",
    "Apellidos": "Pérez García",
    "Correo_Electronico": "juan.perez@example.com",
    "Status": 1
  }
}
```

## Rutas Protegidas

### Periódicos

Las siguientes rutas de periódicos **requieren autenticación** (excepto las de GET):

#### Rutas Públicas (no requieren autenticación):
- **GET** `/api/periodicos` - Obtener todos los periódicos
- **GET** `/api/periodicos/byId/:id` - Obtener periódico por ID
- **GET** `/api/periodicos/columns` - Obtener columnas disponibles

#### Rutas Protegidas (requieren autenticación):
- **POST** `/api/periodicos/add` - Crear un nuevo periódico
- **PUT** `/api/periodicos/:id` - Actualizar periódico
- **PUT** `/api/periodicos/deactivate/:id` - Desactivar periódico
- **PUT** `/api/periodicos/restore/:id` - Restaurar periódico

## Uso del Token

Para acceder a rutas protegidas, debes incluir el token en el header `Authorization`:

### Ejemplo con JavaScript (fetch)
```javascript
// 1. Login para obtener el token
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    Correo_Electronico: "juan.perez@example.com",
    Contraseña: "password123"
  })
});

const { token, user } = await loginResponse.json();

// 2. Usar el token en rutas protegidas
const response = await fetch('http://localhost:3000/api/periodicos/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    Titulo: "El Sol de Durango",
    Año: "2025",
    Tomo: 1
  })
});
```

### Ejemplo con Axios
```javascript
import axios from 'axios';

// Configurar axios con el token
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Agregar token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usar en componentes
const crearPeriodico = async () => {
  try {
    const response = await api.post('/periodicos/add', {
      Titulo: "El Sol de Durango",
      Año: "2025",
      Tomo: 1
    });
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};
```

### Ejemplo con cURL
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "Correo_Electronico": "juan.perez@example.com",
    "Contraseña": "password123"
  }'

# 2. Usar el token (reemplaza YOUR_TOKEN con el token recibido)
curl -X POST http://localhost:3000/api/periodicos/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "Titulo": "El Sol de Durango",
    "Año": "2025",
    "Tomo": 1
  }'
```

## Errores Comunes

### 401 - No autorizado
```json
{
  "error": "Acceso denegado. No se proporcionó un token de autenticación."
}
```

### 401 - Token inválido
```json
{
  "error": "Token inválido."
}
```

### 401 - Token expirado
```json
{
  "error": "Token expirado. Por favor, inicia sesión nuevamente."
}
```

### 403 - Sin permisos
```json
{
  "error": "Acceso denegado. Requiere permisos de administrador."
}
```

## Modelo de Usuario

La tabla `usuarios` utiliza la siguiente estructura existente en tu base de datos:

```sql
CREATE TABLE usuarios (
  `Id Primaria` INT(11) PRIMARY KEY AUTO_INCREMENT,
  `Nombre(s)` VARCHAR(80),
  `Apellido(s)` VARCHAR(80),
  Correo_Electronico VARCHAR(100) UNIQUE,
  Contraseña VARCHAR(255), -- Actualizado de VARCHAR(40) a VARCHAR(255) para bcrypt
  Fecha_de_Creacion DATE DEFAULT CURDATE(),
  Status TINYINT(4) DEFAULT 1
);
```

### Mapeo del Modelo Sequelize
```javascript
const User = sequelize.define('User', {
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'Id Primaria' },
  Nombres: { type: DataTypes.STRING(80), field: 'Nombre(s)' },
  Apellidos: { type: DataTypes.STRING(80), field: 'Apellido(s)' },
  Correo_Electronico: { type: DataTypes.STRING(100), unique: true },
  Contraseña: { type: DataTypes.STRING(255) }, // Hash bcrypt
  Fecha_de_Creacion: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  Status: { type: DataTypes.TINYINT, defaultValue: 1 }
});
```

### Campos del Usuario
- **Id Primaria**: Identificador único autoincremental
- **Nombre(s)**: Nombre(s) del usuario
- **Apellido(s)**: Apellido(s) del usuario
- **Correo_Electronico**: Email único para login
- **Contraseña**: Hash bcrypt de la contraseña (nunca se almacena en texto plano)
- **Fecha_de_Creacion**: Fecha de registro del usuario
- **Status**: 1 = Activo, 0 = Inactivo

## Middleware de Autenticación

### `authenticate`
Middleware que verifica el token JWT y protege rutas.

**Ubicación**: `src/middleware/authMiddleware.js`

**Funcionamiento**:
1. Extrae el token del header `Authorization: Bearer <token>`
2. Verifica la validez del token usando `JWT_SECRET`
3. Busca el usuario en la base de datos por el `id` contenido en el token
4. Verifica que el usuario esté activo (`Status === 1`)
5. Agrega `req.user` con la información del usuario para uso en controladores

**Ejemplo de uso en rutas**:
```javascript
import { authenticate } from '../middleware/authMiddleware.js';

// Ruta protegida
router.post('/add', authenticate, periodicosController.createPeriodicos);

// El controlador puede acceder a req.user
const createPeriodicos = async (req, res) => {
  const userId = req.user.id; // ID del usuario autenticado
  const userEmail = req.user.Correo_Electronico;
  // ... resto del código
};
```

**Objeto `req.user` disponible en rutas protegidas**:
```javascript
{
  id: 1,
  Nombres: "Juan",
  Apellidos: "Pérez García",
  Correo_Electronico: "juan.perez@example.com",
  Status: 1
}
```
