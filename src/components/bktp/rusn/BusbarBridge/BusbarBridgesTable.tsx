import React from 'react';
import { BusMaterial } from '@/types/rusn';

interface BusbarBridge {
  id: string;
  length: number;
  quantity: number;
}

interface BusbarBridgesTableProps {
  bridges: BusbarBridge[];
  busBridgeMaterial: BusMaterial | null;
  matchingConfig: any;
  weightPerMeter: number;
  pricePerKg: number;
}

export const BusbarBridgesTable: React.FC<BusbarBridgesTableProps> = ({
  bridges,
  busBridgeMaterial,
  matchingConfig,
  weightPerMeter,
  pricePerKg,
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  // Рассчитываем стоимость для каждого моста
  const calculateBridgePrice = (bridge: BusbarBridge) => {
    const weight = weightPerMeter * bridge.length;
    return weight * pricePerKg;
  };

  // Общая стоимость всех мостов
  const totalPrice = bridges
    .filter((bridge) => bridge.length > 0)
    .reduce((sum, bridge) => sum + calculateBridgePrice(bridge) * bridge.quantity, 0);

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Шинные мосты</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Наименование
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ед.</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Цена</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Кол-во</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bridges
              .filter((bridge) => bridge.length > 0)
              .map((bridge, index) => {
                const bridgePrice = calculateBridgePrice(bridge);
                return (
                  <tr key={bridge.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      Шинный мост #{index + 1}{' '}
                      {busBridgeMaterial === 'АД' || busBridgeMaterial === 'АД2'
                        ? 'Алюминий'
                        : 'Медь'}{' '}
                      {matchingConfig.busbar} {matchingConfig.breaker} (длина: {bridge.length}м)
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">компл.</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {formatNumber(bridgePrice)} ₸
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {bridge.quantity}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {formatNumber(bridgePrice * bridge.quantity)} ₸
                    </td>
                  </tr>
                );
              })}
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                Итого по категории:
              </td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                {formatNumber(totalPrice)} ₸
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
