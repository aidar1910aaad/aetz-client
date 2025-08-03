import React from 'react';
import { Switchgear } from '@/api/switchgear';
import { BusMaterial } from '@/types/rusn';

interface BusbarBridge {
  id: string;
  length: number;
  quantity: number;
}

interface CalculationResultsProps {
  matchingConfig: Switchgear;
  weightPerMeter: number;
  totalWeight: number;
  totalPrice: number;
  bridges: BusbarBridge[];
  getPricePerKg: (material: BusMaterial) => number;
  busBridgeMaterial: BusMaterial | null;
}

export const CalculationResults: React.FC<CalculationResultsProps> = ({
  matchingConfig,
  weightPerMeter,
  totalWeight,
  totalPrice,
  bridges,
  getPricePerKg,
  busBridgeMaterial,
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  // Рассчитываем общую длину всех мостов
  const totalLength = bridges.reduce((sum, bridge) => sum + bridge.length, 0);

  // Рассчитываем общее количество всех мостов
  const totalQuantity = bridges.reduce((sum, bridge) => sum + bridge.quantity, 0);

  // Рассчитываем среднюю длину для формулы
  const averageLength = totalLength / bridges.length;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-md p-5">
      <div className="flex items-center space-x-2 mb-4">
        <svg
          className="w-5 h-5 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <h4 className="text-lg font-semibold text-gray-900">Расчет шинного моста</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Масса на 1 м</div>
          <div className="text-xl font-bold text-gray-900">{formatNumber(weightPerMeter)} кг/м</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Цена за кг</div>
          <div className="text-xl font-bold text-blue-600">
            {formatNumber(getPricePerKg(busBridgeMaterial!))} ₸
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Общая масса</div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(totalWeight)} кг</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Общая длина</div>
          <div className="text-2xl font-bold text-purple-600">{formatNumber(totalLength)} м</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Итоговая стоимость</div>
          <div className="text-2xl font-bold text-green-600">{formatNumber(totalPrice)} ₸</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4">
        <div className="text-sm text-gray-600 mb-2">Формула расчета:</div>
        <div className="text-sm font-mono text-gray-800">
          {formatNumber(weightPerMeter)} кг/м × {formatNumber(totalLength)} м ×{' '}
          {formatNumber(getPricePerKg(busBridgeMaterial!))} ₸/кг = {formatNumber(totalPrice)} ₸
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Детализация:{' '}
          {bridges.map((bridge, index) => `${bridge.length}м × ${bridge.quantity}шт`).join(' + ')}
        </div>
      </div>
    </div>
  );
};
