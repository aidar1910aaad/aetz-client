import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface AirSwitchingDeviceLogicProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number) => void; remove: () => void; };
  categoryMaterials: Material[];
}

export default function AirSwitchingDeviceLogic({ 
  cell, 
  categoryMaterials 
}: AirSwitchingDeviceLogicProps) {
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

  const airBreakers = categoryMaterials.filter(material => {
    const current = extractCurrentFromName(material.name);
    return current !== null && current >= 630 && current <= 6300;
  });

  return (
    <div className="p-3 bg-blue-50 rounded border">
      <h5 className="text-sm font-medium text-blue-800 mb-2">Логика для Воздушного аппарата:</h5>
      <div className="text-xs text-blue-700 space-y-1">
        <p>• Используется для воздушных линий</p>
        <p>• Номинальный ток: 630А-6300А</p>
        <p>• Напряжение: 0.4кВ</p>
        <p>• Требуется дополнительная защита</p>
      </div>
      
      <div className="mt-3">
        <label className="text-xs font-medium text-blue-800 block mb-2">
          Выберите выкатной автомат (630А-6300А):
        </label>
        <select
          value={cell.breaker || ''}
          onChange={(e) => cell.update('breaker', e.target.value)}
          className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Выберите автомат</option>
          {airBreakers.map((breaker) => (
            <option key={breaker.id} value={breaker.name}>{breaker.name}</option>
          ))}
        </select>
        {airBreakers.length === 0 && (
          <p className="text-xs text-red-600 mt-1">Нет доступных автоматов в диапазоне 630А-6300А</p>
        )}
      </div>
    </div>
  );
} 