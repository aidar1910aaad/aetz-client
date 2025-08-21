'use client';

import React from 'react';

export const RunnNotConfigured: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">РУНН не предусмотрено</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Для данного проекта распределительное устройство низкого напряжения не требуется.
        Выберите "Настроить РУНН" выше, если нужно добавить конфигурацию.
      </p>
    </div>
  );
};

