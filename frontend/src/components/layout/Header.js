'use client';

// src/components/ui/Header.js
import { useState, useEffect } from 'react';
import { Menu, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import ModalLogin from '@/components/features/login/ModalLogin';
import ModalChangePassword from '@/components/features/login/ModalChangePassword';
import { getAuthUser, logout, isAuthenticated } from '@/lib/auth';

// El prop 'onMenuClick' será una función para abrir/cerrar la sidebar en móvil
export default function Header({ onMenuClick }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Verificar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
    const currentUser = getAuthUser();
    setUser(currentUser);
  }, []);

  const handleLoginSuccess = (data) => {
    setUser(data.user);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar tu sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#801530',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'rounded-md px-4 py-2',
        cancelButton: 'rounded-md px-4 py-2'
      }
    });

    if (result.isConfirmed) {
      logout();
      setUser(null);
      
      toast.success('Sesión cerrada exitosamente', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
        },
      });
    }
  };

  const handleSelectChange = (value) => {
    if (value === 'logout') {
      handleLogout();
    } else if (value === 'change-password') {
      setIsChangePasswordModalOpen(true);
    }
  };

  return (
    <>
      <header className={"bg-white shadow-md p-4 flex justify-between items-center border-l border-2 border-gray-200"}
      >
        <div className="flex items-center gap-4">
          {/* Botón de Menú para móvil */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Logo */}
          <div className="h-10 w-10 bg-gray-300 rounded-full">
            <Image 
              src="/logoIcedColor.png" 
              alt="Logo" 
              className="h-full w-full object-cover rounded-full" 
              width={40} 
              height={40} 
            />
          </div>
          <h1 className="text-lg font-semibold text-gray-700 hidden sm:block">
            Torre de Colecciones Antiguas
          </h1>
          <h1 className="text-sm font-semibold text-gray-700 sm:hidden">
            TCA
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {isClient && user ? (
            // Usuario autenticado
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-700">
                  {user.Nombres} {user.Apellidos}
                </span>
                <span className="text-xs text-gray-500">
                  {user.Correo_Electronico}
                </span>
              </div>
              <div className="h-10 w-10 bg-[var(--selected)] rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger className="w-fit gap-2 border-none shadow-none hover:bg-transparent p-2">
                  <Settings className="h-5 w-5" style={{ color: 'var(--selected)' }} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-[var(--selected)]">Opciones</SelectLabel>
                    <SelectItem value="change-password">
                      Cambiar Contraseña
                    </SelectItem>
                    <SelectItem value="logout">
                      Cerrar Sesión
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : (
            // Usuario no autenticado
            <Button 
              variant="destructive"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Identificarse
            </Button>
          )}
          
          {/* Logo ICED */}
          <div className="h-12 w-10 bg-gray-300">
            <Image 
              src="/ICEDbn.png" 
              alt="Logo ICED" 
              className="h-full w-full object-cover" 
              width={90} 
              height={90} 
            />
          </div>
        </div>
      </header>

      {/* Modal de Login */}
      <ModalLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal de Cambiar Contraseña */}
      <ModalChangePassword
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
}