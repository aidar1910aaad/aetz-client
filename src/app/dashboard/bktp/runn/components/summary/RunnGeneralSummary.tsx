'use client';

import React from 'react';
import { useRunnStore } from '@/store/useRunnStore';
import { formatCurrency } from '@/utils/calculationUtils';
import { getPanelNameForBreaker } from '@/utils/panelNameUtils';
import type { RunnCell, RunnCellSummary } from '@/store/useRunnStore';

interface RunnGeneralSummaryProps {
  cellConfigs: RunnCell[];
  breakerCalculation?: any;
  counterCalculation?: any;
  sectionSwitchCalculation?: any;
  outgoingCalculation?: any;
  runnMaterials?: any;
}

export default function RunnGeneralSummary({
  cellConfigs,
  breakerCalculation,
  counterCalculation,
  sectionSwitchCalculation,
  outgoingCalculation,
  runnMaterials
}: RunnGeneralSummaryProps) {
  const { cellSummaries, busbarSummary, busBridgeSummaries } = useRunnStore();

  if (!cellConfigs || cellConfigs.length === 0) {
    return null;
  }

  // УПРОЩЕННАЯ ЛОГИКА: только отображение данных из store
  const cellSum = cellSummaries.reduce((sum, summary) => sum + summary.totalPrice, 0);
  const busbarSum = busbarSummary ? busbarSummary.totalPrice : 0;
  const busBridgeSum = busBridgeSummaries.reduce((sum, summary) => sum + summary.totalPrice, 0);
  const totalSum = cellSum + busbarSum + busBridgeSum;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Общая сводка РУНН</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#8eba1e] text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Наименование
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                Цена
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                Кол-во
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                Сумма
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {cellConfigs.map((cell, index) => {
              const cellSummary = cellSummaries.find(s => s.cellId === cell.id);
              
              return (
                <PanelSummaryItem 
                  key={cell.id || index}
                  cell={cell}
                  cellSummary={cellSummary}
                />
              );
            })}
            
            {/* Добавляем шинные мосты */}
            {busBridgeSummaries.map((bridgeSummary, index) => (
              <tr key={`bridge-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {bridgeSummary.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(bridgeSummary.pricePerUnit)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {bridgeSummary.quantity} шт.
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(bridgeSummary.totalPrice)}
                </td>
              </tr>
            ))}
            
            {/* Добавляем сборные шины */}
            {busbarSummary && (
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {busbarSummary.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(busbarSummary.pricePerUnit)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {busbarSummary.quantity} шт.
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {formatCurrency(busbarSummary.totalPrice)}
                </td>
              </tr>
            )}
            <tr className="bg-[#8eba1e]/10 font-bold border-t-2 border-[#8eba1e]">
              <td className="px-6 py-4 text-sm text-gray-900" colSpan={3}>
                Общая стоимость:
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                {formatCurrency(totalSum)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// УПРОЩЕННЫЙ КОМПОНЕНТ ЭЛЕМЕНТА СВОДКИ
const PanelSummaryItem = ({ 
  cell, 
  cellSummary
}: { 
  cell: RunnCell; 
  cellSummary?: RunnCellSummary;
}) => {
  const quantity = cell.quantity || 1;
  
  // Простое отображение данных из store
  if (cellSummary) {
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-900">
          {cellSummary.name}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 text-right">
          {formatCurrency(cellSummary.pricePerUnit)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 text-right">
          {quantity} шт.
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 text-right">
          {formatCurrency(cellSummary.totalPrice)}
        </td>
      </tr>
    );
  }
  
  // Fallback для ячеек без сводки
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">
        {cell.breaker ? getPanelNameForBreaker(cell.breaker, cell.purpose) : `Панель ЩО 70 (${cell.purpose})`}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 text-right">
        —
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 text-right">
        {quantity} шт.
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 text-right">
        —
      </td>
    </tr>
  );
};