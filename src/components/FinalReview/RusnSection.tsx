'use client';

import React from 'react';

type RusnData = {
  selectedCellTypes: string[];
  breaker?: string;
  rza?: string;
  ctRatio?: string;
  meterType?: string;
  cells: {
    input: number;
    sv: number;
    sr: number;
    outgoing: number;
    tn: number;
    tsn: number;
    transformerOutgoing: number;
  };
};

type Props = {
  rusn: RusnData;
};

const cellNames: Record<keyof RusnData['cells'], string> = {
  input: '1ВК (вводная)',
  sv: '3СВ (секционный выключатель)',
  sr: '4РСВ (разъединитель секционного выключателя)',
  outgoing: 'Отходящая линия',
  transformerOutgoing: '2ЛК1 (трансформаторная)',
  tn: 'ТН (трансформатор напряжения)',
  tsn: 'ТСН (собственных нужд)',
};

const cameraName = 'Камера КСО А12-10';

const pricePerItem = 3200000;

export default function RusnSection({ rusn }: Props) {
  const { selectedCellTypes, breaker, rza, ctRatio, meterType, cells } = rusn;

  const rows = Object.entries(cells)
    .filter(([, value]) => value > 0)
    .map(([key, value], index) => {
      const designation = cellNames[key as keyof typeof cellNames] || key;

      const fullName = [
        cameraName,
        designation,
        breaker ? `С выключателем ${breaker} 1250А` : null,
        rza ? `Микропроцессорная защита ${rza}` : null,
        ctRatio || null,
        meterType || null,
      ]
        .filter(Boolean)
        .join(', ');

      const total = pricePerItem * value;

      return (
        <tr key={key} className="text-center border-b">
          <td className="border px-2 py-1">{index + 1}</td>
          <td className="border px-2 py-1 text-left">{fullName}</td>
          <td className="border px-2 py-1">шт</td>
          <td className="border px-2 py-1">{value}</td>
          <td className="border px-2 py-1">{pricePerItem.toLocaleString('ru-RU')} тг</td>
          <td className="border px-2 py-1">{total.toLocaleString('ru-RU')} тг</td>
        </tr>
      );
    });

  const totalSum = Object.values(cells).reduce((sum, val) => sum + pricePerItem * val, 0);

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-4">
        РУ-{selectedCellTypes[0]?.includes('20') ? '20' : '10'}кВ
      </h2>
      <table className="w-full text-sm table-auto border border-collapse">
        <thead className="bg-[#3A55DF] text-white">
          <tr>
            <th className="p-2 border">№</th>
            <th className="p-2 border text-left">Наименование</th>
            <th className="p-2 border">Ед. изм.</th>
            <th className="p-2 border">Кол-во</th>
            <th className="p-2 border">Цена</th>
            <th className="p-2 border">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {rows}
          <tr className="font-semibold bg-gray-100">
            <td colSpan={5} className="text-right px-4 py-2 border">
              Итого:
            </td>
            <td className="border px-4 py-2 text-right">{totalSum.toLocaleString('ru-RU')} тг</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
