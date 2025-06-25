'use client';

import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { formatPrice } from '@/utils/bmzCalculations';

interface CellData {
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface CurrentRequest {
  cells: CellData[];
  totalSum: number;
  groupName: string;
  calculationName: string;
}

interface RusnSectionProps {
  voltage?: '10' | '20';
}

const TABLE_HEADERS = ['№', 'Наименование', 'Ед. изм.', 'Кол-во', 'Цена', 'Сумма'];
const COLORS = {
  header: 'bg-[#3A55DF]',
  total: 'bg-[#f3f4f6]',
};

export default function RusnSection({ voltage = '10' }: RusnSectionProps) {
  const [requestData] = useLocalStorage<CurrentRequest>('currentRequest');

  if (!requestData?.cells || requestData.cells.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">РУСН-{voltage}кВ</h2>
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
              <td className="p-2">1</td>
              <td className="text-left p-2">РУСН-{voltage}кВ не предусмотрено</td>
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
      <h2 className="text-xl font-semibold text-gray-800 mb-2">РУСН-{voltage}кВ</h2>
      <table className="w-full table-auto border text-sm">
        <thead className={`${COLORS.header} text-white`}>
          <tr>
            {TABLE_HEADERS.map((header, index) => (
              <th key={index} className={`p-2 ${index === 1 ? 'text-left' : ''}`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center">
          {requestData.cells.map((cell, index) => (
            <tr key={index}>
              <td className="p-2">{index + 1}</td>
              <td className="text-left p-2 whitespace-pre-line">{cell.name}</td>
              <td className="p-2">шт</td>
              <td className="p-2">{cell.quantity}</td>
              <td className="p-2">{formatPrice(cell.pricePerUnit)}</td>
              <td className="p-2">{formatPrice(cell.totalPrice)}</td>
            </tr>
          ))}
          <tr className={`${COLORS.total} font-semibold`}>
            <td colSpan={5} className="text-right pr-4">
              ВСЕГО:
            </td>
            <td className="text-right pr-4">{formatPrice(requestData.totalSum)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
