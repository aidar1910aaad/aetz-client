import React, { useEffect } from 'react';
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
  voltage?: number; // Добавляем напряжение
}

// Функция для фильтрации категорий по напряжению (только для выключателя)
const filterCategoriesByVoltage = (categories: { id: number; name: string }[], voltage: number): { id: number; name: string }[] => {
  const voltageLabel = voltage === 400 ? '0.4' : voltage.toString();
  
  return categories.filter(category => {
    const name = category.name.toLowerCase();
    
    // Проверяем различные варианты написания напряжения
    const voltagePatterns = [
      `${voltageLabel}кв`,
      `${voltageLabel} кв`,
      `${voltageLabel}кВ`,
      `${voltageLabel} кВ`,
      `${voltageLabel}кв`,
      `${voltageLabel} кв`,
      `${voltageLabel}кВ`,
      `${voltageLabel} кВ`,
    ];
    
    return voltagePatterns.some(pattern => name.includes(pattern));
  });
};

export default function EquipmentSelector({
  rusnSettings,
  global,
  onGlobalChange,
  voltage = 10, // Дефолтное значение
}: EquipmentSelectorProps) {
  // Фильтруем категории по напряжению только для выключателя
  const filteredSettings = {
    switch: filterCategoriesByVoltage(rusnSettings.switch, voltage), // Только выключатель фильтруется
    rza: rusnSettings.rza, // Остальное без фильтрации
    counter: rusnSettings.counter,
    sr: rusnSettings.sr,
    tsn: rusnSettings.tsn,
    tn: rusnSettings.tn,
    tt: rusnSettings.tt,
  };

  // Типы оборудования, для которых нужен выбор
  const selectableEquipment = [
    { key: 'breaker', label: 'Выключатель', settings: filteredSettings.switch },
    { key: 'rza', label: 'РЗА', settings: filteredSettings.rza },
    { key: 'meterType', label: 'Счетчик', settings: filteredSettings.counter },
  ];

  // Типы оборудования, которые автоматически выбираются
  const autoSelectEquipment = [
    { key: 'sr', label: 'Разъединитель', settings: filteredSettings.sr },
    { key: 'tsn', label: 'Силовой трансформатор', settings: filteredSettings.tsn },
    { key: 'tn', label: 'Трансформатор напряжения', settings: filteredSettings.tn },
    { key: 'tt', label: 'Трансформатор тока', settings: filteredSettings.tt },
  ];

  // Автоматически выбираем первый доступный вариант для autoSelectEquipment
  useEffect(() => {
    autoSelectEquipment.forEach(({ key, settings }) => {
      if (settings.length === 1 && !global[key as keyof typeof global]) {
        const firstOption = settings[0];
        console.log(`Автоматически выбираем ${key}:`, firstOption);
        onGlobalChange(key, { id: firstOption.id, name: firstOption.name });
      }
    });
  }, [filteredSettings, global, onGlobalChange]);

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

      {/* Оборудование с автоматическим выбором */}
      {autoSelectEquipment.map(({ key, label, settings }) => {
        const selected = global[key as keyof typeof global] as { id: number; name: string } | null;
        
        // Если есть только один вариант, показываем его как выбранный
        if (settings.length === 1) {
          const singleOption = settings[0];
          return (
            <div key={key} className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-800 truncate" title={label}>
                  {label}
                </h4>
              </div>
              <div className="px-4 py-3">
                <div className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700">
                  {singleOption.name}
                </div>
                <p className="text-xs text-gray-500 mt-1">Автоматически выбрано</p>
              </div>
            </div>
          );
        }

        // Если вариантов несколько или нет, показываем обычный селект
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
