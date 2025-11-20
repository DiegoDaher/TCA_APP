import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const apiHost = process.env.NEXT_PUBLIC_API_HOST;

    if (!apiHost) {
      return NextResponse.json(
        { error: 'API host not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiHost}/api/diario-oficial/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to add diario oficial' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding diario oficial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
