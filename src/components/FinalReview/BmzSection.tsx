'use client';

import React from 'react';
import { BmzStore } from '@/store/useBmzStore';

type Props = {
  bmz: ReturnType<typeof BmzStore>;
};

const formattedPrice = (num?: number) =>
  num ? num.toLocaleString('ru-RU') + ' тг' : '—';

export default function BmzSection({ bmz }: Props) {
  const bmzLength = Number(bmz.length);
  const bmzWidth = Number(bmz.width);
  const bmzArea = Math.round(((bmzLength * bmzWidth) / 1_000_000) * 100) / 100;

  const pricePerLighting = 5000;
  const pricePerHeatedFloor = 7500;

  const total =
    (bmz.lighting ? bmzArea * pricePerLighting : 0) +
    (bmz.heatedFloor ? bmzArea * pricePerHeatedFloor : 0);

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Блочно-модульное здание (БМЗ)</h2>
      <table className="w-full table-auto border text-sm">
        <thead className="bg-[#3A55DF] text-white">
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
            <td className="text-left p-2">
              Блочно-модульное здание из панелей типа "Сэндвич".
              <br />
              Размеры: {bmz.length}x{bmz.width}x{bmz.height} мм.
              <br />
              Стены выполнены из панелей толщиной {bmz.thickness || '—'} мм (4 блока)
            </td>
            <td>м2</td>
            <td>{bmzArea}</td>
            <td>{formattedPrice(0)}</td>
            <td>{formattedPrice(0)}</td>
          </tr>

          {bmz.heatedFloor && (
            <tr>
              <td className="p-2">2</td>
              <td className="text-left p-2">Утеплённый пол в БМЗ</td>
              <td>м2</td>
              <td>{bmzArea}</td>
              <td>{formattedPrice(pricePerHeatedFloor)}</td>
              <td>{formattedPrice(bmzArea * pricePerHeatedFloor)}</td>
            </tr>
          )}

          {bmz.lighting && (
            <tr>
              <td className="p-2">3</td>
              <td className="text-left p-2">
                Освещение (рабочее, аварийное и ремонтное) без шкафа ШСН
              </td>
              <td>м2</td>
              <td>{bmzArea}</td>
              <td>{formattedPrice(pricePerLighting)}</td>
              <td>{formattedPrice(bmzArea * pricePerLighting)}</td>
            </tr>
          )}

          {bmz.heating && (
            <tr>
              <td className="p-2">4</td>
              <td className="text-left p-2">Отопление без шкафа ШСН</td>
              <td>м2</td>
              <td>{bmzArea}</td>
              <td>—</td>
              <td>—</td>
            </tr>
          )}

          {bmz.fireAlarm && (
            <tr>
              <td className="p-2">5</td>
              <td className="text-left p-2">Охранно-пожарная сигнализация без шкафа ОПС</td>
              <td>м2</td>
              <td>{bmzArea}</td>
              <td>{formattedPrice(0)}</td>
              <td>{formattedPrice(0)}</td>
            </tr>
          )}

          {bmz.cableTrays && (
            <tr>
              <td className="p-2">6</td>
              <td className="text-left p-2">Кабельные полки и стойки</td>
              <td>компл.</td>
              <td>0</td>
              <td>{formattedPrice(19000)}</td>
              <td>{formattedPrice(0)}</td>
            </tr>
          )}

          {bmz.conditioning && (
            <tr>
              <td className="p-2">7</td>
              <td className="text-left p-2">Система кондиционирования</td>
              <td>нет</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
            </tr>
          )}

          {bmz.ventilationShaft && (
            <tr>
              <td className="p-2">8</td>
              <td className="text-left p-2">Шахта для принудительной вентиляции (ТП)</td>
              <td>нет</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
            </tr>
          )}

          <tr className="bg-[#f3f4f6] font-semibold">
            <td colSpan={5} className="text-right pr-4">ВСЕГО:</td>
            <td className="text-right pr-4">{formattedPrice(total)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
