import { RunnCell } from '@/store/useRunnStore';

interface MoldedCaseWithRubilnikSelectorProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
}

export default function MoldedCaseWithRubilnikSelector({ cell }: MoldedCaseWithRubilnikSelectorProps) {
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
    const allOptions = ['Рубильник 1000А', 'Рубильник 630А', 'Рубильник 400А', 'Рубильник 250А', 'Рубильник 160А', 'Рубильник 100А', 'Рубильник 80А', 'Рубильник 63А'];
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

    // Проверяем, есть ли уже рубильник 1000А
    const has1000A = validSelectedRubilniki.some(rubilnik => 
      extractCurrentFromName(rubilnik) === 1000
    );
    
    // Если есть рубильник 1000А, то остальные рубильники недоступны
    if (has1000A) {
      // Возвращаем только текущее значение, если оно есть
      if (currentValue) {
        return [currentValue];
      }
      return [];
    }

    // Проверяем, есть ли уже рубильник 630А
    const has630A = validSelectedRubilniki.some(rubilnik => 
      extractCurrentFromName(rubilnik) === 630
    );

    // Проверяем, есть ли уже рубильник 400А
    const has400A = validSelectedRubilniki.some(rubilnik => 
      extractCurrentFromName(rubilnik) === 400
    );

    // Проверяем, есть ли уже рубильник 250А
    const has250A = validSelectedRubilniki.some(rubilnik => 
      extractCurrentFromName(rubilnik) === 250
    );

    // Проверяем, есть ли уже рубильник 160А
    const has160A = validSelectedRubilniki.some(rubilnik => 
      extractCurrentFromName(rubilnik) === 160
    );
    
    // Если есть рубильник 630А и уже выбрано 2 рубильника, то остальные рубильники недоступны
    if (has630A && validSelectedRubilniki.length >= 2) {
      // Возвращаем только текущее значение, если оно есть
      if (currentValue) {
        return [currentValue];
      }
      return [];
    }

    // Если есть рубильник 400А и уже выбрано 2 рубильника, то остальные рубильники недоступны
    if (has400A && validSelectedRubilniki.length >= 2) {
      // Возвращаем только текущее значение, если оно есть
      if (currentValue) {
        return [currentValue];
      }
      return [];
    }

    // Если есть рубильник 250А и уже выбрано 2 рубильника, то остальные рубильники недоступны
    if (has250A && validSelectedRubilniki.length >= 2) {
      // Возвращаем только текущее значение, если оно есть
      if (currentValue) {
        return [currentValue];
      }
      return [];
    }

    // Если есть рубильник 160А и уже выбрано 2 рубильника, то остальные рубильники недоступны
    if (has160A && validSelectedRubilniki.length >= 2) {
      // Возвращаем только текущее значение, если оно есть
      if (currentValue) {
        return [currentValue];
      }
      return [];
    }

    // Если есть рубильник 630А и выбран только один рубильник, то для второго доступны только от 630А до 63А
    if (has630A && validSelectedRubilniki.length === 1) {
      let options = ['Рубильник 630А', 'Рубильник 400А', 'Рубильник 250А', 'Рубильник 160А', 'Рубильник 100А', 'Рубильник 80А', 'Рубильник 63А'];
      // Добавляем текущее значение, если оно есть и не в списке
      if (currentValue && !options.includes(currentValue)) {
        options.push(currentValue);
      }
      return options;
    }

    // Если есть рубильник 400А и выбран только один рубильник, то для второго доступны только от 400А до 63А
    if (has400A && validSelectedRubilniki.length === 1) {
      let options = ['Рубильник 630А', 'Рубильник 400А', 'Рубильник 250А', 'Рубильник 160А', 'Рубильник 100А', 'Рубильник 80А', 'Рубильник 63А'];
      // Добавляем текущее значение, если оно есть и не в списке
      if (currentValue && !options.includes(currentValue)) {
        options.push(currentValue);
      }
      return options;
    }

    // Если есть рубильник 250А и выбран только один рубильник, то для второго доступны только от 250А до 63А
    if (has250A && validSelectedRubilniki.length === 1) {
      let options = ['Рубильник 630А', 'Рубильник 400А', 'Рубильник 250А', 'Рубильник 160А', 'Рубильник 100А', 'Рубильник 80А', 'Рубильник 63А'];
      // Добавляем текущее значение, если оно есть и не в списке
      if (currentValue && !options.includes(currentValue)) {
        options.push(currentValue);
      }
      return options;
    }

    // Если есть рубильник 160А и выбран только один рубильник, то для второго доступны только от 160А до 63А
    if (has160A && validSelectedRubilniki.length === 1) {
      let options = ['Рубильник 630А', 'Рубильник 400А', 'Рубильник 250А', 'Рубильник 160А', 'Рубильник 100А', 'Рубильник 80А', 'Рубильник 63А'];
      // Добавляем текущее значение, если оно есть и не в списке
      if (currentValue && !options.includes(currentValue)) {
        options.push(currentValue);
      }
      return options;
    }

    // Максимум 6 рубильников
    if (validSelectedRubilniki.length >= 6) {
      // Возвращаем только текущее значение, если оно есть
      if (currentValue) {
        return [currentValue];
      }
      return [];
    }

    // Логика на основе таблицы:
    // Строка 1-4 (0-3 рубильника): все доступны (63, 80, 100, 160, 250, 400, 630, 1000)
    // Строка 5-6 (4-5 рубильников): только 63, 80, 100 доступны

    if (validSelectedRubilniki.length >= 4) {
      // Строка 5-6: только 63А, 80А, 100А
      let options = ['Рубильник 100А', 'Рубильник 80А', 'Рубильник 63А'];
      // Добавляем текущее значение, если оно есть и не в списке
      if (currentValue && !options.includes(currentValue)) {
        options.push(currentValue);
      }
      return options;
    }

    // Строка 1-4: все доступны
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
  const options3 = getAvailableRubilnikOptions('left', 2);
  const options4 = getAvailableRubilnikOptions('right', 3);
  const options5 = getAvailableRubilnikOptions('right', 4);
  const options6 = getAvailableRubilnikOptions('right', 5);

  return (
    <div className="flex flex-col gap-4 min-w-[600px]">
      <span className="text-xs font-medium text-[#3A55DF]">Рубильники (Литой корпус + Рубильник)</span>
      
      <div className="flex gap-4">
        {/* Левые рубильники (1, 2, 3) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-600">Левые</span>
          
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
        </div>

        {/* Правые рубильники (4, 5, 6) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-600">Правые</span>
          
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

          {/* Рубильник 5 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 5</span>
            <select
              value={selectedRubilniki[4] || ''}
              onChange={(e) => updateRubilnik(4, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options5.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Рубильник 6 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 6</span>
            <select
              value={selectedRubilniki[5] || ''}
              onChange={(e) => updateRubilnik(5, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options6.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 