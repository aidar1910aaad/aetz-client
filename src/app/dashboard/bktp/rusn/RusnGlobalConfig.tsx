'use client';

import { useRusnStore } from '@/store/useRusnStore';
import { useRusnSettings } from '@/hooks/useRusnSettings';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useCalculationGroups } from '@/hooks/useCalculationGroups';
import CellTypeSelector from './components/CellTypeSelector';
import EquipmentSelector from './components/EquipmentSelector';

export default function RusnGlobalConfig() {
  const { global, setGlobal } = useRusnStore();
  const { rusnSettings, loading, error } = useRusnSettings();
  const { selectedTransformer } = useTransformerStore();
  const { groups } = useCalculationGroups();

  const voltage = selectedTransformer?.voltage || '10';
  const voltageNum = voltage === '0.4' ? 400 : Number(voltage);

  const handleGroupChange = (groupSlug: string) => {
    const group = groups.find((g) => g.slug === groupSlug);
    if (group) {
      setGlobal('bodyType', group.name);
      localStorage.setItem('selectedGroupSlug', groupSlug);
      localStorage.setItem('selectedGroupName', group.name);
    }
  };

  const handleGlobalChange = (key: string, value: { id: number; name: string } | null) => {
    console.log('RusnGlobalConfig.handleGlobalChange', key, value);
    setGlobal(key as keyof typeof global, value);
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Загрузка настроек...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">Ошибка загрузки: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Тип ячеек */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Тип ячеек</h3>
        <CellTypeSelector
          selectedType={global.bodyType || ''}
          onTypeChange={handleGroupChange}
          voltageNum={voltageNum}
        />
        {global.bodyType && (
          <p className="text-xs text-gray-600 mt-2">
            Выбран тип: <span className="font-medium">{global.bodyType}</span>
          </p>
        )}
      </div>

      {/* Оборудование */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Оборудование</h3>
        <EquipmentSelector
          rusnSettings={rusnSettings}
          global={global}
          onGlobalChange={handleGlobalChange}
          voltage={voltageNum}
        />
      </div>
    </div>
  );
}
