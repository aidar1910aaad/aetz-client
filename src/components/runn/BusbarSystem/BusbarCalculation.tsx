import React, { useState } from 'react';
import { BusMaterial } from '@/store/useRunnStore';
import { Switchgear } from '@/api/switchgear';

interface MaterialsTableProps {
  category: {
    name: string;
    items: Array<{
      name: string;
      unit: string;
      price: number;
      quantity: number;
    }>;
  };
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({ category }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    <h4 className="text-lg font-medium text-gray-900 mb-4">{category.name}</h4>
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
          {category.items.map((item, idx) => {
            const total = item.price * item.quantity;
            return (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.unit}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                  {item.price.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                  {item.quantity}
                </td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                  {total.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

interface BusbarCalculationProps {
  busbarCalculation: any;
  busbarCalculationResult: any;
  busMaterial: BusMaterial | null;
  matchingConfig: Switchgear;
  totalPrice: number;
}

export const BusbarCalculation: React.FC<BusbarCalculationProps> = ({
  busbarCalculation,
  busbarCalculationResult,
  busMaterial,
  matchingConfig,
  totalPrice,
}) => {
  const [showBusbarCalculation, setShowBusbarCalculation] = useState(false);

  if (!busbarCalculation || !busbarCalculationResult) {
    return null;
  }

  const materialName = busMaterial ? `Сборные шины (${busMaterial})` : 'Сборные шины';

  return (
    <div className="border border-gray-200 rounded">
      {/* Заголовок калькуляции */}
      <div 
        className="bg-gray-50 px-6 py-4 cursor-pointer flex items-center justify-between"
        onClick={() => setShowBusbarCalculation(!showBusbarCalculation)}
      >
        <h3 className="text-lg font-medium text-gray-900">
          Калькуляция сборных шин РУНН
        </h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Итого: {busbarCalculationResult.totalWithNds.toLocaleString()} тг
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${showBusbarCalculation ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{materialName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">тг</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">
                      {totalPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">1</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                      {totalPrice.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Итоги расчета */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Материалы:</span>
                <div className="font-medium">
                  {busbarCalculationResult.materialsTotal.toLocaleString()} тг
                </div>
              </div>
              <div>
                <span className="text-gray-600">Работы:</span>
                <div className="font-medium">
                  {busbarCalculationResult.workTotal.toLocaleString()} тг
                </div>
              </div>
              <div>
                <span className="text-gray-600">Накладные:</span>
                <div className="font-medium">
                  {busbarCalculationResult.overhead.toLocaleString()} тг
                </div>
              </div>
              <div>
                <span className="text-gray-600">Итого с НДС:</span>
                <div className="font-medium text-green-700">
                  {(busbarCalculationResult.totalWithNds + totalPrice).toLocaleString()} тг
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

