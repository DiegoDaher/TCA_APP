'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Unauthorized() {
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-20 w-20 text-red-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">401</CardTitle>
          <p className="text-xl text-gray-600 mt-2">No autorizado</p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página. Por favor, contacta al administrador si crees que esto es un error.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Cerrar sesión
            </Button>
            <Link href="/">
              <Button className="flex items-center gap-2 bg-[var(--selected)] hover:bg-[var(--hoverselect)] text-white w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Ir al inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
