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

  useEffect(() => {
    console.log('=== DEBUG: Calculations ===');
    console.log('Calculations:', calculations);
    console.log('Calculations length:', calculations.length);
    console.log(
      'Calculations names:',
      calculations.map((c) => c.name)
    );
  }, [calculations]);

  console.log('BusbarTable received data:', data);
  console.log('BusbarTable received columnHeaders:', columnHeaders);

  const cellTypes = ['Ввод', 'СВ', 'ОТХ', 'ТР', 'ТН', 'ТСН', 'ЗШН', 'СР'];

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
  console.log('BusbarTable groupedData:', groupedData);

  // Фильтрация заголовков столбцов
  const filteredColumnHeaders = columnHeaders.filter((header) => {
    if (filterType && header.type !== filterType) {
      console.log(
        `DEBUG: Filtering out header.type='${header.type}' because it does not match filterType='${filterType}'`
      );
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

  console.log('DEBUG Filter values:', { filterType, filterAmperage, filterGroup });
  console.log('DEBUG Data after type filter:', dataFilteredByType.length);
  console.log('DEBUG Headers after all filters:', filteredColumnHeaders.length);

  const filteredData = filterType ? data.filter((row) => row.typeLabel === filterType) : [];

  return (
    <div className="space-y-4">
      {filterType ? (
        <>
          <div className="overflow-x-auto">
            <table className="table-fixed bg-white border border-gray-300 text-xs shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-[90px] px-1 py-1 border border-gray-200 text-gray-700">Тип</th>
                  <th className="w-[50px] px-1 py-1 border border-gray-200 text-gray-700">
                    Ячейка
                  </th>
                  {filteredColumnHeaders.map((header) => (
                    <th
                      key={header.id}
                      className="w-[60px] px-1 py-1 border border-gray-200 text-gray-700"
                    >
                      <div className="flex flex-col text-[10px] leading-tight">
                        <span className="font-medium">{header.breaker}</span>
                        <span>{header.amperage}</span>
                        <span>{header.group}</span>
                        <span>{header.busbar}</span>
                      </div>
                      {onDeleteColumn && (
                        <button
                          onClick={() => onDeleteColumn(header.id)}
                          className="mt-1 text-red-500 hover:text-red-700 text-xs underline"
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
                          <tr key={cellName} className="hover:bg-gray-50">
                            {index === 0 && (
                              <td
                                rowSpan={cellTypes.length}
                                className="px-1 py-1 border border-gray-200 font-medium text-left text-[10px] text-gray-700"
                              >
                                {typeLabel}
                              </td>
                            )}
                            <td className="px-1 py-1 border border-gray-200 text-[10px] text-gray-700">
                              {cellName}
                            </td>
                            {filteredColumnHeaders.map((header) => {
                              return (
                                <td key={header.id} className="px-1 py-1 border border-gray-200">
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
                                    className="w-full p-0.5 border border-gray-200 rounded text-center text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
          {filteredData.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">Нет данных для отображения</div>
          )}
        </>
      ) : null}
    </div>
  );
};
