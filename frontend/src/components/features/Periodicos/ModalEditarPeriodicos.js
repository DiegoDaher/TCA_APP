import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authenticatedFetch } from '@/lib/auth';

const ModalEditarPeriodicos = ({ isOpen, onClose, libroId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState({});

  const [formData, setFormData] = useState({
    Titulo: '',
    Tomo: '',
    Año: '',
    Observaciones: ''
  });

  // Cargar datos del registro cuando se abre el modal
  useEffect(() => {
    if (isOpen && libroId) {
      console.log('Fetching periodico with ID:', libroId);
      setIsFetching(true);
      setError(null);
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';

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
            const periodicoData = data.data;
            
            // Guardar datos originales
            setOriginalData(periodicoData);
            
            // Establecer valores del formulario
            setFormData({
              Titulo: periodicoData.Titulo || '',
              Tomo: periodicoData.Tomo || '',
              Año: periodicoData.Año || '',
              Observaciones: periodicoData.Observaciones || ''
            });
          } else {
            throw new Error('Invalid data format received');
          }
          setIsFetching(false);
        })
        .catch((error) => {
          console.error('Error fetching periodico data:', error);
          toast.error('Error al cargar los datos', {
            description: error.message,
            duration: 4000,
            style: {
              background: '#ef4444',
              color: 'white',
              border: 'none',
            },
          });
          setError(error.message);
          setIsFetching(false);
        });
    } else if (!isOpen) {
      // Reiniciar estado cuando se cierra el modal
      setFormData({
        Titulo: '',
        Tomo: '',
        Año: '',
        Observaciones: ''
      });
      setOriginalData({});
      setIsFetching(true);
      setError(null);
    }
  }, [libroId, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'Tomo' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comparar datos actuales con originales
    const changes = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changes[key] = formData[key];
      }
    });

    // Si no hay cambios, mostrar mensaje y no hacer la petición
    if (Object.keys(changes).length === 0) {
      toast('No se detectaron cambios', {
        description: 'No se realizaron modificaciones en el registro',
        duration: 3000,
        style: {
          background: '#f59e0b',
          color: 'white',
          border: 'none',
        },
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      console.log('Actualizando periódico con ID:', libroId);
      console.log('Cambios detectados:', changes);

      // Asegurarse de que Tomo se envía como número (o vacío)
      const payload = {
        ...formData,
        Tomo: formData.Tomo === '' ? '' : Number(formData.Tomo)
      };
      const response = await authenticatedFetch(`${apiHost}/api/periodicos/${libroId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar el registro: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Registro actualizado exitosamente:', result);
      
      toast.success('¡Registro actualizado exitosamente!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
        },
      });

      // Cerrar el modal después de 1 segundo
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recargar para mostrar los cambios
      }, 1000);

    } catch (error) {
      console.error('Error al actualizar el registro:', error);
      toast.error('Error al actualizar el registro', {
        description: error.message,
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        },
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Resetear el formulario a los datos originales
    setFormData({
      Titulo: originalData.Titulo || '',
      Tomo: originalData.Tomo || '',
      Año: originalData.Año || '',
      Observaciones: originalData.Observaciones || ''
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCancel}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="mr-4 flex items-center justify-center w-10 h-10 hover:bg-[var(--hoverselect)] rounded-full transition"
            >
              <Image
                src="/chevron-left.svg"
                alt="Volver"
                width={20}
                height={20}
              />
            </button>
            <h2 className="text-xl font-semibold">Editar Periódico</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="bg-[#801530] hover:bg-[#6b1128] text-white px-4 py-2 rounded text-sm transition-colors disabled:bg-gray-400"
              disabled={isLoading || isFetching}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isFetching ? (
            <div className="text-center py-12">Cargando datos...</div>
          ) : error ? (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold mb-4">Información del periódico</h3>
              
              {/* Grid de formulario */}
              <div className="space-y-4">
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="Titulo">
                    Título <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Titulo"
                    name="Titulo"
                    value={formData.Titulo}
                    onChange={handleInputChange}
                    className="placeholder:text-[var(--selected)]"
                    placeholder="Ingrese el título"
                    required
                  />
                </div>

                <Separator />

                {/* Fila: Tomo y Año */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="Tomo">
                      Tomo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="Tomo"
                      name="Tomo"
                      type="number"
                      value={formData.Tomo}
                      onChange={handleInputChange}
                      className="placeholder:text-[var(--selected)]"
                      placeholder="Ingrese el tomo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Año">
                      Año <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="Año"
                      name="Año"
                      value={formData.Año}
                      onChange={handleInputChange}
                      className="placeholder:text-[var(--selected)]"
                      placeholder="Ej: 2024"
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Observaciones */}
                <div className="space-y-2">
                  <Label htmlFor="Observaciones">Observaciones</Label>
                  <Input
                    id="Observaciones"
                    name="Observaciones"
                    value={formData.Observaciones}
                    onChange={handleInputChange}
                    className="placeholder:text-[var(--selected)]"
                    placeholder="Ingrese observaciones"
                  />
                </div>

                <Separator />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEditarPeriodicos;
