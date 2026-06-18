import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { RusnQuickActions } from '@/components/bktp/rusn/RusnQuickActions';

interface RusnHeaderProps {
  voltage: string;
  cellCount: number;
}

export default function RusnHeader({ voltage, cellCount }: RusnHeaderProps) {
  return (
    <div className="mb-8">
      <Breadcrumbs />
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#8eba1e] rounded-xl">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Конфигурация РУСН</h1>
            <p className="text-sm text-gray-600 mt-1">
              Напряжение: {voltage} кВ • {cellCount} ячеек
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <RusnQuickActions />
      </div>
    </div>
  );
}
