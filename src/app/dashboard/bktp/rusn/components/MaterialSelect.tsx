import { Material } from '@/api/material';
import { RusnCell } from '@/store/useRusnStore';
import { getMaterialArrayForField } from '@/utils/rusnMaterials';
import { RusnMaterials } from '@/utils/rusnMaterials';

interface MaterialSelectProps {
  field: keyof RusnCell;
  label: string;
  materials: RusnMaterials;
  cell: RusnCell;
  selectedId: string | undefined;
  onUpdate: (id: string, field: keyof RusnCell, value: RusnCell[keyof RusnCell]) => void;
}

export default function MaterialSelect({
  field,
  label,
  materials,
  cell,
  selectedId,
  onUpdate,
}: MaterialSelectProps) {
  const materialList = getMaterialArrayForField(materials, field, cell.purpose);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        value={selectedId || ''}
        onChange={(e) => {
          const material = materialList.find((m) => m.id.toString() === e.target.value);
          if (material) {
            onUpdate(cell.id, field, {
              id: material.id.toString(),
              name: material.name,
              price: Number(material.price),
            });
          }
        }}
      >
        <option value="">Выберите {label.toLowerCase()}</option>
        {materialList.map((material) => (
          <option key={material.id} value={material.id}>
            {material.name}
          </option>
        ))}
      </select>
    </div>
  );
}
