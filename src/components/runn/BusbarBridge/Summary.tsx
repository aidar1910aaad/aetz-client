import React from 'react';
import { BusbarBridge, BusMaterial } from '@/store/useRunnStore';
import { Switchgear } from '@/api/switchgear';

interface SummaryProps {
  busBridgeMaterial: BusMaterial | null;
  matchingConfig: Switchgear;
  busbarBridgeCalculationResult: any;
  totalBridgePrice: number;
  bridges: BusbarBridge[];
  totalBridgeWeight: number;
}

export const Summary: React.FC<SummaryProps> = ({
  busBridgeMaterial,
  matchingConfig,
  busbarBridgeCalculationResult,
  totalBridgePrice,
  bridges,
  totalBridgeWeight,
}) => {
  const grandTotal = busbarBridgeCalculationResult 
    ? busbarBridgeCalculationResult.totalWithNds + totalBridgePrice 
    : totalBridgePrice;

  return (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        Итоговая сводка по шинному мосту РУНН
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Материал моста:</span>
            <span className="font-medium">{busBridgeMaterial || 'Не выбран'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Конфигурация:</span>
            <span className="font-medium">{matchingConfig.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Количество мостов:</span>
            <span className="font-medium">{bridges.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Общий вес:</span>
            <span className="font-medium">{totalBridgeWeight.toFixed(2)} кг</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Стоимость материала:</span>
            <span className="font-medium">{totalBridgePrice.toLocaleString()} тг</span>
          </div>
          {busbarBridgeCalculationResult && (
            <div className="flex justify-between">
              <span className="text-gray-600">Стоимость работ:</span>
              <span className="font-medium">
                {busbarBridgeCalculationResult.totalWithNds.toLocaleString()} тг
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

      {/* Детали мостов */}
      {bridges.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Детали мостов:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {bridges.map((bridge, index) => (
              <div key={index} className="bg-white p-2 rounded border">
                <span className="text-gray-600">Мост #{index + 1}:</span>
                <span className="ml-2 font-medium">
                  {bridge.length}м × {bridge.width}мм × {bridge.quantity}шт
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

