import React from 'react';
import { Switchgear } from '@/api/switchgear';

interface BusbarResultsProps {
  title: string;
  matchingConfig: Switchgear | null;
  totalWeight: number;
  totalPrice: number;
  materialCost?: number;
  pricePerKg: number;
  hasMatchingConfig: boolean;
  transformerPower?: number;
  selectedTransformer?: any;
  cellDetails?: Array<{name: string, quantity: number, weightPerCell: number, totalWeight: number}>;
  busbarCalculationResult?: any;
}

export const BusbarResults: React.FC<BusbarResultsProps> = ({
  title,
  matchingConfig,
  totalWeight,
  totalPrice,
  materialCost,
  pricePerKg,
  hasMatchingConfig,
  transformerPower,
  selectedTransformer,
  cellDetails = [],
  busbarCalculationResult
}) => {
  if (!hasMatchingConfig) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-800">Не найдена подходящая конфигурация</h4>
            <p className="text-sm text-red-600">
              Для трансформатора {transformerPower} кВА и материала {selectedTransformer?.busbars} не найдена подходящая конфигурация.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     

      {/* Информация о выбранном материале */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Материал сборных шин</h4>
        <div className="text-sm text-gray-600">
          <p><span className="font-medium">Тип материала:</span> {
            matchingConfig?.group === 'МТ' || matchingConfig?.group === 'МТ2' ? 'Медь' :
            matchingConfig?.group === 'АД' || matchingConfig?.group === 'АД2' ? 'Алюминий' :
            selectedTransformer?.busbars || 'Не выбран'
          }</p>
          <p className="text-xs text-gray-500 mt-1">
            {matchingConfig ? 
              `Определяется автоматически из конфигурации "${matchingConfig.type}" (группа: ${matchingConfig.group})` : 
              'Выбирается автоматически на основе выбора в трансформаторе'
            }
          </p>
        </div>
      </div>

      {/* Результаты расчета */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Результаты расчета</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Конфигурация:</span>
            <div className="font-semibold text-gray-900">{matchingConfig?.type || 'Не найдена'}</div>
          </div>
          <div>
            <span className="text-gray-600">Общий вес:</span>
            <div className="font-semibold text-gray-900">{(totalWeight || 0).toFixed(2)} кг</div>
          </div>
          <div>
            <span className="text-gray-600">Цена за кг:</span>
            <div className="font-semibold text-gray-900">{pricePerKg.toLocaleString()} тг</div>
            <div className="text-xs text-gray-500">
              {matchingConfig?.group === 'МТ' || matchingConfig?.group === 'МТ2' ? 'Медь (ID: 3490)' : 'Алюминий (ID: 3489)'}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Общая стоимость:</span>
            <div className="font-semibold text-gray-900">{(totalPrice || 0).toLocaleString()} тг</div>
          </div>
        </div>
      </div>


      {/* Итоговая сводка */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Итоговая сводка по {title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Материал шин:</span>
            <div className="font-semibold text-gray-900">{matchingConfig?.group || 'Не определен'}</div>
          </div>
          <div>
            <span className="text-gray-600">Конфигурация:</span>
            <div className="font-semibold text-gray-900">{matchingConfig?.type || 'Не найдена'}</div>
          </div>
          <div>
            <span className="text-gray-600">Напряжение:</span>
            <div className="font-semibold text-gray-900">{selectedTransformer?.voltage || 0.4} кВ</div>
          </div>
        </div>
      </div>
    </div>
  );
};