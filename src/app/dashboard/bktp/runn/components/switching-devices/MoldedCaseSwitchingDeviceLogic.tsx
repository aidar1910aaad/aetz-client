import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface MoldedCaseSwitchingDeviceLogicProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number) => void; remove: () => void; };
  categoryMaterials: Material[];
}

export default function MoldedCaseSwitchingDeviceLogic({ 
  cell, 
  categoryMaterials 
}: MoldedCaseSwitchingDeviceLogicProps) {
  // Функция для извлечения тока из названия материала
  const extractCurrentFromName = (name: string): number | null => {
    const currentPatterns = [
      /(\d+)\s*A\s*$/i, // 630 A, 1000 A в конце строки
      /(\d+)\s*А\s*$/i, // 630 А, 1000 А в конце строки
      /(\d+)\s*A\s*,/i, // 630 A, в середине
      /(\d+)\s*А\s*,/i, // 630 А, в середине
      /(\d+)\s*а/i, /(\d+)\s*a/i, // старые паттерны
      /(\d+)\s*ампер/i, /(\d+)\s*амп/i,
      /ток\s*(\d+)/i, /номинальный\s*ток\s*(\d+)/i,
      /iн\s*=\s*(\d+)/i, /i\s*=\s*(\d+)/i,
    ];

    for (const pattern of currentPatterns) {
      const match = name.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return null;
  };

  const moldedCaseBreakers = categoryMaterials.filter(material => {
    const current = extractCurrentFromName(material.name);
    return current !== null && current <= 1600;
  });

  // Группируем автоматы по номинальному току
  const groupedBreakers = moldedCaseBreakers.reduce((acc, breaker) => {
    const current = extractCurrentFromName(breaker.name);
    if (current && !acc[current]) {
      acc[current] = [];
    }
    if (current) {
      acc[current].push(breaker);
    }
    return acc;
  }, {} as Record<number, Material[]>);

  // Определяем доступные варианты выбора
  const availableOptions = [];
  
  if (groupedBreakers[1000]) {
    availableOptions.push({ current: 1000, count: 1, breakers: groupedBreakers[1000] });
  }
  
  if (groupedBreakers[630]) {
    availableOptions.push({ current: 630, count: 2, breakers: groupedBreakers[630] });
  }
  
  if (groupedBreakers[400]) {
    availableOptions.push({ current: 400, count: 4, breakers: groupedBreakers[400] });
  }
  
  if (groupedBreakers[250]) {
    availableOptions.push({ current: 250, count: 4, breakers: groupedBreakers[250] });
  }
  
  if (groupedBreakers[160]) {
    availableOptions.push({ current: 160, count: 4, breakers: groupedBreakers[160] });
  }
  
  if (groupedBreakers[100]) {
    availableOptions.push({ current: 100, count: 6, breakers: groupedBreakers[100] });
  }
  
  if (groupedBreakers[80]) {
    availableOptions.push({ current: 80, count: 6, breakers: groupedBreakers[80] });
  }
  
  if (groupedBreakers[63]) {
    availableOptions.push({ current: 63, count: 6, breakers: groupedBreakers[63] });
  }

  return (
    <div className="p-3 bg-green-50 rounded border">
      <h5 className="text-sm font-medium text-green-800 mb-2">Логика для Литого корпуса:</h5>
      <div className="text-xs text-green-700 space-y-1">
        <p>• Компактная конструкция</p>
        <p>• Номинальный ток: до 1600А</p>
        <p>• Встроенная защита</p>
        <p>• Подходит для большинства применений</p>
      </div>
      
      <div className="mt-3">
        <label className="text-xs font-medium text-green-800 block mb-2">
          Выберите конфигурацию автоматов:
        </label>
        <select
          value={cell.breaker || ''}
          onChange={(e) => cell.update('breaker', e.target.value)}
          className="w-full border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Выберите конфигурацию</option>
          {availableOptions.map((option) => (
            <option key={`${option.current}A-${option.count}шт`} value={`${option.current}A-${option.count}шт`}>
              {option.current}А - {option.count} шт
            </option>
          ))}
        </select>
        
        {availableOptions.length > 0 && (
          <div className="mt-2 text-xs text-green-600">
            <p className="font-medium">Доступные варианты:</p>
            <ul className="mt-1 space-y-1">
              {availableOptions.map((option) => (
                <li key={`${option.current}A-${option.count}шт`}>
                  • {option.current}А - {option.count} шт
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {availableOptions.length === 0 && (
          <p className="text-xs text-red-600 mt-1">Нет доступных автоматов до 1600А</p>
        )}
      </div>
    </div>
  );
} 