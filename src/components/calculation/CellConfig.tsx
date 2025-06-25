import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CellConfiguration, CellType, MaterialType } from '@/types/calculation';
import MaterialSearch from '@/app/dashboard/calc/[groupSlug]/[calcSlug]/components/MaterialSearch';

interface CellConfigProps {
  cellType: CellType;
  configuration: CellConfiguration;
  onConfigurationChange: (config: CellConfiguration) => void;
}

const CELL_TYPES: { value: CellType; label: string }[] = [
  { value: '10kv', label: '10 кВ' },
  { value: '20kv', label: '20 кВ' },
  { value: '0.4kv', label: '0.4 кВ' },
  { value: 'rza', label: 'РЗА' },
];

const CELL_MATERIALS: Record<CellType, { type: MaterialType; label: string }[]> = {
  '10kv': [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'rza', label: 'РЗА' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
    { type: 'tsn', label: 'ТСН' },
    { type: 'tn', label: 'ТН' },
  ],
  '20kv': [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'rza', label: 'РЗА' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
    { type: 'tsn', label: 'ТСН' },
    { type: 'tn', label: 'ТН' },
  ],
  '0.4kv': [
    { type: 'switch', label: 'Автоматический выключатель' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
  ],
  rza: [
    { type: 'rza', label: 'РЗА' },
    { type: 'sr', label: 'СР' },
  ],
};

export default function CellConfig({
  cellType,
  configuration,
  onConfigurationChange,
}: CellConfigProps) {
  const [selectedMaterialType, setSelectedMaterialType] = useState<MaterialType | null>(null);
  const [selectedCellType, setSelectedCellType] = useState<CellType>(cellType);

  // Initialize materials if they don't exist
  useEffect(() => {
    const initialMaterials = {
      switch: [],
      rza: [],
      counter: [],
      sr: [],
      tsn: [],
      tn: [],
    };

    if (!configuration.materials) {
      onConfigurationChange({
        ...configuration,
        materials: initialMaterials,
      });
    }
  }, []);

  useEffect(() => {
    const savedCellType = localStorage.getItem('selectedCellType') as CellType;
    if (savedCellType && CELL_TYPES.some((type) => type.value === savedCellType)) {
      setSelectedCellType(savedCellType);
      onConfigurationChange({
        ...configuration,
        type: savedCellType,
      });
    }
  }, []);

  const handleCellTypeChange = (type: CellType) => {
    setSelectedCellType(type);
    localStorage.setItem('selectedCellType', type);
    onConfigurationChange({
      ...configuration,
      type,
    });
  };

  const handleMaterialSelect = (material: { id: string; name: string; price: number }) => {
    if (!selectedMaterialType) return;

    console.log('Adding material:', material, 'to type:', selectedMaterialType);

    const updatedMaterials = [...(configuration.materials[selectedMaterialType] || [])];
    const index = updatedMaterials.findIndex((m) => m.id === material.id);

    if (index !== -1) {
      updatedMaterials[index] = {
        ...updatedMaterials[index],
        id: material.id,
        name: material.name,
        price: Number(material.price) || 0,
        type: selectedMaterialType,
      };
    } else {
      updatedMaterials.push({
        id: material.id,
        name: material.name,
        price: Number(material.price) || 0,
        type: selectedMaterialType,
      });
    }

    console.log('Updated materials:', updatedMaterials);

    onConfigurationChange({
      ...configuration,
      materials: {
        ...configuration.materials,
        [selectedMaterialType]: updatedMaterials,
      },
    });
    setSelectedMaterialType(null);
  };

  const removeMaterial = (materialType: MaterialType, materialId: string) => {
    console.log('Removing material:', materialId, 'from type:', materialType);

    const updatedMaterials = {
      ...configuration.materials,
      [materialType]: configuration.materials[materialType].filter((m) => m.id !== materialId),
    };

    console.log('Updated materials after removal:', updatedMaterials);

    onConfigurationChange({
      ...configuration,
      materials: updatedMaterials,
    });
  };

  const renderMaterialInput = (
    label: string,
    materialType: MaterialType,
    materials: CellConfiguration['materials'][MaterialType]
  ) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div className="relative">
            <button
              onClick={() => setSelectedMaterialType(materialType)}
              className="px-4 py-2 bg-[#3A55DF] text-white rounded-lg hover:bg-[#2A45CF] transition-colors"
            >
              Добавить материал
            </button>
            {selectedMaterialType === materialType && (
              <div className="absolute right-0 mt-2 z-10">
                <MaterialSearch
                  onSelect={handleMaterialSelect}
                  onClose={() => setSelectedMaterialType(null)}
                  categoryId={configuration.categoryId}
                  cellType={selectedCellType}
                />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {materials && materials.length > 0 ? (
            materials.map((material) => (
              <div
                key={`${materialType}-${material.id}`}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{material.name}</div>
                  <div className="text-sm text-gray-500">
                    {(Number(material.price) || 0).toLocaleString()} ₸
                  </div>
                </div>
                <button
                  onClick={() => removeMaterial(materialType, material.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 italic">Нет выбранных материалов</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Тип ячейки:</span>
        <div className="flex space-x-2">
          {CELL_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleCellTypeChange(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCellType === type.value
                  ? 'bg-[#3A55DF] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {CELL_MATERIALS[selectedCellType].map(({ type, label }) => (
          <div key={type}>{renderMaterialInput(label, type, configuration.materials[type])}</div>
        ))}
      </div>
    </div>
  );
}
