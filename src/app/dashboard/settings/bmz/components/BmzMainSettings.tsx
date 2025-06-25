'use client';

import { BmzSettings } from '@/api/bmz';

interface BmzMainSettingsProps {
  settings: BmzSettings;
}

export default function BmzMainSettings({ settings }: BmzMainSettingsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Основные настройки</h2>
      <div className="grid grid-cols-1 gap-4">
        {/* <div>
          <p className="text-gray-600">Базовая цена за м²:</p>
          <p className="text-lg font-medium">
            {Number(settings.basePricePerSquareMeter).toLocaleString()} тг
          </p>
        </div> */}
        <div>
          <p className="text-gray-600">Статус:</p>
          <p className="text-lg font-medium">{settings.isActive ? 'Активно' : 'Неактивно'}</p>
        </div>
      </div>
    </div>
  );
}
