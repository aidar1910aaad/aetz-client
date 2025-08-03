import React, { useState } from 'react';
import { BusMaterial } from '@/types/rusn';
import MaterialsTable from '@/app/dashboard/bktp/rusn/components/MaterialsTable';

interface BusbarCalculationProps {
  busbarCalculation: any;
  busbarCalculationResult: any;
  busBridgeMaterial: BusMaterial | null;
  matchingConfig: any;
  totalPrice: number;
}

export const BusbarCalculation: React.FC<BusbarCalculationProps> = ({
  busbarCalculation,
  busbarCalculationResult,
  busBridgeMaterial,
  matchingConfig,
  totalPrice,
}) => {
  const [showBusbarCalculation, setShowBusbarCalculation] = useState(false);

  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  if (!busbarCalculation || !busbarCalculationResult) return null;

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold text-gray-900">Калькуляция сборных шин</h5>
        <button
          onClick={() => setShowBusbarCalculation(!showBusbarCalculation)}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            showBusbarCalculation
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showBusbarCalculation ? 'Скрыть' : 'Показать'} детали калькуляции
        </button>
      </div>

      {/* Основная информация о калькуляции */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Отпускная цена (с НДС)</div>
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(busbarCalculationResult.finalPrice)} ₸
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="text-sm text-gray-600 mb-1">Оптовая цена (без НДС)</div>
          <div className="text-xl font-semibold text-blue-600">
            {formatNumber(busbarCalculationResult.wholesalePrice)} ₸
          </div>
        </div>
      </div>

      {/* Детали калькуляции */}
      {showBusbarCalculation && (
        <div className="space-y-4">
          {/* Таблица материалов */}
          {busbarCalculation.data.categories.map((category: any, index: number) => (
            <MaterialsTable key={index} category={category} />
          ))}

          {/* Дополнительная категория со сборными шинами */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Сборные шины</h4>
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
                      Сборный шина{' '}
                      {busBridgeMaterial === 'АД' || busBridgeMaterial === 'АД2'
                        ? 'Алюминий'
                        : 'Медь'}{' '}
                      {matchingConfig.busbar} {matchingConfig.breaker}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">компл.</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {formatNumber(totalPrice)} ₸
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">1</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {formatNumber(totalPrice)} ₸
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td
                      colSpan={4}
                      className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                    >
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

          {/* Альтернативные материалы */}
          {busbarCalculation.data.cellConfig?.materials && (
            <div className="mt-6 space-y-4">
              <h6 className="text-md font-semibold text-gray-800">Альтернативные материалы:</h6>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Алюминий */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Алюминий (АД/АД2)</span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        busBridgeMaterial === 'АД' || busBridgeMaterial === 'АД2'
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-gray-300 border-gray-300'
                      }`}
                    ></div>
                  </div>
                  <div className="text-sm text-blue-700">
                    Цена: {formatNumber(busbarCalculationResult.finalPrice)} ₸
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
                    Цена: {formatNumber(busbarCalculationResult.finalPrice)} ₸
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
                  {formatNumber(busbarCalculationResult.materialsTotal)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Зарплата на изделие:</span>
                <span className="font-medium">
                  {formatNumber(busbarCalculationResult.salary)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Общепроизводственные расходы (
                  {busbarCalculation.data.calculation?.overheadPercentage}%):
                </span>
                <span className="font-medium">
                  {formatNumber(busbarCalculationResult.overheadCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-semibold text-gray-700">
                  Производственная себестоимость:
                </span>
                <span className="font-semibold">
                  {formatNumber(busbarCalculationResult.productionCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Административные расходы ({busbarCalculation.data.calculation?.adminPercentage}%):
                </span>
                <span className="font-medium">
                  {formatNumber(busbarCalculationResult.adminCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-semibold text-gray-700">Полная себестоимость:</span>
                <span className="font-semibold">
                  {formatNumber(busbarCalculationResult.fullCost)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Плановые накопления ({busbarCalculation.data.calculation?.plannedProfitPercentage}
                  %):
                </span>
                <span className="font-medium">
                  {formatNumber(busbarCalculationResult.plannedProfit)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-semibold text-gray-700">Оптовая цена:</span>
                <span className="font-semibold text-blue-600">
                  {formatNumber(busbarCalculationResult.wholesalePrice)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  НДС ({busbarCalculation.data.calculation?.ndsPercentage}%):
                </span>
                <span className="font-medium">
                  {formatNumber(busbarCalculationResult.ndsAmount)} ₸
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-lg font-bold text-gray-900">Отпускная расчетная цена:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatNumber(busbarCalculationResult.finalPrice)} ₸
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
