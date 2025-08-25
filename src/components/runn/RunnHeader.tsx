'use client';

import React from 'react';

interface RunnHeaderProps {
  voltage: number | string;
  cellCount: number;
}

export const RunnHeader: React.FC<RunnHeaderProps> = ({ voltage, cellCount }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Конфигурация РУНН</h1>
          <p className="text-sm text-gray-500 mt-1">
            Напряжение: {voltage} кВ • {cellCount} ячеек
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Режим РУНН:</div>
            <div className="font-medium text-gray-900">
              {cellCount > 0 ? 'Настроить РУНН' : 'Не предусмотрено'}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">РУНН-{voltage}кВ:</div>
            <div className="font-medium text-gray-900">
              {cellCount > 0 ? 'Настроен' : 'Не настроен'}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Ячеек:</div>
            <div className="font-medium text-gray-900">{cellCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

