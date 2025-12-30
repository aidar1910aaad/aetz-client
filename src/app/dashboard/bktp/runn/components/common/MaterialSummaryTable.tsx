import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface MaterialSummaryTableProps {
  cell: RunnCell;
  categoryMaterials: Material[];
  meterMaterials: Material[];
  rpsLeftMaterials?: Material[];
}

export default function MaterialSummaryTable({ 
  cell, 
  categoryMaterials, 
  meterMaterials,
  rpsLeftMaterials = []
}: MaterialSummaryTableProps) {
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

  const selectedMaterials = [];

  // Добавляем коммутационный аппарат
  if (cell.switchingDevice) {
    selectedMaterials.push({
      name: cell.switchingDevice,
      price: 0,
      quantity: cell.quantity || 1,
      unit: 'шт',
      type: 'Коммутационный аппарат',
    });
  }

  // Добавляем автомат выкатной
  if (cell.breaker) {
    // Проверяем, является ли это значением РПС (например, "630А", "400А")
    const rpsCurrentMatch = cell.breaker.match(/^(\d+)А$/);
    
    if (rpsCurrentMatch && cell.switchingDevice === 'РПС') {
      // Для РПС показываем как отдельный материал
      selectedMaterials.push({
        name: `РПС ${cell.breaker}`,
        price: 0, // Цена не привязана к материалу
        quantity: cell.quantity || 1,
        unit: 'шт',
        type: 'РПС',
      });
    } else {
      // Проверяем, является ли это конфигурацией с количеством (например, "630А - 2 шт")
      const configMatch = cell.breaker.match(/^(\d+)А\s*-\s*(\d+)\s*шт$/);
      
      if (configMatch) {
        const current = parseInt(configMatch[1]);
        const count = parseInt(configMatch[2]);
        
        // Ищем подходящий автомат по току
        const breakerMaterial = categoryMaterials.find((m) => {
          const extractedCurrent = extractCurrentFromName(m.name);
          return extractedCurrent === current;
        });

        if (breakerMaterial) {
          selectedMaterials.push({
            name: `${breakerMaterial.name} (${current}А)`,
            price: typeof breakerMaterial.price === 'string' ? parseFloat(breakerMaterial.price) : breakerMaterial.price,
            quantity: count * (cell.quantity || 1),
            unit: breakerMaterial.unit,
            type: 'Автомат выкатной',
          });
        }
      } else {
        // Старый формат - просто название автомата
        const breakerMaterial = categoryMaterials.find((m) => m.name === cell.breaker);
        if (breakerMaterial) {
          selectedMaterials.push({
            name: cell.breaker,
            price: typeof breakerMaterial.price === 'string' ? parseFloat(breakerMaterial.price) : breakerMaterial.price,
            quantity: cell.quantity || 1,
            unit: breakerMaterial.unit,
            type: 'Автомат выкатной',
          });
        }
      }
    }
  }

  // Добавляем рубильники для РПС
  if (cell.rubilniki && cell.rubilniki.length > 0 && cell.switchingDevice === 'РПС') {
    cell.rubilniki.forEach((rubilnik, index) => {
      // Ищем материал по названию в rpsLeftMaterials
      const rubilnikMaterial = rpsLeftMaterials.find(material => material.name === rubilnik);
      
      selectedMaterials.push({
        name: `${rubilnik} (${index + 1})`,
        price: rubilnikMaterial ? 
          (typeof rubilnikMaterial.price === 'string' ? parseFloat(rubilnikMaterial.price) : rubilnikMaterial.price) : 0,
        quantity: cell.quantity || 1,
        unit: rubilnikMaterial?.unit || 'шт',
        type: 'Рубильник',
      });
    });
  }

  // Добавляем рубильники для "Литой корпус + Рубильник"
  if (cell.rubilniki && cell.rubilniki.length > 0 && cell.switchingDevice === 'Литой корпус + Рубильник') {
    cell.rubilniki.forEach((rubilnik, index) => {
      selectedMaterials.push({
        name: `${rubilnik} (${index + 1})`,
        price: 0, // Цена не привязана к материалу
        quantity: cell.quantity || 1,
        unit: 'шт',
        type: 'Рубильник',
      });
    });
  }

  // Добавляем ПУ
  if (cell.meterType) {
    const meterMaterial = meterMaterials.find((m) => m.name === cell.meterType);
    if (meterMaterial) {
      selectedMaterials.push({
        name: cell.meterType,
        price: typeof meterMaterial.price === 'string' ? parseFloat(meterMaterial.price) : meterMaterial.price,
        quantity: cell.quantity || 1,
        unit: meterMaterial.unit,
        type: 'ПУ',
      });
    }
  }

  if (selectedMaterials.length === 0) return null;

  const totalSum = selectedMaterials.reduce((sum, material) => sum + material.price * material.quantity, 0);

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded border">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Выбранные материалы:</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1 px-2">Тип</th>
              <th className="text-left py-1 px-2">Наименование</th>
              <th className="text-right py-1 px-2">Цена (₸)</th>
              <th className="text-center py-1 px-2">Кол-во</th>
              <th className="text-right py-1 px-2">Сумма (₸)</th>
            </tr>
          </thead>
          <tbody>
            {selectedMaterials.map((material, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-1 px-2 text-gray-600">{material.type}</td>
                <td className="py-1 px-2 font-medium">{material.name}</td>
                <td className="py-1 px-2 text-right">
                  {material.price > 0 ? material.price.toLocaleString() : '—'}
                </td>
                <td className="py-1 px-2 text-center">{material.quantity}</td>
                <td className="py-1 px-2 text-right font-medium">
                  {material.price > 0 ? (material.price * material.quantity).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-medium">
              <td colSpan={4} className="py-1 px-2 text-right">Итого:</td>
              <td className="py-1 px-2 text-right">{totalSum.toLocaleString()} ₸</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 