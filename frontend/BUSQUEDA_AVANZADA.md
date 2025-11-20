# 🔍 Sistema de Búsqueda Avanzada - Libros

## 📋 Resumen de Implementación

Se ha implementado un sistema de búsqueda avanzada en la página de Libros que permite:
- ✅ Búsqueda simple en la página actual (filtrado local)
- ✅ Búsqueda avanzada en TODOS los registros del backend
- ✅ Selección de columna específica para buscar
- ✅ Búsqueda solo se ejecuta al hacer clic en el botón

## 🗂️ Archivos Modificados/Creados

### 1. HeaderSon.js (Modificado)
**Ruta:** `src/components/layout/HeaderSon.js`

**Nuevas Props:**
```javascript
{
  title: string,                    // Título del header
  searchTerm: string,               // Término de búsqueda
  setSearchTerm: function,          // Función para actualizar el término
  showAdvancedFilter: boolean,      // Mostrar/ocultar filtro avanzado
  columnsEndpoint: string,          // Endpoint para obtener columnas
  onSearch: function               // Callback al buscar
}
```

### 2. SearchBar.js (Modificado)
**Ruta:** `src/components/layout/SearchBar.js`

**Características:**
- Combobox de columnas disponibles
- Botón de búsqueda que ejecuta query solo al hacer clic
- Búsqueda en todos los registros cuando se usa el filtro avanzado
- Búsqueda local cuando no se selecciona columna

### 3. Libros.js (Modificado)
**Ruta:** `src/screens/main/Libros.js`

**Cambios:**
- Integración del filtro avanzado
- Función `handleAdvancedSearch` para manejar búsquedas
- Estado `isSearching` para controlar el modo de búsqueda
- Soporte para búsqueda con columna específica

### 4. API Routes (Creados/Modificados)

#### `/api/libros/route.js` (Modificado)
Ahora acepta parámetros adicionales:
```
GET /api/libros?page=1&limit=10&column=Titulo&value=Cien%20años
```

**Parámetros:**
- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 10)
- `column`: Columna donde buscar (opcional)
- `value`: Valor a buscar (opcional)

#### `/api/libros/columns/route.js` (Eliminado - Reemplazado por ruta dinámica)

#### `/api/[endpoint]/columns/route.js` (Creado - RUTA DINÁMICA)
**Endpoint genérico para obtener columnas de cualquier recurso**

Funciona para cualquier endpoint:
- `/api/libros/columns` → Hace proxy a `${BACKEND}/api/libros/columns`
- `/api/revistas/columns` → Hace proxy a `${BACKEND}/api/revistas/columns`
- `/api/auditoria/columns` → Hace proxy a `${BACKEND}/api/auditoria/columns`

**Respuesta del backend esperada:**
```json
{
  "message": "Columnas disponibles obtenidas exitosamente",
  "columns": [
    "MFN",
    "Id",
    "Idioma",
    "Autor",
    "Titulo",
    "Edicion",
    "..."
  ]
}
```


## 🎯 Flujo de Búsqueda

### Búsqueda Simple (Sin columna seleccionada)
1. Usuario escribe en la barra de búsqueda
2. Hace clic en el botón de búsqueda o presiona Enter
3. Se filtran los registros de la **página actual** localmente
4. No se hace petición al backend

### Búsqueda Avanzada (Con columna seleccionada)
1. Usuario escribe en la barra de búsqueda
2. Selecciona una columna del combobox
3. Hace clic en "Buscar en todos los registros"
4. Se ejecuta la petición al backend:
   ```
   GET /api/libros?page=1&limit=10&column=Titulo&value=texto
   ```
5. El backend busca en **TODOS los registros** (no solo la página actual)
6. Se muestran los resultados paginados

## 🔄 Estados y Comportamiento

### Estado `isSearching`
- `false`: Modo normal - paginación estándar
- `true`: Modo búsqueda - mantiene los parámetros de búsqueda

### Navegación de Páginas
- En modo normal: carga todas las páginas normalmente
- En modo búsqueda: mantiene los filtros al cambiar de página

## 📝 Ejemplo de Uso Completo

```javascript
// En Libros.js
<HeaderSon 
  title="Libros" 
  searchTerm={searchTerm} 
  setSearchTerm={setSearchTerm}
  showAdvancedFilter={true}                    // Activar filtro avanzado
  columnsEndpoint="/api/libros/columns"        // Endpoint de columnas
  onSearch={handleAdvancedSearch}              // Función de búsqueda
/>
```

## 🎨 UI del Filtro Avanzado

Cuando `showAdvancedFilter={true}`:
```
┌─────────────────────────────────────────────────────────┐
│  [🔍 Barra de búsqueda...        ]  [🔍]  [≡]          │
├─────────────────────────────────────────────────────────┤
│  Buscar en: [Seleccionar columna ▼]  [Buscar en todos] │
└─────────────────────────────────────────────────────────┘
```

## ⚙️ Configuración del Backend

El backend debe soportar estos parámetros en el endpoint `/api/libros`:

```
GET /api/libros?page=1&limit=5&column=Titulo&value=Cien%20años%20de%20soledad
```

**Respuesta esperada:**
```json
{
  "data": [
    {
      "Id": 1,
      "Titulo": "Cien años de soledad",
      "Periodo": "...",
      "Año": "1967"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalRecords": 50
  }
}
```

## 🚀 Próximos Pasos

Si necesitas agregar el filtro avanzado a otras pantallas (Agregados, Revistas, etc.):

1. Usa el mismo patrón en HeaderSon
2. Crea el endpoint `/api/{recurso}/columns`
3. Implementa la función `handleAdvancedSearch`
4. Actualiza la API route para soportar `column` y `value`

## 🐛 Solución de Problemas

### El combobox no carga columnas
- Verifica que el endpoint `/api/libros/columns` responda correctamente
- Revisa la consola del navegador para errores

### La búsqueda no funciona
- Asegúrate que el backend soporte los parámetros `column` y `value`
- Verifica que la API devuelva resultados en el formato esperado

### Los resultados no se actualizan
- Revisa que `handleAdvancedSearch` esté correctamente pasado a HeaderSon
- Verifica el estado `isSearching` en la consola
