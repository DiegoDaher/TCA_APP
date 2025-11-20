import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID del libro es requerido' },
        { status: 400 }
      );
    }

    // Validar que se envíen campos para actualizar
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      );
    }

    console.log('Actualizando libro ID:', id);
    console.log('Campos modificados:', body);

    // URL del backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
    
    // Hacer la petición al backend con solo los campos modificados
    const response = await fetch(`${backendUrl}/api/libros/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      return NextResponse.json(
        { error: errorData.error || 'Error al actualizar el libro' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Libro actualizado exitosamente',
        data 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en PUT /api/libros/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
