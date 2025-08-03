import React from 'react';
import { useCalculationGroups } from '@/hooks/useCalculationGroups';
import { getVoltageLabel, getVoltageStyles } from '@/utils/rusnSettings';

interface CellTypeSelectorProps {
  selectedType: string;
  onTypeChange: (groupSlug: string) => void;
  voltageNum: number;
}

export default function CellTypeSelector({
  selectedType,
  onTypeChange,
  voltageNum,
}: CellTypeSelectorProps) {
  const { groups, loading, error } = useCalculationGroups();

  if (loading) {
    return <div className="text-sm text-gray-600">Загрузка типов ячеек...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">Ошибка загрузки: {error}</div>;
  }

  const filteredGroups = groups.filter((group) => group.voltageType === voltageNum);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {filteredGroups.map((group) => (
        <button
          key={group.id}
          onClick={() => onTypeChange(group.slug)}
          className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors flex items-start ${
            selectedType === group.name
              ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          }`}
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold text-base">{group.name}</span>
            <span
              className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getVoltageStyles(
                group.voltageType
              )}`}
            >
              {getVoltageLabel(group.voltageType)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
