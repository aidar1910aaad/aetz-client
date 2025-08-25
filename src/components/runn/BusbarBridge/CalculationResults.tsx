import React from 'react';
import { BusbarBridge, BusMaterial, RunnCell } from '@/store/useRunnStore';
import { Switchgear } from '@/api/switchgear';

interface CalculationResultsProps {
  matchingConfig: Switchgear;
  bridges: BusbarBridge[];
  totalBridgeWeight: number;
  totalBridgePrice: number;
  getPricePerKg: (material: BusMaterial) => number;
  busBridgeMaterial: BusMaterial | null;
  cellConfigs: RunnCell[];
  calculateBridgeWeight: (bridge: BusbarBridge) => number;
}

export const CalculationResults: React.FC<CalculationResultsProps> = ({
  matchingConfig,
  bridges,
  totalBridgeWeight,
  totalBridgePrice,
  getPricePerKg,
  busBridgeMaterial,
  cellConfigs,
  calculateBridgeWeight,
}) => {
  const pricePerKg = busBridgeMaterial ? getPricePerKg(busBridgeMaterial) : 0;

  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded">
      <h4 className="font-medium text-green-900 mb-3">Результаты расчета шинного моста</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-600">Конфигурация:</span>
          <div className="font-medium">{matchingConfig.id}</div>
        </div>
        <div>
          <span className="text-gray-600">Количество мостов:</span>
          <div className="font-medium">{bridges.length}</div>
        </div>
        <div>
          <span className="text-gray-600">Цена за кг:</span>
          <div className="font-medium">{pricePerKg.toLocaleString()} тг</div>
        </div>
        <div>
          <span className="text-gray-600">Общая стоимость:</span>
          <div className="font-medium text-green-700">
            {totalBridgePrice.toLocaleString()} тг
          </div>
        </div>
      </div>
      
      {/* Детали мостов */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-green-800">
          Детали шинных мостов
        </summary>
        <div className="mt-2 space-y-2">
          {bridges.map((bridge, index) => (
            <div key={index} className="bg-white p-3 rounded border text-xs">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="text-gray-600">Мост #{index + 1}:</span>
                  <div>{bridge.length}м × {bridge.width}мм × {bridge.quantity}шт</div>
                </div>
                <div>
                  <span className="text-gray-600">Вес:</span>
                  <div>{calculateBridgeWeight(bridge).toFixed(2)} кг</div>
                </div>
                <div>
                  <span className="text-gray-600">Стоимость:</span>
                  <div>{(calculateBridgeWeight(bridge) * pricePerKg).toLocaleString()} тг</div>
                </div>
                <div>
                  <span className="text-gray-600">Материал:</span>
                  <div>{busBridgeMaterial}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-gray-100 p-3 rounded text-xs font-medium">
            <div className="flex justify-between">
              <span>Общий вес:</span>
              <span>{totalBridgeWeight.toFixed(2)} кг</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};

