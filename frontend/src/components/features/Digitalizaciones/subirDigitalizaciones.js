"use client";
import { useState } from 'react';

export default function SubirDigitalizacion({ onSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const manejarCambioArchivos = (e) => {
    // Convertimos el FileList a un Array estándar de JS
    setArchivos(Array.from(e.target.files));
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (!titulo || archivos.length === 0) {
      alert("Por favor, ingresa un título y selecciona imágenes.");
      return;
    }

    setCargando(true);
    setMensaje('Procesando y optimizando imágenes...');

    // 1. Crear el objeto FormData
    const formData = new FormData();
    formData.append('titulo', titulo); // Coincide con req.body.titulo en el controller
    
    // 2. Agregar cada imagen al array 'imagenes'
    // Importante: El nombre 'imagenes' debe coincidir con upload.array('imagenes') en tus rutas
    archivos.forEach((archivo) => {
      formData.append('imagenes', archivo);
    });

    try {
      // 3. Conexión al endpoint de Node.js
      const apiHost = process.env.NEXT_PUBLIC_API_HOST;
      const respuesta = await fetch(`${apiHost}/api/digitalizaciones/upload`, {
        method: 'POST',
        body: formData, // El navegador configura automáticamente el Content-Type a multipart/form-data
      });

      // Asegurarnos de que la respuesta sea JSON antes de parsear
      const contentType = respuesta.headers.get('content-type') || '';
      let resultado = null;

      if (contentType.includes('application/json')) {
        resultado = await respuesta.json();
      } else {
        const texto = await respuesta.text();
        throw new Error(`Respuesta no JSON del servidor: ${texto.slice(0, 200)}`);
      }

      if (respuesta.ok) {
        setMensaje(`¡Éxito! Digitalización guardada con ID: ${resultado.id}`);

        // Notificar al padre para que actualice el listado, si se proporciona
        if (typeof onSuccess === 'function') {
          onSuccess({
            id: resultado.id,
            titulo,
            totalHojas: archivos.length,
            portadaUrl: null,
          });
        }

        setTitulo('');
        setArchivos([]);
      } else {
        setMensaje(`Error: ${resultado?.error || 'Error en el servidor'}`);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      setMensaje(`No se pudo conectar con el servidor backend. Detalle: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Nueva Digitalización</h2>
      
      <form onSubmit={enviarFormulario} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Título del Libro/Grupo</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Ej: Libro de Actas 2023"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Seleccionar Hojas (JPG)</label>
          <input
            type="file"
            multiple
            accept="image/jpeg, image/jpg"
            onChange={manejarCambioArchivos}
            className="w-full p-2 border rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            {archivos.length} archivos seleccionados
          </p>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold 
            ${cargando ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {cargando ? 'Subiendo...' : 'Comenzar Digitalización'}
        </button>
      </form>

      {mensaje && (
        <div className={`mt-4 p-3 rounded-md text-sm ${mensaje.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {mensaje}
        </div>
      )}
    </div>
  );
}