import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import { useEffect } from 'react';
import RpsRubilnikSelector from '../selectors/RpsRubilnikSelector';
import MoldedCaseWithRubilnikSelector from '../selectors/MoldedCaseWithRubilnikSelector';
import { Select } from '@/components/ui/select';

interface CellParametersProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
  breakerOptions: string[];
  meterOptions: string[];
  meterMaterialsLoading: boolean;
  categoryMaterials: Material[];
  rpsLeftMaterials?: Material[];
  additionalRpsMaterials?: Material[];
  avtomatLityMaterials?: Material[];
  additionalMoldedCaseMaterials?: Material[];
  /** РПС 630А доступен только на схеме 4 (Панель ЩО 70-04) */
  allowRps630?: boolean;
}

export default function CellParameters({ 
  cell, 
  breakerOptions, 
  meterOptions, 
  meterMaterialsLoading,
  categoryMaterials,
  rpsLeftMaterials = [],
  additionalRpsMaterials = [],
  avtomatLityMaterials = [],
  additionalMoldedCaseMaterials = [],
  allowRps630 = false
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

  // Проверяем, выбрано ли 6 автоматов для "Литой корпус" или "Литой корпус + Рубильник"
  const isMoldedCase = cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник';
  const selectedAutomatonsCount = cell.rubilniki?.filter(r => r && r.trim() !== '').length || 0;
  const isMeterDisabled = isMoldedCase && selectedAutomatonsCount === 6;

  // Очищаем ПУ, если выбрано 6 автоматов
  useEffect(() => {
    if (isMeterDisabled && cell.meterType) {
      cell.update('meterType', '');
    }
  }, [isMeterDisabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderSelectBlock = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[],
    isLoading: boolean = false
  ) => (
    <div className="flex min-w-[160px] flex-col gap-1.5">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
        disabled={isLoading}
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Select>
    </div>
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-900">Параметры ячейки</h4>
        <button
          type="button"
          onClick={cell.remove}
          className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          title="Удалить ячейку"
        >
          x
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {/* Показываем поле "Автомат выкатной" только если не выбран РПС, Литой корпус или Литой корпус + Рубильник */}
        {cell.switchingDevice !== 'РПС' && 
         cell.switchingDevice !== 'Литой корпус' && 
         cell.switchingDevice !== 'Литой корпус + Рубильник' && (
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
          meterMaterialsLoading || isMeterDisabled
        )}

        {/* Показываем селектор рубильников только если выбран РПС */}
        {cell.switchingDevice === 'РПС' && (
          <RpsRubilnikSelector
            cell={cell}
            rpsLeftMaterials={rpsLeftMaterials}
            additionalRpsMaterials={additionalRpsMaterials}
            allowRps630={allowRps630}
          />
        )}

        {/* Показываем селектор рубильников для "Литой корпус" и "Литой корпус + Рубильник" */}
        {(cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник') && (
          <MoldedCaseWithRubilnikSelector 
            cell={cell} 
            avtomatLityMaterials={avtomatLityMaterials}
            additionalMoldedCaseMaterials={additionalMoldedCaseMaterials}
          />
        )}

        <div className="flex min-w-[120px] flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Кол-во</span>
          <input
            type="number"
            min={1}
            value={cell.quantity || 1}
            onChange={(e) => cell.update('quantity', Number(e.target.value))}
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
          />
        </div>
      </div>
    </div>
  );
} 