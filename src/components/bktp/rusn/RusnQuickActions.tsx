'use client';

import React from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import Link from 'next/link';

interface RusnQuickActionsProps {
  voltage: string;
  onReset?: () => void;
}

export const RusnQuickActions: React.FC<RusnQuickActionsProps> = ({ voltage, onReset }) => {
  const { cellConfigs, reset } = useRusnStore();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      reset();
    }
  };

  const hasConfiguration = cellConfigs.length > 0;

  return (
    <div className="flex items-center gap-3">
      {/* Preview Button */}
      <Link href="/dashboard/final">
        <button className="bg-[#3A55DF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          Предварительный просмотр
        </button>
      </Link>

      {/* Reset Button - только если есть конфигурация */}
      {hasConfiguration && (
        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium border border-gray-300 rounded-lg hover:border-red-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Сбросить
        </button>
      )}

      {/* Help Button */}
      <button className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};
