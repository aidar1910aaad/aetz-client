import React from 'react';
import SelectWithLabel from '../SelectWithLabel';
import { RusnSettings } from '@/utils/rusnSettings';

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
}

export default function EquipmentSelector({
  rusnSettings,
  global,
  onGlobalChange,
}: EquipmentSelectorProps) {
  const equipmentConfig = [
    { key: 'breaker', label: 'Выключатель', settings: rusnSettings.switch },
    { key: 'rza', label: 'РЗА', settings: rusnSettings.rza },
    { key: 'meterType', label: 'Счетчик', settings: rusnSettings.counter },
    { key: 'sr', label: 'Разъединитель', settings: rusnSettings.sr },
    { key: 'tsn', label: 'Силовой трансформатор', settings: rusnSettings.tsn },
    { key: 'tn', label: 'Трансформатор напряжения', settings: rusnSettings.tn },
    { key: 'tt', label: 'Трансформатор тока', settings: rusnSettings.tt },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {equipmentConfig.map(({ key, label, settings }) => {
        const selected = global[key as keyof typeof global] as { id: number; name: string } | null;
        return (
          <SelectWithLabel
            key={key}
            label={label}
            value={selected?.id?.toString() || ''}
            onChange={(value) => {
              const found = settings.find((cat) => cat.id.toString() === value);
              if (found) {
                console.log('EquipmentSelector: выбрана категория', key, found);
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
