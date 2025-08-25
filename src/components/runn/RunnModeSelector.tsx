'use client';

import React from 'react';

type RunnMode = 'not-configured' | 'configured';

interface RunnModeSelectorProps {
  mode: RunnMode;
  onModeChange: (mode: RunnMode) => void;
}

export const RunnModeSelector: React.FC<RunnModeSelectorProps> = ({ mode, onModeChange }) => {
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
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900">Выберите режим работы с РУНН</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((modeOption) => (
          <label
            key={modeOption.id}
            className={`
              relative flex cursor-pointer rounded-lg p-4 border-2 transition-colors
              ${
                mode === modeOption.id
                  ? 'border-[#3A55DF] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
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
              <div className={`
                flex h-5 w-5 items-center justify-center rounded-full border-2 mt-0.5
                ${
                  mode === modeOption.id
                    ? 'border-[#3A55DF] bg-[#3A55DF]'
                    : 'border-gray-300'
                }
              `}>
                {mode === modeOption.id && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  mode === modeOption.id ? 'text-[#3A55DF]' : 'text-gray-900'
                }`}>
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
  );
};

