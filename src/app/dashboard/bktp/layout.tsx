'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useBktpRealtimeCalculation } from '@/hooks/useBktpRealtimeCalculation';
import { useWorkPricesBootstrap } from '@/hooks/useWorkPricesBootstrap';
import { useRealtimeCalculationStore } from '@/store/useRealtimeCalculationStore';
import { formatAmount } from '@/utils/formatAmount';

function PayloadSection({ title, value }: { title: string; value: unknown }) {
  return (
    <details className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1">
      <summary className="cursor-pointer text-xs font-medium text-gray-800">{title}</summary>
      <pre className="mt-2 max-h-72 overflow-auto overscroll-contain rounded-md bg-white p-2 text-[10px] leading-4 text-gray-700 whitespace-pre-wrap break-words">
        {JSON.stringify(value ?? null, null, 2)}
      </pre>
    </details>
  );
}

function RealtimeCalculationBadge() {
  const [isPayloadOpen, setIsPayloadOpen] = useState(false);
  const { isCalculating, totalAmount, error, lastCalculatedAt, data, requestConfig } =
    useRealtimeCalculationStore();

  const debugPayload = {
    request: {
      type: 'БКТП',
      data: {
        config: requestConfig,
      },
    },
    response: {
      totalAmount,
      snapshot: data?.snapshot ?? null,
      pricingMeta: data?.pricingMeta ?? null,
      repriceDiff: data?.repriceDiff ?? null,
    },
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-h-[75vh] w-[min(560px,calc(100vw-2rem))] overflow-y-auto overscroll-contain bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-gray-700">Онлайн пересчет (backend)</p>
        <span className={`text-xs ${isCalculating ? 'text-amber-600' : 'text-green-600'}`}>
          {isCalculating ? 'Считаем...' : 'Актуально'}
        </span>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-1 text-sm font-bold text-gray-900">
          {totalAmount !== null ? `${formatAmount(totalAmount)} ₸` : '—'}
        </p>
      )}
      {lastCalculatedAt && (
        <p className="mt-1 text-[11px] text-gray-500">
          {new Date(lastCalculatedAt).toLocaleTimeString('ru-RU')}
        </p>
      )}

      <button
        type="button"
        onClick={() => setIsPayloadOpen((open) => !open)}
        className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-left text-xs font-medium text-gray-700 transition-colors hover:border-[#8eba1e]/40 hover:bg-[#8eba1e]/5"
        aria-expanded={isPayloadOpen}
      >
        <span>{isPayloadOpen ? 'Скрыть payload' : 'Показать payload хранения/пересчета'}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isPayloadOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isPayloadOpen && (
        <div className="mt-2 max-h-[56vh] space-y-2 overflow-y-auto pr-1 text-xs">
          <p className="text-[11px] text-gray-600">
            Заявка › Общая информация › Здание подстанции › Трансформатор › РУСН › РУНН › Доп
            Оборудование › Работы
          </p>

          <PayloadSection title="Заявка" value={debugPayload} />
          <PayloadSection title="Общая информация" value={requestConfig?.meta} />
          <PayloadSection title="Здание подстанции" value={requestConfig?.bmz} />
          <PayloadSection title="Трансформатор" value={requestConfig?.transformer} />
          <PayloadSection title="РУСН" value={requestConfig?.rusn} />
          <PayloadSection title="РУНН" value={requestConfig?.runn} />
          <PayloadSection title="Доп Оборудование" value={requestConfig?.additionalEquipment} />
          <PayloadSection title="Работы" value={requestConfig?.works} />
        </div>
      )}
    </div>
  );
}

export default function BktpLayout({ children }: { children: ReactNode }) {
  useWorkPricesBootstrap();
  useBktpRealtimeCalculation();

  return (
    <>
      {children}
      <RealtimeCalculationBadge />
    </>
  );
}
