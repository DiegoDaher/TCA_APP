# API de Roles y Asignaciones de Roles

Esta documentación describe los endpoints disponibles para la gestión de roles y asignaciones de roles a usuarios.

## Índice
- [Autenticación](#autenticación)
- [Gestión de Roles](#gestión-de-roles)
- [Asignación de Roles a Usuarios](#asignación-de-roles-a-usuarios)
- [Consultas y Verificaciones](#consultas-y-verificaciones)

---

## Autenticación

Todos los endpoints requieren autenticación mediante token JWT en el header:

```
Authorization: Bearer <token>
```

---

## Gestión de Roles

### 1. Crear Rol

**Endpoint:** `POST /api/roles`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "nombre": "Administrador",
  "slug": "administrador",
  "descripcion": "Usuario con acceso completo al sistema"
}
```

**Campos:**
- `nombre` (string, requerido): Nombre descriptivo del rol
- `slug` (string, requerido): Identificador único en formato slug (e.g., "administrador", "editor")
- `descripcion` (string, opcional): Descripción del rol

**Response 201 - Éxito:**
```json
{
  "message": "Rol creado exitosamente",
  "role": {
    "id": 1,
    "nombre": "Administrador",
    "slug": "administrador",
    "descripcion": "Usuario con acceso completo al sistema",
    "creado_en": "2025-11-19T12:00:00.000Z",
    "actualizado_en": null
  }
}
```

**Response 400 - Error de validación:**
```json
{
  "error": "Los campos nombre y slug son obligatorios."
}
```

---

### 2. Obtener Todos los Roles

**Endpoint:** `GET /api/roles`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response 200 - Éxito:**
```json
{
  "message": "Roles obtenidos exitosamente",
  "roles": [
    {
      "id": 1,
      "nombre": "Administrador",
      "slug": "administrador",
      "descripcion": "Usuario con acceso completo al sistema",
      "creado_en": "2025-11-19T12:00:00.000Z",
      "actualizado_en": null
    },
    {
      "id": 2,
      "nombre": "Editor",
      "slug": "editor",
      "descripcion": "Usuario que puede editar contenido",
      "creado_en": "2025-11-19T12:00:00.000Z",
      "actualizado_en": null
    }
  ]
}
```

---

### 3. Obtener Rol por ID

**Endpoint:** `GET /api/roles/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Parámetros URL:**
- `id` (number): ID del rol

**Ejemplo:** `GET /api/roles/1`

**Response 200 - Éxito:**
```json
{
  "message": "Rol obtenido exitosamente",
  "role": {
    "id": 1,
    "nombre": "Administrador",
    "slug": "administrador",
    "descripcion": "Usuario con acceso completo al sistema",
    "creado_en": "2025-11-19T12:00:00.000Z",
    "actualizado_en": null
  }
}
```

**Response 404 - No encontrado:**
```json
{
  "error": "Rol no encontrado"
}
```

---

### 4. Actualizar Rol

**Endpoint:** `PUT /api/roles/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Parámetros URL:**
- `id` (number): ID del rol

**Body:**
```json
{
  "nombre": "Super Administrador",
  "descripcion": "Usuario con todos los privilegios"
}
```

**Campos (todos opcionales):**
- `nombre` (string): Nuevo nombre del rol
- `slug` (string): Nuevo slug del rol
- `descripcion` (string): Nueva descripción

**Response 200 - Éxito:**
```json
{
  "message": "Rol actualizado exitosamente",
  "role": {
    "id": 1,
    "nombre": "Super Administrador",
    "slug": "administrador",
    "descripcion": "Usuario con todos los privilegios",
    "creado_en": "2025-11-19T12:00:00.000Z",
    "actualizado_en": "2025-11-19T14:30:00.000Z"
  }
}
```

**Response 404 - No encontrado:**
```json
{
  "error": "Rol no encontrado"
}
```

---

### 5. Eliminar Rol

**Endpoint:** `DELETE /api/roles/:id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Parámetros URL:**
- `id` (number): ID del rol

**Ejemplo:** `DELETE /api/roles/1`

**Response 200 - Éxito:**
```json
{
  "message": "Rol eliminado exitosamente"
}
```

**Response 400 - Rol en uso:**
```json
{
  "error": "No se puede eliminar el rol. Está asignado a 5 usuario(s)."
}
```

**Response 404 - No encontrado:**
```json
{
  "error": "Rol no encontrado"
}
```

---

## Asignación de Roles a Usuarios

### 6. Asignar Rol a Usuario

**Endpoint:** `POST /api/roles/assign`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "usuario_id": 42,
  "rol_id": 1,
  "asignado_por": 1
}
```

**Campos:**
- `usuario_id` (number, requerido): ID del usuario al que se asignará el rol
- `rol_id` (number, requerido): ID del rol a asignar
- `asignado_por` (number, opcional): ID del usuario que realiza la asignación

**Nota:** Usa `INSERT ... ON DUPLICATE KEY UPDATE`, por lo que actualiza el timestamp si la asignación ya existe.

**Response 201 - Rol asignado (nuevo):**
```json
{
  "message": "Rol asignado exitosamente",
  "assignment": {
    "usuario_id": 42,
    "rol_id": 1,
    "asignado_por": 1,
    "asignado_en": "2025-11-19T12:00:00.000Z"
  }
}
```

**Response 200 - Asignación actualizada (ya existía):**
```json
{
  "message": "Asignación de rol actualizada",
  "assignment": {
    "usuario_id": 42,
    "rol_id": 1,
    "asignado_por": 1,
    "asignado_en": "2025-11-19T14:30:00.000Z"
  }
}
```

**Response 404 - Usuario no encontrado:**
```json
{
  "error": "Usuario no encontrado"
}
```

**Response 404 - Rol no encontrado:**
```json
{
  "error": "Rol no encontrado"
}
```

---

### 7. Quitar Rol de Usuario

**Endpoint:** `DELETE /api/roles/remove`

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "usuario_id": 42,
  "rol_id": 1
}
```

**Campos:**
- `usuario_id` (number, requerido): ID del usuario
- `rol_id` (number, requerido): ID del rol a remover

**Response 200 - Éxito:**
```json
{
  "message": "Rol removido exitosamente del usuario"
}
```

**Response 404 - No encontrado:**
```json
{
  "error": "Asignación de rol no encontrada"
}
```

---

## Consultas y Verificaciones

### 8. Obtener Roles de un Usuario

**Endpoint:** `GET /api/roles/user/:usuario_id`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Parámetros URL:**
- `usuario_id` (number): ID del usuario

**Ejemplo:** `GET /api/roles/user/42`

**Response 200 - Éxito:**
```json
{
  "message": "Roles del usuario obtenidos exitosamente",
  "usuario_id": "42",
  "roles": [
    {
      "id": 1,
      "nombre": "Administrador",
      "slug": "administrador",
      "descripcion": "Usuario con acceso completo al sistema",
      "asignado_en": "2025-11-19T12:00:00"
    },
    {
      "id": 2,
      "nombre": "Editor",
      "slug": "editor",
      "descripcion": "Usuario que puede editar contenido",
      "asignado_en": "2025-11-19T13:00:00"
    }
  ]
}
```

**Response 404 - Usuario no encontrado:**
```json
{
  "error": "Usuario no encontrado"
}
```

---

### 9. Obtener Usuarios por Rol

**Endpoint:** `GET /api/roles/users-by-role/:slug`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Parámetros URL:**
- `slug` (string): Slug del rol

**Ejemplo:** `GET /api/roles/users-by-role/editor`

**Response 200 - Éxito:**
```json
{
  "message": "Usuarios con el rol obtenidos exitosamente",
  "role": {
    "id": 2,
    "nombre": "Editor",
    "slug": "editor"
  },
  "users": [
    {
      "Id": 42,
      "Nombres": "Juan",
      "Apellidos": "Pérez",
      "Correo_Electronico": "juan.perez@example.com",
      "asignado_en": "2025-11-19T12:00:00"
    },
    {
      "Id": 43,
      "Nombres": "María",
      "Apellidos": "García",
      "Correo_Electronico": "maria.garcia@example.com",
      "asignado_en": "2025-11-19T13:00:00"
    }
  ]
}
```

**Response 404 - Rol no encontrado:**
```json
{
  "error": "Rol no encontrado"
}
```

---

### 10. Verificar si Usuario Tiene un Rol

**Endpoint:** `GET /api/roles/check/:usuario_id/:slug`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Parámetros URL:**
- `usuario_id` (number): ID del usuario
- `slug` (string): Slug del rol a verificar

**Ejemplo:** `GET /api/roles/check/42/administrador`

**Response 200 - Usuario tiene el rol:**
```json
{
  "message": "Verificación completada",
  "usuario_id": "42",
  "slug": "administrador",
  "tiene_rol": true
}
```

**Response 200 - Usuario NO tiene el rol:**
```json
{
  "message": "Verificación completada",
  "usuario_id": "42",
  "slug": "editor",
  "tiene_rol": false
}
```

**Response 404 - Usuario no encontrado:**
```json
{
  "error": "Usuario no encontrado"
}
```

---

### 11. Listar Usuarios con Conteo de Roles

**Endpoint:** `GET /api/roles/users/role-count`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response 200 - Éxito:**
```json
{
  "message": "Usuarios con cantidad de roles obtenidos exitosamente",
  "users": [
    {
      "usuario_id": 1,
      "Nombres": "Admin",
      "Apellidos": "Principal",
      "Correo_Electronico": "admin@example.com",
      "cantidad_roles": "3"
    },
    {
      "usuario_id": 42,
      "Nombres": "Juan",
      "Apellidos": "Pérez",
      "Correo_Electronico": "juan.perez@example.com",
      "cantidad_roles": "2"
    },
    {
      "usuario_id": 50,
      "Nombres": "Pedro",
      "Apellidos": "López",
      "Correo_Electronico": "pedro.lopez@example.com",
      "cantidad_roles": "0"
    }
  ]
}
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Error de validación o solicitud incorrecta |
| 401 | No autenticado o token inválido |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Ejemplos de Uso con cURL

### Crear un rol
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Editor",
    "slug": "editor",
    "descripcion": "Usuario que puede editar contenido"
  }'
```

### Asignar rol a usuario
```bash
curl -X POST http://localhost:3000/api/roles/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 42,
    "rol_id": 1,
    "asignado_por": 1
  }'
```

### Obtener roles de un usuario
```bash
curl -X GET http://localhost:3000/api/roles/user/42 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verificar si usuario tiene un rol
```bash
curl -X GET http://localhost:3000/api/roles/check/42/administrador \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints requieren un token JWT válido.
2. **Duplicados**: La asignación de roles usa `upsert`, por lo que no genera error si intentas asignar un rol que ya tiene el usuario; simplemente actualiza el timestamp.
3. **Eliminación de roles**: No puedes eliminar un rol que esté asignado a usuarios. Primero debes remover todas las asignaciones.
4. **Slugs únicos**: Los slugs de roles deben ser únicos y se usan para identificar roles de manera más legible que con IDs.
5. **Timestamps automáticos**: Los campos `creado_en`, `actualizado_en` y `asignado_en` se manejan automáticamente.

---

## Estructura de Datos

### Tabla `roles`
```sql
{
  id: BIGINT UNSIGNED (PK, AUTO_INCREMENT),
  nombre: VARCHAR(100) NOT NULL,
  slug: VARCHAR(100) NOT NULL UNIQUE,
  descripcion: VARCHAR(255) NULL,
  creado_en: TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en: TIMESTAMP NULL
}
```

### Tabla `rolUsuarios`
```sql
{
  usuario_id: INT (PK, FK -> usuarios.Id),
  rol_id: BIGINT UNSIGNED (PK, FK -> roles.id),
  asignado_por: INT NULL (FK -> usuarios.Id),
  asignado_en: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}
```
