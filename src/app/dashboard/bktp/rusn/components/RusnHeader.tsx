import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { RusnQuickActions } from '@/components/bktp/rusn/RusnQuickActions';

interface RusnHeaderProps {
  voltage: string;
  cellCount: number;
}

export default function RusnHeader({ voltage, cellCount }: RusnHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <Breadcrumbs />
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Конфигурация РУСН</h1>
          <p className="text-sm text-gray-600 mt-1">
            Напряжение: {voltage} кВ • {cellCount} ячеек
          </p>
        </div>

        {/* Quick Actions */}
        <RusnQuickActions voltage={voltage} />
      </div>
    </div>
  );
}
