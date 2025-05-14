'use client';

import { useState } from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import RunnFormFields from './RunnFormFields';

const cellTypesByVoltage: Record<number, string[]> = {
  10: ['ЩО-70', 'ЩО-90', 'ПР11', 'РУНН-1', 'РУНН-2'],
  0.4: ['РУНН-0.4', 'ЩО-70-0.4', 'ЩО-90-0.4'],
};

export default function RunnConfigurator() {
  const { selectedTransformer } = useTransformerStore();
  const voltage = selectedTransformer?.voltage || 0.4;
  const availableCells = cellTypesByVoltage[voltage] || [];

  const [showCells, setShowCells] = useState(true);

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-4">Конфигурация РУНН ({voltage} кВ)</h1>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setShowCells((prev) => !prev)}
          className="text-sm px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
        >
          {showCells ? 'Нет (скрыть конфигурацию)' : 'Показать конфигурацию'}
        </button>

        <Link href="/dashboard/final">
          <button className="bg-[#3A55DF] text-white px-4 py-2 rounded-[20px] hover:bg-blue-700 transition">
            Текущая заявка
          </button>
        </Link>
      </div>

      {showCells && <RunnFormFields availableCells={availableCells} />}
    </div>
  );
}
