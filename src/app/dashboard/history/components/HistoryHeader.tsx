'use client';

interface HistoryHeaderProps {
  total: number;
  showing: number;
  loading: boolean;
}

export default function HistoryHeader({ total, showing, loading }: HistoryHeaderProps) {
  return (
    <div className="border-b border-[#7aa31a]/30 bg-gradient-to-r from-[#7aa31a] to-[#8eba1e] px-6 py-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Единый журнал</h1>
          <p className="mt-1 text-sm text-white/85">
            Изменения материалов, калькуляций и курсов валют
          </p>
        </div>
        {(total > 0 || showing > 0) && (
          <div className="flex flex-wrap gap-2">
            <div className="rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
              Всего: <span className="font-semibold">{loading ? '…' : total}</span>
            </div>
            <div className="rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
              На странице: <span className="font-semibold">{loading ? '…' : showing}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
