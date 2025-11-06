import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface MoldedCaseWithRubilnikSelectorProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
  avtomatLityMaterials?: Material[];
  additionalMoldedCaseMaterials?: Material[];
}

export default function MoldedCaseWithRubilnikSelector({ cell, avtomatLityMaterials = [], additionalMoldedCaseMaterials = [] }: MoldedCaseWithRubilnikSelectorProps) {
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

  // Функция для получения доступных автоматов с ограничениями
  const getAvailableRubilnikOptions = (position: 'left' | 'right', rubilnikIndex: number) => {
    
    // Используем материалы из глобальных настроек, если они есть
    let baseOptions = avtomatLityMaterials.length > 0 
      ? avtomatLityMaterials.map(material => material.name)
      : ['Автомат 1000А', 'Автомат 630А', 'Автомат 400А', 'Автомат 250А', 'Автомат 160А', 'Автомат 100А', 'Автомат 80А', 'Автомат 63А'];
    
    // Добавляем материалы из дополнительной калькуляции
    const additionalOptions = additionalMoldedCaseMaterials.map(material => material.name);
    
    const selectedRubilniki = cell.rubilniki || [];
    
    // Объединяем все опции
    const allOptions = [...baseOptions, ...additionalOptions];
    
    // Добавляем уже выбранные материалы в список опций, если их там нет
    selectedRubilniki.forEach(selected => {
      if (selected && typeof selected === 'string' && !allOptions.includes(selected)) {
        allOptions.push(selected);
      }
    });
    
    // Убираем дублирующиеся значения
    const uniqueOptions = [...new Set(allOptions)];
    
    // Отладочная информация
    if (process.env.NODE_ENV === 'development') {
    }
    
    // Фильтруем только валидные значения
    const validSelectedRubilniki = selectedRubilniki.filter(rubilnik => 
      rubilnik && typeof rubilnik === 'string'
    );
    
    // Получаем текущее значение для этого селекта
    const currentValue = selectedRubilniki[rubilnikIndex];
    
    // Упрощенная логика - всегда показываем все доступные опции для редактирования
    // Убираем сложные ограничения, чтобы пользователь мог свободно редактировать выбор

    // Максимум 6 рубильников - но все равно показываем все доступные опции для редактирования
    // if (validSelectedRubilniki.length >= 6) {
    //   // Возвращаем только текущее значение, если оно есть
    //   if (currentValue) {
    //     return [currentValue];
    //   }
    //   return [];
    // }

    // Упрощенная логика - всегда показываем все доступные опции
    let options = [...uniqueOptions];
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
      <span className="text-xs font-medium text-[#3A55DF]">
        Автоматы ({cell.switchingDevice === 'Литой корпус' ? 'Литой корпус' : 'Литой корпус + Рубильник'})
      </span>
      
      <div className="flex gap-4">
        {/* Левые автоматы (1, 2, 3) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-600">Левые</span>
          
          {/* Автомат 1 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Автомат 1</span>
            <select
              value={selectedRubilniki[0] || ''}
              onChange={(e) => updateRubilnik(0, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options1.map((opt, index) => (
                <option key={`${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Автомат 2 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Автомат 2</span>
            <select
              value={selectedRubilniki[1] || ''}
              onChange={(e) => updateRubilnik(1, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options2.map((opt, index) => (
                <option key={`${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Автомат 3 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Автомат 3</span>
            <select
              value={selectedRubilniki[2] || ''}
              onChange={(e) => updateRubilnik(2, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options3.map((opt, index) => (
                <option key={`${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Правые автоматы (4, 5, 6) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-600">Правые</span>
          
          {/* Автомат 4 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Автомат 4</span>
            <select
              value={selectedRubilniki[3] || ''}
              onChange={(e) => updateRubilnik(3, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options4.map((opt, index) => (
                <option key={`${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Автомат 5 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Автомат 5</span>
            <select
              value={selectedRubilniki[4] || ''}
              onChange={(e) => updateRubilnik(4, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options5.map((opt, index) => (
                <option key={`${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Автомат 6 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Автомат 6</span>
            <select
              value={selectedRubilniki[5] || ''}
              onChange={(e) => updateRubilnik(5, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options6.map((opt, index) => (
                <option key={`${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 