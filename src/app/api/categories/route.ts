import { NextResponse } from 'next/server';
import { api } from '@/api/baseUrl/index';

export async function GET(request: Request) {
  try {
    console.log('GET /api/categories request received');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    const response = await fetch(`${api}/categories`, {
      headers: {
        Authorization: request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка при получении категорий: ${response.status}`);
    }

    const data = await response.json();
    console.log('Categories fetched successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json({ message: 'Ошибка при получении категорий' }, { status: 500 });
  }
}
