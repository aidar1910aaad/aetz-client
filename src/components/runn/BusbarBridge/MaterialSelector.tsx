import React from 'react';
import { BusMaterial } from '@/store/useRunnStore';
import { useTransformerStore } from '@/store/useTransformerStore';

interface MaterialSelectorProps {
  selectedMaterial: BusMaterial | null;
  onMaterialChange: (material: BusMaterial) => void;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialChange,
}) => {
  const { selectedTransformer } = useTransformerStore();

  const getMaterialLabel = (busbarsType: string) => {
    if (busbarsType === 'Алюминий') {
      return 'Алюминий (АД, АД2, АД3)';
    }
    if (busbarsType === 'Медь') {
      return 'Медь (МТ, МТ2, МТ3)';
    }
    return 'Не выбран';
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Материал шинного моста</h4>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="text-sm text-gray-600">
          <p><span className="font-medium">Тип материала:</span> {getMaterialLabel(selectedTransformer?.busbars || '')}</p>
          <p className="text-xs text-gray-500 mt-1">Выбирается автоматически на основе выбора в трансформаторе</p>
        </div>
      </div>
    </div>
  );
};

