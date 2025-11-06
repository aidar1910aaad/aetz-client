'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type RunnMode = 'not-configured' | 'configured';

interface RunnHeaderProps {
  voltage: number | string;
  cellCount: number;
  mode: RunnMode;
  onModeChange: (mode: RunnMode) => void;
  loading?: boolean;
}

export const RunnHeader: React.FC<RunnHeaderProps> = ({ 
  voltage, 
  cellCount, 
  mode, 
  onModeChange,
  loading = false 
}) => {
  const modes = [
    {
      id: 'not-configured' as RunnMode,
      label: 'Не предусмотрено',
      description: 'РУНН не требуется для данного проекта',
    },
    {
      id: 'configured' as RunnMode,
      label: 'Настроить РУНН',
      description: 'Конфигурация распределительного устройства низкого напряжения',
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Header Info */}
      <div className="px-6 py-4 border-b border-gray-200">
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

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span className="text-sm font-medium text-yellow-900">Загрузка настроек РУНН...</span>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      {!loading && (
        <div className="px-6 py-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Выберите режим работы с РУНН</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modes.map((modeOption) => (
                <label
                  key={modeOption.id}
                  className={cn(
                    'relative flex cursor-pointer rounded-lg p-4 border-2 transition-colors',
                    mode === modeOption.id
                      ? 'border-[#3A55DF] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    name="runn-mode"
                    value={modeOption.id}
                    checked={mode === modeOption.id}
                    onChange={() => onModeChange(modeOption.id)}
                    className="sr-only"
                  />
                  <div className="flex items-start">
                    <div className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2 mt-0.5',
                      mode === modeOption.id
                        ? 'border-[#3A55DF] bg-[#3A55DF]'
                        : 'border-gray-300'
                    )}>
                      {mode === modeOption.id && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className={cn('text-sm font-medium', 
                        mode === modeOption.id ? 'text-[#3A55DF]' : 'text-gray-900'
                      )}>
                        {modeOption.label}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {modeOption.description}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

