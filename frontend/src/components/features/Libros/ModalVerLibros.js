import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ModalVerLibros = ({ isOpen, onClose, libroId }) => {
  const [libroData, setLibroData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && libroId) {
      console.log('Fetching libro with ID:', libroId);
      setIsLoading(true);
      setError(null);
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      fetch(`${apiHost}/api/libros/byId/${libroId}`)
        .then((response) => {
          console.log('Response status:', response.status);
          if (!response.ok) {
            throw new Error(`Error fetching libro data: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('Data received:', data);
          if (data && data.data) {
            setLibroData(data.data);
          } else {
            throw new Error('Invalid data format received');
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching libro data:', error);
          setError(error.message);
          setIsLoading(false);
        });
    } else if (!isOpen) {
      // Reiniciar estado cuando se cierra el modal
      setLibroData(null);
      setIsLoading(true);
      setError(null);
    } else {
      console.log('No libroId provided');
      setIsLoading(false);
    }
  }, [libroId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
                      <button
                        onClick={onClose}
                        className="mr-4 flex items-center justify-center w-10 h-10 hover:bg-[var(--hoverselect)] rounded-full transition"
                      >
                        <Image
                          src="/chevron-left.svg"
                          alt="Volver"
                          width={20}
                          height={20}
                        />
                      </button>
                      <h2 className="text-xl font-semibold">Ver Libro</h2>
                    </div>
          <button
            onClick={onClose}
            className="bg-[#801530] hover:bg-[#6b1128] text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">Error: {error}</div>
          ) : libroData ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Información del libro</h3>
              
              {/* Grid de información */}
              <div className="space-y-4">
                {/* Fila 1: MFN y Número */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      MFN <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-gray-900">{libroData.MFN || '011'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Número <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-gray-900">{libroData.Id || '011'}</p>
                  </div>
                </div>

                <Separator />

                {/* Fila 2: Idioma y Autor(es) */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Idioma <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-gray-900">{libroData.Idioma || 'Spa'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Autor(es)</label>
                    <p className="mt-1 text-gray-900">{libroData.Autor || '*****'}</p>
                  </div>
                </div>

                <Separator />

                {/* Fila 3: Autor Uniforme y Autor Corporativo */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Autor Uniforme</label>
                    <p className="mt-1 text-gray-900">{libroData.Autor_Uniforme || '*****'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Autor Corporativo</label>
                    <p className="mt-1 text-gray-900">{libroData.Autor_Corporativo || '*****'}</p>
                  </div>
                </div>

                <Separator />

                {/* Título */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <p className="mt-1 text-gray-900">{libroData.Titulo}</p>
                </div>

                <Separator />

                {/* Fila 4: Edición y Lugar Publicación */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Edición</label>
                    <p className="mt-1 text-gray-900">{libroData.Edicion || 'Spa'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Lugar Publicación <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-gray-900">{libroData.Lugar_Publicacion}</p>
                  </div>
                </div>

                <Separator />

                {/* Fila 5: Descripción y Serie */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-gray-900">{libroData.Descripcion}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Serie</label>
                    <p className="mt-1 text-gray-900">{libroData.Serie || '****'}</p>
                  </div>
                </div>

                <Separator />

                {/* Fila 6: Contenido y Bibliografía */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Contenido <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{libroData.Contenido || '****'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bibliografía</label>
                    <p className="mt-1 text-gray-900">{libroData.Bibliografia || '****'}</p>
                  </div>
                </div>

                <Separator />

                {/* Notas */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Notas</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{libroData.Notas}</p>
                </div>

                <Separator />

                {/* Fila 7: Encuadernado con y Coautor personal */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Encuadernado con</label>
                    <p className="mt-1 text-gray-900">{libroData.Encuadernado_con || '****'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Coautor personal</label>
                    <p className="mt-1 text-gray-900">{libroData.Coautor_personal || '****'}</p>
                  </div>
                </div>

                <Separator />

                {/* Fila 8: Memorico 2020 y Memorico 2024 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Memorico 2020</label>
                    <p className="mt-1 text-gray-900">{libroData.Memorico_2020 || '****'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Memorico 2024</label>
                    <p className="mt-1 text-gray-900">{libroData.Memorico_2024 || '*****'}</p>
                  </div>
                </div>

                <Separator />

                {/* Fila 9: Tema General */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tema General <span className="text-red-500">*</span>
                  </label>
                  <p className="mt-1 text-gray-900">{libroData.Tema_general}</p>
                </div>

                <Separator />

                {/* Fila 10: Colección */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Colección <span className="text-red-500">*</span>
                  </label>
                  <p className="mt-1 text-gray-900">{libroData.Coleccion}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">No se encontró información del libro</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalVerLibros;
