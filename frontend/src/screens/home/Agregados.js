'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import HeaderSon from '@/components/layout/HeaderSon';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Library, Book, Newspaper, Scale, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/auth';

// Importar modales de Colección Durango
import ModalVerColeccionDurango from '@/components/features/coleccionDurango/ModalVerColeccionDurango';
import ModalEditarColeccionDurango from '@/components/features/coleccionDurango/ModalEditarColeccionDurango';

// Importar modales de Libros
import ModalVerLibros from '@/components/features/Libros/ModalVerLibros';
import ModalEditarLibros from '@/components/features/Libros/ModalEditarLibros';

// Importar modales de Periódicos
import ModalVerPeriodicos from '@/components/features/Periodicos/ModalVerPeriodicos';
import ModalEditarPeriodicos from '@/components/features/Periodicos/ModalEditarPeriodicos';

// Importar modales de Diario Oficial
import ModalVerDiarioOficial from '@/components/features/DiarioOficial/ModalVerDiarioOficial';
import ModalEditarDiarioOficial from '@/components/features/DiarioOficial/ModalEditarDiarioOficial';

// Función para obtener el ícono según el tipo de tabla
function getTableIcon(type) {
  switch (type) {
    case 'coleccion_durango':
      return Library;
    case 'libros':
      return Book;
    case 'periodicos':
      return Newspaper;
    case 'diario_oficial':
      return Scale;
    default:
      return Library;
  }
}

export default function AgregadosScreen() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Estados para controlar modales
  const [modalState, setModalState] = useState({
    ver: { isOpen: false, type: null, id: null },
    editar: { isOpen: false, type: null, id: null }
  });

  // Función para abrir modal de Ver
  const handleOpenVerModal = (item) => {
    setModalState(prev => ({
      ...prev,
      ver: { isOpen: true, type: item.type, id: item.number }
    }));
  };

  // Función para cerrar modal de Ver
  const handleCloseVerModal = () => {
    setModalState(prev => ({
      ...prev,
      ver: { isOpen: false, type: null, id: null }
    }));
  };

  // Función para abrir modal de Editar
  const handleOpenEditarModal = (item) => {
    setModalState(prev => ({
      ...prev,
      editar: { isOpen: true, type: item.type, id: item.number }
    }));
  };

  // Función para cerrar modal de Editar
  const handleCloseEditarModal = () => {
    setModalState(prev => ({
      ...prev,
      editar: { isOpen: false, type: null, id: null }
    }));
  };

  // Función para eliminar (desactivar)
  const handleDelete = async (item) => {
    // Mostrar modal de confirmación
    const result = await Swal.fire({
      title: `¿Estás seguro de dar de baja el registro ${item.number}?`,
      text: "Esta acción no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#801530",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'rounded-md px-4 py-2',
        cancelButton: 'rounded-md px-4 py-2'
      }
    });

    if (result.isConfirmed) {
      try {
        const host = process.env.NEXT_PUBLIC_API_HOST;
        let apiPath = '';
        
        // Mapear el tipo de tabla al nombre del endpoint
        switch(item.type) {
          case 'coleccion_durango':
            apiPath = 'coleccionDurango';
            break;
          case 'libros':
            apiPath = 'libros';
            break;
          case 'periodicos':
            apiPath = 'periodicos';
            break;
          case 'diario_oficial':
            apiPath = 'diario-oficial';
            break;
          default:
            await Swal.fire({
              title: "Error",
              text: "Tipo de tabla no reconocido",
              icon: "error",
              confirmButtonColor: "#801530",
              confirmButtonText: "Aceptar",
              customClass: {
                popup: 'rounded-lg',
                confirmButton: 'rounded-md px-4 py-2'
              }
            });
            return;
        }
        
        const endpoint = `${host}/api/${apiPath}/deactivate/${item.number}`;
        console.log('Desactivando registro:', endpoint);
        
        const response = await authenticatedFetch(endpoint, { method: 'PUT' });
        
        if (response.ok) {
          // Mostrar mensaje de éxito con SweetAlert2
          await Swal.fire({
            title: "¡Eliminado!",
            text: "El registro ha sido dado de baja exitosamente.",
            icon: "success",
            confirmButtonColor: "#801530",
            confirmButtonText: "Aceptar",
            customClass: {
              popup: 'rounded-lg',
              confirmButton: 'rounded-md px-4 py-2'
            }
          });

          // Mostrar notificación adicional con toast
          toast.success('Registro eliminado exitosamente', {
            duration: 3000,
            style: {
              background: '#10b981',
              color: 'white',
              border: 'none',
            },
          });

          // Recargar la página para actualizar la lista
          window.location.reload();
        } else {
          const errorData = await response.json();
          
          // Mostrar mensaje de error con SweetAlert2
          await Swal.fire({
            title: "Error",
            text: `Hubo un problema al eliminar el registro: ${errorData.message || response.statusText}`,
            icon: "error",
            confirmButtonColor: "#801530",
            confirmButtonText: "Aceptar",
            customClass: {
              popup: 'rounded-lg',
              confirmButton: 'rounded-md px-4 py-2'
            }
          });

          // Mostrar notificación adicional con toast
          toast.error('Error al eliminar el registro', {
            description: errorData.message || response.statusText,
            duration: 4000,
            style: {
              background: '#ef4444',
              color: 'white',
              border: 'none',
            },
          });
        }
      } catch (error) {
        console.error('Error:', error);
        
        // Mostrar mensaje de error con SweetAlert2
        await Swal.fire({
          title: "Error",
          text: "Hubo un problema al eliminar el registro. Por favor, intenta de nuevo.",
          icon: "error",
          confirmButtonColor: "#801530",
          confirmButtonText: "Aceptar",
          customClass: {
            popup: 'rounded-lg',
            confirmButton: 'rounded-md px-4 py-2'
          }
        });

        // Mostrar notificación adicional con toast
        toast.error('Error al eliminar el registro', {
          description: error.message,
          duration: 4000,
          style: {
            background: '#ef4444',
            color: 'white',
            border: 'none',
          },
        });
      }
    }
  };

  // Función para obtener los datos de la API
  async function fetchItems(page) {
    setIsLoading(true);
    try {
      // Usar la API route local de Next.js como proxy (evita CORS)
      const url = `/api/auditoria/registros?page=${page}&limit=${itemsPerPage}`;      
      const res = await fetch(url, {
        cache: 'no-store'
      });
            
      if (!res.ok) {
        throw new Error(`Error al obtener los datos: ${res.status}`);
      }
      
      const response = await res.json();
      console.log('Response data:', response);
      
      // Mapear los datos
      if (response.data && Array.isArray(response.data)) {
        const mappedItems = response.data.map(item => ({
          type: item.tabla_afectada || 'file',
          number: item.id_registro?.toString() || '',
          title: item.titulo || '',
          period: item.Periodo || '',
          year: item.Año || item.Tema_general || ''
        }));
        
        setItems(mappedItems);
        setFilteredItems(mappedItems);
        
        // Actualizar información de paginación
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  }
  // Filtrar items cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.number.toLowerCase().includes(searchLower) ||
          item.title.toLowerCase().includes(searchLower) ||
          item.period.toLowerCase().includes(searchLower) ||
          item.year.toLowerCase().includes(searchLower)
        );
      });
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  // Cargar datos cuando cambia la página
  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage]);

  // Funciones de navegación
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderSon title="Agregados Recientemente" searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <main className="container mx-auto p-6">
        <Card>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--tableRow)]">
                      <TableHead>Tipo</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Título / Periodo</TableHead>
                      <TableHead>Año / Tema General</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems && filteredItems.length > 0 ? (
                      filteredItems.map((item, index) => {
                        const IconComponent = getTableIcon(item.type);
                        return (
                          <TableRow key={item.number || index}>
                            <TableCell>
                              <IconComponent className="h-5 w-5 text-[var(--selected)]" />
                            </TableCell>
                            <TableCell>{item.number}</TableCell>
                            <TableCell className="font-medium">
                              {item.title} {item.period}
                            </TableCell>
                            <TableCell>{item.year}</TableCell>
                            <TableCell className="flex space-x-4">
                              <button 
                                type="button" 
                                onClick={() => handleOpenVerModal(item)} 
                                aria-label={`Ver ${item.number}`}
                              >
                                <Image 
                                  width={25} 
                                  height={25} 
                                  src="/read.png" 
                                  alt="Ver Detalles" 
                                  className="h-5 w-5 cursor-pointer" 
                                />
                              </button>
                              {isAuthenticated && (
                                <>
                                  <button 
                                    type="button" 
                                    onClick={() => handleOpenEditarModal(item)} 
                                    aria-label={`Editar ${item.number}`}
                                  >
                                    <Image 
                                      width={25} 
                                      height={25} 
                                      src="/edit.png" 
                                      alt="Editar" 
                                      className="h-5 w-5 cursor-pointer" 
                                    />
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => handleDelete(item)} 
                                    aria-label={`Eliminar ${item.number}`}
                                  >
                                    <Image 
                                      width={25} 
                                      height={25} 
                                      src="/delete.png" 
                                      alt="Eliminar" 
                                      className="h-5 w-5 cursor-pointer" 
                                    />
                                  </button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No hay registros disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Paginación */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 bg-[var(--selected)] text-white hover:bg-[var(--hoverselect)]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 bg-[var(--selected)] text-white hover:bg-[var(--hoverselect)]"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modales de Ver según el tipo */}
      {modalState.ver.type === 'coleccion_durango' && (
        <ModalVerColeccionDurango
          isOpen={modalState.ver.isOpen}
          onClose={handleCloseVerModal}
          libroId={modalState.ver.id}
        />
      )}
      {modalState.ver.type === 'libros' && (
        <ModalVerLibros
          isOpen={modalState.ver.isOpen}
          onClose={handleCloseVerModal}
          libroId={modalState.ver.id}
        />
      )}
      {modalState.ver.type === 'periodicos' && (
        <ModalVerPeriodicos
          isOpen={modalState.ver.isOpen}
          onClose={handleCloseVerModal}
          libroId={modalState.ver.id}
        />
      )}
      {modalState.ver.type === 'diario_oficial' && (
        <ModalVerDiarioOficial
          isOpen={modalState.ver.isOpen}
          onClose={handleCloseVerModal}
          libroId={modalState.ver.id}
        />
      )}

      {/* Modales de Editar según el tipo */}
      {modalState.editar.type === 'coleccion_durango' && (
        <ModalEditarColeccionDurango
          isOpen={modalState.editar.isOpen}
          onClose={handleCloseEditarModal}
          libroId={modalState.editar.id}
        />
      )}
      {modalState.editar.type === 'libros' && (
        <ModalEditarLibros
          isOpen={modalState.editar.isOpen}
          onClose={handleCloseEditarModal}
          libroId={modalState.editar.id}
        />
      )}
      {modalState.editar.type === 'periodicos' && (
        <ModalEditarPeriodicos
          isOpen={modalState.editar.isOpen}
          onClose={handleCloseEditarModal}
          libroId={modalState.editar.id}
        />
      )}
      {modalState.editar.type === 'diario_oficial' && (
        <ModalEditarDiarioOficial
          isOpen={modalState.editar.isOpen}
          onClose={handleCloseEditarModal}
          libroId={modalState.editar.id}
        />
      )}
    </div>
  );
}
