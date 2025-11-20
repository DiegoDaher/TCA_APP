import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID del libro es requerido' },
        { status: 400 }
      );
    }

    console.log('Desactivando libro ID:', id);

    // URL del backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
    
    // Hacer la petición al backend para desactivar
    const response = await fetch(`${backendUrl}/api/libros/deactivate/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      return NextResponse.json(
        { error: errorData.error || 'Error al desactivar el libro' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Libro desactivado exitosamente',
        data 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /api/libros/deactivate/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
