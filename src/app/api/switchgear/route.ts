import { NextResponse } from 'next/server';
import { Switchgear, CreateSwitchgearDto } from '@/api/switchgear';

// Временное хранилище для демонстрации
let switchgearConfigs: Switchgear[] = [
  {
    id: 1,
    type: 'Камера КСО А12-10',
    breaker: 'AV-12 1250A',
    amperage: 1320,
    group: 'АД',
    busbar: '80x8',
    cells: [
      { name: 'Ввод', quantity: 10 },
      { name: 'СВ', quantity: 10 },
      { name: 'ОТХ', quantity: 10 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'Камера тест',
    breaker: 'AV-12 1250A',
    amperage: 1320,
    group: 'АД',
    busbar: '80x8',
    cells: [
      { name: 'Ввод', quantity: 8 },
      { name: 'СВ', quantity: 8 },
      { name: 'ОТХ', quantity: 8 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
let nextId = 3;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const amperage = searchParams.get('amperage');
    const group = searchParams.get('group');

    let filtered = [...switchgearConfigs];

    if (type) {
      filtered = filtered.filter((config) => config.type === type);
    }
    if (amperage) {
      filtered = filtered.filter((config) => config.amperage.toString() === amperage);
    }
    if (group) {
      filtered = filtered.filter((config) => config.group === group);
    }

    return NextResponse.json(filtered);
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
    const data: CreateSwitchgearDto = await request.json();
    const newConfig: Switchgear = {
      id: nextId++,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    switchgearConfigs.push(newConfig);
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
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const data: CreateSwitchgearDto = await request.json();

    const index = switchgearConfigs.findIndex((config) => config.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Switchgear configuration not found' }, { status: 404 });
    }

    const updatedConfig: Switchgear = {
      ...switchgearConfigs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    switchgearConfigs[index] = updatedConfig;

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
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    const index = switchgearConfigs.findIndex((config) => config.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Switchgear configuration not found' }, { status: 404 });
    }

    switchgearConfigs = switchgearConfigs.filter((config) => config.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting switchgear configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete switchgear configuration' },
      { status: 500 }
    );
  }
}
