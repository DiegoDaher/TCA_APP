import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ModalAgregarDiarioOficial = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    Periodo: '',
    Tomo: '',
    Año: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      // Convertir Tomo a número
      const dataToSend = {
        ...formData,
        Tomo: formData.Tomo ? parseInt(formData.Tomo, 10) : null
      };

      const response = await fetch(`${apiHost}/api/diario-oficial/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        throw new Error(`Error al guardar el registro: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Registro guardado exitosamente:', result);
      
      // Mostrar notificación de éxito en verde
      toast.success('¡Registro guardado exitosamente!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
        },
      });
      
      // Resetear el formulario
      setFormData({
        Periodo: '',
        Tomo: '',
        Año: ''
      });

      // Cerrar el modal después de 1 segundo
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recargar para mostrar el nuevo registro
      }, 1000);

    } catch (error) {
      console.error('Error al guardar el registro:', error);
      toast.error('Error al guardar el registro', {
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
    // Resetear el formulario
    setFormData({
      Periodo: '',
      Tomo: '',
      Año: ''
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCancel}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            {/* Botón para regresar a la página anterior */}
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
          <h2 className="text-xl font-semibold">Agregar Diario Oficial</h2>
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
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold mb-4">Información del registro</h3>
            
            {/* Grid de formulario */}
            <div className="space-y-4">
              {/* Periodo */}
              <div className="space-y-2">
                <Label htmlFor="Periodo">
                  Periodo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="Periodo"
                  name="Periodo"
                  value={formData.Periodo}
                  onChange={handleInputChange}
                  className="placeholder:text-[var(--selected)]"
                  placeholder="Ingrese el periodo"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarDiarioOficial;
