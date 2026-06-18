'use client';

import { formatKzt } from '@/utils/formatCurrency';

type Props = {
  name: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  isCalculating?: boolean;
};

export default function CellPriceSummary({
  name,
  quantity,
  pricePerUnit,
  total,
  isCalculating = false,
}: Props) {
  return (
    <div className="rounded-lg border border-[#8eba1e]/25 bg-gradient-to-r from-[#8eba1e]/5 to-white overflow-hidden">
      <div className="px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium mb-1">
            Результат расчёта
          </p>
          <p className="text-sm font-medium text-gray-900 leading-snug break-words">{name}</p>
        </div>
        <div className="flex flex-wrap items-stretch gap-4 sm:gap-6 shrink-0">
          <div className="text-center sm:text-right min-w-[4rem]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Кол-во</p>
            <p className="text-sm font-semibold text-gray-800 tabular-nums mt-0.5">{quantity} шт.</p>
          </div>
          <div className="text-center sm:text-right min-w-[5rem]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">За ед.</p>
            <p className="text-sm font-semibold text-gray-800 tabular-nums mt-0.5">
              {isCalculating ? '…' : `${formatKzt(pricePerUnit)} ₸`}
            </p>
          </div>
          <div className="text-center sm:text-right pl-0 sm:pl-4 sm:border-l border-[#8eba1e]/25 min-w-[6rem]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Итого</p>
            <p className="text-base font-bold text-[#8eba1e] tabular-nums mt-0.5">
              {isCalculating ? 'Загрузка…' : `${formatKzt(total)} ₸`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
