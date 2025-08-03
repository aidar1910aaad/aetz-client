import React, { useState } from 'react';
import { BusMaterial } from '@/types/rusn';
import MaterialsTable from '@/app/dashboard/bktp/rusn/components/MaterialsTable';
import { BusbarBridgesTable } from './BusbarBridgesTable';

interface BusbarBridge {
  id: string;
  length: number;
  quantity: number;
}

interface BusbarBridgeCalculationProps {
  busbarBridgeCalculation: any;
  busbarBridgeCalculationResult: any;
  busBridgeMaterial: BusMaterial | null;
  matchingConfig: any;
  totalPrice: number;
  bridges: BusbarBridge[];
  weightPerMeter: number;
  pricePerKg: number;
}

export const BusbarBridgeCalculation: React.FC<BusbarBridgeCalculationProps> = ({
  busbarBridgeCalculation,
  busbarBridgeCalculationResult,
  busBridgeMaterial,
  matchingConfig,
  totalPrice,
  bridges,
  weightPerMeter,
  pricePerKg,
}) => {
  const [showBusbarBridgeCalculation, setShowBusbarBridgeCalculation] = useState(false);

  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  if (!busbarBridgeCalculation || !busbarBridgeCalculationResult) return null;

  // Рассчитываем общее количество всех мостов
  const totalQuantity = bridges.reduce((sum, bridge) => sum + bridge.quantity, 0);

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold text-gray-900">Калькуляция шинного моста</h5>
        <button
          onClick={() => setShowBusbarBridgeCalculation(!showBusbarBridgeCalculation)}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            showBusbarBridgeCalculation
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showBusbarBridgeCalculation ? 'Скрыть' : 'Показать'} детали калькуляции
        </button>
      </div>

      {/* Основная информация о калькуляции */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Отпускная цена (с НДС)</div>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(busbarBridgeCalculationResult.finalPrice * totalQuantity)} ₸
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Оптовая цена (без НДС)</div>
          <div className="text-xl font-semibold text-blue-600">
            {formatNumber(busbarBridgeCalculationResult.wholesalePrice * totalQuantity)} ₸
          </div>
        </div>
      </div>

      {/* Детали калькуляции */}
      {showBusbarBridgeCalculation && (
        <div className="space-y-4">
          {/* Таблица материалов */}
          {busbarBridgeCalculation.data.categories.map((category: any, index: number) => (
            <MaterialsTable key={index} category={category} />
          ))}

          {/* Таблица шинных мостов */}
          <BusbarBridgesTable
            bridges={bridges}
            busBridgeMaterial={busBridgeMaterial}
            matchingConfig={matchingConfig}
            weightPerMeter={weightPerMeter}
            pricePerKg={pricePerKg}
          />

          {/* Альтернативные материалы */}
          {busbarBridgeCalculation.data.cellConfig?.materials && (
            <div className="mt-6 space-y-4">
              <h6 className="text-md font-semibold text-gray-800">Альтернативные материалы:</h6>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Алюминий */}
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-900">Алюминий (АД/АД2)</span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        busBridgeMaterial === 'АД' || busBridgeMaterial === 'АД2'
                          ? 'bg-purple-600 border-purple-600'
                          : 'bg-gray-300 border-gray-300'
                      }`}
                    ></div>
                  </div>
                  <div className="text-sm text-purple-700">
                    Цена: {formatNumber(busbarBridgeCalculationResult.finalPrice * totalQuantity)} ₸
                  </div>
                </div>

                {/* Медь */}
                <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-900">Медь (МТ/МТ2)</span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        busBridgeMaterial === 'МТ' || busBridgeMaterial === 'МТ2'
                          ? 'bg-orange-600 border-orange-600'
                          : 'bg-gray-300 border-gray-300'
                      }`}
                    ></div>
                  </div>
                  <div className="text-sm text-orange-700">
                    Цена: {formatNumber(busbarBridgeCalculationResult.finalPrice * totalQuantity)} ₸
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Расчет стоимости */}
          <div className="mt-6 space-y-4">
            <h6 className="text-md font-semibold text-gray-800">Расчет стоимости:</h6>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Итого по материалам:</span>
                <span className="font-medium">
                  {formatNumber(busbarBridgeCalculationResult.materialsTotal)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Зарплата на изделие:</span>
                <span className="font-medium">
                  {formatNumber(busbarBridgeCalculationResult.salary)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Общепроизводственные расходы (
                  {busbarBridgeCalculation.data.calculation?.overheadPercentage}%):
                </span>
                <span className="font-medium">
                  {formatNumber(busbarBridgeCalculationResult.overheadCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-semibold text-gray-700">
                  Производственная себестоимость:
                </span>
                <span className="font-semibold">
                  {formatNumber(busbarBridgeCalculationResult.productionCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Административные расходы (
                  {busbarBridgeCalculation.data.calculation?.adminPercentage}%):
                </span>
                <span className="font-medium">
                  {formatNumber(busbarBridgeCalculationResult.adminCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-semibold text-gray-700">Полная себестоимость:</span>
                <span className="font-semibold">
                  {formatNumber(busbarBridgeCalculationResult.fullCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Плановые накопления (
                  {busbarBridgeCalculation.data.calculation?.plannedProfitPercentage}
                  %):
                </span>
                <span className="font-medium">
                  {formatNumber(busbarBridgeCalculationResult.plannedProfit)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-semibold text-gray-700">Оптовая цена:</span>
                <span className="font-semibold text-blue-600">
                  {formatNumber(busbarBridgeCalculationResult.wholesalePrice)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  НДС ({busbarBridgeCalculation.data.calculation?.ndsPercentage}%):
                </span>
                <span className="font-medium">
                  {formatNumber(busbarBridgeCalculationResult.ndsAmount)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-lg font-bold text-gray-900">Отпускная расчетная цена:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatNumber(busbarBridgeCalculationResult.finalPrice * totalQuantity)} ₸
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
