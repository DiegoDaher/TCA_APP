import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}/api/periodicos/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en PUT /api/periodicos:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el periódico' },
      { status: 500 }
    );
  }
}
