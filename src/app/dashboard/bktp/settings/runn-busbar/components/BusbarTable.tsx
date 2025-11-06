'use client';

import React, { useEffect } from 'react';
import { useCalculations } from '@/hooks/useCalculations';

// Интерфейс для данных одной ячейки (Ввод, СВ, ОТХ и т.д.)
interface CellValue {
  [columnId: string]: number | null; // Ключ - это идентификатор столбца, значение - количество
}

// Интерфейс для одной строки таблицы (например, "Ввод" или "СВ")
export interface TableRow {
  typeLabel: string; // "КСО 12-10", "КСО 17-20" и т.д.
  cellName: string; // "Ввод", "СВ", "ОТХ" и т.д.
  values: CellValue; // Значения для каждого столбца
}

// Интерфейс для заголовка столбца
export interface TableColumnHeader {
  breaker: string;
  amperage: string;
  group: string;
  busbar: string;
  id: string; // Уникальный ID для столбца (например, "AV-12 1250_870_АД_60x6")
  type: string; // Добавлено поле type
}

interface BusbarTableProps {
  data: TableRow[];
  columnHeaders: TableColumnHeader[];
  onInputChange: (
    typeLabel: string,
    cellName: string,
    columnId: string,
    value: number | null
  ) => void;
  filterType?: string;
  filterAmperage?: string;
  filterGroup?: string;
  onDeleteColumn?: (headerId: string) => void;
}

export const BusbarTable: React.FC<BusbarTableProps> = ({
  data,
  columnHeaders,
  onInputChange,
  filterType,
  filterAmperage,
  filterGroup,
  onDeleteColumn,
}) => {
  const { calculations } = useCalculations();





  const cellTypes = ['Ввод', 'СВ', 'ОТХ', 'УСТ', 'Шинный мост'];

  // Фильтрация данных таблицы по типу
  const dataFilteredByType = data.filter((row) => {
    return !filterType || row.typeLabel === filterType;
  });

  // Группируем отфильтрованные данные по typeLabel
  const groupedData: { [key: string]: TableRow[] } = dataFilteredByType.reduce((acc, row) => {
    if (!acc[row.typeLabel]) {
      acc[row.typeLabel] = [];
    }
    acc[row.typeLabel].push(row);
    return acc;
  }, {} as { [key: string]: TableRow[] });

  // Фильтрация заголовков столбцов
  const filteredColumnHeaders = columnHeaders.filter((header) => {
    if (filterType && header.type !== filterType) {
      return false;
    }
    if (filterAmperage) {
      // Преобразуем filterAmperage из строки (например, "870A") в число (870) для сравнения
      const numericFilterAmperage = parseInt(filterAmperage);
      if (
        isNaN(numericFilterAmperage) ||
        header.amperage !== numericFilterAmperage.toString() + 'A'
      ) {
        return false;
      }
    }
    if (filterGroup && header.group !== filterGroup && filterGroup !== 'Все группы') {
      // Если filterGroup === 'Все группы', не фильтруем по группе
      return false;
    }
    return true;
  });



  const filteredData = filterType ? data.filter((row) => row.typeLabel === filterType) : [];

  // Разделяем данные на панели ЩО-70 и панели ЩО-70N
  const panel70Data = data.filter(row => row.typeLabel === 'Панель ЩО-70');
  const panel70NData = data.filter(row => row.typeLabel === 'Панель ЩО-70N');
  
  // Разделяем заголовки
  const panel70Headers = columnHeaders.filter(header => header.type === 'Панель ЩО-70');
  const panel70NHeaders = columnHeaders.filter(header => header.type === 'Панель ЩО-70N');


  // Группируем данные панелей ЩО-70
  const panel70GroupedData: { [key: string]: TableRow[] } = panel70Data.reduce((acc, row) => {
    if (!acc[row.typeLabel]) {
      acc[row.typeLabel] = [];
    }
    acc[row.typeLabel].push(row);
    return acc;
  }, {} as { [key: string]: TableRow[] });

  // Группируем данные панелей ЩО-70N
  const panel70NGroupedData: { [key: string]: TableRow[] } = panel70NData.reduce((acc, row) => {
    if (!acc[row.typeLabel]) {
      acc[row.typeLabel] = [];
    }
    acc[row.typeLabel].push(row);
    return acc;
  }, {} as { [key: string]: TableRow[] });

  const renderTable = (groupedData: { [key: string]: TableRow[] }, headers: TableColumnHeader[], title: string) => {
    if (Object.keys(groupedData).length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#8eba1e] rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#8eba1e]">{title}</h3>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
          <table className="table-fixed bg-white text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-[#8eba1e] to-[#7aa31a] text-white">
                <th className="w-[90px] px-2 py-3 border-r border-white/20 font-semibold">Тип</th>
                <th className="w-[50px] px-2 py-3 border-r border-white/20 font-semibold">
                  Ячейка
                </th>
                {headers.map((header) => (
                  <th
                    key={header.id}
                    className="w-[60px] px-2 py-3 border-r border-white/20 last:border-r-0"
                  >
                    <div className="flex flex-col text-[10px] leading-tight">
                      <span className="font-bold">{header.breaker}</span>
                      <span className="opacity-90">{header.amperage}</span>
                      <span className="opacity-90">{header.group}</span>
                      <span className="opacity-90">{header.busbar}</span>
                    </div>
                    {onDeleteColumn && (
                      <button
                        onClick={() => onDeleteColumn(header.id)}
                        className="mt-2 text-white/80 hover:text-white text-xs underline hover:no-underline transition-all"
                        title="Удалить конфигурацию"
                      >
                        Удалить
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedData).map(([typeLabel, rows]) => {
                const typedRows = rows as TableRow[];
                return (
                  <React.Fragment key={typeLabel}>
                    {cellTypes.map((cellName, index) => {
                      const rowData = typedRows.find((row) => row.cellName === cellName);
                      return (
                        <tr key={cellName} className="hover:bg-[#8eba1e]/5 transition-colors">
                          {index === 0 && (
                            <td
                              rowSpan={cellTypes.length}
                              className="px-2 py-3 border-r border-gray-200 font-semibold text-left text-[10px] text-gray-800 bg-gray-50"
                            >
                              {typeLabel}
                            </td>
                          )}
                          <td className="px-2 py-3 border-r border-gray-200 text-[10px] text-gray-700 font-medium">
                            {cellName}
                          </td>
                          {headers.map((header) => {
                            return (
                              <td key={header.id} className="px-2 py-3 border-r border-gray-200 last:border-r-0">
                                <input
                                  type="number"
                                  value={rowData?.values[header.id] || ''}
                                  onChange={(e) =>
                                    onInputChange(
                                      typeLabel,
                                      cellName,
                                      header.id,
                                      e.target.value ? Number(e.target.value) : null
                                    )
                                  }
                                  className="w-full p-1 border border-gray-300 rounded text-center text-[10px] focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/30 focus:border-[#8eba1e] transition-all hover:border-[#8eba1e]/50"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderTable(panel70GroupedData, panel70Headers, "Панель ЩО-70")}
      {renderTable(panel70NGroupedData, panel70NHeaders, "Панель ЩО-70N")}
    </div>
  );
}; 