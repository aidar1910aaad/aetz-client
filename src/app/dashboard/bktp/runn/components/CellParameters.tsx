import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import RpsRubilnikSelector from './RpsRubilnikSelector';
import MoldedCaseWithRubilnikSelector from './MoldedCaseWithRubilnikSelector';

interface CellParametersProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
  breakerOptions: string[];
  meterOptions: string[];
  meterMaterialsLoading: boolean;
  categoryMaterials: Material[];
}

export default function CellParameters({ 
  cell, 
  breakerOptions, 
  meterOptions, 
  meterMaterialsLoading,
  categoryMaterials
}: CellParametersProps) {
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

  // Функция для получения конфигураций автоматов
  const getBreakerConfigurations = (maxCurrent: number = 1600) => {
    const moldedCaseBreakers = categoryMaterials.filter(material => {
      const current = extractCurrentFromName(material.name);
      return current !== null && current <= maxCurrent;
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
      availableOptions.push(`1000А - 1 шт`);
    }
    
    if (groupedBreakers[630]) {
      availableOptions.push(`630А - 2 шт`);
    }
    
    if (groupedBreakers[400]) {
      availableOptions.push(`400А - 4 шт`);
    }
    
    if (groupedBreakers[250]) {
      availableOptions.push(`250А - 4 шт`);
    }
    
    if (groupedBreakers[160]) {
      availableOptions.push(`160А - 4 шт`);
    }
    
    if (groupedBreakers[100]) {
      availableOptions.push(`100А - 4 шт`);
    }
    
    if (groupedBreakers[80]) {
      availableOptions.push(`80А - 6 шт`);
    }
    
    if (groupedBreakers[63]) {
      availableOptions.push(`63А - 6 шт`);
    }

    return availableOptions;
  };

  // Фильтруем автоматы в зависимости от выбранного коммутационного аппарата
  const getFilteredBreakerOptions = () => {
    const switchingDevice = cell.switchingDevice;
    
    if (!switchingDevice) {
      return breakerOptions;
    }

    // Для Воздушного - только 630А-6300А
    if (switchingDevice === 'Воздушный') {
      return categoryMaterials
        .filter(material => {
          const current = extractCurrentFromName(material.name);
          return current !== null && current >= 630 && current <= 6300;
        })
        .map(material => material.name);
    }

    // Для Литого корпуса и Литого корпуса + Рубильник - показываем варианты конфигураций
    if (switchingDevice === 'Литой корпус' || switchingDevice === 'Литой корпус + Рубильник') {
      return getBreakerConfigurations(1600);
    }

    // Для РПС - не показываем поле "Автомат выкатной"
    if (switchingDevice === 'РПС') {
      return [];
    }

    return breakerOptions;
  };

  const filteredBreakerOptions = getFilteredBreakerOptions();

  const renderSelectBlock = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[],
    isLoading: boolean = false
  ) => (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <span className="text-xs font-medium text-[#3A55DF]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
        disabled={isLoading}
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
      {/* Показываем поле "Автомат выкатной" только если не выбран РПС */}
      {cell.switchingDevice !== 'РПС' && (
        renderSelectBlock(
          'Автомат выкатной',
          cell.breaker,
          (val) => cell.update('breaker', val),
          filteredBreakerOptions
        )
      )}

      {renderSelectBlock(
        'ПУ',
        cell.meterType ?? '',
        (val) => cell.update('meterType', val),
        meterOptions,
        meterMaterialsLoading
      )}

      {/* Показываем селектор рубильников только если выбран РПС */}
      {cell.switchingDevice === 'РПС' && (
        <RpsRubilnikSelector cell={cell} />
      )}

      {/* Показываем селектор рубильников для "Литой корпус + Рубильник" */}
      {cell.switchingDevice === 'Литой корпус + Рубильник' && (
        <MoldedCaseWithRubilnikSelector cell={cell} />
      )}

      <div className="flex flex-col gap-1 min-w-[100px]">
        <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
        <input
          type="number"
          min={1}
          value={cell.quantity || 1}
          onChange={(e) => cell.update('quantity', Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
        />
      </div>

      <button
        onClick={cell.remove}
        className="text-red-600 hover:text-red-800 text-sm font-bold ml-auto"
        title="Удалить ячейку"
      >
        ✕
      </button>
    </div>
  );
} 