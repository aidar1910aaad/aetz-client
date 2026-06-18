import React from 'react';
import { Switchgear } from '@/api/switchgear';
import { BusAlert } from '@/components/shared/busUi';

interface BusbarResultsProps {
  title: string;
  matchingConfig: Switchgear | null;
  totalWeight: number;
  totalPrice: number;
  materialCost?: number;
  pricePerKg: number;
  hasMatchingConfig: boolean;
  transformerPower?: number;
  selectedTransformer?: any;
  cellDetails?: Array<{ name: string; quantity: number; weightPerCell: number; totalWeight: number }>;
  busbarCalculationResult?: any;
}

function StatItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export const BusbarResults: React.FC<BusbarResultsProps> = ({
  title,
  matchingConfig,
  totalWeight,
  totalPrice,
  pricePerKg,
  hasMatchingConfig,
  transformerPower,
  selectedTransformer,
}) => {
  const materialLabel =
    matchingConfig?.group === 'МТ' || matchingConfig?.group === 'МТ2'
      ? 'Медь'
      : matchingConfig?.group === 'АД' || matchingConfig?.group === 'АД2'
        ? 'Алюминий'
        : selectedTransformer?.busbars || 'Не выбран';

  if (!hasMatchingConfig) {
    return (
      <BusAlert variant="error" title="Конфигурация не найдена">
        Для трансформатора {transformerPower ?? '—'} кВА и материала «{selectedTransformer?.busbars ?? '—'}»
        не найдена подходящая конфигурация. Проверьте ячейки РУНН и настройки трансформатора.
      </BusAlert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#8eba1e]/20 bg-[#8eba1e]/5 px-4 py-3 text-sm text-gray-700">
        <span className="font-medium text-gray-900">Материал:</span> {materialLabel}
        {matchingConfig && (
          <span className="text-gray-500">
            {' '}
            · из конфигурации «{matchingConfig.type}» (группа {matchingConfig.group})
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatItem label="Конфигурация" value={matchingConfig?.type || '—'} />
        <StatItem label="Общий вес" value={`${(totalWeight || 0).toFixed(2)} кг`} />
        <StatItem
          label="Цена за кг"
          value={`${pricePerKg.toLocaleString()} тг`}
          hint={
            matchingConfig?.group === 'МТ' || matchingConfig?.group === 'МТ2' ? 'Медь' : 'Алюминий'
          }
        />
        <StatItem
          label="Стоимость"
          value={`${(totalPrice || 0).toLocaleString()} тг`}
          hint="без НДС по материалам"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Сводка</p>
        <p className="mt-1 text-sm text-gray-600">
          Итог по <span className="font-medium text-gray-900">{title}</span> · напряжение{' '}
          {selectedTransformer?.voltage ?? 0.4} кВ
        </p>
      </div>
    </div>
  );
};
