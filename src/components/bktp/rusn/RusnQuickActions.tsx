'use client';

import React from 'react';
import { useRusnStore } from '@/store/useRusnStore';

interface RusnQuickActionsProps {
  onReset?: () => void;
}

export const RusnQuickActions: React.FC<RusnQuickActionsProps> = ({ onReset }) => {
  const { cellConfigs, reset } = useRusnStore();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      reset();
    }
  };

  const hasConfiguration = cellConfigs.length > 0;

  if (!hasConfiguration) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleReset}
        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-red-300 hover:text-red-600"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        Сбросить
      </button>
    </div>
  );
};
