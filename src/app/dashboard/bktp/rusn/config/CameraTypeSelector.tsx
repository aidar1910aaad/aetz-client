import React from 'react';
import { useCalculationGroups } from '@/hooks/useCalculationGroups';
import { getVoltageLabel, getVoltageStyles } from '@/utils/rusnSettings';

interface CameraTypeSelectorProps {
  selectedType: string;
  onTypeChange: (cameraType: string) => void;
  voltageNum: number;
}

export default function CameraTypeSelector({
  selectedType,
  onTypeChange,
  voltageNum,
}: CameraTypeSelectorProps) {
  const { groups, loading, error } = useCalculationGroups();


  if (loading) {
    return <div className="text-sm text-gray-600">Загрузка типов ячеек...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">Ошибка загрузки: {error}</div>;
  }

  if (!groups || groups.length === 0) {
    return <div className="text-sm text-yellow-600">Нет доступных групп калькуляций</div>;
  }

  // Фильтруем группы по напряжению
  const filteredGroups = groups.filter((group) => {
    // Для 20кВ показываем только КСО А17-20 и 8DJH
    if (voltageNum === 20) {
      return group.name === 'Камера КСО А17-20' || group.name === 'Камера 8DJH';
    }
    
    // Для 10кВ показываем только 10кВ типы
    if (voltageNum === 10) {
      if (group.voltageType !== 10) {
        return false;
      }
      // Скрываем УСТ для 10кВ
      if (group.name.toLowerCase().includes('уст')) {
        return false;
      }
      return true;
    }
    
    // Для других напряжений показываем только соответствующие типы
    if (group.voltageType !== voltageNum) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredGroups.map((group) => {
        // Специальная обработка для 8DJH при 20кВ трансформаторе
        // 8DJH в БД хранится как 10кВ, но для 20кВ трансформатора нужно показывать 20кВ
        const is8DJHAt20kV = group.name === 'Камера 8DJH' && voltageNum === 20;
        const displayVoltage = is8DJHAt20kV ? 20 : (group.voltageType || 10);
        
        return (
          <button
            key={group.id}
            onClick={() => onTypeChange(group.name)}
            className={`px-6 py-4 text-sm font-medium rounded-xl border transition-all duration-200 transform hover:scale-105 flex items-start shadow-sm hover:shadow-md ${
              selectedType === group.name
                ? 'bg-[#8eba1e] text-white border-[#8eba1e] shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-[#8eba1e]'
            }`}
          >
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center gap-2 w-full">
                <div className={`w-2 h-2 rounded-full ${
                  selectedType === group.name ? 'bg-white' : 'bg-[#8eba1e]'
                }`} />
                <span className="font-bold text-base">{group.name}</span>
              </div>
              <span
                className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedType === group.name
                    ? 'bg-white/20 text-white'
                    : getVoltageStyles(displayVoltage)
                }`}
              >
                {getVoltageLabel(displayVoltage)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
