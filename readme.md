# TCA - Sistema de Acervo Bibliográfico

Sistema para la gestión de acervos bibliográficos que incluye colecciones, libros, periódicos y el diario oficial.

## 🏗️ Arquitectura

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

## 📊 Tipos de Tablas

### 1. Colección Durango (`coleccion_durango`)
- Endpoint: `/api/coleccionDurango/`
- Modales: Ver, Editar
- Campos: Titulo, Autor, Año, Editorial, etc.

### 2. Libros (`libros`)
- Endpoint: `/api/libros/`
- Modales: Ver, Editar
- Campos: Titulo, Autor, Año_Publicacion, ISBN, etc.

### 3. Periódicos (`periodicos`)
- Endpoint: `/api/periodicos/`
- Modales: Ver, Editar
- Campos: Titulo, Año, Tomo, Numero, etc.

### 4. Diario Oficial (`diario_oficial`)
- Endpoint: `/api/diario-oficial/`
- Modales: Ver, Editar
- Campos: Fecha_Publicacion, Numero, Contenido, etc.

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

## 🚀 Instalación

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 📝 Credenciales de prueba

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
