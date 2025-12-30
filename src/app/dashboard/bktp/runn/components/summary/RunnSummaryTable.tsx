'use client';

import React from 'react';
import { useRunnStore, RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface RunnSummaryTableProps {
  cells: RunnCell[];
  materials: {
    avtomatVyk: Material[];
    avtomatLity: Material[];
    counter: Material[];
    rpsLeft: Material[];
  };
}

// Функция для форматирования описания ячейки РУНН (стиль как в РУСН)
const formatRunnCellDescription = (cell: RunnCell, materials: any): string => {
  const parts = [];
  parts.push(`Ячейка ${cell.purpose}`);
  parts.push('Камера КСО А12-10'); // Добавляем как в РУСН
  
  // Собираем значения выбранных материалов
  const materialParts: string[] = [];

  if (cell.breaker) {
    materialParts.push(cell.breaker);
  }

  if (cell.meterType) {
    materialParts.push(cell.meterType);
  }

  if (cell.rza) {
    materialParts.push(cell.rza);
  }

  if (cell.rubilniki && cell.rubilniki.length > 0) {
    materialParts.push(cell.rubilniki.join(', '));
  }

  if (materialParts.length > 0) {
    parts.push(materialParts.join(', '));
  }

  return parts.join(' ');
};

// Функция для получения цены материала
const getMaterialPrice = (materialName: string, materials: any): number => {
  // Ищем в автоматах выкатных
  const avtomatVyk = materials.avtomatVyk?.find((m: Material) => m.name === materialName);
  if (avtomatVyk) {
    return typeof avtomatVyk.price === 'string' ? parseFloat(avtomatVyk.price) : avtomatVyk.price;
  }

  // Ищем в автоматах литых
  const avtomatLity = materials.avtomatLity?.find((m: Material) => m.name === materialName);
  if (avtomatLity) {
    return typeof avtomatLity.price === 'string' ? parseFloat(avtomatLity.price) : avtomatLity.price;
  }

  // Ищем в счетчиках
  const counter = materials.counter?.find((m: Material) => m.name === materialName);
  if (counter) {
    return typeof counter.price === 'string' ? parseFloat(counter.price) : counter.price;
  }

  // Ищем в РПС
  const rpsLeft = materials.rpsLeft?.find((m: Material) => m.name === materialName);
  if (rpsLeft) {
    return typeof rpsLeft.price === 'string' ? parseFloat(rpsLeft.price) : rpsLeft.price;
  }

  return 0;
};

// Компонент для отображения одной ячейки в сводке (стиль как в РУСН)
const SummaryCellItem = ({ cell, materials }: { cell: RunnCell; materials: any }) => {
  const cellDescription = formatRunnCellDescription(cell, materials);
  const quantity = cell.quantity || 1;
  
  // Собираем все материалы ячейки с ценами
  const cellMaterials = [];
  
  if (cell.breaker) {
    const price = getMaterialPrice(cell.breaker, materials);
    cellMaterials.push({ name: cell.breaker, price });
  }
  
  if (cell.meterType) {
    const price = getMaterialPrice(cell.meterType, materials);
    cellMaterials.push({ name: cell.meterType, price });
  }
  
  if (cell.rza) {
    const price = getMaterialPrice(cell.rza, materials);
    cellMaterials.push({ name: cell.rza, price });
  }
  
  if (cell.rubilniki && cell.rubilniki.length > 0) {
    cell.rubilniki.forEach(rubilnik => {
      const price = getMaterialPrice(rubilnik, materials);
      cellMaterials.push({ name: rubilnik, price });
    });
  }

  // Рассчитываем общую стоимость ячейки
  const totalPrice = cellMaterials.reduce((sum, material) => sum + material.price, 0);
  const totalSum = totalPrice * quantity;

  return (
    <tr>
      <td className="px-6 py-4 text-sm text-gray-900">{cellDescription}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        {quantity} шт.
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
        <div className="flex flex-col items-end">
          <span>{totalPrice > 0 ? `${totalPrice.toLocaleString('ru-RU')} ₸` : '—'}</span>
          <span className="text-xs text-gray-500">
            Итого: {totalSum > 0 ? `${totalSum.toLocaleString('ru-RU')} ₸` : '—'}
          </span>
        </div>
      </td>
    </tr>
  );
};

// Компонент для итоговой строки
const TotalRow = ({ cells, materials }: { cells: RunnCell[]; materials: any }) => {
  const totalSum = cells.reduce((sum, cell) => {
    const quantity = cell.quantity || 1;
    let cellTotal = 0;
    
    if (cell.breaker) {
      cellTotal += getMaterialPrice(cell.breaker, materials);
    }
    if (cell.meterType) {
      cellTotal += getMaterialPrice(cell.meterType, materials);
    }
    if (cell.rza) {
      cellTotal += getMaterialPrice(cell.rza, materials);
    }
    if (cell.rubilniki && cell.rubilniki.length > 0) {
      cell.rubilniki.forEach(rubilnik => {
        cellTotal += getMaterialPrice(rubilnik, materials);
      });
    }
    
    return sum + (cellTotal * quantity);
  }, 0);

  return (
    <>
      <tr className="bg-gray-50 font-medium">
        <td className="px-6 py-4 text-sm text-gray-900">
          Итого по материалам:
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 text-right">
          —
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 text-right">
          —
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 text-right">
          {totalSum > 0 ? `${totalSum.toLocaleString()} ₸` : '—'}
        </td>
      </tr>
    </>
  );
};

export default function RunnSummaryTable({ cells, materials }: RunnSummaryTableProps) {
  if (!cells || cells.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Сводка по материалам</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {cells.map((cell) => (
              <SummaryCellItem
                key={cell.id}
                cell={cell}
                materials={materials}
              />
            ))}
            <TotalRow
              cells={cells}
              materials={materials}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}