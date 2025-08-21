import React from 'react';
import { BusMaterial } from '@/store/useRunnStore';

interface MaterialSelectorProps {
  selectedMaterial: BusMaterial | null;
  onMaterialChange: (material: BusMaterial) => void;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialChange,
}) => {
  const materials: { value: BusMaterial; label: string }[] = [
    { value: 'АД', label: 'АД (Алюминий)' },
    { value: 'АД2', label: 'АД2 (Алюминий улучшенный)' },
    { value: 'МТ', label: 'МТ (Медь)' },
    { value: 'МТ2', label: 'МТ2 (Медь улучшенная)' },
  ];

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Материал шинного моста</h4>
      <div className="grid grid-cols-2 gap-3">
        {materials.map((material) => (
          <label
            key={material.value}
            className={`
              flex items-center p-3 border rounded cursor-pointer transition-colors
              ${
                selectedMaterial === material.value
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input
              type="radio"
              name="busBridgeMaterial"
              value={material.value}
              checked={selectedMaterial === material.value}
              onChange={() => onMaterialChange(material.value)}
              className="mr-2"
            />
            <span className="text-sm font-medium">{material.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

