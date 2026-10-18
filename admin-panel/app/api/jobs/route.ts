import { apiFetch } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';

  const params = new URLSearchParams({ page, limit });
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  if (search) params.set('search', search);
  if (status) params.set('status', status);

  const response = await apiFetch(`${backendUrl}/job?${params.toString()}`, {
    headers: {
      Cookie: request.headers.get('cookie') || '',
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const body = await request.json();

  const response = await apiFetch(`${backendUrl}/job`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}