import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ModalVerPeriodicos = ({ isOpen, onClose, libroId }) => {
  const [libroData, setLibroData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && libroId) {
      console.log('Fetching periodico with ID:', libroId);
      setIsLoading(true);
      setError(null);
      const apiHost = process.env.NEXT_PUBLIC_API_HOST;
      fetch(`${apiHost}/api/periodicos/byId/${libroId}`)
        .then((response) => {
          console.log('Response status:', response.status);
          if (!response.ok) {
            throw new Error(`Error fetching periodico data: ${response.statusText}`);
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
          console.error('Error fetching periodico data:', error);
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
            <h2 className="text-xl font-semibold">Ver Periódico</h2>
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
              <h3 className="text-lg font-semibold mb-4">Información del periódico</h3>
              
              {/* Grid de información */}
              <div className="space-y-4">
                {/* ID */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Número</label>
                    <p className="mt-1 text-gray-900">{libroData.Id || '***'}</p>
                  </div>
                </div>
                <Separator />

                {/* Título */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Título</label>
                  <p className="mt-1 text-gray-900">{libroData.Titulo || '***'}</p>
                </div>

                <Separator />

                {/* Tomo y Año */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tomo</label>
                    <p className="mt-1 text-gray-900">{libroData.Tomo || '***'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Año</label>
                    <p className="mt-1 text-gray-900">{libroData.Año || '***'}</p>
                  </div>
                </div>

                <Separator />

                {/* Observaciones */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Observaciones</label>
                  <p className="mt-1 text-gray-900">{libroData.Observaciones || '***'}</p>
                </div>

                <Separator />

                {/* Fecha de creación */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
                  <p className="mt-1 text-gray-900">{libroData.Fecha_de_creacion || '***'}</p>
                </div>

                <Separator />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">No se encontró información del periódico</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalVerPeriodicos;
