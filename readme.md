# TCA - Sistema de Acervo Bibliográfico

Sistema completo de gestión de acervos bibliográficos desarrollado con arquitectura full-stack moderna. Incluye gestión de colecciones, libros, periódicos y el diario oficial, con sistema de autenticación y roles de usuario.

## 📋 Tabla de Contenidos

- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Sistema de Autenticación](#-sistema-de-autenticación)
- [API Endpoints](#-api-endpoints)
- [Guía de Escalamiento](#-guía-de-escalamiento)
- [Desarrollo](#-desarrollo)

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** (v18+) - Runtime de JavaScript
- **Express.js** (v5.1.0) - Framework web
- **MySQL** (v8+) - Base de datos relacional
- **Sequelize** (v6.37.7) - ORM para MySQL
- **JWT** (jsonwebtoken v9.0.2) - Autenticación basada en tokens
- **bcryptjs** (v3.0.3) - Encriptación de contraseñas
- **Redis** + **BullMQ** (v5.63.2) - Cola de trabajos para emails
- **Nodemailer** (v7.0.10) - Envío de correos electrónicos
- **dotenv** (v17.2.3) - Gestión de variables de entorno
- **CORS** (v2.8.5) - Configuración de acceso entre dominios

### Frontend
- **Next.js** (v15.5.4) - Framework React con App Router
- **React** (v19.1.0) - Librería UI
- **Tailwind CSS** (v4.1.14) - Framework CSS utility-first
- **Radix UI** - Componentes accesibles y sin estilos
- **Lucide React** - Iconos
- **SweetAlert2** (v11.26.3) - Alertas y modales elegantes
- **React Hook Form** (v7.66.0) - Manejo de formularios
- **Zod** (v4.1.12) - Validación de esquemas
- **shadcn/ui** - Sistema de componentes reutilizables

### Herramientas de Desarrollo
- **Nodemon** - Auto-reload del servidor backend
- **ESLint** - Linter para JavaScript
- **Turbopack** - Empaquetador de Next.js

## 🏗️ Arquitectura del Proyecto

```
TCA_APP/
├── backend/          # API REST con Node.js + Express
│   ├── src/
│   │   ├── config/       # Configuración DB y Redis
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── middleware/   # Autenticación y validación
│   │   ├── models/       # Modelos Sequelize
│   │   ├── routes/       # Rutas API
│   │   └── utils/        # Utilidades
│   └── index.js
│
└── Frontend/         # Next.js 14 + React
    ├── src/
    │   ├── app/          # App Router
    │   ├── components/   # Componentes reutilizables
    │   ├── contexts/     # Contextos React
    │   ├── lib/          # Utilidades y servicios
    │   └── screens/      # Pantallas principales
    └── public/
```

## 🔐 Sistema de Autenticación

### Características
- **JWT Tokens** con expiración de 24 horas
- **SessionStorage** para almacenamiento seguro
- **Refresh automático** cada 5 minutos
- **Protección contra CSRF** y XSS
- **Logout con confirmación** vía SweetAlert2

### Componentes principales

#### 1. AuthContext (`/contexts/AuthContext.js`)
Contexto global para manejar el estado de autenticación:

```javascript
import { useAuth } from '@/contexts/AuthContext';

const MiComponente = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Cargando...</div>;
  
  return isAuthenticated ? (
    <p>Bienvenido, {user.Nombres}!</p>
  ) : (
    <p>Inicia sesión</p>
  );
};
```

#### 2. Servicio de autenticación (`/lib/auth.js`)

**Funciones disponibles:**

- `saveAuthToken(token, user)` - Guarda token y usuario en sessionStorage
- `getAuthToken()` - Obtiene token válido (verifica expiración)
- `getAuthUser()` - Obtiene información del usuario logueado
- `isAuthenticated()` - Verifica si hay sesión activa
- `clearAuth()` - Limpia datos de autenticación
- `logout()` - Cierra sesión con limpieza completa
- `getAuthHeaders()` - Obtiene headers para peticiones autenticadas
- `authenticatedFetch(url, options)` - Fetch con token automático
- `verifyToken()` - Verifica validez del token con el backend
- `setupAuthRefresh()` - Configura refresh automático cada 5min

**Uso básico:**

```javascript
import { authenticatedFetch } from '@/lib/auth';

// Petición autenticada automática
const response = await authenticatedFetch('/api/periodicos/add', {
  method: 'POST',
  body: JSON.stringify(datos)
});
```

#### 3. Modal de Login (`/components/features/login/ModalLogin.js`)

Modal con validación y manejo de errores:

```javascript
import ModalLogin from '@/components/features/login/ModalLogin';

const [showLogin, setShowLogin] = useState(false);

<ModalLogin 
  isOpen={showLogin} 
  onClose={() => setShowLogin(false)} 
/>
```

### Flujo de autenticación

1. **Login**:
   ```
   Usuario ingresa credenciales → POST /api/auth/login → 
   Recibe token JWT → Se guarda en sessionStorage → 
   Header muestra info del usuario
   ```

2. **Peticiones autenticadas**:
   ```
   Componente llama authenticatedFetch() → 
   Se agrega Bearer token automáticamente → 
   Backend valida token → Responde con datos
   ```

3. **Expiración de token**:
   ```
   Token expira (24h) → getAuthToken() retorna null → 
   authenticatedFetch() detecta 401 → Muestra alerta → 
   Redirige al login
   ```

4. **Logout**:
   ```
   Usuario click "Cerrar Sesión" → SweetAlert confirmación → 
   clearAuth() limpia sessionStorage → Header actualiza → 
   Redirige a home
   ```

### Protección de rutas

**Ejemplo de componente protegido:**

```javascript
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PaginaProtegida = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return null;

  return <div>Contenido protegido</div>;
};
```

### Seguridad

✅ **Implementado:**
- Token almacenado en sessionStorage (se borra al cerrar navegador)
- Expiración de 24 horas
- Validación de expiry en el cliente
- Headers automáticos con Bearer token
- Limpieza automática en logout
- Verificación de token con backend

⚠️ **Pendiente:**
- Implementación de refresh tokens
- Rate limiting en login
- 2FA (autenticación de dos factores)
- Password recovery completo

```

## 📊 Modelos de Datos

El sistema maneja 4 tipos principales de recursos bibliográficos:

### 1. Colección Durango (`coleccion_durango`)
**Campos:** Letra, Titulo, Autor, Año, Editorial, Edición, ISBN, Ejemplares, Fecha_de_creacion, Status

**Endpoints:**
- `GET /api/coleccionDurango` - Listar con paginación y filtros
- `POST /api/coleccionDurango` - Crear nuevo registro
- `GET /api/coleccionDurango/:id` - Obtener por ID
- `PUT /api/coleccionDurango/:id` - Actualizar registro
- `PATCH /api/coleccionDurango/:id/deactivate` - Desactivar (soft delete)
- `PATCH /api/coleccionDurango/:id/restore` - Restaurar registro

### 2. Libros (`libros`)
**Campos:** MFN, Idioma, Autor, Autor_Corporativo, Autor_Uniforme, Titulo, Edicion, Lugar_Publicacion, Descripcion, Serie, Notas, Encuadernado_con, Bibliografia, Contenido, Tema_general, Coautor_personal, Memorico_2020, Memorico_2024, Coleccion, Fecha_de_creacion, Status

**Endpoints:** Similar estructura a Colección Durango

### 3. Periódicos (`periodicos`)
**Campos:** Titulo, Año, Tomo, Observaciones, Fecha_de_creacion, Status

**Endpoints:** Similar estructura a Colección Durango

### 4. Diario Oficial (`diario_oficial`)
**Campos:** Año, Tomo, Periodo, Fecha_de_creacion, Status

**Endpoints:** Similar estructura a Colección Durango

### 5. Usuarios y Roles
**Tablas:** `usuarios`, `roles`, `rol_usuarios`

**Endpoints de Autenticación:**
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario
- `POST /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `GET /api/auth/users` - Listar usuarios (admin)
- `PATCH /api/auth/users/:id/deactivate` - Desactivar usuario
- `PATCH /api/auth/users/:id/restore` - Restaurar usuario

**Endpoints de Roles:**
- `GET /api/roles` - Listar roles
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol
- `POST /api/roles/assign` - Asignar rol a usuario
- `DELETE /api/roles/remove` - Quitar rol de usuario

## 🎨 UX/UI

### SweetAlert2
Todas las confirmaciones usan SweetAlert2 con tema personalizado:

```javascript
Swal.fire({
  title: '¿Estás seguro?',
  text: 'Esta acción no se puede deshacer',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#801530', // Color corporativo
  cancelButtonColor: '#6c757d',
  confirmButtonText: 'Sí, eliminar',
  cancelButtonText: 'Cancelar'
});
```

### Toast Notifications (Sonner)
Para notificaciones no intrusivas:

```javascript
import { toast } from 'sonner';

toast.success('Registro eliminado correctamente');
toast.error('Error al procesar la solicitud');
toast.info('Función en desarrollo');
```

## 📦 Requisitos Previos

### Software Necesario
- **Node.js** v18 o superior
- **npm** v9 o superior
- **MySQL** v8.0 o superior
- **Redis** v6 o superior (para BullMQ y colas de email)
- **Git** (para control de versiones)

### Servicios Externos
- Cuenta de Gmail con contraseña de aplicación (para envío de emails)

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/DiegoDaher/TCA_APP.git
cd TCA_APP
```

### 2. Configurar Backend

#### Instalar Dependencias
```bash
cd backend
npm install
```

#### Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `backend/`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_NAME=tca_bd
DB_PORT=3306

# Application Port
PORT_APP=3000

# JWT Configuration
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Environment
NODE_ENV=production

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

#### Crear Base de Datos
```sql
CREATE DATABASE tca_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ejecutar el script SQL `database_update.sql` para crear las tablas necesarias.

#### Iniciar Servidor Backend
```bash
npm run dev    # Modo desarrollo con nodemon
# o
npm start      # Modo producción
```

El backend estará disponible en `http://localhost:3000`

### 3. Configurar Frontend

#### Instalar Dependencias
```bash
cd Frontend
npm install
```

#### Configurar Variables de Entorno
Crear archivo `.env.local` en la carpeta `Frontend/`:

```env
# API Configuration
NEXT_PUBLIC_API_HOST=http://localhost:3000
```

#### Iniciar Aplicación Frontend
```bash
npm run dev    # Modo desarrollo
```

El frontend estará disponible en `http://localhost:5000`

### 4. Iniciar Redis (para colas de email)
```bash
# Windows (con Redis instalado)
redis-server

# Linux/Mac
redis-server
```

## 🔧 Estructura Detallada del Proyecto

### Backend (`/backend`)
```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Configuración de Sequelize y MySQL
│   │   ├── mailer.js          # Configuración de Nodemailer
│   │   └── redis.js           # Configuración de Redis
│   │
│   ├── controllers/
│   │   ├── authController.js          # Autenticación y usuarios
│   │   ├── rolesController.js         # Gestión de roles
│   │   ├── librosController.js        # CRUD de libros
│   │   ├── periodicosController.js    # CRUD de periódicos
│   │   ├── diarioOficialController.js # CRUD de diario oficial
│   │   ├── coleccionDurangoController.js  # CRUD de colección
│   │   └── auditoriasController.js    # Registro de auditorías
│   │
│   ├── middleware/
│   │   └── authMiddleware.js  # Verificación de JWT y roles
│   │
│   ├── models/
│   │   ├── userModel.js               # Modelo de usuarios
│   │   ├── rolesModel.js              # Modelo de roles
│   │   ├── rolUsuariosModel.js        # Relación usuarios-roles
│   │   ├── librosModel.js             # Modelo de libros
│   │   ├── periodicosModel.js         # Modelo de periódicos
│   │   ├── diarioOficialModel.js      # Modelo de diario oficial
│   │   ├── coleccionDurangoModel.js   # Modelo de colección
│   │   └── auditoriasModel.js         # Modelo de auditorías
│   │
│   ├── routes/
│   │   ├── authRoutes.js              # Rutas de autenticación
│   │   ├── rolesRoutes.js             # Rutas de roles
│   │   ├── librosRoutes.js            # Rutas de libros
│   │   ├── periodicosRoutes.js        # Rutas de periódicos
│   │   ├── diarioOficialRoutes.js     # Rutas de diario oficial
│   │   ├── coleccionDurangoRoutes.js  # Rutas de colección
│   │   └── auditoriasRoutes.js        # Rutas de auditorías
│   │
│   ├── queues/
│   │   └── emailQueue.js      # Configuración de BullMQ
│   │
│   ├── workers/
│   │   └── emailWorker.js     # Procesador de cola de emails
│   │
│   └── utils/
│       └── generatePassword.js # Generador de contraseñas
│
├── index.js              # Punto de entrada del servidor
├── package.json          # Dependencias del backend
├── .env                  # Variables de entorno (no versionar)
└── README.md             # Documentación específica del backend
```

### Frontend (`/Frontend`)
```
Frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.js           # Layout principal
│   │   ├── page.js             # Página de inicio
│   │   ├── globals.css         # Estilos globales
│   │   │
│   │   ├── api/                # Rutas API proxy
│   │   │   └── [endpoint]/
│   │   │
│   │   ├── usuarios/           # Gestión de usuarios
│   │   │   └── page.js
│   │   │
│   │   ├── libros/             # Gestión de libros
│   │   │   └── page.js
│   │   │
│   │   ├── periodicos/         # Gestión de periódicos
│   │   │   └── page.js
│   │   │
│   │   ├── diario-oficial/     # Gestión de diario oficial
│   │   │   └── page.js
│   │   │
│   │   ├── coleccion/          # Gestión de colección Durango
│   │   │   └── page.js
│   │   │
│   │   ├── agregados/          # Vista de registros agregados
│   │   │   └── page.js
│   │   │
│   │   ├── eliminados/         # Vista de registros eliminados
│   │   │   └── page.js
│   │   │
│   │   └── unauthorized/       # Página de acceso no autorizado
│   │       └── page.js
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── RoleProtectedRoute.js  # Protección por roles
│   │   │
│   │   ├── features/
│   │   │   ├── login/
│   │   │   │   ├── ModalLogin.js
│   │   │   │   ├── ModalChangePassword.js
│   │   │   │   └── ModalForgotPassword.js
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── ModalAgregarUsuario.js
│   │   │   │   ├── ModalEditarUsuario.js
│   │   │   │   └── ModalVerUsuario.js
│   │   │   │
│   │   │   ├── Libros/
│   │   │   │   ├── ModalAgregarLibros.js
│   │   │   │   ├── ModalEditarLibros.js
│   │   │   │   └── ModalVerLibros.js
│   │   │   │
│   │   │   ├── Periodicos/
│   │   │   │   ├── ModalAgregarPeriodicos.js
│   │   │   │   ├── ModalEditarPeriodicos.js
│   │   │   │   └── ModalVerPeriodicos.js
│   │   │   │
│   │   │   ├── DiarioOficial/
│   │   │   │   ├── ModalAgregarDiarioOficial.js
│   │   │   │   ├── ModalEditarDiarioOficial.js
│   │   │   │   └── ModalVerDiarioOficial.js
│   │   │   │
│   │   │   └── coleccionDurango/
│   │   │       ├── ModalAgregarColeccionDurango.js
│   │   │       ├── ModalEditarColeccionDurango.js
│   │   │       └── ModalVerColeccionDurango.js
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.js          # Header con login y logout
│   │   │   ├── HeaderSon.js       # Sub-header con búsqueda
│   │   │   ├── MainLayout.js      # Layout con sidebar
│   │   │   ├── Sidebar.js         # Navegación lateral
│   │   │   └── SearchBar.js       # Barra de búsqueda
│   │   │
│   │   ├── ui/                    # Componentes shadcn/ui
│   │   │   ├── button.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── input.jsx
│   │   │   ├── select.jsx
│   │   │   └── ...
│   │   │
│   │   └── DataTableClient.jsx    # Tabla de datos reutilizable
│   │
│   ├── contexts/
│   │   └── AuthContext.js         # Context de autenticación global
│   │
│   ├── lib/
│   │   ├── auth.js                # Utilidades de autenticación
│   │   └── utils.js               # Utilidades generales
│   │
│   └── screens/                   # Pantallas (estructura legacy)
│
├── public/                         # Archivos estáticos
├── package.json                    # Dependencias del frontend
├── .env.local                      # Variables de entorno (no versionar)
├── components.json                 # Configuración de shadcn/ui
├── tailwind.config.js              # Configuración de Tailwind
├── next.config.mjs                 # Configuración de Next.js
└── README.md                       # Documentación específica del frontend
```

## 📚 Guía de Escalamiento

### Backend

#### 1. Base de Datos
**Optimizaciones actuales:**
- Índices en campos de búsqueda frecuente
- Soft deletes con campo `Status`
- Paginación en todas las consultas

**Para escalar:**
- Implementar índices compuestos para búsquedas complejas
- Considerar particionamiento de tablas grandes
- Implementar read replicas para separar lectura/escritura
- Migrar a base de datos más robusta (PostgreSQL) si es necesario
- Implementar caché con Redis para consultas frecuentes

#### 2. Autenticación
**Para mejorar:**
- Implementar refresh tokens
- Rate limiting con express-rate-limit
- Agregar 2FA (Two-Factor Authentication)
- Implementar OAuth2 para integraciones externas
- Agregar blacklist de tokens en Redis

#### 3. API
**Optimizaciones:**
- Implementar compresión de respuestas (gzip)
- Agregar versionado de API (`/api/v1`, `/api/v2`)
- Implementar GraphQL para consultas más eficientes
- Agregar documentación con Swagger/OpenAPI
- Implementar rate limiting por usuario/IP

#### 4. Colas y Workers
**Actual:** BullMQ para emails

**Para escalar:**
- Separar workers en procesos independientes
- Implementar múltiples workers para procesamiento paralelo
- Agregar colas para otras tareas (reportes, notificaciones, exports)
- Monitoreo de colas con Bull Board
- Implementar reintentos y dead letter queues

#### 5. Monitoreo y Logs
**Para implementar:**
- Winston o Pino para logging estructurado
- PM2 para gestión de procesos en producción
- Sentry para tracking de errores
- New Relic o DataDog para APM
- Prometheus + Grafana para métricas

### Frontend

#### 1. Rendimiento
**Optimizaciones a implementar:**
- Lazy loading de componentes pesados
- Virtualización de listas largas con `react-window`
- Optimización de imágenes con Next.js Image
- Implementar Service Workers para PWA
- Code splitting más granular

#### 2. Estado Global
**Actual:** Context API

**Para escalar:**
- Migrar a Redux Toolkit o Zustand para estado más complejo
- Implementar React Query para caché de datos del servidor
- SWR para revalidación automática

#### 3. SEO y Accesibilidad
**Para mejorar:**
- Agregar metadata dinámica
- Implementar sitemap.xml
- Mejorar accesibilidad ARIA
- Agregar soporte multi-idioma (i18n)

#### 4. Testing
**Para implementar:**
- Jest para unit tests
- React Testing Library para componentes
- Cypress o Playwright para E2E testing
- Storybook para documentación de componentes

### Infraestructura

#### Deployment Actual
- Backend: Node.js standalone
- Frontend: Next.js standalone
- Base de datos: MySQL local
- Redis: Local

#### Para Producción
**Opción 1: VPS/Servidor Dedicado**
- Nginx como reverse proxy
- PM2 para gestión de procesos Node.js
- SSL con Let's Encrypt
- Backups automáticos de MySQL

**Opción 2: Cloud (Recomendado)**
- **Backend:** AWS Elastic Beanstalk, Heroku, o Railway
- **Frontend:** Vercel (optimizado para Next.js) o Netlify
- **Base de datos:** AWS RDS, Google Cloud SQL, o PlanetScale
- **Redis:** Redis Cloud, AWS ElastiCache
- **Storage:** AWS S3 para archivos estáticos/uploads
- **CDN:** CloudFlare para caché global

**Opción 3: Containerización (Escalable)**
- Docker para ambos servicios
- Docker Compose para desarrollo
- Kubernetes para producción (alta disponibilidad)
- CI/CD con GitHub Actions o GitLab CI

### Seguridad en Producción

**Checklist:**
- [ ] HTTPS obligatorio
- [ ] Variables de entorno seguras
- [ ] Rate limiting implementado
- [ ] SQL injection protection (Sequelize ya lo hace)
- [ ] XSS protection headers
- [ ] CSRF tokens
- [ ] Content Security Policy
- [ ] Helmet.js en Express
- [ ] Auditorías de dependencias (`npm audit`)
- [ ] Backups automáticos de BD
- [ ] Logs de seguridad

## 🧪 Desarrollo

### Agregar un Nuevo Recurso

#### 1. Backend

**Crear Modelo (`src/models/nuevoModel.js`)**
```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Nuevo = sequelize.define('Nuevo', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // ... otros campos
  Status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  timestamps: false,
  tableName: 'nuevo',
});

export default Nuevo;
```

**Crear Controlador (`src/controllers/nuevoController.js`)**
```javascript
import Nuevo from '../models/nuevoModel.js';

export const create = async (req, res) => {
  // Lógica de creación
};

export const getAll = async (req, res) => {
  // Lógica de listado con paginación
};

export const getById = async (req, res) => {
  // Lógica de detalle
};

export const update = async (req, res) => {
  // Lógica de actualización
};

export const deactivate = async (req, res) => {
  // Soft delete
};

export const restore = async (req, res) => {
  // Restaurar
};
```

**Crear Rutas (`src/routes/nuevoRoutes.js`)**
```javascript
import express from 'express';
import * as nuevoController from '../controllers/nuevoController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, nuevoController.create);
router.get('/', authenticateToken, nuevoController.getAll);
router.get('/:id', authenticateToken, nuevoController.getById);
router.put('/:id', authenticateToken, nuevoController.update);
router.patch('/:id/deactivate', authenticateToken, nuevoController.deactivate);
router.patch('/:id/restore', authenticateToken, nuevoController.restore);

export default router;
```

**Registrar Rutas (`index.js`)**
```javascript
import nuevoRoutes from './src/routes/nuevoRoutes.js';
app.use('/api/nuevo', nuevoRoutes);
```

#### 2. Frontend

**Crear Página (`src/app/nuevo/page.js`)**
```javascript
'use client';
import { useState, useEffect } from 'react';
import DataTableClient from '@/components/DataTableClient';
import HeaderSon from '@/components/layout/HeaderSon';

export default function NuevoPage() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <HeaderSon
        title="Nuevo"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showAddButton={true}
        onAddClick={() => {/* Abrir modal */}}
      />
      <DataTableClient
        data={data}
        endpoint="nuevo"
        // ... configuración
      />
    </>
  );
}
```

**Crear Modales**
- `ModalAgregarNuevo.js`
- `ModalEditarNuevo.js`
- `ModalVerNuevo.js`

### Comandos Útiles

```bash
# Backend
npm run dev          # Iniciar en desarrollo
npm start            # Iniciar en producción
npm audit            # Verificar vulnerabilidades

# Frontend
npm run dev          # Iniciar en desarrollo
npm run build        # Build para producción
npm run lint         # Ejecutar linter
npm run start        # Iniciar build de producción

# Base de datos
mysql -u root -p < database_update.sql  # Ejecutar script SQL

# Redis
redis-cli            # Cliente de Redis
redis-cli FLUSHALL   # Limpiar toda la caché
```

## 📝 Convenciones de Código

### Naming Conventions
- **Archivos:** camelCase para JS, PascalCase para componentes React
- **Variables:** camelCase
- **Constantes:** UPPER_SNAKE_CASE
- **Componentes React:** PascalCase
- **Funciones:** camelCase
- **Clases:** PascalCase

### Git Workflow
```bash
# Crear rama para nueva feature
git checkout -b feature/nombre-feature

# Commits descriptivos
git commit -m "feat: agregar CRUD de nuevo recurso"
git commit -m "fix: corregir validación en formulario"
git commit -m "docs: actualizar README con instrucciones"

# Push y Pull Request
git push origin feature/nombre-feature
```

## 📄 Licencia

Este proyecto es privado y pertenece a [Tu Organización].

## 👥 Contribuidores

- Diego Daher - Desarrollador Principal

## 📞 Soporte

Para preguntas o soporte, contactar a: [tu-email@dominio.com]

---

**Última actualización:** Diciembre 2025

Ver `backend/AUTH_README.md` para credenciales de testing.

## 🛠️ Tecnologías

**Backend:**
- Node.js + Express
- Sequelize ORM
- MySQL
- Redis
- JWT
- bcrypt

**Frontend:**
- Next.js 14 (App Router)
- React 18
- SweetAlert2
- Sonner
- Tailwind CSS
- shadcn/ui

## 📖 Documentación adicional

- `backend/AUTH_README.md` - Documentación del sistema de autenticación backend
- `Frontend/BUSQUEDA_AVANZADA.md` - Sistema de búsqueda
- `Frontend/API_DINAMICA_COLUMNAS.md` - API de columnas dinámicas
- `Frontend/SISTEMA_BUSQUEDA_MEJORADO.md` - Mejoras del buscador
- `Frontend/src/lib/authExamples.js` - Ejemplos de uso de autenticación

## 🤝 Contribuciones

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.
