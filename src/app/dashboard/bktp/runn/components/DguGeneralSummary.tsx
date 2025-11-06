'use client';

import React from 'react';
import { useDguStore } from '@/store/useDguStore';
import { formatCurrency } from '@/utils/calculationUtils';

export default function DguGeneralSummary() {
  const dgu = useDguStore();

  if (!dgu.enabled || dgu.cells.length === 0) {
    return null;
  }

  // Рассчитываем общую стоимость всех ячеек ДГУ
  const totalSum = dgu.cells.reduce((sum, cell) => {
    // Пока используем price из ячейки, если есть
    const cellPrice = cell.price || 0;
    const quantity = cell.quantity || 1;
    return sum + (cellPrice * quantity);
  }, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Сводка ДГУ</h3>
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
            {dgu.cells.map((cell, index) => {
              const quantity = cell.quantity || 1;
              const pricePerUnit = cell.price || 0;
              const totalPrice = pricePerUnit * quantity;
              
              // Формируем название ячейки
              let cellName = cell.purpose;
              if (cell.breaker) {
                cellName = `${cellName} - ${cell.breaker}`;
              }
              if (cell.meterType) {
                cellName = `${cellName}, ${cell.meterType}`;
              }

              return (
                <tr key={cell.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {cellName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {pricePerUnit > 0 ? formatCurrency(pricePerUnit) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {quantity} шт.
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {totalPrice > 0 ? formatCurrency(totalPrice) : '—'}
                  </td>
                </tr>
              );
            })}
            
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

