import { apiFetch } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const body = await request.json();

  const response = await apiFetch(`${backendUrl}/auth/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
