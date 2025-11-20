# 🔄 API Route Dinámica para Columnas

## 📋 Descripción

Se ha creado una **ruta dinámica** que funciona para obtener las columnas de **cualquier endpoint** del backend.

## 📁 Estructura

```
src/app/api/
  └── [endpoint]/
      └── columns/
          └── route.js
```

## 🎯 Uso

### Frontend
```javascript
// Para Libros
columnsEndpoint="/api/libros/columns"

// Para Revistas
columnsEndpoint="/api/revistas/columns"

// Para Auditoría
columnsEndpoint="/api/auditoria/columns"

// Para cualquier otro recurso
columnsEndpoint="/api/{nombre-recurso}/columns"
```

## 🔀 Flujo de la Petición

```
Frontend                    Next.js API Route              Backend
   │                              │                           │
   │  GET /api/libros/columns     │                           │
   ├─────────────────────────────>│                           │
   │                              │  GET /api/libros/columns  │
   │                              ├──────────────────────────>│
   │                              │                           │
   │                              │    Response:              │
   │                              │    {                      │
   │                              │      "message": "...",    │
   │                              │      "columns": [...]     │
   │                              │    }                      │
   │                              │<──────────────────────────┤
   │                              │                           │
   │    Response:                 │                           │
   │    ["Col1", "Col2", ...]     │                           │
   │<─────────────────────────────┤                           │
   │                              │                           │
```

## 📥 Formato de Respuesta

### Del Backend (formato completo):
```json
{
  "message": "Columnas disponibles obtenidas exitosamente",
  "columns": [
    "MFN",
    "Id",
    "Idioma",
    "Autor",
    "Autor_Corporativo",
    "Autor_Uniforme",
    "Titulo",
    "Edicion",
    "Lugar_Publicacion",
    "Descripcion",
    "Serie",
    "Notas",
    "Encuadernado_con",
    "Bibliografia",
    "Contenido",
    "Tema_general",
    "Coautor_personal",
    "Memorico_2020",
    "Memorico_2024",
    "Coleccion",
    "Fecha_de_creacion",
    "Status"
  ]
}
```

### Del Proxy (simplificado para el combobox):
```json
[
  "MFN",
  "Id",
  "Idioma",
  "Autor",
  "Autor_Corporativo",
  "Autor_Uniforme",
  "Titulo",
  "..."
]
```

## 💡 Ventajas

1. ✅ **Un solo archivo** para todos los endpoints
2. ✅ **Mantenimiento simplificado** - cambios en un solo lugar
3. ✅ **Escalable** - funciona automáticamente con nuevos endpoints
4. ✅ **Consistente** - misma lógica para todos los recursos

## 🔧 Configuración

### Variables de Entorno
Asegúrate de tener configurado:
```env
NEXT_PUBLIC_API_HOST=http://tu-backend.com
```

### Requisitos del Backend
El backend debe tener implementado para cada recurso:
```
GET /api/{recurso}/columns
```

Ejemplo:
- `GET /api/libros/columns`
- `GET /api/revistas/columns`
- `GET /api/auditoria/columns`

## 📝 Ejemplo Completo en Código

```javascript
// En cualquier pantalla (Libros, Revistas, etc.)
import HeaderSon from '@/components/layout/HeaderSon';

export default function MiPantalla() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = ({ searchTerm, column }) => {
    // Tu lógica de búsqueda
    console.log('Buscar:', searchTerm, 'en columna:', column);
  };

  return (
    <div>
      <HeaderSon 
        title="Mi Recurso" 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        showAdvancedFilter={true}
        columnsEndpoint="/api/mi-recurso/columns"  // ← Cambia solo esto
        onSearch={handleSearch}
      />
      {/* ... resto del contenido */}
    </div>
  );
}
```

## 🚀 Agregar un Nuevo Recurso

Para agregar búsqueda avanzada a un nuevo recurso, solo necesitas:

1. **En el componente:**
   ```javascript
   columnsEndpoint="/api/nuevo-recurso/columns"
   ```

2. **En el backend:**
   Implementar: `GET /api/nuevo-recurso/columns`

¡Eso es todo! La ruta dinámica se encarga del resto automáticamente.

## 🐛 Troubleshooting

### Error: "Error al obtener columnas del backend"
- Verifica que `NEXT_PUBLIC_API_HOST` esté configurado correctamente
- Asegúrate que el backend tenga el endpoint `/api/{recurso}/columns`
- Revisa los logs del servidor con `console.log`

### Las columnas no se cargan
- Abre la consola del navegador
- Busca errores en la pestaña Network
- Verifica que la respuesta del backend tenga el formato correcto

### La ruta no funciona
- Verifica que la carpeta sea `[endpoint]` con corchetes
- Reinicia el servidor de desarrollo de Next.js
