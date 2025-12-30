import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface RpsRubilnikSelectorProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
  rpsLeftMaterials?: Material[];
  additionalRpsMaterials?: Material[];
}

export default function RpsRubilnikSelector({ cell, rpsLeftMaterials = [], additionalRpsMaterials = [] }: RpsRubilnikSelectorProps) {
  // Объединяем материалы из категории "РПС левый" и дополнительные материалы из калькуляции, убираем дубликаты
  const allMaterials = [...rpsLeftMaterials, ...additionalRpsMaterials];
  
  // Убираем дубликаты по названию
  const uniqueMaterials = allMaterials.filter((material, index, self) => 
    index === self.findIndex(m => m.name === material.name)
  );
  
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
    
    
    // Используем реальные материалы или статичный список
    const allOptions = uniqueMaterials.length > 0 
      ? uniqueMaterials.map(material => material.name)
      : ['Рубильник 630А', 'Рубильник 400А', 'Рубильник 250А', 'Рубильник 100А'];
    
    const selectedRubilniki = cell.rubilniki || [];
    
    // Фильтруем только валидные значения
    const validSelectedRubilniki = selectedRubilniki.filter(rubilnik => 
      rubilnik && typeof rubilnik === 'string'
    );
    
    // Получаем текущее значение для этого селекта
    const currentValue = selectedRubilniki[rubilnikIndex];
    
    
    // Всегда показываем все доступные опции для редактирования
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
    
    // Обеспечиваем, что массив имеет достаточную длину
    while (newRubilniki.length <= index) {
      newRubilniki.push('');
    }
    
    if (value === '') {
      // Устанавливаем пустое значение вместо удаления, чтобы сохранить индексы
      newRubilniki[index] = '';
    } else {
      // Обновляем рубильник
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

  return (
    <div className="flex flex-col gap-4 min-w-[400px]">
      <span className="text-xs font-medium text-[#3A55DF]">Рубильники</span>
      
      <div className="flex gap-4">
        {/* Левые рубильники (1 и 2) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-600">Левые</span>
          
          {/* Рубильник 1 */}
          <div key="rubilnik-container-1" className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 1</span>
            <select
              key="rubilnik-1"
              value={selectedRubilniki[0] || ''}
              onChange={(e) => updateRubilnik(0, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options1.map((opt, index) => (
                <option key={`rub1-${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Рубильник 2 */}
          <div key="rubilnik-container-2" className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 2</span>
            <select
              key="rubilnik-2"
              value={selectedRubilniki[1] || ''}
              onChange={(e) => updateRubilnik(1, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options2.map((opt, index) => (
                <option key={`rub2-${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Правые рубильники (3 и 4) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-600">Правые</span>
          
          {/* Рубильник 3 */}
          <div key="rubilnik-container-3" className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 3</span>
            <select
              key="rubilnik-3"
              value={selectedRubilniki[2] || ''}
              onChange={(e) => updateRubilnik(2, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options3.map((opt, index) => (
                <option key={`rub3-${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Рубильник 4 */}
          <div key="rubilnik-container-4" className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Рубильник 4</span>
            <select
              key="rubilnik-4"
              value={selectedRubilniki[3] || ''}
              onChange={(e) => updateRubilnik(3, e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="">—</option>
              {options4.map((opt, index) => (
                <option key={`rub4-${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 