import React from 'react';
import { BusMaterial } from '@/types/rusn';
import { calculateCost } from '@/utils/calculationUtils';

interface BusbarBridge {
  id: string;
  length: number;
  quantity: number;
}

interface SummaryProps {
  busBridgeMaterial: BusMaterial | null;
  matchingConfig: any;
  totalPrice: number;
  bridges: BusbarBridge[];
  weightPerMeter: number;
  pricePerKg: number;
  busbarBridgeCalculation: any;
}

export const Summary: React.FC<SummaryProps> = ({
  busBridgeMaterial,
  matchingConfig,
  totalPrice,
  bridges,
  weightPerMeter,
  pricePerKg,
  busbarBridgeCalculation,
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  // Рассчитываем стоимость для одного моста
  const calculateBridgePrice = (bridge: BusbarBridge) => {
    const weight = weightPerMeter * bridge.length;
    return weight * pricePerKg;
  };

  // Рассчитываем стоимость дополнительных материалов
  const additionalMaterialsTotal =
    busbarBridgeCalculation?.data?.categories?.reduce((sum: number, category: any) => {
      return (
        sum +
        category.items.reduce((itemSum: number, item: any) => {
          return itemSum + item.price * item.quantity;
        }, 0)
      );
    }, 0) || 0;

  // Рассчитываем калькуляцию для одного моста
  const calculateSingleBridgePrice = (bridge: BusbarBridge) => {
    const bridgePrice = calculateBridgePrice(bridge);
    const totalMaterialsPrice = bridgePrice + additionalMaterialsTotal;

    const calculationResult = calculateCost(totalMaterialsPrice, {
      hourlyRate: 2000,
      manufacturingHours: 1,
      overheadPercentage: 10,
      adminPercentage: 15,
      plannedProfitPercentage: 10,
      ndsPercentage: 12,
    });

    return calculationResult.finalPrice;
  };

  const validBridges = bridges.filter((bridge) => bridge.length > 0);
  let totalFinalPrice = 0;

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-md p-4">
      <h5 className="text-lg font-semibold text-gray-900 mb-4">Итоговая сводка</h5>

      <div className="space-y-3">
        {validBridges.map((bridge, index) => {
          const singleBridgePrice = calculateSingleBridgePrice(bridge);
          const totalBridgePrice = singleBridgePrice * bridge.quantity;
          totalFinalPrice += totalBridgePrice;

          return (
            <div
              key={bridge.id}
              className="flex justify-between items-center py-2 border-b border-gray-100"
            >
              <div className="text-sm text-gray-700">
                №{index + 1} Шинный мост{' '}
                {busBridgeMaterial === 'АД' || busBridgeMaterial === 'АД2' ? 'Алюминий' : 'Медь'}{' '}
                {matchingConfig.busbar} (длина: {bridge.length}м)
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {formatNumber(singleBridgePrice)} ₸ × {bridge.quantity} шт
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatNumber(totalBridgePrice)} ₸
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
          <div className="text-lg font-semibold text-gray-900">Итого:</div>
          <div className="text-lg font-bold text-green-600">{formatNumber(totalFinalPrice)} ₸</div>
        </div>
      </div>
    </div>
  );
};
