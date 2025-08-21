import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface RpsRubilnikSelectorProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
  rpsLeftMaterials?: Material[];
}

export default function RpsRubilnikSelector({ cell, rpsLeftMaterials = [] }: RpsRubilnikSelectorProps) {

  // Функция для извлечения тока из названия материала
  const extractCurrentFromName = (name: string): number | null => {
    // Проверяем, что name существует и является строкой
    if (!name || typeof name !== 'string') {
      return null;
    }

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

  // Функция для получения доступных рубильников с ограничениями
  const getAvailableRubilnikOptions = (position: 'left' | 'right', rubilnikIndex: number) => {
    // Используем реальные материалы из категории "РПС левый"
    const allOptions = rpsLeftMaterials.map(material => material.name);
    const selectedRubilniki = cell.rubilniki || [];
    
    // Фильтруем только валидные значения
    const validSelectedRubilniki = selectedRubilniki.filter(rubilnik => 
      rubilnik && typeof rubilnik === 'string'
    );
    
    // Получаем текущее значение для этого селекта
    const currentValue = selectedRubilniki[rubilnikIndex];
    
    // Если нет выбранных рубильников, показываем все
    if (validSelectedRubilniki.length === 0) {
      return allOptions;
    }

    // Проверяем, есть ли уже рубильник 630А
    const has630A = validSelectedRubilniki.some(rubilnik => 
      extractCurrentFromName(rubilnik) === 630
    );
    
    // Если есть рубильник 630А и уже выбрано 2 рубильника, то остальные рубильники недоступны
    if (has630A && validSelectedRubilniki.length >= 2) {
      // Возвращаем только текущее значение, если оно есть
      if (currentValue) {
        return [currentValue];
      }
      return [];
    }

    // Если выбрано 2 или больше рубильников, то 630А не показываем
    if (validSelectedRubilniki.length >= 2) {
      let options = allOptions.filter(option => option !== 'Рубильник 630А');
      // Добавляем текущее значение, если оно есть и не в списке
      if (currentValue && !options.includes(currentValue)) {
        options.push(currentValue);
      }
      return options;
    }

    // В остальных случаях показываем все опции
    let options = [...allOptions];
    // Добавляем текущее значение, если оно есть и не в списке
    if (currentValue && !options.includes(currentValue)) {
      options.push(currentValue);
    }
    return options;
  };

  // Функция для обновления конкретного рубильника
  const updateRubilnik = (index: number, value: string) => {
    const currentRubilniki = cell.rubilniki || [];
    let newRubilniki = [...currentRubilniki];
    
    if (value === '') {
      // Удаляем рубильник если выбрано пустое значение
      newRubilniki.splice(index, 1);
    } else {
      // Обновляем или добавляем рубильник
      newRubilniki[index] = value;
    }
    
    cell.update('rubilniki', newRubilniki);
  };

  const selectedRubilniki = cell.rubilniki || [];

  // Получаем опции для каждого рубильника
  const options1 = getAvailableRubilnikOptions('left', 0);
  const options2 = getAvailableRubilnikOptions('left', 1);
  const options3 = getAvailableRubilnikOptions('right', 2);
  const options4 = getAvailableRubilnikOptions('right', 3);

  // Если нет материалов, показываем сообщение
  if (rpsLeftMaterials.length === 0) {
    return (
      <div className="flex flex-col gap-4 min-w-[400px]">
        <span className="text-xs font-medium text-[#3A55DF]">Рубильники</span>
        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-xs text-yellow-800">
            ⚠️ Нет доступных материалов в категории "РПС левый". 
            Проверьте консоль для подробностей о поиске категории.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-w-[400px]">
      <span className="text-xs font-medium text-[#3A55DF]">Рубильники</span>
      
      <div className="flex gap-4">
        {/* Рубильники (1 и 2) */}
        <div className="flex flex-col gap-2">
          
          {/* Рубильник 1 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 1</span>
            <select
              value={selectedRubilniki[0] || ''}
              onChange={(e) => updateRubilnik(0, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options1.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Рубильник 2 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 2</span>
            <select
              value={selectedRubilniki[1] || ''}
              onChange={(e) => updateRubilnik(1, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options2.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Рубильники (3 и 4) */}
        <div className="flex flex-col gap-2">
          
          {/* Рубильник 3 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 3</span>
            <select
              value={selectedRubilniki[2] || ''}
              onChange={(e) => updateRubilnik(2, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options3.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Рубильник 4 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 4</span>
            <select
              value={selectedRubilniki[3] || ''}
              onChange={(e) => updateRubilnik(3, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options4.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 