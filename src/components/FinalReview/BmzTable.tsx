'use client';

import React from 'react';
import { getActiveEquipment } from '@/utils/bmzCalculations';
import { BmzData } from '@/utils/bmzCalculations';

interface BmzTableProps {
  bmzData: BmzData;
  roundedArea: number;
  unitPrice: number;
  totalPrice: number;
}

const TABLE_HEADERS = ['Наименование', 'Ед. изм.', 'Кол-во', 'Цена', 'Сумма'];
const COLORS = {
  header: 'bg-[#3A55DF]',
  total: 'bg-[#f3f4f6]',
};

export default function BmzTable({ bmzData, roundedArea, unitPrice, totalPrice }: BmzTableProps) {
  const activeEquipment = getActiveEquipment(bmzData);

  return (
    <div className="bg-white border border-gray-200">
      <table className="w-full table-auto border text-sm">
        <thead className={`${COLORS.header} text-white`}>
          <tr>
            {TABLE_HEADERS.map((header, index) => (
              <th key={index} className={`p-2 ${index === 0 ? 'text-left' : ''}`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center">
          {bmzData.buildingType === 'bmz' && (
            <tr>
              <td className="p-2 text-left">
                Здание БМЗ ({bmzData.length}×{bmzData.width}×{bmzData.height} мм, толщина{' '}
                {bmzData.thickness} мм, {bmzData.blockCount} блоков)
              </td>
              <td className="p-2">м²</td>
              <td className="p-2">{roundedArea}</td>
              <td className="p-2">{unitPrice.toLocaleString()} тг</td>
              <td className="p-2">{(unitPrice * roundedArea).toLocaleString()} тг</td>
            </tr>
          )}
          {bmzData.buildingType === 'tp' && (
            <tr>
              <td className="p-2 text-left">
                Здание ТП ({bmzData.length}×{bmzData.width}×{bmzData.height} мм)
              </td>
              <td className="p-2">м²</td>
              <td className="p-2">{roundedArea}</td>
              <td className="p-2">—</td>
              <td className="p-2">—</td>
            </tr>
          )}

          {activeEquipment.map((equipment) => (
            <tr key={equipment.name}>
              <td className="p-2 text-left">{equipment.name}</td>
              <td className="p-2">{equipment.unit}</td>
              <td className="p-2">{equipment.quantity.toFixed(2)}</td>
              <td className="p-2">{equipment.price.toLocaleString()} тг</td>
              <td className="p-2">{equipment.totalPrice.toLocaleString()} тг</td>
            </tr>
          ))}

          <tr className={`${COLORS.total} font-semibold`}>
            <td colSpan={4} className="text-right pr-4">
              ВСЕГО:
            </td>
            <td className="text-right pr-4">{totalPrice.toLocaleString()} тг</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
