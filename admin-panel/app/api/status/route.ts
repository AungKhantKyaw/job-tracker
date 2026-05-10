import { apiFetch } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  
  const response = await apiFetch(`${backendUrl}/status`, {
    headers: {
      Cookie: request.headers.get('cookie') || '',
    },
  });
  
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}