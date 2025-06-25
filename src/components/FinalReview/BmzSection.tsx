'use client';

import React, { useMemo } from 'react';
import {
  calculateArea,
  calculateBasePrice,
  calculateTotalPrice,
  BmzData,
} from '@/utils/bmzCalculations';
import BmzTable from './BmzTable';

type Props = {
  bmz: BmzData;
};

const COLORS = {
  header: 'bg-[#3A55DF]',
  total: 'bg-[#f3f4f6]',
};

export default function BmzSection({ bmz }: Props) {
  // Мемоизированные вычисления
  const area = useMemo(() => calculateArea(bmz.width, bmz.length), [bmz.width, bmz.length]);
  const roundedArea = useMemo(() => Math.round(area * 10) / 10, [area]);
  const unitPrice = useMemo(
    () => (bmz.buildingType === 'bmz' ? calculateBasePrice(bmz.settings, bmz.thickness, area) : 0),
    [bmz.buildingType, bmz.settings, bmz.thickness, area]
  );
  const totalPrice = useMemo(() => calculateTotalPrice(bmz), [bmz]);

  if (!bmz.buildingType || bmz.buildingType === 'none') {
    return (
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">РУ-0,4кВ</h2>
        <table className="w-full table-auto border text-sm">
          <thead className={`${COLORS.header} text-white`}>
            <tr>
              <th className="p-2">№</th>
              <th className="p-2 text-left">Наименование</th>
              <th className="p-2">Ед. изм.</th>
              <th className="p-2">Кол-во</th>
              <th className="p-2">Цена</th>
              <th className="p-2">Сумма</th>
            </tr>
          </thead>
          <tbody className="text-center">
            <tr>
              <td className="p-2">2</td>
              <td className="text-left p-2">БМЗ не предусмотрено</td>
              <td className="p-2">шт</td>
              <td className="p-2">—</td>
              <td className="p-2">—</td>
              <td className="p-2">—</td>
            </tr>
          </tbody>
        </table>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Блочно модульное здание</h2>
      <BmzTable
        bmzData={bmz}
        roundedArea={roundedArea}
        unitPrice={unitPrice}
        totalPrice={totalPrice}
      />
    </section>
  );
}
