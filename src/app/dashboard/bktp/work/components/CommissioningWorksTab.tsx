'use client';

import { useState, useEffect } from 'react';

interface CommissioningWorksTabProps {
  isVisible: boolean;
}

export default function CommissioningWorksTab({ isVisible }: CommissioningWorksTabProps) {
  // Фиксированные значения
  const relaySettingsQuantity = 1; // Расчёт уставок РЗ всегда 1
  const relaySettingsPrice = 150000; // Цена за расчёт уставок РЗ
  
  const complexTestingQuantity = 1; // Комплексное испытание всегда 1
  const complexTestingPrice = 195905; // Цена за комплексное испытание
  
  // Значения из проекта (пока заглушки)
  const ru04kvQuantity = 1; // РУ-0,4кВ (АВР) - из проекта
  const ru04kvPrice = 200000; // Цена за РУ-0,4кВ (АВР)
  
  const ru1020kvQuantity = 0; // Ячейка РУ-10/20кВ - из проекта (пока 0)
  const ru1020kvPrice = 80000; // Цена за ячейку РУ-10/20кВ
  
  // Расчеты
  const relaySettingsTotal = relaySettingsQuantity * relaySettingsPrice;
  const complexTestingTotal = complexTestingQuantity * complexTestingPrice;
  const ru04kvTotal = ru04kvQuantity * ru04kvPrice;
  const ru1020kvTotal = ru1020kvQuantity * ru1020kvPrice;
  
  const totalCost = relaySettingsTotal + complexTestingTotal + ru04kvTotal + ru1020kvTotal;

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Пусконаладочные работы
      </h3>
      
      <div className="space-y-6">
        {/* Таблица расчета */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Описание</th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">Количество</th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">Цена за единицу</th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* ПНР секция */}
              <tr>
                <td className="px-4 py-3 text-gray-900 font-medium bg-blue-50">
                  ПНР
                </td>
                <td className="px-4 py-3 text-center text-gray-900"></td>
                <td className="px-4 py-3 text-center text-gray-900"></td>
                <td className="px-4 py-3 text-center text-gray-900"></td>
              </tr>
              
              <tr>
                <td className="px-4 py-3 text-gray-900 pl-8">
                  Ячейка РУ-10/20кВ (уточнить кол-во)
                </td>
                <td className="px-4 py-3 text-center text-gray-900">{ru1020kvQuantity}</td>
                <td className="px-4 py-3 text-center text-gray-900">
                  {ru1020kvPrice.toLocaleString()} ₸
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-900">
                  {ru1020kvTotal.toLocaleString()} ₸
                </td>
              </tr>
              
              <tr>
                <td className="px-4 py-3 text-gray-900 pl-8">
                  РУ-0,4кВ (АВР)
                </td>
                <td className="px-4 py-3 text-center text-gray-900">{ru04kvQuantity}</td>
                <td className="px-4 py-3 text-center text-gray-900">
                  {ru04kvPrice.toLocaleString()} ₸
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-900">
                  {ru04kvTotal.toLocaleString()} ₸
                </td>
              </tr>
              
              <tr>
                <td className="px-4 py-3 text-gray-900 pl-8">
                  Расчёт уставок РЗ
                </td>
                <td className="px-4 py-3 text-center text-gray-900">{relaySettingsQuantity}</td>
                <td className="px-4 py-3 text-center text-gray-900">
                  {relaySettingsPrice.toLocaleString()} ₸
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-900">
                  {relaySettingsTotal.toLocaleString()} ₸
                </td>
              </tr>
              
              {/* Лаб. секция */}
              <tr>
                <td className="px-4 py-3 text-gray-900 font-medium bg-blue-50">
                  Лаб.
                </td>
                <td className="px-4 py-3 text-center text-gray-900"></td>
                <td className="px-4 py-3 text-center text-gray-900"></td>
                <td className="px-4 py-3 text-center text-gray-900"></td>
              </tr>
              
              <tr>
                <td className="px-4 py-3 text-gray-900 pl-8">
                  Комплексное испытание (двухтрансформаторное)
                </td>
                <td className="px-4 py-3 text-center text-gray-900">{complexTestingQuantity}</td>
                <td className="px-4 py-3 text-center text-gray-900">
                  {complexTestingPrice.toLocaleString()} ₸
                </td>
                <td className="px-4 py-3 text-center font-medium text-gray-900">
                  {complexTestingTotal.toLocaleString()} ₸
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                  Итого:
                </td>
                <td className="px-4 py-3 text-center font-bold text-gray-900">
                  {totalCost.toLocaleString()} ₸
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Автоматический расчет:</strong> 
            Расчёт уставок РЗ ({relaySettingsQuantity} × {relaySettingsPrice.toLocaleString()} ₸) + 
            Комплексное испытание ({complexTestingQuantity} × {complexTestingPrice.toLocaleString()} ₸) + 
            РУ-0,4кВ (АВР) ({ru04kvQuantity} × {ru04kvPrice.toLocaleString()} ₸) + 
            Ячейка РУ-10/20кВ ({ru1020kvQuantity} × {ru1020kvPrice.toLocaleString()} ₸) = 
            {totalCost.toLocaleString()} ₸
          </p>
        </div>
      </div>
    </div>
  );
}
