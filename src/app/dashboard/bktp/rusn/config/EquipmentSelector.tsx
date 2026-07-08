import React, { useEffect, useMemo } from 'react';
import { RusnSettings } from '@/utils/rusnSettings';
import { Select } from '@/components/ui/select';

// Компонент SelectWithLabel
interface Option {
  value: string;
  label: string;
}

interface SelectWithLabelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

function SelectWithLabel({ label, value, onChange, options }: SelectWithLabelProps) {
  const isSelected = value && value !== '';
  
  return (
    <div className={`mb-4 rounded-xl border transition-all duration-200 ${
      isSelected 
        ? 'border-[#8eba1e] bg-white shadow-md' 
        : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
    }`}>
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isSelected ? 'bg-[#8eba1e]' : 'bg-gray-400'
          }`} />
          <h4 className="text-sm font-semibold text-gray-800 truncate" title={label}>
            {label}
          </h4>
        </div>
      </div>
      <div className="px-4 py-3">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none ${
            isSelected
              ? 'border-[#8eba1e] bg-white focus:ring-2 focus:ring-[#8eba1e]/20 focus:border-[#8eba1e]'
              : 'border-gray-300 bg-white focus:ring-2 focus:ring-[#8eba1e]/20 focus:border-[#8eba1e]'
          }`}
        >
          <option value="">Выберите</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        {isSelected && (
          <div className="mt-2 text-xs text-[#8eba1e] font-medium">
            ✓ Выбрано
          </div>
        )}
      </div>
    </div>
  );
}

interface EquipmentSelectorProps {
  rusnSettings: RusnSettings;
  global: {
    breaker?: { id: number; name: string } | null;
    rza?: { id: number; name: string } | null;
    meterType?: { id: number; name: string } | null;
    sr?: { id: number; name: string } | null;
    tsn?: { id: number; name: string } | null;
    tn?: { id: number; name: string } | null;
    tt?: { id: number; name: string } | null;
  };
  onGlobalChange: (key: string, value: { id: number; name: string } | null) => void;
  voltage?: number; // Добавляем напряжение
}

/** Категории, в названии которых есть напряжение заявки (10кВ / 20кВ / 0.4кВ). */
const filterCategoriesByVoltage = (
  categories: { id: number; name: string }[],
  voltage: number
): { id: number; name: string }[] => {
  const voltageLabel = voltage === 400 ? '0.4' : String(voltage);
  const normalized = (value: string) =>
    value.toLowerCase().replace(/,/g, '.').replace(/\s+/g, '');

  const patterns = [
    `${voltageLabel}кв`,
    `${voltageLabel}кв.`,
    `${normalized(voltageLabel)}кв`,
  ];

  const matched = categories.filter((category) => {
    const name = normalized(category.name);
    return patterns.some((pattern) => name.includes(pattern));
  });

  // Если в названиях нет «10кВ/20кВ» — не прячем категории совсем
  return matched.length > 0 ? matched : categories;
};

export default function EquipmentSelector({
  rusnSettings,
  global,
  onGlobalChange,
  voltage = 10, // Дефолтное значение
}: EquipmentSelectorProps) {
  // Выключатель, ТТ и ТСН — только категория под выбранное напряжение (10/20 кВ)
  const filteredSettings = useMemo(
    () => ({
      switch: filterCategoriesByVoltage(rusnSettings.switch, voltage),
      rza: rusnSettings.rza,
      counter: rusnSettings.counter,
      sr: rusnSettings.sr,
      tsn: filterCategoriesByVoltage(rusnSettings.tsn, voltage),
      tn: rusnSettings.tn,
      tt: filterCategoriesByVoltage(rusnSettings.tt, voltage),
    }),
    [rusnSettings, voltage]
  );

  // Типы оборудования, для которых нужен выбор
  const selectableEquipment = [
    { key: 'breaker', label: 'Выключатель', settings: filteredSettings.switch },
    { key: 'rza', label: 'РЗА', settings: filteredSettings.rza },
    { key: 'meterType', label: 'Счетчик', settings: filteredSettings.counter },
  ];

  // Типы оборудования, которые автоматически выбираются (скрыты от пользователя)
  const autoSelectEquipment = [
    { key: 'sr', label: 'Разъединитель', settings: filteredSettings.sr },
    { key: 'tsn', label: 'Силовой трансформатор', settings: filteredSettings.tsn },
    { key: 'tn', label: 'Трансформатор напряжения', settings: filteredSettings.tn },
    { key: 'tt', label: 'Трансформатор тока', settings: filteredSettings.tt },
  ] as const;

  // Автоматически выбираем категорию под напряжение (для ТТ — 10кВ или 20кВ)
  useEffect(() => {
    autoSelectEquipment.forEach(({ key, settings }) => {
      if (settings.length === 0) return;

      const current = global[key as keyof typeof global];
      const stillValid =
        current && settings.some((option) => option.id === current.id);

      if (!stillValid) {
        const firstOption = settings[0];
        onGlobalChange(key, { id: firstOption.id, name: firstOption.name });
      }
    });
  }, [
    filteredSettings.sr,
    filteredSettings.tsn,
    filteredSettings.tn,
    filteredSettings.tt,
    global.sr,
    global.tsn,
    global.tn,
    global.tt,
    onGlobalChange,
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Оборудование с выбором */}
      {selectableEquipment.map(({ key, label, settings }) => {
        const selected = global[key as keyof typeof global] as { id: number; name: string } | null;
        return (
          <SelectWithLabel
            key={key}
            label={label}
            value={selected?.id?.toString() || ''}
            onChange={(value) => {
              const found = settings.find((cat) => cat.id.toString() === value);
              if (found) {
                onGlobalChange(key, { id: found.id, name: found.name });
              } else {
                onGlobalChange(key, null);
              }
            }}
            options={settings.map((cat) => ({
              value: cat.id.toString(),
              label: cat.name,
            }))}
          />
        );
      })}

    </div>
  );
}
