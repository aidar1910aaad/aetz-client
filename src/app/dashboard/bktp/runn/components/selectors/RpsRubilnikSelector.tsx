import { useEffect } from 'react';
import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import { Select } from '@/components/ui/select';

interface RpsRubilnikSelectorProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
  rpsLeftMaterials?: Material[];
  additionalRpsMaterials?: Material[];
  /** РПС 630А доступен только на схеме 4 (Панель ЩО 70-04) */
  allowRps630?: boolean;
}

const RPS_SLOT_COUNT = 4;

function extractCurrentFromName(name: string): number | null {
  if (!name || typeof name !== 'string') {
    return null;
  }

  const currentPatterns = [
    /(\d+)\s*A\s*$/i,
    /(\d+)\s*А\s*$/i,
    /(\d+)\s*A\s*,/i,
    /(\d+)\s*А\s*,/i,
    /(\d+)\s*а/i,
    /(\d+)\s*a/i,
    /(\d+)\s*ампер/i,
    /(\d+)\s*амп/i,
    /ток\s*(\d+)/i,
    /номинальный\s*ток\s*(\d+)/i,
    /iн\s*=\s*(\d+)/i,
    /i\s*=\s*(\d+)/i,
  ];

  for (const pattern of currentPatterns) {
    const match = name.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

function ensureFourSlots(rubilniki: string[] | undefined): string[] {
  return Array.from({ length: RPS_SLOT_COUNT }, (_, index) => rubilniki?.[index] || '');
}

export default function RpsRubilnikSelector({
  cell,
  rpsLeftMaterials = [],
  additionalRpsMaterials = [],
  allowRps630 = false,
}: RpsRubilnikSelectorProps) {
  // Базовый список — всегда из категории «РПС левый»; схема только дополняет пресетом
  const allMaterials = [...rpsLeftMaterials, ...additionalRpsMaterials];

  const uniqueMaterials = allMaterials.filter(
    (material, index, self) =>
      material?.name && self.findIndex((m) => m.name === material.name) === index
  );

  const availableMaterials = uniqueMaterials.filter((material) => {
    const current = extractCurrentFromName(material.name);
    if (current === 630) {
      return allowRps630;
    }
    return true;
  });

  const fallbackOptions = allowRps630
    ? ['Рубильник 630А', 'Рубильник 400А', 'Рубильник 250А', 'Рубильник 100А']
    : ['Рубильник 400А', 'Рубильник 250А', 'Рубильник 100А'];

  const getAvailableRubilnikOptions = (rubilnikIndex: number) => {
    const allOptions =
      availableMaterials.length > 0
        ? availableMaterials.map((material) => material.name)
        : fallbackOptions;

    const selectedRubilniki = ensureFourSlots(cell.rubilniki);
    const currentValue = selectedRubilniki[rubilnikIndex];

    const options = [...allOptions];

    // Текущее значение оставляем в списке (например, 630 после смены схемы), чтобы селект не «ломался»
    if (currentValue && !options.includes(currentValue)) {
      options.push(currentValue);
    }

    return options;
  };

  const updateRubilnik = (index: number, value: string) => {
    const newRubilniki = ensureFourSlots(cell.rubilniki);
    newRubilniki[index] = value;
    cell.update('rubilniki', newRubilniki);
  };

  // При ручном выборе режима РПС без схемы — сразу 4 пустых слота
  useEffect(() => {
    const current = cell.rubilniki;
    if (!current || current.length < RPS_SLOT_COUNT) {
      cell.update('rubilniki', ensureFourSlots(current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Если схема не 4 — сбрасываем выбранные 630А, чтобы нельзя было оставить недоступный номинал
  useEffect(() => {
    if (allowRps630) return;

    const current = ensureFourSlots(cell.rubilniki);
    const cleaned = current.map((rubilnik) =>
      rubilnik && extractCurrentFromName(rubilnik) === 630 ? '' : rubilnik
    );

    const changed = cleaned.some((value, index) => value !== current[index]);
    if (changed) {
      cell.update('rubilniki', cleaned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowRps630]);

  const selectedRubilniki = ensureFourSlots(cell.rubilniki);
  const options1 = getAvailableRubilnikOptions(0);
  const options2 = getAvailableRubilnikOptions(1);
  const options3 = getAvailableRubilnikOptions(2);
  const options4 = getAvailableRubilnikOptions(3);

  return (
    <div className="min-w-[420px] flex-1 rounded-xl border border-[#8eba1e]/20 bg-[#8eba1e]/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Рубильники</span>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#5f7f14]">
          4 позиции
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Левые
          </span>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Рубильник 1</span>
            <Select
              value={selectedRubilniki[0] || ''}
              onChange={(e) => updateRubilnik(0, e.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
            >
              <option value="">—</option>
              {options1.map((opt, index) => (
                <option key={`rub1-${opt}-${index}`} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Рубильник 2</span>
            <Select
              value={selectedRubilniki[1] || ''}
              onChange={(e) => updateRubilnik(1, e.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
            >
              <option value="">—</option>
              {options2.map((opt, index) => (
                <option key={`rub2-${opt}-${index}`} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Правые
          </span>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Рубильник 3</span>
            <Select
              value={selectedRubilniki[2] || ''}
              onChange={(e) => updateRubilnik(2, e.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
            >
              <option value="">—</option>
              {options3.map((opt, index) => (
                <option key={`rub3-${opt}-${index}`} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Рубильник 4</span>
            <Select
              value={selectedRubilniki[3] || ''}
              onChange={(e) => updateRubilnik(3, e.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
            >
              <option value="">—</option>
              {options4.map((opt, index) => (
                <option key={`rub4-${opt}-${index}`} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {!allowRps630 && (
        <p className="mt-3 text-xs text-gray-500">
          РПС 630А доступен только при схеме «Панель ЩО 70-04»
        </p>
      )}
    </div>
  );
}
