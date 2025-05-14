'use client';

import { useState } from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import Link from 'next/link';
import RusnFormFields from './RusnFormFields';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';

const cellTypesByVoltage: Record<number, string[]> = {
  10: ['КСО-А12-10', 'КСО-366', 'КСО-А212', 'КМ1-АФ', 'ЯКНО', '8DJH'],
  20: ['КСО-А17-20', '8DJH'],
};

export default function RusnConfigurator() {
  const { selectedTransformer } = useTransformerStore();
  const voltage = selectedTransformer?.voltage || 10;
  const availableCells = cellTypesByVoltage[voltage] || [];

  const [showCells, setShowCells] = useState(true);

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-4">Конфигурация РУСН ({voltage} кВ)</h1>

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

      {showCells && <RusnFormFields availableCells={availableCells} />}
    </div>
  );
}
