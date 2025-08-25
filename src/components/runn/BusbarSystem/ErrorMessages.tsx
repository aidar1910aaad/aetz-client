import React from 'react';
import { BusMaterial } from '@/store/useRunnStore';

interface ErrorMessagesProps {
  selectedMaterial: BusMaterial | null;
  hasMatchingConfig: boolean;
}

export const ErrorMessages: React.FC<ErrorMessagesProps> = ({
  selectedMaterial,
  hasMatchingConfig,
}) => {
  if (!selectedMaterial) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <p className="text-red-800">
          Выберите материал для расчета сборных шин
        </p>
      </div>
    );
  }

  if (!hasMatchingConfig) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <p className="text-red-800">
          Не найдена подходящая конфигурация для выбранного выключателя и материала
        </p>
      </div>
    );
  }

  return null;
};

