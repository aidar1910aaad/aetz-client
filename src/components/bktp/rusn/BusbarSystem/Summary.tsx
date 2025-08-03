import React from 'react';
import { BusMaterial } from '@/types/rusn';

interface SummaryProps {
  busBridgeMaterial: BusMaterial | null;
  matchingConfig: any;
  busbarCalculationResult: any;
  totalPrice: number;
}

export const Summary: React.FC<SummaryProps> = ({
  busBridgeMaterial,
  matchingConfig,
  busbarCalculationResult,
  totalPrice,
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  return (
    <div className="mt-6">
      <div className="text-sm font-medium text-gray-800">
        Сборный шина{' '}
        {busBridgeMaterial === 'АД' || busBridgeMaterial === 'АД2' ? 'Алюминий' : 'Медь'}{' '}
        {matchingConfig.busbar}{' '}
        {busbarCalculationResult
          ? formatNumber(busbarCalculationResult.finalPrice)
          : formatNumber(totalPrice)}{' '}
        ₸
      </div>
    </div>
  );
};
