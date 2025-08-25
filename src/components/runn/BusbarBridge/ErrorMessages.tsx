import React from 'react';
import { BusMaterial } from '@/store/useRunnStore';

interface ErrorMessagesProps {
  selectedMaterial: BusMaterial | null;
  hasMatchingConfig: boolean;
  length: number;
}

export const ErrorMessages: React.FC<ErrorMessagesProps> = ({
  selectedMaterial,
  hasMatchingConfig,
  length,
}) => {
  if (!selectedMaterial) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <p className="text-red-800">
          Выберите материал для расчета шинного моста
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

  if (length <= 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-yellow-800">
          Добавьте шинные мосты с указанием длины для расчета
        </p>
      </div>
    );
  }

  return null;
};

