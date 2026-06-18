import React from 'react';
import { BusMaterial } from '@/types/rusn';
import { BusMaterialToggle } from '@/components/shared/busUi';

interface MaterialSelectorProps {
  selectedMaterial: BusMaterial | null;
  onMaterialChange: (material: BusMaterial) => void;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialChange,
}) => {
  return (
    <BusMaterialToggle
      value={selectedMaterial}
      options={[
        { id: 'АД', label: 'Алюминий', hint: 'Группы АД, АД2, АД3' },
        { id: 'МТ', label: 'Медь', hint: 'Группы МТ, МТ2, МТ3' },
      ]}
      onChange={(id) => onMaterialChange(id as BusMaterial)}
    />
  );
};
