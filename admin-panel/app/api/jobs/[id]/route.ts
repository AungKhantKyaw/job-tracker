import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const response = await fetch(`${backendUrl}/job/${params.id}`, {
    headers: {
      Cookie: request.headers.get('cookie') || '',
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const body = await request.json();

  const response = await fetch(`${backendUrl}/job/${params.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const body = await request.json();

  const response = await fetch(`${backendUrl}/job/${params.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const response = await fetch(`${backendUrl}/job/${params.id}`, {
    method: 'DELETE',
    headers: {
      Cookie: request.headers.get('cookie') || '',
    },
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}