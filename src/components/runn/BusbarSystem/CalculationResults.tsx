import React from 'react';
import { BusMaterial, RunnCell } from '@/store/useRunnStore';
import { Switchgear } from '@/api/switchgear';

interface CalculationResultsProps {
  matchingConfig: Switchgear;
  totalWeight: number;
  totalPrice: number;
  getPricePerKg: (material: BusMaterial) => number;
  busMaterial: BusMaterial | null;
  cellConfigs: RunnCell[];
}

export const CalculationResults: React.FC<CalculationResultsProps> = ({
  matchingConfig,
  totalWeight,
  totalPrice,
  getPricePerKg,
  busMaterial,
  cellConfigs,
}) => {
  const pricePerKg = busMaterial ? getPricePerKg(busMaterial) : 0;

  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded">
      <h4 className="font-medium text-green-900 mb-3">Результаты расчета</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Конфигурация:</span>
          <div className="font-medium">{matchingConfig.id}</div>
        </div>
        <div>
          <span className="text-gray-600">Общий вес:</span>
          <div className="font-medium">{totalWeight.toFixed(2)} кг</div>
        </div>
        <div>
          <span className="text-gray-600">Цена за кг:</span>
          <div className="font-medium">{pricePerKg.toLocaleString()} тг</div>
        </div>
        <div>
          <span className="text-gray-600">Общая стоимость:</span>
          <div className="font-medium text-green-700">
            {totalPrice.toLocaleString()} тг
          </div>
        </div>
      </div>
      
      {/* Детали конфигурации */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-green-800">
          Детали конфигурации
        </summary>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {Object.entries(matchingConfig)
            .filter(([key, value]) => key.startsWith('w') && typeof value === 'number' && value > 0)
            .map(([key, weight]) => (
              <div key={key} className="bg-white p-2 rounded">
                <span className="text-gray-600">{key}:</span>
                <span className="ml-1 font-medium">{weight} кг</span>
              </div>
            ))}
        </div>
      </details>
    </div>
  );
};

