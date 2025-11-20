import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const apiHost = process.env.NEXT_PUBLIC_API_HOST;

    if (!apiHost) {
      return NextResponse.json(
        { error: 'API host not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiHost}/api/diario-oficial/byId/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch diario oficial data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching diario oficial by ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
