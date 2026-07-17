'use client';

import { useState, useEffect } from 'react';
import { currencyApi } from '@/api/currency';

export interface CalculationValues {
  manufacturingHours: number;
  hourlyRate: number;
  overheadPercentage: number;
  adminPercentage: number;
  plannedProfitPercentage: number;
  ndsPercentage: number;
}

interface CalculationSummaryProps {
  totalMaterialsCost: number;
  onValuesChange: (values: CalculationValues) => void;
  isReadOnly?: boolean;
  editablePercentages?: boolean;
  initialValues?: Partial<CalculationValues>;
}

export function CalculationSummary({
  totalMaterialsCost,
  onValuesChange,
  isReadOnly = false,
  editablePercentages = false,
  initialValues,
}: CalculationSummaryProps) {
  const [manufacturingHours, setManufacturingHours] = useState(initialValues?.manufacturingHours ?? 0);
  const [hourlyRate, setHourlyRate] = useState(initialValues?.hourlyRate ?? 2000);
  const [overheadPercentage, setOverheadPercentage] = useState(initialValues?.overheadPercentage ?? 10);
  const [adminPercentage, setAdminPercentage] = useState(initialValues?.adminPercentage ?? 15);
  const [plannedProfitPercentage, setPlannedProfitPercentage] = useState(
    initialValues?.plannedProfitPercentage ?? 10
  );
  const [ndsPercentage, setNdsPercentage] = useState(initialValues?.ndsPercentage ?? 12);
  const [settingsLoaded, setSettingsLoaded] = useState(editablePercentages);

  useEffect(() => {
    if (!editablePercentages || !initialValues) return;

    if (initialValues.manufacturingHours !== undefined) {
      setManufacturingHours(initialValues.manufacturingHours);
    }
    if (initialValues.hourlyRate !== undefined) {
      setHourlyRate(initialValues.hourlyRate);
    }
    if (initialValues.overheadPercentage !== undefined) {
      setOverheadPercentage(initialValues.overheadPercentage);
    }
    if (initialValues.adminPercentage !== undefined) {
      setAdminPercentage(initialValues.adminPercentage);
    }
    if (initialValues.plannedProfitPercentage !== undefined) {
      setPlannedProfitPercentage(initialValues.plannedProfitPercentage);
    }
    if (initialValues.ndsPercentage !== undefined) {
      setNdsPercentage(initialValues.ndsPercentage);
    }
    setSettingsLoaded(true);
  }, [editablePercentages, initialValues]);

  useEffect(() => {
    if (editablePercentages) return;

    if (initialValues?.manufacturingHours !== undefined) {
      setManufacturingHours(initialValues.manufacturingHours);
    }
  }, [editablePercentages, initialValues?.manufacturingHours]);

  useEffect(() => {
    if (editablePercentages) return;

    const loadSettings = async () => {
      try {
        const settings = await currencyApi.getSettings();
        setHourlyRate(parseFloat(String(settings.hourlyWage)) || 2000);
        setOverheadPercentage(parseFloat(String(settings.productionExpenses)) || 10);
        setAdminPercentage(parseFloat(String(settings.administrativeExpenses)) || 15);
        setPlannedProfitPercentage(parseFloat(String(settings.plannedSavings)) || 10);
        setNdsPercentage(parseFloat(String(settings.vatRate)) || 12);
      } catch {
        setHourlyRate(2000);
        setOverheadPercentage(10);
        setAdminPercentage(15);
        setPlannedProfitPercentage(10);
        setNdsPercentage(12);
      } finally {
        setSettingsLoaded(true);
      }
    };
    loadSettings();
  }, [editablePercentages]);

  useEffect(() => {
    if (!settingsLoaded) return;
    onValuesChange({
      manufacturingHours,
      hourlyRate,
      overheadPercentage,
      adminPercentage,
      plannedProfitPercentage,
      ndsPercentage,
    });
  }, [
    settingsLoaded,
    manufacturingHours,
    hourlyRate,
    overheadPercentage,
    adminPercentage,
    plannedProfitPercentage,
    ndsPercentage,
  ]);

  const totalSalary = manufacturingHours * hourlyRate;
  const overheadCost = (totalMaterialsCost * overheadPercentage) / 100;
  const productionCost = totalMaterialsCost + totalSalary + overheadCost;
  const adminCost = (totalMaterialsCost * adminPercentage) / 100;
  const fullCost = productionCost + adminCost;
  const plannedProfit = (fullCost * plannedProfitPercentage) / 100;
  const wholesalePrice = fullCost + plannedProfit;
  const ndsAmount = (wholesalePrice * ndsPercentage) / 100;
  const finalPrice = wholesalePrice + ndsAmount;

  const fmt = (n: number) => n.toLocaleString('ru-RU', { maximumFractionDigits: 3 });

  const Row = ({
    label,
    value,
    bold = false,
    accent = false,
    separator = false,
  }: {
    label: string;
    value: string;
    bold?: boolean;
    accent?: boolean;
    separator?: boolean;
  }) => (
    <div className={`grid grid-cols-[1fr_auto] items-center gap-3 py-1.5 ${separator ? 'mt-1 pt-2 border-t border-gray-100' : ''}`}>
      <span className={`text-xs leading-tight ${bold ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-xs font-semibold tabular-nums text-right whitespace-nowrap ${accent ? 'text-[#8eba1e]' : bold ? 'text-gray-900' : 'text-gray-700'}`}>{value}</span>
    </div>
  );

  const GlobalSettingRow = ({
    label,
    paramValue,
    resultLabel,
    resultValue,
    separator = false,
  }: {
    label: string;
    paramValue: string;
    resultLabel: string;
    resultValue: string;
    separator?: boolean;
  }) => (
    <div className={`space-y-0.5 ${separator ? 'mt-1 pt-2 border-t border-gray-100' : ''}`}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <span className="text-xs text-gray-500 leading-tight">{label}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-medium text-gray-700 tabular-nums">{paramValue}</span>
          <span className="text-[9px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded">из настроек</span>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <span className="text-xs text-gray-400 leading-tight">{resultLabel}</span>
        <span className="text-xs font-semibold tabular-nums text-right whitespace-nowrap text-gray-600">{resultValue}</span>
      </div>
    </div>
  );

  const EditablePercentRow = ({
    label,
    value,
    onChange,
    resultLabel,
    resultValue,
    separator = false,
    suffix = '%',
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    resultLabel: string;
    resultValue: string;
    separator?: boolean;
    suffix?: string;
  }) => (
    <div className={`space-y-1 ${separator ? 'mt-1 pt-2 border-t border-gray-100' : ''}`}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <span className="text-xs font-semibold text-gray-700 leading-tight">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 px-2 py-1 text-xs text-right border border-gray-200 rounded focus:ring-1 focus:ring-[#8eba1e]/40 focus:border-[#8eba1e] transition-colors"
          />
          <span className="text-[10px] text-gray-400">{suffix}</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{resultLabel}</span>
        <span className="text-xs font-semibold tabular-nums text-gray-700">{resultValue}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-[#8eba1e]/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#8eba1e]/20 bg-[#8eba1e]/5">
        <h3 className="text-sm font-semibold text-gray-900 border-l-4 border-[#8eba1e] pl-2">
          Расчет стоимости
        </h3>
        {editablePercentages && !isReadOnly && (
          <p className="mt-1 text-[10px] text-gray-500 pl-2">
            Проценты и ставка сохраняются в калькуляции и не зависят от глобальных настроек
          </p>
        )}
      </div>

      <div className="px-4 py-3 space-y-0.5">

        {/* Материалы */}
        <Row label="Итого по материалам" value={`${fmt(totalMaterialsCost)} ₸`} bold />

        {/* Изготовление */}
        {isReadOnly ? (
          <Row
            label={`Изготовление (${manufacturingHours} ч × ${fmt(hourlyRate)} ₸)`}
            value={`${fmt(totalSalary)} ₸`}
            separator
          />
        ) : (
          <div className="mt-1 pt-2 border-t border-gray-100 space-y-1.5">
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <span className="text-xs font-semibold text-gray-700">Изготовление</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">ч</span>
                  <input
                    type="number"
                    value={manufacturingHours}
                    onChange={(e) => setManufacturingHours(Number(e.target.value))}
                    className="w-14 px-2 py-1 text-xs text-right border border-gray-200 rounded focus:ring-1 focus:ring-[#8eba1e]/40 focus:border-[#8eba1e] transition-colors"
                  />
                </div>
                <span className="text-[10px] text-gray-300">×</span>
                {editablePercentages ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs text-right border border-gray-200 rounded focus:ring-1 focus:ring-[#8eba1e]/40 focus:border-[#8eba1e] transition-colors"
                    />
                    <span className="text-[10px] text-gray-400">₸</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-700 tabular-nums">{fmt(hourlyRate)}</span>
                    <span className="text-[10px] text-gray-400">₸</span>
                    <span className="text-[9px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded">из настроек</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Зарплата</span>
              <span className="text-xs font-semibold tabular-nums text-gray-700">{fmt(totalSalary)} ₸</span>
            </div>
          </div>
        )}

        {/* Общепроизводственные */}
        {isReadOnly ? (
          <Row label={`Общепроизв. расходы (${overheadPercentage}%)`} value={`${fmt(overheadCost)} ₸`} />
        ) : editablePercentages ? (
          <EditablePercentRow
            label="Общепроизв. расходы"
            value={overheadPercentage}
            onChange={setOverheadPercentage}
            resultLabel="Сумма"
            resultValue={`${fmt(overheadCost)} ₸`}
          />
        ) : (
          <GlobalSettingRow
            label="Общепроизв. расходы"
            paramValue={`${overheadPercentage}%`}
            resultLabel="Сумма"
            resultValue={`${fmt(overheadCost)} ₸`}
          />
        )}

        <Row label="Произв. себестоимость" value={`${fmt(productionCost)} ₸`} bold separator />

        {/* Административные */}
        {isReadOnly ? (
          <Row label={`Адм. расходы (${adminPercentage}%)`} value={`${fmt(adminCost)} ₸`} />
        ) : editablePercentages ? (
          <EditablePercentRow
            label="Адм. расходы"
            value={adminPercentage}
            onChange={setAdminPercentage}
            resultLabel="Сумма"
            resultValue={`${fmt(adminCost)} ₸`}
          />
        ) : (
          <GlobalSettingRow
            label="Адм. расходы"
            paramValue={`${adminPercentage}%`}
            resultLabel="Сумма"
            resultValue={`${fmt(adminCost)} ₸`}
          />
        )}

        <Row label="Полная себестоимость" value={`${fmt(fullCost)} ₸`} bold separator />

        {/* Плановые накопления */}
        {isReadOnly ? (
          <Row label={`Плановые накопления (${plannedProfitPercentage}%)`} value={`${fmt(plannedProfit)} ₸`} />
        ) : editablePercentages ? (
          <EditablePercentRow
            label="Плановые накопл."
            value={plannedProfitPercentage}
            onChange={setPlannedProfitPercentage}
            resultLabel="Сумма"
            resultValue={`${fmt(plannedProfit)} ₸`}
          />
        ) : (
          <GlobalSettingRow
            label="Плановые накопл."
            paramValue={`${plannedProfitPercentage}%`}
            resultLabel="Сумма"
            resultValue={`${fmt(plannedProfit)} ₸`}
          />
        )}

        <Row label="Оптовая цена" value={`${fmt(wholesalePrice)} ₸`} bold separator />

        {/* НДС */}
        {isReadOnly ? (
          <Row label={`НДС (${ndsPercentage}%)`} value={`${fmt(ndsAmount)} ₸`} />
        ) : editablePercentages ? (
          <EditablePercentRow
            label="НДС"
            value={ndsPercentage}
            onChange={setNdsPercentage}
            resultLabel="Сумма НДС"
            resultValue={`${fmt(ndsAmount)} ₸`}
          />
        ) : (
          <GlobalSettingRow
            label="НДС"
            paramValue={`${ndsPercentage}%`}
            resultLabel="Сумма НДС"
            resultValue={`${fmt(ndsAmount)} ₸`}
          />
        )}
      </div>

      {/* Итог */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#8eba1e]/10 border-t border-[#8eba1e]/20">
        <span className="text-sm font-semibold text-gray-900">Отпускная цена:</span>
        <span className="text-base font-bold text-[#8eba1e] tabular-nums">{fmt(finalPrice)} ₸</span>
      </div>
    </div>
  );
}
