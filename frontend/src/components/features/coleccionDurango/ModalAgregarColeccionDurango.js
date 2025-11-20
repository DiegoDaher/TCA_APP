import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ModalAgregarColeccionDurango = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    Letra: '',
    Titulo: '',
    Autor: '',
    Año: '',
    Editorial: '',
    Edición: '',
    ISBN: '',
    Ejemplares: ''
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
      
      // Convertir MFN a número si no está vacío
      const dataToSend = {
        ...formData,
        MFN: formData.MFN ? parseInt(formData.MFN, 10) : null
      };

      const response = await fetch(`${apiHost}/api/libros/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        throw new Error(`Error al guardar el libro: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Libro guardado exitosamente:', result);
      
      // Mostrar notificación de éxito en verde
      toast.success('¡Libro guardado exitosamente!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
        },
      });
      
      // Resetear el formulario
      setFormData({
        Letra: '',
        Titulo: '',
        Autor: '',
        Año: '',
        Editorial: '',
        Edición: '',
        ISBN: '',
        Ejemplares: ''
      });

      // Cerrar el modal después de 1 segundo
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recargar para mostrar el nuevo libro
      }, 1000);

    } catch (error) {
      console.error('Error al guardar el libro:', error);
      toast.error('Error al guardar el libro', {
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
      Letra: '',
      Titulo: '',
      Autor: '',
      Año: '',
      Editorial: '',
      Edición: '',
      ISBN: '',
      Ejemplares: ''
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
          <h2 className="text-xl font-semibold">Agregar Libro</h2>
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
            <h3 className="text-lg font-semibold mb-4">Información del libro</h3>
            
            {/* Grid de formulario */}
            <div className="space-y-4">
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
                  placeholder="Ingrese título del libro"
                  required
                />
              </div>

              <Separator />
              {/* Fila 1: MFN y Número */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Autor">
                    Autor(es) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Autor"
                    name="Autor"
                    value={formData.Autor}
                    onChange={handleInputChange}
                    className="placeholder:text-[var(--selected)]"
                    placeholder="Ingrese el Autor"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Editorial">
                    Editorial <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Editorial"
                    name="Editorial"
                    value={formData.Editorial || ''}
                    onChange={handleInputChange}
                    className="placeholder:text-[var(--selected)]"
                    placeholder="Ingrese la Editorial"
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Fila 2: Letra y Autor(es) */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Letra">
                    Letra <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Letra"
                    name="Letra"
                    value={formData.Letra}
                    onChange={handleInputChange}
                    className="placeholder:text-[var(--selected)]"
                    placeholder="Ej: H"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Edición">Edición</Label>
                  <Input
                    id="Edición"
                    name="Edición"
                    value={formData.Edición}
                    onChange={handleInputChange}
                    className="placeholder:text-[var(--selected)]"
                    placeholder="Ingrese Edición"
                  />
                </div>
              </div>

              <Separator />

              {/* Fila 3: Año y Ejemplares */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Año">Año</Label>
                  <Input
                    id="Año"
                    name="Año"
                    type="number"
                    value={formData.Año}
                    onChange={handleInputChange}
                    className="placeholder:text-[var(--selected)]"
                    placeholder="Solo un año, Ej: 1999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Ejemplares">Ejemplares</Label>
                  <Input
                    id="Ejemplares"
                    type="number"
                    name="Ejemplares" 
                    value={formData.Ejemplares}
                    onChange={handleInputChange}
                    className="placeholder:text-[var(--selected)]"
                    placeholder="Ingrese no. de ejemplares Ej: 3"
                  />
                </div>
              </div>

              <Separator />
              {/* Fila 4: Edición y Lugar Publicación */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ISBN">ISBN</Label>
                  <Input
                    id="ISBN"
                    name="ISBN"
                    value={formData.ISBN}
                    onChange={handleInputChange}
                    className="placeholder:text-[var(--selected)]"
                    placeholder="Ej: Primera ISBN"
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

export default ModalAgregarColeccionDurango;
