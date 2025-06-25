import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    console.log('PUT /settings/update request received');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    const body = await request.json();
    console.log('Request body:', body);

    // Проверяем формат данных
    if (!body.settings || typeof body.settings !== 'object') {
      console.error('Invalid request format: missing or invalid settings object');
      return NextResponse.json(
        { message: 'Неверный формат данных' },
        { status: 400 }
      );
    }

    // Проверяем наличие id
    if (!body.id) {
      console.error('Missing settings id');
      return NextResponse.json(
        { message: 'ID настройки не указан' },
        { status: 400 }
      );
    }

    // Здесь должна быть логика обновления настроек в базе данных
    // При этом обновляются только те секции, которые пришли в запросе
    
    console.log('Settings updated successfully');
    return NextResponse.json({
      ...body,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { message: 'Ошибка при обновлении настроек' },
      { status: 500 }
    );
  }
} 