import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import { Select } from '@/components/ui/select';

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
    <div className="min-w-[420px] flex-1 rounded-xl border border-[#8eba1e]/20 bg-[#8eba1e]/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Рубильники</span>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#5f7f14]">
          4 позиции
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Левые рубильники (1 и 2) */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Левые</span>
          
          {/* Рубильник 1 */}
          <div key="rubilnik-container-1" className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Рубильник 1</span>
            <Select
              key="rubilnik-1"
              value={selectedRubilniki[0] || ''}
              onChange={(e) => updateRubilnik(0, e.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
            >
              <option value="">—</option>
              {options1.map((opt, index) => (
                <option key={`rub1-${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </Select>
          </div>

          {/* Рубильник 2 */}
          <div key="rubilnik-container-2" className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Рубильник 2</span>
            <Select
              key="rubilnik-2"
              value={selectedRubilniki[1] || ''}
              onChange={(e) => updateRubilnik(1, e.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
            >
              <option value="">—</option>
              {options2.map((opt, index) => (
                <option key={`rub2-${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Правые рубильники (3 и 4) */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Правые</span>
          
          {/* Рубильник 3 */}
          <div key="rubilnik-container-3" className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Рубильник 3</span>
            <Select
              key="rubilnik-3"
              value={selectedRubilniki[2] || ''}
              onChange={(e) => updateRubilnik(2, e.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
            >
              <option value="">—</option>
              {options3.map((opt, index) => (
                <option key={`rub3-${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </Select>
          </div>

          {/* Рубильник 4 */}
          <div key="rubilnik-container-4" className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Рубильник 4</span>
            <Select
              key="rubilnik-4"
              value={selectedRubilniki[3] || ''}
              onChange={(e) => updateRubilnik(3, e.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
            >
              <option value="">—</option>
              {options4.map((opt, index) => (
                <option key={`rub4-${opt}-${index}`} value={opt}>{opt}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
} 