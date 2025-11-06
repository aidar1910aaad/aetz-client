'use client';

import React from 'react';
import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface RunnCellSummaryTableProps {
  cell: RunnCell;
  selectedMaterials?: Array<{
    name: string;
    price: number;
    quantity: number;
    unit: string;
    type: string;
  }>;
  materials?: {
    avtomatVyk: Material[];
    avtomatLity: Material[];
    counter: Material[];
    rpsLeft: Material[];
  };
}

// Функция для форматирования описания ячейки РУНН (стиль как в РУСН)
const formatRunnCellDescription = (cell: RunnCell): string => {
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

export default function RunnCellSummaryTable({
  cell,
  selectedMaterials,
  materials,
}: RunnCellSummaryTableProps) {
  let description = '';
  let quantity = 1;
  let totalPrice = 0;
  let totalSum = 0;

    // Если есть selectedMaterials, используем их
    if (selectedMaterials && selectedMaterials.length > 0) {
      const material = selectedMaterials[0];
      // Используем полное название из selectedMaterials (включая панель)
      description = material.name;
      quantity = material.quantity;
      totalPrice = material.price;
      totalSum = material.price * material.quantity;
      
    
  } else {
    // Fallback на старую логику
    description = formatRunnCellDescription(cell);
    quantity = cell.quantity || 1;
    
    if (materials) {
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

      totalPrice = cellMaterials.reduce((sum, material) => sum + material.price, 0);
      totalSum = totalPrice * quantity;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 text-sm text-gray-900">{description}</td>
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
        </tbody>
      </table>
    </div>
  );
}