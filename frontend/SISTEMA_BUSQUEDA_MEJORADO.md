# 🔍 Sistema de Búsqueda Mejorado - Frontend

## 📋 Resumen

El sistema de búsqueda ahora tiene dos modos:
1. **Búsqueda Local**: Filtra registros de la página actual mientras escribes (sin petición al servidor)
2. **Búsqueda Global**: Busca en TODOS los registros del servidor al presionar Enter con columna seleccionada

---

## 🎯 Flujos de Búsqueda

### 1️⃣ Búsqueda Local (mientras escribes)
```
Usuario escribe "prueba" en la barra
           ↓
handleLocalSearch() se ejecuta
           ↓
Filtra localmente en allItems (página actual)
           ↓
Actualiza filteredItems (sin petición HTTP)
           ↓
La tabla se actualiza instantáneamente
```

**Características:**
- ✅ Instantáneo (sin delay de red)
- ✅ Busca en todos los campos visibles
- ✅ Solo en los registros de la página actual
- ❌ No requiere seleccionar columna
- ❌ No hace petición al servidor

### 2️⃣ Búsqueda Global (Enter + Columna)
```
Usuario escribe "prueba" + selecciona "Autor" + presiona Enter
           ↓
handleAdvancedSearch() se ejecuta
           ↓
Hace petición: GET /api/libros?column=Autor&value=prueba
           ↓
Backend busca en TODOS los registros
           ↓
Devuelve TODOS los resultados (sin paginación)
           ↓
Frontend muestra resultados en la tabla
```

**Características:**
- ✅ Busca en TODA la base de datos
- ✅ Requiere seleccionar columna en el combobox
- ✅ Se ejecuta con Enter o clic en botón
- ✅ Devuelve TODOS los resultados coincidentes
- ✅ Mantiene los resultados al cambiar de "página"

---

## 🔄 Estados del Componente

```javascript
const [searchTerm, setSearchTerm] = useState('');           // Término de búsqueda
const [allItems, setAllItems] = useState([]);               // Todos los items de la página/búsqueda
const [filteredItems, setFilteredItems] = useState([]);     // Items filtrados (lo que se muestra)
const [isSearching, setIsSearching] = useState(false);      // Modo búsqueda global activo
const [activeSearchColumn, setActiveSearchColumn] = useState(null);  // Columna de búsqueda activa
const [activeSearchValue, setActiveSearchValue] = useState(null);    // Valor de búsqueda activo
```

---

## 📡 API Endpoints

### Paginación Normal
```
GET /api/libros?page=1&limit=10
```

**Respuesta:**
```json
{
  "message": "Registros obtenidos exitosamente",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Búsqueda Global
```
GET /api/libros?column=Autor&value=prueba
```

**Respuesta:**
```json
{
  "message": "Registros obtenidos exitosamente",
  "data": [
    {
      "MFN": 4007,
      "Id": 4009,
      "Autor": "prueba",
      "Titulo": "prueba",
      "..."
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 🎨 Interacción del Usuario

### Escenario 1: Búsqueda Rápida Local
1. Usuario está en página 2 de Libros (20 registros cargados)
2. Escribe "García" en la barra
3. La tabla filtra instantáneamente los 20 registros actuales
4. Solo muestra los que contienen "García"

### Escenario 2: Búsqueda Completa en Servidor
1. Usuario selecciona "Autor" del combobox
2. Escribe "García Márquez"
3. Presiona Enter o hace clic en "Buscar en todos los registros"
4. El servidor busca en TODOS los libros (no solo página actual)
5. Devuelve todos los libros de "García Márquez"
6. La tabla muestra TODOS los resultados encontrados

### Escenario 3: Volver a Modo Normal
1. Usuario borra el término de búsqueda
2. Presiona Enter
3. El sistema sale del modo búsqueda
4. Vuelve a cargar la paginación normal

---

## 🛠 Funciones Principales

### `handleLocalSearch(value)`
Filtra localmente mientras el usuario escribe.

```javascript
const handleLocalSearch = (value) => {
  setSearchTerm(value);
  
  if (value.trim() === '') {
    setFilteredItems(allItems);
  } else {
    const filtered = allItems.filter(item => {
      const searchLower = value.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.autor.toLowerCase().includes(searchLower) ||
        // ... más campos
      );
    });
    setFilteredItems(filtered);
  }
};
```

### `handleAdvancedSearch({ searchTerm, column })`
Ejecuta búsqueda en el servidor cuando hay columna seleccionada.

```javascript
const handleAdvancedSearch = ({ searchTerm, column }) => {
  if (searchTerm && column) {
    setIsSearching(true);
    setActiveSearchColumn(column);
    setActiveSearchValue(searchTerm);
    setCurrentPage(1);
    fetchItems(1, column, searchTerm);
  } else if (!searchTerm) {
    setIsSearching(false);
    setActiveSearchColumn(null);
    setActiveSearchValue(null);
    fetchItems(1);
  }
};
```

### `fetchItems(page, searchColumn, searchValue)`
Obtiene datos del servidor (paginación o búsqueda).

```javascript
async function fetchItems(page, searchColumn = null, searchValue = null) {
  let url;
  
  if (searchColumn && searchValue) {
    // Búsqueda global (sin paginación)
    url = `/api/libros?column=${searchColumn}&value=${searchValue}`;
  } else {
    // Paginación normal
    url = `/api/libros?page=${page}&limit=${itemsPerPage}`;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  setAllItems(data.data);
  setFilteredItems(data.data);
}
```

---

## 🎯 Validaciones

### SearchBar
```javascript
// Botón de búsqueda solo activo si:
disabled={!selectedColumn || !searchTerm}

// Enter solo busca en servidor si hay columna:
if (e.key === 'Enter' && selectedColumn) {
  handleSearch();
}
```

---

## 💡 Ventajas del Sistema

1. ✅ **Búsqueda instantánea** mientras escribes (local)
2. ✅ **Búsqueda completa** cuando necesitas buscar en todo (servidor)
3. ✅ **Eficiente** - no hace peticiones innecesarias
4. ✅ **Intuitivo** - el usuario controla cuándo buscar en el servidor
5. ✅ **Flexible** - búsqueda por cualquier columna

---

## 🚀 Aplicar a Otras Pantallas

Para aplicar este sistema a otras pantallas (Revistas, Auditoría, etc.):

1. Copia la estructura de estados de `Libros.js`
2. Implementa `handleLocalSearch` y `handleAdvancedSearch`
3. Actualiza `fetchItems` para manejar ambos modos
4. Pasa `handleLocalSearch` a `setSearchTerm` en `HeaderSon`
5. Configura el `columnsEndpoint` apropiado

```javascript
<HeaderSon 
  title="Mi Recurso"
  searchTerm={searchTerm}
  setSearchTerm={handleLocalSearch}  // ← Importante
  showAdvancedFilter={true}
  columnsEndpoint="/api/mi-recurso/columns"
  onSearch={handleAdvancedSearch}
/>
```

---

## 🐛 Debugging

Para ver qué está pasando, revisa la consola:

```javascript
console.log('Búsqueda en servidor:', { searchTerm, column });
console.log('Response data:', response);
console.log('Proxy fetching libros:', url);
```

---

¡El sistema está listo! 🎉
