'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Scale, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ModalVerPeriodicos from '../../components/features/Periodicos/ModalVerPeriodicos';
import ModalAgregarPeriodicos from '../../components/features/Periodicos/ModalAgregarPeriodicos';
import ModalEditarPeriodicos from '../../components/features/Periodicos/ModalEditarPeriodicos';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/auth';

// Función para obtener el ícono según el tipo de tabla
function getTableIcon(type) {
  switch (type) {
    default:
      return Scale;
  }
}

export default function PeriodicosScreen() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // Guardar todos los items de la página actual
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchColumn, setActiveSearchColumn] = useState(null);
  const [activeSearchValue, setActiveSearchValue] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLibroId, setSelectedLibroId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditLibroId, setSelectedEditLibroId] = useState(null);

  // Función para obtener los datos de la API
  const fetchItems = useCallback(async (page, searchColumn = null, searchValue = null) => {
    setIsLoading(true);
    console.log('Periodicos - fetchItems llamado con:', { page, searchColumn, searchValue });
    try {
      let url;
      
      if (searchColumn && searchValue) {
        // Búsqueda con paginación y límite de items
        url = `/api/periodicos?page=${page}&limit=${itemsPerPage}&column=${encodeURIComponent(searchColumn)}&value=${encodeURIComponent(searchValue)}`;
        console.log('Periodicos - URL de búsqueda:', url);
      } else {
        // Paginación normal
        url = `/api/periodicos?page=${page}&limit=${itemsPerPage}`;
        console.log('Periodicos - URL de paginación:', url);
      }
      
      const res = await fetch(url, {
        cache: 'no-store'
      });
            
      if (!res.ok) {
        throw new Error(`Error al obtener los datos: ${res.status}`);
      }
      
      const response = await res.json();
      console.log('Periodicos - Response data:', response);
      
      // Mapear los datos
      if (response.data && Array.isArray(response.data)) {
        const mappedItems = response.data.map(item => ({
          id: item.Id || item.MFN || '', // Agregar el ID
          type: item.tabla_afectada || '',
          number: item.Id?.toString() || '',
          title: item.Titulo || '',
          period: item.Periodo || '',
          year: item.Año || item.Tema_general || '',
          // Agregar todos los campos para la búsqueda local
          autor: item.Autor || '',
          idioma: item.Idioma || '',
          edicion: item.Edicion || '',
          serie: item.Serie || '',
        }));
        
        setItems(mappedItems);
        setAllItems(mappedItems); // Guardar copia de todos los items
        setFilteredItems(mappedItems);
        
        // Actualizar información de paginación
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        } else {
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
      setAllItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);
  
  // Función para manejar la búsqueda avanzada (Enter o clic en botón)
  const handleAdvancedSearch = ({ searchTerm, column }) => {
    console.log('Periodicos - handleAdvancedSearch llamado:', { searchTerm, column });
    
    if (searchTerm && column) {
      console.log('Periodicos - Ejecutando búsqueda en servidor');
      // Buscar en TODOS los registros del servidor usando la columna seleccionada
      setIsSearching(true);
      setActiveSearchColumn(column);
      setActiveSearchValue(searchTerm);
      setCurrentPage(1); // Resetear a la primera página
      fetchItems(1, column, searchTerm);
    } else if (!searchTerm) {
      console.log('Periodicos - Búsqueda vacía, recargando todos los registros');
      // Si se borra el término de búsqueda, volver a cargar todos los registros
      setIsSearching(false);
      setActiveSearchColumn(null);
      setActiveSearchValue(null);
      fetchItems(1);
    } else {
      console.log('Periodicos - Búsqueda no ejecutada. Falta:', !searchTerm ? 'searchTerm' : 'column');
    }
  };

  // Función para filtrar localmente mientras se escribe (sin hacer petición al servidor)
  const handleLocalSearch = (value) => {
    setSearchTerm(value);
    
    if (value.trim() === '') {
      // Si está vacío, mostrar todos los items de la página actual
      setFilteredItems(allItems);
    } else {
      // Filtrar localmente en los items de la página actual
      const filtered = allItems.filter(item => {
        const searchLower = value.toLowerCase();
        return (
          item.number.toLowerCase().includes(searchLower) ||
          item.title.toLowerCase().includes(searchLower) ||
          item.period.toLowerCase().includes(searchLower) ||
          item.year.toLowerCase().includes(searchLower) ||
          item.autor.toLowerCase().includes(searchLower) ||
          item.idioma.toLowerCase().includes(searchLower)
        );
      });
      setFilteredItems(filtered);
    }
  };

  // Cargar datos cuando cambia la página
  useEffect(() => {
    if (isSearching && activeSearchColumn && activeSearchValue) {
      // Si está en modo búsqueda, mantener los parámetros de búsqueda al cambiar de página
      fetchItems(currentPage, activeSearchColumn, activeSearchValue);
    } else {
      // Modo normal, cargar todos los registros
      fetchItems(currentPage);
    }
  }, [currentPage, isSearching, activeSearchColumn, activeSearchValue, fetchItems]);

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

  // Función para manejar el cambio de cantidad de items por página
  const handleItemsPerPageChange = async (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    if ([10, 20, 30, 40, 50, 60].includes(newItemsPerPage)) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1); // Resetear a la primera página
      
      // Construir la URL con el nuevo límite
      setIsLoading(true);
      try {
        let url;
        
        if (isSearching && activeSearchColumn && activeSearchValue) {
          // Búsqueda con el nuevo límite
          url = `/api/periodicos?page=1&limit=${newItemsPerPage}&column=${encodeURIComponent(activeSearchColumn)}&value=${encodeURIComponent(activeSearchValue)}`;
        } else {
          // Paginación normal con el nuevo límite
          url = `/api/periodicos?page=1&limit=${newItemsPerPage}`;
        }
        
        const res = await fetch(url, {
          cache: 'no-store'
        });
              
        if (!res.ok) {
          throw new Error(`Error al obtener los datos: ${res.status}`);
        }
        
        const response = await res.json();
        console.log('Response data after limit change:', response);
        
        // Mapear los datos
        if (response.data && Array.isArray(response.data)) {
          const mappedItems = response.data.map(item => ({
            id: item.Id || item.MFN || '',
            type: item.tabla_afectada || '',
            number: item.Id?.toString() || '',
            title: item.Titulo || '',
            period: item.Periodo || '',
            year: item.Año || item.Tema_general || '',
            autor: item.Autor || '',
            idioma: item.Idioma || '',
            edicion: item.Edicion || '',
            serie: item.Serie || '',
          }));
          
          setItems(mappedItems);
          setAllItems(mappedItems);
          setFilteredItems(mappedItems);
          
          // Actualizar información de paginación
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages || 1);
          } else {
            setTotalPages(1);
          }
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]);
        setAllItems([]);
        setFilteredItems([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Función para manejar la vista de detalles del libro
  const handleViewDetails = (libroId) => {
    console.log('Opening modal with libro ID:', libroId);
    setSelectedLibroId(libroId);
    setIsModalOpen(true);
  };

  // Función para manejar la apertura del modal de agregar
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  // Función para manejar la apertura del modal de editar
  const handleEditDetails = (libroId) => {
    console.log('Opening edit modal with libro ID:', libroId);
    setSelectedEditLibroId(libroId);
    setIsEditModalOpen(true);
  };

  // Función para manejar la eliminación del libro
  const handleDeleteDetails = async (libroId) => {
    console.log('Delete libro with ID:', libroId);
    
    // Mostrar modal de confirmación
    const result = await Swal.fire({
      title: `¿Estas seguro de dar de baja el libro ${libroId}?`,
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
        // Llamar al endpoint de eliminación
        const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
        const response = await authenticatedFetch(`${apiHost}/api/periodicos/deactivate/${libroId}`, {
          method: 'PUT',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el libro');
        }

        // Mostrar mensaje de éxito con SweetAlert2
        await Swal.fire({
          title: "¡Eliminado!",
          text: "El libro ha sido dado de baja exitosamente.",
          icon: "success",
          confirmButtonColor: "#801530",
          confirmButtonText: "Aceptar",
          customClass: {
            popup: 'rounded-lg',
            confirmButton: 'rounded-md px-4 py-2'
          }
        });

        // Mostrar notificación adicional con toast
        toast.success('Libro eliminado exitosamente', {
          duration: 3000,
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none',
          },
        });

        // Recargar la página para actualizar la lista
        window.location.reload();
      } catch (error) {
        console.error('Error al eliminar el libro:', error);
        
        // Mostrar mensaje de error con SweetAlert2
        await Swal.fire({
          title: "Error",
          text: "Hubo un problema al eliminar el libro. Por favor, intenta de nuevo.",
          icon: "error",
          confirmButtonColor: "#801530",
          confirmButtonText: "Aceptar",
          customClass: {
            popup: 'rounded-lg',
            confirmButton: 'rounded-md px-4 py-2'
          }
        });

        // Mostrar notificación adicional con toast
        toast.error('Error al eliminar el libro', {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderSon 
        title="Periodicos" 
        searchTerm={searchTerm} 
        setSearchTerm={handleLocalSearch}
        showAdvancedFilter={true}
        columnsEndpoint="/api/periodicos/columns"
        onSearch={handleAdvancedSearch}
        showAddButton={true}
        onAddClick={handleAddClick}
        defaultSearchColumn="Titulo"
      />
      
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
                              {item.title.length > 30 ? `${item.title.substring(0, 30)}...` : item.title} {item.period.length > 30 ? `${item.period.substring(0, 30)}...` : item.period}
                            </TableCell>
                            <TableCell>
                              {item.year.length > 30 ? `${item.year.substring(0, 30)}...` : item.year}
                            </TableCell>
                            <TableCell className="flex space-x-4">
                              <Image 
                                width={25} 
                                height={25} 
                                src="/read.png" 
                                alt="Ver Detalles" 
                                className="h-5 w-5 cursor-pointer" 
                                onClick={() => handleViewDetails(item.id)}
                                />
                              {isAuthenticated && (
                                <>
                                  <Image 
                                    width={25} 
                                    height={25} 
                                    src="/edit.png" 
                                    alt="Editar" 
                                    className="h-5 w-5 cursor-pointer" 
                                    onClick={() => handleEditDetails(item.id)}
                                    />
                                  <Image 
                                    width={25} 
                                    height={25} 
                                    src="/delete.png" 
                                    alt="Eliminar" 
                                    className="h-5 w-5 cursor-pointer" 
                                    onClick={() => handleDeleteDetails(item.id)}
                                  />
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
                    Página
                    <input
                    type="number"
                    defaultValue={currentPage}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const newPage = parseInt(e.target.value, 10);
                        if (!isNaN(newPage) && newPage > 0 && newPage <= totalPages) {
                          setCurrentPage(newPage);
                        } else {
                          e.target.value = currentPage; // Reset to current page if invalid
                        }
                      }
                    }}
                    className="w-16 text-center text-sm text-gray-600 border border-gray-300 rounded-md"
                  /> de {totalPages}
                  </span>
                  <span className="text-sm text-gray-600">
                   Mostrar {filteredItems.length} registros
                  </span>

                  {/* Selector de cantidad de items por página */}
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                    <option value={60}>60</option>
                  </select>
                  
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

      {/* Modal para ver detalles del libro */}
      <ModalVerPeriodicos 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        libroId={selectedLibroId} 
      />

      {/* Modal para agregar libro */}
      <ModalAgregarPeriodicos 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Modal para editar libro */}
      <ModalEditarPeriodicos
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        libroId={selectedEditLibroId} 
      />
    </div>
  );
}
