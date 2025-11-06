'use client';

import React from 'react';
import UniversalTable from './UniversalTable';
import type { TableConfig } from './UniversalTable';

// Пример конфигурации для новой секции "Материалы"
export const materialsTableConfig: TableConfig = {
  id: 'materials',
  title: 'Материалы',
  columns: [
    {
      key: 'name',
      title: 'Наименование',
      width: 'w-1/3',
      align: 'left',
    },
    {
      key: 'specification',
      title: 'Характеристики',
      width: 'w-1/4',
      align: 'left',
    },
    {
      key: 'unit',
      title: 'Ед. изм.',
      width: 'w-16',
      align: 'center',
    },
    {
      key: 'quantity',
      title: 'Кол-во',
      width: 'w-16',
      align: 'center',
    },
    {
      key: 'price',
      title: 'Цена',
      width: 'w-24',
      align: 'center',
      formatter: (value: any) => typeof value === 'number' ? value.toLocaleString('ru-RU') + ' ₸' : '—',
    },
    {
      key: 'total',
      title: 'Сумма',
      width: 'w-24',
      align: 'center',
      formatter: (value: any, row: any) => {
        const price = typeof row.price === 'number' ? row.price : 0;
        const quantity = typeof row.quantity === 'number' ? row.quantity : 1;
        const total = price * quantity;
        return typeof total === 'number' ? total.toLocaleString('ru-RU') + ' ₸' : '—';
      },
    },
  ],
  dataMapper: (materialsData: any[]) => {
    return materialsData.map((material, idx) => ({
      id: `material-${idx}`,
      name: material.name,
      specification: material.specification || '—',
      unit: material.unit || 'шт',
      quantity: material.quantity || 1,
      price: material.price || 0,
      total: (material.price || 0) * (material.quantity || 1),
    }));
  },
  emptyMessage: 'Материалы не выбраны',
  showTotal: true,
};

// Пример использования новой секции
interface ExampleNewSectionProps {
  materials: any[];
}

export default function ExampleNewSection({ materials }: ExampleNewSectionProps) {
  return (
    <UniversalTable 
      config={materialsTableConfig}
      data={materials}
    />
  );
}

// Пример данных для тестирования
export const exampleMaterialsData = [
  {
    name: 'Кабель ВВГнг 3x2.5',
    specification: 'Медь, 3 жилы, 2.5мм²',
    unit: 'м',
    quantity: 100,
    price: 250,
  },
  {
    name: 'Автоматический выключатель',
    specification: '16А, характеристика C',
    unit: 'шт',
    quantity: 5,
    price: 1500,
  },
  {
    name: 'Шина медная',
    specification: '40x4мм, длина 3м',
    unit: 'шт',
    quantity: 2,
    price: 5000,
  },
];