import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface SimplifiedRpsSelectorProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number | string[]) => void; remove: () => void; };
  rpsLeftMaterials: Material[];
}

export default function SimplifiedRpsSelector({ cell, rpsLeftMaterials }: SimplifiedRpsSelectorProps) {
  // Функция для извлечения тока из названия материала
  const extractCurrentFromName = (name: string): number | null => {
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

  // Функция для добавления нового рубильника
  const addRubilnik = () => {
    const currentRubilniki = cell.rubilniki || [];
    const newRubilniki = [...currentRubilniki, ''];
    cell.update('rubilniki', newRubilniki);
  };

  // Функция для удаления рубильника
  const removeRubilnik = (index: number) => {
    const currentRubilniki = cell.rubilniki || [];
    const newRubilniki = currentRubilniki.filter((_, i) => i !== index);
    cell.update('rubilniki', newRubilniki);
  };

  const selectedRubilniki = cell.rubilniki || [];

  // Создаем опции из реальных материалов категории "РПС левый"
  const rpsOptions = rpsLeftMaterials.map(material => material.name);

  return (
    <div className="flex flex-col gap-4 min-w-[400px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#3A55DF]">Рубильники РПС</span>
        <button
          onClick={addRubilnik}
          className="px-3 py-1 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-xs font-medium"
        >
          + Добавить
        </button>
      </div>
      
      <div className="space-y-3">
        {selectedRubilniki.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            Нет выбранных рубильников. Нажмите "Добавить" для добавления.
          </div>
        ) : (
          selectedRubilniki.map((rubilnik, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-xs text-gray-500">Рубильник {index + 1}</span>
                <select
                  value={rubilnik || ''}
                  onChange={(e) => updateRubilnik(index, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
                >
                  <option value="">Выберите рубильник</option>
                  {rpsOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeRubilnik(index)}
                className="text-red-600 hover:text-red-800 text-sm font-bold px-2 py-1"
                title="Удалить рубильник"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {rpsLeftMaterials.length === 0 && (
        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-xs text-yellow-800">
            ⚠️ Нет доступных материалов в категории "РПС левый". 
            Проверьте настройки категорий.
          </p>
        </div>
      )}
      
      {selectedRubilniki.length > 0 && (
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <h6 className="text-xs font-medium text-blue-800 mb-1">Выбранные рубильники:</h6>
          <div className="text-xs text-blue-700 space-y-1">
            {selectedRubilniki.map((rubilnik, index) => {
              if (!rubilnik) return null;
              const current = extractCurrentFromName(rubilnik);
              return (
                <div key={index} className="flex justify-between">
                  <span>Рубильник {index + 1}:</span>
                  <span className="font-medium">
                    {current ? `${current}А` : rubilnik}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

