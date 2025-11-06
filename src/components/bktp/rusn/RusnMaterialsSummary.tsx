'use client';

import React, { useMemo } from 'react';
import { useRusnStore } from '@/store/useRusnStore';

interface RusnMaterialsSummaryProps {
  title?: string;
  showClearButton?: boolean;
}

export default function RusnMaterialsSummary({ 
  title = "Сводка по материалам", 
  showClearButton = true 
}: RusnMaterialsSummaryProps) {
  const rusn = useRusnStore();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [key, setKey] = React.useState(0);
  
  // Принудительно обновляем компонент при изменении cellSummaries
  React.useEffect(() => {
    forceUpdate();
  }, [rusn.cellSummaries]);

  const groupedSummaries = useMemo(() => {
    return rusn.cellSummaries.reduce((acc, summary) => {
      const existing = acc.find(s => s.name === summary.name);
      if (existing) {
        existing.quantity += summary.quantity;
        existing.totalPrice += summary.totalPrice;
      } else {
        acc.push({ ...summary });
      }
      return acc;
    }, [] as typeof rusn.cellSummaries);
  }, [rusn.cellSummaries]);

  const filteredSummaries = useMemo(() => {
    return groupedSummaries.filter(cellSummary => {
      // Исключаем только старые записи КСО 366 без определенного типа
      // Исключаем записи с названием "Ячейка Секционный разьединитель Камера КСО 366" (старый формат)
      const isOldKso366Entry = cellSummary.name.includes('Ячейка Секционный разьединитель Камера КСО 366');
      
      // Показываем все записи кроме старых записей КСО 366
      return !isOldKso366Entry;
    });
  }, [groupedSummaries]);

  // Добавляем материалы сборных шин и шинных мостов
  const busbarSummaries = [];
  
  // Добавляем основные сборные шины
  if (rusn.busbarSummary) {
    busbarSummaries.push({
      cellId: 'busbar_main',
      name: rusn.busbarSummary.name,
      quantity: rusn.busbarSummary.quantity,
      pricePerUnit: rusn.busbarSummary.pricePerUnit,
      totalPrice: rusn.busbarSummary.totalPrice,
    });
  }

  // Добавляем шинные мосты
  if (rusn.busBridgeSummaries && rusn.busBridgeSummaries.length > 0) {
    rusn.busBridgeSummaries.forEach((bridgeSummary, index) => {
      if (bridgeSummary.totalPrice > 0) {
        busbarSummaries.push({
          cellId: `busbridge_${index}`,
          name: bridgeSummary.name,
          quantity: bridgeSummary.quantity,
          pricePerUnit: bridgeSummary.pricePerUnit,
          totalPrice: bridgeSummary.totalPrice,
        });
      }
    });
  }

  // Объединяем все материалы
  const allSummaries = [...filteredSummaries, ...busbarSummaries];

  return (
    <div key={key} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        {showClearButton && (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                console.log('Текущие записи перед очисткой:', rusn.cellSummaries);
                rusn.clearOldKso366Summaries();
                setTimeout(() => {
                  console.log('Записи после очистки:', rusn.cellSummaries);
                  forceUpdate();
                }, 100);
              }}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Очистить КСО 366
            </button>
            <button 
              onClick={() => {
                console.log('Принудительное удаление всех записей КСО 366');
                const allSummaries = rusn.cellSummaries;
                const kso366Summaries = allSummaries.filter(summary => 
                  summary.name.includes('Камера КСО 366') ||
                  summary.name.includes('Шинный мост с разъединителем')
                );
                console.log('Найденные записи КСО 366:', kso366Summaries);
                kso366Summaries.forEach(summary => {
                  console.log('Удаляем:', summary.name, summary.cellId);
                  rusn.removeCellSummary(summary.cellId);
                });
                setTimeout(() => {
                  console.log('Записи после удаления:', rusn.cellSummaries);
                  forceUpdate();
                  setKey(prev => prev + 1); // Принудительно перерендериваем весь компонент
                }, 100);
              }}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              Удалить КСО 366
            </button>
            <button 
              onClick={() => {
                rusn.clearCellSummaries();
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Очистить все
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#8eba1e] text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold">Наименование</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Цена</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Кол-во</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Сумма</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {allSummaries.map((summary) => (
              <tr key={summary.cellId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{summary.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {summary.pricePerUnit.toLocaleString('ru-RU')} ₸
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {summary.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {summary.totalPrice.toLocaleString('ru-RU')} ₸
                </td>
              </tr>
            ))}
            {allSummaries.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>
                  Настройте ячейки и сборные шины для отображения сводки
                </td>
              </tr>
            )}
            {allSummaries.length > 0 && (
              <tr className="bg-[#8eba1e]/10 font-bold border-t-2 border-[#8eba1e]">
                <td className="px-6 py-4 text-sm text-gray-900" colSpan={3}>
                  Итого по материалам:
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {allSummaries.reduce((sum, summary) => sum + summary.totalPrice, 0).toLocaleString('ru-RU')} ₸
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
