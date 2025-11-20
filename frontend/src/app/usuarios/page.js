'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import HeaderSon from '@/components/layout/HeaderSon';
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/auth';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import ModalAgregarUsuario from '@/components/features/users/ModalAgregarUsuario';
import ModalEditarUsuario from '@/components/features/users/ModalEditarUsuario';
import ModalVerUsuario from '@/components/features/users/ModalVerUsuario';

function UsuariosScreen() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Función para obtener los datos de la API
  const fetchItems = useCallback(async (page) => {
    setIsLoading(true);
    console.log('Usuarios - fetchItems llamado con página:', page);
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      const url = `${apiHost}/api/auth/users?page=${page}&limit=${itemsPerPage}`;
      console.log('Usuarios - URL:', url);
      
      const res = await authenticatedFetch(url, {
        method: 'GET',
      });
            
      if (!res.ok) {
        throw new Error(`Error al obtener los datos: ${res.status}`);
      }
      
      const response = await res.json();
      console.log('Usuarios - Response data:', response);
      
      // Mapear los datos
      if (response.users && Array.isArray(response.users)) {
        const mappedItems = response.users.map(user => ({
          id: user.Id || '',
          nombres: user.Nombres || '',
          apellidos: user.Apellidos || '',
          correo: user.Correo_Electronico || '',
          status: user.Status === 1 ? 'Activo' : 'Inactivo',
          statusValue: user.Status,
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
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios', {
        description: error.message,
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        },
      });
      setItems([]);
      setAllItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  // Función para filtrar localmente por nombre o apellido
  const handleLocalSearch = (value) => {
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredItems(allItems);
    } else {
      const filtered = allItems.filter(item => {
        const searchLower = value.toLowerCase();
        // match only from the start (prefix) - equivalent to SQL 'item%'
        return (
          item.nombres.toLowerCase().startsWith(searchLower) ||
          item.apellidos.toLowerCase().startsWith(searchLower)||
          item.correo.toLowerCase().startsWith(searchLower)
        );
      });
      setFilteredItems(filtered);
    }
  };

  // Cargar datos cuando cambia la página
  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage, fetchItems]);

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
      setCurrentPage(1);
      
      setIsLoading(true);
      try {
        const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
        const url = `${apiHost}/api/users?page=1&limit=${newItemsPerPage}`;
        
        const res = await authenticatedFetch(url, {
          method: 'GET',
        });
              
        if (!res.ok) {
          throw new Error(`Error al obtener los datos: ${res.status}`);
        }
        
        const response = await res.json();
        
        if (response.users && Array.isArray(response.users)) {
          const mappedItems = response.users.map(user => ({
            id: user.Id || '',
            nombres: user.Nombres || '',
            apellidos: user.Apellidos || '',
            correo: user.Correo_Electronico || '',
            status: user.Status === 1 ? 'Activo' : 'Inactivo',
            statusValue: user.Status,
          }));
          
          setItems(mappedItems);
          setAllItems(mappedItems);
          setFilteredItems(mappedItems);
          
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages || 1);
          } else {
            setTotalPages(1);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Error al cargar usuarios', {
          description: error.message,
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Función para manejar la apertura del modal de agregar
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  // Función para manejar la apertura del modal de editar
  const handleEditClick = (item) => {
    setSelectedUser({
      Id: item.id,
      Nombres: item.nombres,
      Apellidos: item.apellidos,
      Correo_Electronico: item.correo,
      Status: item.statusValue
    });
    setIsEditModalOpen(true);
  };

  // Función para manejar la apertura del modal de ver detalles
  const handleViewClick = (item) => {
    setSelectedUserId(item.id);
    setIsViewModalOpen(true);
  };

  // Función para eliminar (desactivar) usuario
  const handleDelete = async (item) => {
    // Mostrar modal de confirmación
    const result = await Swal.fire({
      title: `¿Estás seguro de desactivar al usuario ${item.nombres} ${item.apellidos}?`,
      text: "El usuario será marcado como inactivo",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#801530",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'rounded-md px-4 py-2',
        cancelButton: 'rounded-md px-4 py-2'
      }
    });

    if (result.isConfirmed) {
      try {
        const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
        const endpoint = `${apiHost}/api/auth/users/${item.id}`;
        
        const response = await authenticatedFetch(endpoint, { 
          method: 'DELETE' 
        });
        
        if (response.ok) {
          // Mostrar mensaje de éxito
          toast.success('Usuario desactivado exitosamente', {
            duration: 3000,
            style: {
              background: '#10b981',
              color: 'white',
              border: 'none',
            },
          });

          // Recargar los datos
          fetchItems(currentPage);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al desactivar usuario');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al desactivar usuario', {
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

  // Función para restaurar usuario
  const handleRestore = async (item) => {
    // Mostrar modal de confirmación
    const result = await Swal.fire({
      title: `¿Estás seguro de restaurar al usuario ${item.nombres} ${item.apellidos}?`,
      text: "El usuario volverá a estar activo",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#801530",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'rounded-md px-4 py-2',
        cancelButton: 'rounded-md px-4 py-2'
      }
    });

    if (result.isConfirmed) {
      try {
        const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
        const endpoint = `${apiHost}/api/auth/users/${item.id}/restore`;
        
        const response = await authenticatedFetch(endpoint, { 
          method: 'PATCH' 
        });
        
        if (response.ok) {
          // Mostrar mensaje de éxito
          toast.success('Usuario restaurado exitosamente', {
            duration: 3000,
            style: {
              background: '#10b981',
              color: 'white',
              border: 'none',
            },
          });

          // Recargar los datos
          fetchItems(currentPage);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al restaurar usuario');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al restaurar usuario', {
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
        title="Usuarios" 
        searchTerm={searchTerm} 
        setSearchTerm={handleLocalSearch}
        showAdvancedFilter={false}
        showAddButton={true}
        onAddClick={handleAddClick}
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
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre(s)</TableHead>
                      <TableHead>Apellido(s)</TableHead>
                      <TableHead>Correo Electrónico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems && filteredItems.length > 0 ? (
                      filteredItems.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell>
                            <User className="h-5 w-5 text-[var(--selected)]" />
                          </TableCell>
                          <TableCell>{item.id}</TableCell>
                          <TableCell className="font-medium">
                            {item.nombres}
                          </TableCell>
                          <TableCell>
                            {item.apellidos}
                          </TableCell>
                          <TableCell>
                            {item.correo}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.statusValue === 1 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell className="flex space-x-4">
                            <Image 
                              width={25} 
                              height={25} 
                              src="/read.png" 
                              alt="Ver Detalles" 
                              className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" 
                              title="Ver detalles del usuario"
                              onClick={() => handleViewClick(item)}
                            />
                            {isAuthenticated && (
                              <>
                                {item.statusValue === 1 ? (
                                  <>
                                    {/* Usuario Activo: Mostrar Editar y Eliminar */}
                                    <Image 
                                      width={25} 
                                      height={25} 
                                      src="/edit.png" 
                                      alt="Editar" 
                                      className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" 
                                      title="Editar usuario"
                                      onClick={() => handleEditClick(item)}
                                    />
                                    <Image 
                                      width={25} 
                                      height={25} 
                                      src="/delete.png" 
                                      alt="Eliminar" 
                                      className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity"
                                      title="Desactivar usuario"
                                      onClick={() => handleDelete(item)}
                                    />
                                  </>
                                ) : (
                                  <>
                                    {/* Usuario Inactivo: Mostrar solo Restaurar */}
                                    <Image 
                                      width={25} 
                                      height={25} 
                                      src="/restore.png" 
                                      alt="Restaurar" 
                                      className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity"
                                      title="Restaurar usuario"
                                      onClick={() => handleRestore(item)}
                                    />
                                  </>
                                )}
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500">
                          No hay usuarios disponibles
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
                            e.target.value = currentPage;
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

      {/* Modal para agregar usuario */}
      <ModalAgregarUsuario 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Modal para editar usuario */}
      <ModalEditarUsuario 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        usuario={selectedUser}
      />

      {/* Modal para ver usuario */}
      <ModalVerUsuario 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        usuarioId={selectedUserId}
      />
    </div>
  );
}

export default function ProtectedUsuariosPage() {
  return (
    <RoleProtectedRoute requiredRole="administrador">
      <UsuariosScreen />
    </RoleProtectedRoute>
  );
}
