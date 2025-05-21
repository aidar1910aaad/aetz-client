import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Creating settings with body:', body);
    
    // Здесь должна быть логика создания настроек в базе данных
    
    return NextResponse.json({ message: 'Настройки созданы' });
  } catch (error) {
    console.error('Error creating settings:', error);
    return NextResponse.json(
      { message: 'Ошибка при создании настроек' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log('Updating settings with body:', body);
    
    // Здесь должна быть логика обновления настроек в базе данных
    
    return NextResponse.json({ message: 'Настройки обновлены' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Ошибка при обновлении настроек' },
      { status: 500 }
    );
  }
} 