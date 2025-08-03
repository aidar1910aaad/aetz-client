import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  DeviceTabletIcon,
  CubeIcon,
  BeakerIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { CellConfiguration, CellType, MaterialType } from '@/types/calculation';
import MaterialSearch from '@/app/dashboard/calc/[groupSlug]/[calcSlug]/components/MaterialSearch';
import React, { useRef } from 'react';

interface CellConfigProps {
  cellType: CellType;
  configuration: CellConfiguration;
  onConfigurationChange: (config: CellConfiguration) => void;
}

const CELL_TYPE_GROUPS = [
  {
    label: 'Основные',
    types: [
      {
        value: '10kv',
        label: '10 кВ',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        value: '20kv',
        label: '20 кВ',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        value: '0.4kv',
        label: '0.4 кВ',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      { value: 'rza', label: 'РЗА', icon: <CubeIcon className="w-5 h-5 mr-1 text-indigo-500" /> },
    ],
  },
  {
    label: 'Оборудование',
    types: [
      {
        value: 'pu',
        label: 'ПУ',
        icon: <DeviceTabletIcon className="w-5 h-5 mr-1 text-gray-500" />,
      },
      {
        value: 'disconnector',
        label: 'Разъединитель',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12M6 12l4-4m-4 4l4 4" />
          </svg>
        ),
      },
      {
        value: 'busbar',
        label: 'Сборные шины',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <rect x="4" y="10" width="16" height="4" rx="2" />
          </svg>
        ),
      },
      {
        value: 'busbridge',
        label: 'Шинный мост',
        icon: <CubeIcon className="w-5 h-5 mr-1 text-gray-500" />,
      },
      {
        value: 'switch',
        label: 'Выключатель',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h2m16 0h2" />
          </svg>
        ),
      },
      {
        value: 'tn',
        label: 'Трансформатор напряжения',
        icon: <BeakerIcon className="w-5 h-5 mr-1 text-yellow-500" />,
      },
      {
        value: 'tsn',
        label: 'ТСН',
        icon: <Cog6ToothIcon className="w-5 h-5 mr-1 text-orange-500" />,
      },
    ],
  },
];

const CELL_MATERIALS: Record<CellType, { type: MaterialType; label: string }[]> = {
  '10kv': [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'disconnector', label: 'Разъединитель' },
    { type: 'busbar', label: 'Сборные шины' },
    { type: 'busbridge', label: 'Шинный мост' },
    { type: 'pu', label: 'ПУ' },
    { type: 'rza', label: 'РЗА' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
    { type: 'tt', label: 'Трансформатор тока' },
  ],
  '20kv': [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'disconnector', label: 'Разъединитель' },
    { type: 'busbar', label: 'Сборные шины' },
    { type: 'busbridge', label: 'Шинный мост' },
    { type: 'pu', label: 'ПУ' },
    { type: 'rza', label: 'РЗА' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
    { type: 'tt', label: 'Трансформатор тока' },
  ],
  '0.4kv': [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'disconnector', label: 'Разъединитель' },
    { type: 'busbar', label: 'Сборные шины' },
    { type: 'busbridge', label: 'Шинный мост' },
    { type: 'pu', label: 'ПУ' },
    { type: 'rza', label: 'РЗА' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
    { type: 'tt', label: 'Трансформатор тока' },
  ],
  rza: [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'disconnector', label: 'Разъединитель' },
    { type: 'busbar', label: 'Сборные шины' },
    { type: 'busbridge', label: 'Шинный мост' },
    { type: 'pu', label: 'ПУ' },
    { type: 'rza', label: 'РЗА' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
    { type: 'tt', label: 'Трансформатор тока' },
  ],
  pu: [{ type: 'pu', label: 'ПУ' }],
  disconnector: [{ type: 'disconnector', label: 'Разъединитель' }],
  busbar: [{ type: 'busbar', label: 'Сборные шины' }],
  busbridge: [{ type: 'busbridge', label: 'Шинный мост' }],
  switch: [{ type: 'switch', label: 'Выключатель' }],
  tn: [{ type: 'tn', label: 'Трансформатор напряжения' }],
  tsn: [{ type: 'tsn', label: 'ТСН' }],
};

export default function CellConfig({
  cellType,
  configuration,
  onConfigurationChange,
}: CellConfigProps) {
  const [selectedMaterialType, setSelectedMaterialType] = useState<MaterialType | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Validate and normalize cell type
  const validCellTypes: CellType[] = [
    '0.4kv',
    '10kv',
    '20kv',
    'rza',
    'pu',
    'disconnector',
    'busbar',
    'busbridge',
    'switch',
    'tn',
    'tsn',
  ];
  const normalizedCellType: CellType = validCellTypes.includes(cellType as CellType)
    ? (cellType as CellType)
    : '10kv'; // Default fallback

  const [selectedCellType, setSelectedCellType] = useState<CellType>(normalizedCellType);

  // Initialize materials if they don't exist
  useEffect(() => {
    const initialMaterials = {
      switch: [],
      disconnector: [],
      busbar: [],
      busbridge: [],
      pu: [],
      rza: [],
      counter: [],
      sr: [],
      tsn: [],
      tn: [],
      tt: [],
    };

    if (!configuration.materials) {
      onConfigurationChange({
        ...configuration,
        materials: initialMaterials,
      });
    }
  }, []);

  useEffect(() => {
    // Sync selectedCellType with configuration.type
    if (configuration.type && validCellTypes.includes(configuration.type as CellType)) {
      setSelectedCellType(configuration.type as CellType);
    } else if (normalizedCellType !== cellType) {
      // If the original cell type was invalid, update it to the normalized one
      onConfigurationChange({
        ...configuration,
        type: normalizedCellType,
      });
    }
  }, [configuration.type]);

  const handleCellTypeChange = (type: CellType) => {
    setSelectedCellType(type);
    onConfigurationChange({
      ...configuration,
      type,
    });
  };

  const handleMaterialSelect = (material: {
    id: string;
    name: string;
    price: number;
    unit?: string;
  }) => {
    if (!selectedMaterialType) return;

    console.log('Adding material:', material, 'to type:', selectedMaterialType);

    const updatedMaterials = [...(configuration.materials[selectedMaterialType] || [])];
    const materialId = Number(material.id);
    const index = updatedMaterials.findIndex((m) => m.id === materialId);

    if (index !== -1) {
      updatedMaterials[index] = {
        ...updatedMaterials[index],
        id: materialId,
        name: material.name,
        price: Number(material.price) || 0,
        type: selectedMaterialType,
      };
    } else {
      updatedMaterials.push({
        id: materialId,
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

  const removeMaterial = (materialType: MaterialType, materialId: number) => {
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
              ref={(el) => (buttonRefs.current[materialType] = el)}
              onClick={() => setSelectedMaterialType(materialType)}
              className="px-4 py-2 bg-[#3A55DF] text-white rounded-lg hover:bg-[#2A45CF] transition-colors"
            >
              Добавить материал
            </button>
            {selectedMaterialType === materialType && (
              <MaterialSearch
                onSelect={handleMaterialSelect}
                onClose={() => setSelectedMaterialType(null)}
                categoryId={configuration.categoryId}
                cellType={selectedCellType}
                dropdownMinWidth={400}
                anchorRef={{ current: buttonRefs.current[materialType] }}
              />
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
      <div>
        <span className="text-sm font-medium text-gray-700 block mb-2">Тип ячейки:</span>
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
          {CELL_TYPE_GROUPS.map((group) => (
            <div key={group.label} className="flex-1">
              <div className="text-xs text-gray-400 mb-1 pl-1">{group.label}</div>
              <div className="flex flex-wrap gap-2">
                {group.types.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleCellTypeChange(type.value as CellType)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition-colors shadow-sm
                      ${
                        selectedCellType === (type.value as CellType)
                          ? 'bg-[#3A55DF] text-white border-[#3A55DF] shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }
                    `}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-sm text-gray-500 font-semibold mt-2">
        Текущий тип ячейки:{' '}
        {
          CELL_TYPE_GROUPS.flatMap((g) => g.types).find((t) => t.value === configuration.type)
            ?.label
        }
      </div>
      <div className="space-y-6">
        {CELL_MATERIALS[selectedCellType]?.map(({ type, label }) => (
          <div key={type}>{renderMaterialInput(label, type, configuration.materials[type])}</div>
        ))}
      </div>
    </div>
  );
}
