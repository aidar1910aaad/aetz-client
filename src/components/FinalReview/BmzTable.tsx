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
  header: 'bg-[#90bd20]',
  total: 'bg-[#f3f4f6]',
};

export default function BmzTable({ bmzData, roundedArea, unitPrice, totalPrice }: BmzTableProps) {
  const activeEquipment = getActiveEquipment(bmzData);

  return (
        <div className="bg-white">
          <table className="w-full table-fixed text-sm">
        <thead className={`${COLORS.header} text-white`}>
          <tr>
            <th className="p-2 w-12">№</th>
            <th className="p-2 text-left w-2/5 break-words">Наименование</th>
            <th className="p-2 w-20">Ед. изм.</th>
            <th className="p-2 w-20">Кол-во</th>
            <th className="p-2 w-32">Цена</th>
            <th className="p-2 w-32">Сумма</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {bmzData.buildingType === 'bmz' && (
            <tr>
              <td className="p-2">1</td>
              <td className="p-2 text-left break-words">
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
              <td className="p-2">1</td>
              <td className="p-2 text-left break-words">
                Здание ТП ({bmzData.length}×{bmzData.width}×{bmzData.height} мм)
              </td>
              <td className="p-2">м²</td>
              <td className="p-2">{roundedArea}</td>
              <td className="p-2">—</td>
              <td className="p-2">—</td>
            </tr>
          )}

          {activeEquipment.map((equipment, index) => (
            <tr key={equipment.name}>
              <td className="p-2">{index + 2}</td>
              <td className="p-2 text-left break-words">{equipment.name}</td>
              <td className="p-2">{equipment.unit}</td>
              <td className="p-2">{equipment.quantity.toFixed(2)}</td>
              <td className="p-2">{equipment.price.toLocaleString()} тг</td>
              <td className="p-2">{equipment.totalPrice.toLocaleString()} тг</td>
            </tr>
          ))}

          <tr className={`${COLORS.total} font-semibold`}>
            <td colSpan={5} className="text-right pr-2">
              ВСЕГО:
            </td>
            <td className="text-right pl-2">{totalPrice.toLocaleString()} тг</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
