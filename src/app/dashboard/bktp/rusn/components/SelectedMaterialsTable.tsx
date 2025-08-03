import { RusnCell as RusnCellType } from '@/store/useRusnStore';
import { RusnMaterials, getMaterialById } from '@/utils/rusnMaterials';

interface SelectedMaterialsTableProps {
  cell: RusnCellType;
  materials: RusnMaterials;
  showBreaker?: boolean;
  showRza?: boolean;
  showTransformerCurrent?: boolean;
  showPu?: boolean;
  showDisconnector?: boolean;
  showTsn?: boolean;
  showTn?: boolean;
}

export default function SelectedMaterialsTable({
  cell,
  materials,
  showBreaker,
  showRza,
  showTransformerCurrent,
  showPu,
  showDisconnector,
  showTsn,
  showTn,
}: SelectedMaterialsTableProps) {
  const selectedMaterialsList: Array<{
    name: string;
    price: number;
    unit: string;
    quantity: number;
  }> = [];

  if (showBreaker && cell.breaker) {
    const material = getMaterialById(materials, 'breaker', cell.breaker.id);
    if (material) {
      selectedMaterialsList.push({
        name: material.name,
        price: Number(material.price),
        unit: 'шт',
        quantity: 1,
      });
    }
  }

  if (showRza && cell.rza) {
    const material = getMaterialById(materials, 'rza', cell.rza.id);
    if (material) {
      selectedMaterialsList.push({
        name: material.name,
        price: Number(material.price),
        unit: 'шт',
        quantity: 1,
      });
    }
  }

  if (showTransformerCurrent && cell.transformerCurrent) {
    const material = getMaterialById(materials, 'tt', cell.transformerCurrent.id);
    if (material) {
      // Трансформатор тока умножается на 3 для всех ячеек
      const quantity = 3;
      selectedMaterialsList.push({
        name: material.name,
        price: Number(material.price),
        unit: 'шт',
        quantity: quantity,
      });
    }
  }

  if (showPu && cell.meterType) {
    const material = getMaterialById(materials, 'meter', cell.meterType.id);
    if (material) {
      selectedMaterialsList.push({
        name: material.name,
        price: Number(material.price),
        unit: 'шт',
        quantity: 1,
      });
    }
  }

  if (showDisconnector && cell.breaker && cell.purpose === 'Секционный разьединитель') {
    const material = getMaterialById(materials, 'sr', cell.breaker.id);
    if (material) {
      selectedMaterialsList.push({
        name: material.name,
        price: Number(material.price),
        unit: 'шт',
        quantity: 1,
      });
    }
  }

  if (showTsn && cell.transformerPower) {
    const material = getMaterialById(materials, 'tsn', cell.transformerPower.id);
    if (material) {
      selectedMaterialsList.push({
        name: material.name,
        price: Number(material.price),
        unit: 'шт',
        quantity: 1,
      });
    }
  }

  if (showTn && cell.transformerVoltage) {
    const material = getMaterialById(materials, 'tn', cell.transformerVoltage.id);
    if (material) {
      selectedMaterialsList.push({
        name: material.name,
        price: Number(material.price),
        unit: 'шт',
        quantity: 1,
      });
    }
  }

  if (selectedMaterialsList.length === 0) {
    return null;
  }

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Выбранные материалы</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                Наименование
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ед.</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Цена</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Кол-во</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {selectedMaterialsList.map((material, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm text-gray-900">{material.name}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{material.unit}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                  {material.price.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₸
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right">{material.quantity}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                  {(material.price * material.quantity).toLocaleString('ru-RU', {
                    maximumFractionDigits: 2,
                  })}{' '}
                  ₸
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
