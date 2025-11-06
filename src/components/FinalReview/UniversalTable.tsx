'use client';

import React from 'react';

// Типы для конфигурации таблицы
export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any, row: TableRow) => string;
}

export interface TableRow {
  id: string | number;
  [key: string]: any;
}

export interface TableConfig {
  id: string;
  title: string;
  columns: TableColumn[];
  dataMapper: (data: any, additionalData?: any) => TableRow[];
  emptyMessage: string;
  showTotal?: boolean;
  totalFormatter?: (rows: TableRow[]) => number;
}

interface UniversalTableProps {
  config: TableConfig;
  data: any;
  additionalData?: any;
  className?: string;
}

const formattedPrice = (num?: number) =>
  typeof num === 'number' ? num.toLocaleString('ru-RU') + ' ₸' : '—';

const defaultPriceFormatter = (value: any) => formattedPrice(value);

const defaultTotalFormatter = (rows: TableRow[]) => {
  return rows.reduce((sum, row) => {
    const price = typeof row.price === 'number' ? row.price : 0;
    const quantity = typeof row.quantity === 'number' ? row.quantity : 1;
    return sum + (price * quantity);
  }, 0);
};

export default function UniversalTable({ 
  config, 
  data, 
  additionalData, 
  className = '' 
}: UniversalTableProps) {
  // Получаем данные через маппер
  const rows = config.dataMapper(data, additionalData);
  
  // Вычисляем итог если нужно
  const total = config.showTotal 
    ? (config.totalFormatter || defaultTotalFormatter)(rows)
    : 0;

  // Если нет данных, показываем пустое состояние
  if (rows.length === 0) {
    return (
      <section className={`mt-10 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{config.title}</h2>
        <table className="w-full table-fixed text-sm">
          <thead className="bg-[#90bd20] text-white">
            <tr>
              <th className="p-2 w-8">№</th>
              {config.columns.map((column) => (
                <th 
                  key={column.key}
                  className={`p-2 ${column.width || ''} ${column.align === 'left' ? 'text-left' : 'text-center'}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            <tr>
              <td className="p-2 bg-white w-8">—</td>
              {config.columns.map((column) => (
                <td 
                  key={column.key}
                  className={`p-2 bg-white ${column.align === 'left' ? 'text-left' : 'text-center'}`}
                >
                  —
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>
    );
  }

  return (
    <section className={`mt-10 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{config.title}</h2>
        <table className="w-full table-auto text-sm">
        <thead className="bg-[#90bd20] text-white">
          <tr>
            <th className="p-2 w-8">№</th>
            {config.columns.map((column) => (
              <th 
                key={column.key}
                className={`p-2 ${column.width || ''} ${column.align === 'left' ? 'text-left' : 'text-center'}`}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center">
          {rows.map((row, idx) => (
            <tr key={row.id}>
              <td className="p-2 w-8">{idx + 1}</td>
              {config.columns.map((column) => {
                const value = row[column.key];
                const formattedValue = column.formatter 
                  ? column.formatter(value, row)
                  : value;
                
                return (
                  <td 
                    key={column.key}
                    className={`p-2 ${column.align === 'left' ? 'text-left' : 'text-center'} ${
                      column.key === 'name' ? 'break-words' : ''
                    }`}
                  >
                    {formattedValue}
                  </td>
                );
              })}
            </tr>
          ))}
          {config.showTotal && (
            <tr className="bg-[#f3f4f6] font-semibold">
              <td colSpan={config.columns.length} className="text-right pr-4">
                ВСЕГО:
              </td>
              <td className="text-right pr-4">{formattedPrice(total)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}