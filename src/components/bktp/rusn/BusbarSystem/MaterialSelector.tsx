import React from 'react';
import { BusMaterial } from '@/types/rusn';

interface MaterialSelectorProps {
  selectedMaterial: BusMaterial | null;
  onMaterialChange: (material: BusMaterial) => void;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterial,
  onMaterialChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">Материал шины:</label>
      <div className="flex space-x-4">
        <button
          onClick={() => onMaterialChange('АД')}
          className={`flex-1 px-4 py-3 rounded-md border transition-all duration-200 ${
            selectedMaterial === 'АД'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full border ${
                selectedMaterial === 'АД' ? 'bg-white border-white' : 'bg-gray-300 border-gray-300'
              }`}
            ></div>
            <span className="font-medium">Алюминий </span>
          </div>
        </button>
        <button
          onClick={() => onMaterialChange('МТ')}
          className={`flex-1 px-4 py-3 rounded-md border transition-all duration-200 ${
            selectedMaterial === 'МТ'
              ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full border ${
                selectedMaterial === 'МТ' ? 'bg-white border-white' : 'bg-gray-300 border-gray-300'
              }`}
            ></div>
            <span className="font-medium">Медь</span>
          </div>
        </button>
      </div>
    </div>
  );
};
