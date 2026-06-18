import { Material } from '@/api/material';
import { RusnCell } from '@/store/useRusnStore';
import { getMaterialArrayForField, RusnMaterials } from '@/utils/rusnMaterials';
import { CellFormField, inputClassName } from '@/components/bktp/shared/CellFormField';
import { Select } from '@/components/ui/select';

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
  const selectedMaterial = materialList.find((m) => m.id.toString() === selectedId);

  return (
    <CellFormField label={label}>
      <Select
        className={inputClassName}
        value={selectedId || ''}
        title={selectedMaterial?.name}
        onChange={(e) => {
          if (!e.target.value) {
            onUpdate(cell.id, field, undefined);
            if (
              cell.purpose === 'Секционный разьединитель' &&
              (cell.cellType === 'Камера КСО 366-13' ||
                cell.cellType === 'Камера КСО 366 ШМР 14, 15')
            ) {
              onUpdate(cell.id, 'cellType', '');
              onUpdate(cell.id, 'totalPrice', 0);
            }
          } else {
            const material = materialList.find((m) => m.id.toString() === e.target.value);
            if (material) {
              onUpdate(cell.id, field, {
                id: material.id.toString(),
                name: material.name,
                price: Number(material.price),
              });
            }
          }
        }}
      >
        <option value="">— Не выбрано —</option>
        {materialList.map((material) => (
          <option key={material.id} value={material.id.toString()} title={material.name}>
            {material.name}
          </option>
        ))}
      </Select>
      {selectedMaterial && (
        <p className="mt-1 text-[10px] text-gray-500 line-clamp-2" title={selectedMaterial.name}>
          {selectedMaterial.name}
        </p>
      )}
    </CellFormField>
  );
}
