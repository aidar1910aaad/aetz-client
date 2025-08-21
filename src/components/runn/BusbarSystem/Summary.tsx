import React from 'react';
import { BusMaterial } from '@/store/useRunnStore';
import { Switchgear } from '@/api/switchgear';

interface SummaryProps {
  busMaterial: BusMaterial | null;
  matchingConfig: Switchgear;
  busbarCalculationResult: any;
  totalPrice: number;
}

export const Summary: React.FC<SummaryProps> = ({
  busMaterial,
  matchingConfig,
  busbarCalculationResult,
  totalPrice,
}) => {
  const grandTotal = busbarCalculationResult 
    ? busbarCalculationResult.totalWithNds + totalPrice 
    : totalPrice;

  return (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        Итоговая сводка по сборным шинам РУНН
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Материал шин:</span>
            <span className="font-medium">{busMaterial || 'Не выбран'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Конфигурация:</span>
            <span className="font-medium">{matchingConfig.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Напряжение:</span>
            <span className="font-medium">{matchingConfig.voltage} кВ</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Стоимость материала шин:</span>
            <span className="font-medium">{totalPrice.toLocaleString()} тг</span>
          </div>
          {busbarCalculationResult && (
            <div className="flex justify-between">
              <span className="text-gray-600">Стоимость работ:</span>
              <span className="font-medium">
                {busbarCalculationResult.totalWithNds.toLocaleString()} тг
              </span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-semibold">Общая стоимость:</span>
            <span className="font-bold text-blue-700 text-lg">
              {grandTotal.toLocaleString()} тг
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

