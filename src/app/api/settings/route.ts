import { api } from '@/api/baseUrl';
import { NextResponse } from 'next/server';

// Временные данные для тестирования
const mockSettings = {
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    rusn: [],
    bmz: [],
    runn: [],
    work: [],
    transformer: [],
    additionalEquipment: [],
    sr: [],
    tsn: [],
    tn: [],
  },
};

export async function GET(request: Request) {
  try {
    console.log('GET /api/settings request received');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    const response = await fetch(`${api}/settings`, {
      headers: {
        Authorization: request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка при получении настроек: ${response.status}`);
    }

    const data = await response.json();
    console.log('Settings fetched successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching settings:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json({ message: 'Ошибка при получении настроек' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Creating settings with body:', body);

    // Здесь должна быть логика создания настроек в базе данных

    return NextResponse.json({ message: 'Настройки созданы' });
  } catch (error) {
    console.error('Error creating settings:', error);
    return NextResponse.json({ message: 'Ошибка при создании настроек' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('PUT /api/settings request received');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    const body = await request.json();
    console.log('Request body:', body);

    // Проверяем формат данных
    if (!body.settings || typeof body.settings !== 'object') {
      console.error('Invalid request format: missing or invalid settings object');
      return NextResponse.json({ message: 'Неверный формат данных' }, { status: 400 });
    }

    // Проверяем формат каждой секции
    for (const [section, items] of Object.entries(body.settings)) {
      if (!Array.isArray(items)) {
        console.error(`Invalid section format: ${section} is not an array`);
        return NextResponse.json({ message: `Неверный формат секции ${section}` }, { status: 400 });
      }

      // Проверяем формат каждого элемента
      for (const item of items) {
        if (!item.categoryId || !item.type || typeof item.isVisible !== 'boolean') {
          console.error(`Invalid item format in section ${section}:`, item);
          return NextResponse.json(
            { message: `Неверный формат элемента в секции ${section}` },
            { status: 400 }
          );
        }
      }
    }

    const response = await fetch(`${api}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', errorData);
      throw new Error(errorData?.message || `Ошибка при обновлении настроек: ${response.status}`);
    }

    // Проверяем тип контента
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      throw new Error('Неверный формат ответа от сервера');
    }

    const data = await response.json();
    console.log('Settings updated successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating settings:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json({ message: 'Ошибка при обновлении настроек' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}
