import { NextResponse } from 'next/server';
import { Switchgear, CreateSwitchgearDto } from '@/api/switchgear';

// Данные загружаются только с сервера
let switchgearConfigs: Switchgear[] = [];
let nextId = 1;

export async function GET(request: Request) {
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const amperage = searchParams.get('amperage');
    const group = searchParams.get('group');

    // Загружаем данные с сервера
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (amperage) queryParams.append('amperage', amperage);
    if (group) queryParams.append('group', group);

    const response = await fetch(`${baseUrl}/api/switchgear?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching switchgear configurations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch switchgear configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const data: CreateSwitchgearDto = await request.json();

    // Отправляем данные на сервер
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/switchgear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const newConfig = await response.json();
    return NextResponse.json(newConfig);
  } catch (error) {
    console.error('Error creating switchgear configuration:', error);
    return NextResponse.json(
      { error: 'Failed to create switchgear configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const data: CreateSwitchgearDto = await request.json();

    // Отправляем данные на сервер
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/switchgear/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Switchgear configuration not found' }, { status: 404 });
      }
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const updatedConfig = await response.json();
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error updating switchgear configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update switchgear configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    // Отправляем запрос на сервер
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/switchgear/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Switchgear configuration not found' }, { status: 404 });
      }
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting switchgear configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete switchgear configuration' },
      { status: 500 }
    );
  }
}
