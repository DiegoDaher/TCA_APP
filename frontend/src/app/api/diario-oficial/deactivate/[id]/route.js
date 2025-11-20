import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const apiHost = process.env.NEXT_PUBLIC_API_HOST;

    if (!apiHost) {
      return NextResponse.json(
        { error: 'API host not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiHost}/api/diario-oficial/deactivate/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to deactivate diario oficial' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deactivating diario oficial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
