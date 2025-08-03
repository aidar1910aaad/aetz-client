import React from 'react';
import { Switchgear } from '@/api/switchgear';
import { BusMaterial } from '@/types/rusn';

interface CalculationResultsProps {
  matchingConfig: Switchgear;
  totalWeight: number;
  totalPrice: number;
  getPricePerKg: (material: BusMaterial) => number;
  busBridgeMaterial: BusMaterial | null;
  cellConfigs: any[];
}

export const CalculationResults: React.FC<CalculationResultsProps> = ({
  matchingConfig,
  totalWeight,
  totalPrice,
  getPricePerKg,
  busBridgeMaterial,
  cellConfigs,
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4">
      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-green-800 font-medium">Расчет выполнен успешно</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Основные параметры</h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Тип:</span>
              <span className="font-medium text-gray-900">{matchingConfig.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Группа:</span>
              <span className="font-medium text-gray-900">{matchingConfig.group}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Шина:</span>
              <span className="font-medium text-gray-900">{matchingConfig.busbar}</span>
            </div>
          </div>
        </div>

        {/* Детализация по ячейкам */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Расход по ячейкам</h5>
          <div className="space-y-2">
            {matchingConfig.cells
              .filter((configCell) => configCell.name !== 'Шинный мост')
              .map((configCell, index) => {
                let cellCount = 0;

                switch (configCell.name) {
                  case 'Ввод':
                    cellCount = cellConfigs
                      .filter((c) => c.purpose === 'Ввод')
                      .reduce((total, cell) => total + (cell.count || 1), 0);
                    break;
                  case 'СВ':
                    cellCount = cellConfigs
                      .filter((c) => c.purpose === 'Секционный выключатель')
                      .reduce((total, cell) => total + (cell.count || 1), 0);
                    break;
                  case 'СР':
                    cellCount = cellConfigs
                      .filter((c) => c.purpose === 'Секционный разьединитель')
                      .reduce((total, cell) => total + (cell.count || 1), 0);
                    break;
                  case 'ТР':
                    cellCount = cellConfigs
                      .filter((c) => c.purpose === 'Трансформаторная')
                      .reduce((total, cell) => total + (cell.count || 1), 0);
                    break;
                  case 'ОТХ':
                    cellCount = cellConfigs
                      .filter((c) => c.purpose === 'Отходящая')
                      .reduce((total, cell) => total + (cell.count || 1), 0);
                    break;
                  case 'ТН':
                    cellCount = cellConfigs
                      .filter((c) => c.purpose === 'Трансформатор напряжения')
                      .reduce((total, cell) => total + (cell.count || 1), 0);
                    break;
                  case 'ТСН':
                    cellCount = cellConfigs
                      .filter((c) => c.purpose === 'Трансформатор собственных нужд')
                      .reduce((total, cell) => total + (cell.count || 1), 0);
                    break;
                  case 'ЗШН':
                    cellCount = cellConfigs
                      .filter((c) => c.purpose === 'ЗШН')
                      .reduce((total, cell) => total + (cell.count || 1), 0);
                    break;
                  default:
                    cellCount = cellConfigs
                      .filter((c) => c.purpose === configCell.name)
                      .reduce((total, cell) => total + (cell.count || 1), 0);
                    break;
                }

                const weightPerCell = configCell.quantity || 0;
                const totalWeight = weightPerCell * cellCount;
                const totalPrice = totalWeight * getPricePerKg(busBridgeMaterial!);

                return (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{configCell.name}:</span>
                    <span className="font-medium text-gray-900">
                      {cellCount} шт × {weightPerCell.toFixed(2)} кг = {totalWeight.toFixed(2)} кг (
                      {formatNumber(totalPrice)} ₸)
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Итоговые результаты */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Итоговые результаты</h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Общий вес:</span>
              <span className="font-medium text-gray-900">{totalWeight.toFixed(2)} кг</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Цена за кг:</span>
              <span className="font-medium text-gray-900">
                {formatNumber(getPricePerKg(busBridgeMaterial!))} ₸
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm font-semibold text-gray-700">Итого:</span>
              <span className="font-semibold text-lg text-gray-900">{formatNumber(totalPrice)} ₸</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 