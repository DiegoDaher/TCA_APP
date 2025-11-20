'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Componente de orden superior (HOC) para proteger rutas según roles
 * @param {React.Component} Component - Componente a proteger
 * @param {string|string[]} requiredRoles - Rol(es) requerido(s) para acceder
 */
export default function RoleProtectedRoute({ children, requiredRole }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirigir a home
      if (!user) {
        router.push('/unauthorized');
        return;
      }

      // Verificar si el usuario tiene el rol requerido
      const hasRequiredRole = user.roleSlugs && user.roleSlugs.includes(requiredRole);

      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, requiredRole, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--selected)] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // No renderizar contenido si no tiene permisos
  if (!user || !user.roleSlugs || !user.roleSlugs.includes(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
