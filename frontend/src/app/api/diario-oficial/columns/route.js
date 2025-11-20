export async function GET(request) {
  try {
    const apiHost = process.env.NEXT_PUBLIC_API_HOST;

    if (!apiHost) {
      return Response.json(
        { error: 'API host not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiHost}/api/diario-oficial/columns`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to fetch columns' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching columns:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
