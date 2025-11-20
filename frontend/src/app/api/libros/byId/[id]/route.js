import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID del libro es requerido' },
        { status: 400 }
      );
    }

    // URL del backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
    
    // Hacer la petición al backend
    const response = await fetch(`${backendUrl}/api/libros/byId/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Libro no encontrado' },
          { status: 404 }
        );
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener el libro' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en GET /api/libros/byId/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
