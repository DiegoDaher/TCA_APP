// src/components/layout/MainLayout.js
'use client'; // Este componente necesita estado

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthProvider } from '@/contexts/AuthContext';

// Componentes de shadcn/ui para la sidebar móvil
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function MainLayout({ children }) {
  // Estado para la sidebar móvil)
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar para Desktop (el azul) */}
        <Sidebar />

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header (blanco) */}
          <Header onMenuClick={() => setMobileMenuOpen(true)} />

          {/* Body (rojo) - Aquí se renderizarán tus páginas */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>

        {/* Sidebar para Móvil (usando Sheet de shadcn/ui) */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="p-0 text-white border-none w-64">
                {/* Reutilizamos el componente Sidebar dentro del Sheet móvil */}
                <div className="flex flex-col h-full">
                  <Sidebar mobile={true} />
                </div>
            </SheetContent>
        </Sheet>
      </div>
    </AuthProvider>
  );
}