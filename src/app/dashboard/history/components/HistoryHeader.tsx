'use client';

import { FileDiff } from 'lucide-react';

interface HistoryHeaderProps {
  total: number;
  showing: number;
  loading: boolean;
}

export default function HistoryHeader({ total, showing, loading }: HistoryHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gray-100 rounded-xl">
          <FileDiff className="w-6 h-6 text-[#8eba1e]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">История изменений</h1>
          <p className="text-gray-600">Просмотр всех изменений в системе</p>
        </div>
      </div>

      {(total > 0 || showing > 0) && (
        <div className="flex items-center gap-6 mb-6">
          <div className="bg-gray-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-600">Всего изменений: </span>
            <span className="font-semibold text-[#8eba1e]">{total || 0}</span>
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-600">Показано: </span>
            <span className="font-semibold text-[#8eba1e]">{showing || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

