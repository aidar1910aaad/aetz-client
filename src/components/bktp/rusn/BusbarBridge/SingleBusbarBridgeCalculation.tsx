import React, { useState } from 'react';
import { BusMaterial } from '@/types/rusn';
import { Switchgear } from '@/api/switchgear';
import { calculateCost } from '@/utils/calculationUtils';
import MaterialsTable from '@/app/dashboard/bktp/rusn/components/MaterialsTable';

interface BusbarBridge {
  id: string;
  length: number;
  quantity: number;
}

interface SingleBusbarBridgeCalculationProps {
  bridge: BusbarBridge;
  busBridgeMaterial: BusMaterial | null;
  matchingConfig: Switchgear;
  weightPerMeter: number;
  pricePerKg: number;
  index: number;
  busbarBridgeCalculation: any;
}

export const SingleBusbarBridgeCalculation: React.FC<SingleBusbarBridgeCalculationProps> = ({
  bridge,
  busBridgeMaterial,
  matchingConfig,
  weightPerMeter,
  pricePerKg,
  index,
  busbarBridgeCalculation,
}) => {
  const [showCalculation, setShowCalculation] = useState(false);

  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  // Рассчитываем стоимость для этого моста
  const calculateBridgePrice = () => {
    const weight = weightPerMeter * bridge.length;
    return weight * pricePerKg;
  };

  const bridgePrice = calculateBridgePrice();
  // Для калькуляции берем стоимость одной единицы
  const bridgePricePerUnit = bridgePrice;

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

  // Общая стоимость материалов для одной единицы (шинный мост + дополнительные материалы)
  const totalMaterialsPricePerUnit = bridgePricePerUnit + additionalMaterialsTotal;

  // Базовая калькуляция для одной единицы
  const calculationResult = calculateCost(totalMaterialsPricePerUnit, {
    hourlyRate: 2000,
    manufacturingHours: 1,
    overheadPercentage: 10,
    adminPercentage: 15,
    plannedProfitPercentage: 10,
    ndsPercentage: 12,
  });

  if (bridge.length === 0) return null;

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold text-gray-900">№{index + 1} Калькуляция моста</h5>
        <button
          onClick={() => setShowCalculation(!showCalculation)}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            showCalculation
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showCalculation ? 'Скрыть' : 'Показать'} детали калькуляции
        </button>
      </div>

      {/* Основная информация о калькуляции */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Отпускная цена (с НДС)</div>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(calculationResult.finalPrice * bridge.quantity)} ₸
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Оптовая цена (без НДС)</div>
          <div className="text-xl font-semibold text-blue-600">
            {formatNumber(calculationResult.wholesalePrice * bridge.quantity)} ₸
          </div>
        </div>
      </div>

      {/* Детали калькуляции */}
      {showCalculation && (
        <div className="space-y-4">
          {/* Дополнительные материалы */}
          {busbarBridgeCalculation?.data?.categories && (
            <div className="space-y-4">
              {busbarBridgeCalculation.data.categories.map((category: any, catIndex: number) => (
                <MaterialsTable key={catIndex} category={category} />
              ))}
            </div>
          )}

          {/* Таблица материалов */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Материалы</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Наименование
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ед.</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Цена</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
                      Кол-во
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
                      Сумма
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
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
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">1</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {formatNumber(bridgePrice)} ₸
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td
                      colSpan={4}
                      className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                    >
                      Итого по материалам:
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                      {formatNumber(totalMaterialsPricePerUnit)} ₸
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Расчет стоимости */}
          <div className="mt-6 space-y-4">
            <h6 className="text-md font-semibold text-gray-800">Расчет стоимости:</h6>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Итого по материалам:</span>
                <span className="font-medium">
                  {formatNumber(calculationResult.materialsTotal)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Зарплата на изделие:</span>
                <span className="font-medium">{formatNumber(calculationResult.salary)} ₸</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Общепроизводственные расходы (10%):</span>
                <span className="font-medium">
                  {formatNumber(calculationResult.overheadCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-semibold text-gray-700">
                  Производственная себестоимость:
                </span>
                <span className="font-semibold">
                  {formatNumber(calculationResult.productionCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Административные расходы (15%):</span>
                <span className="font-medium">{formatNumber(calculationResult.adminCost)} ₸</span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-semibold text-gray-700">Полная себестоимость:</span>
                <span className="font-semibold">{formatNumber(calculationResult.fullCost)} ₸</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Плановые накопления (10%):</span>
                <span className="font-medium">
                  {formatNumber(calculationResult.plannedProfit)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-semibold text-gray-700">Оптовая цена:</span>
                <span className="font-semibold text-blue-600">
                  {formatNumber(calculationResult.wholesalePrice)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">НДС (12%):</span>
                <span className="font-medium">{formatNumber(calculationResult.ndsAmount)} ₸</span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-lg font-bold text-gray-900">Отпускная расчетная цена:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatNumber(calculationResult.finalPrice * bridge.quantity)} ₸
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
