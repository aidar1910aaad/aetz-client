import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  DeviceTabletIcon,
  CubeIcon,
  BeakerIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { CellConfiguration, CellType, MaterialType } from '@/types/calculation';
import { BHA_CALCULATION_PRESETS, isBhaCellType, isKsoA12CalculationGroup } from '@/domain/calculation/bhaPresets';
import {
  isKsoA17CalculationGroup,
  KSO_A17_20_CELL_TYPE_LABELS,
} from '@/domain/calculation/ksoA17Presets';
import {
  formatRzaCellTargets,
  getRzaCellTargetsForGroup,
  RZA_CELL_TARGET_LABELS,
  RzaCellTarget,
} from '@/domain/calculation/rzaCellTargets';
import { ALL_CELL_TYPES, STANDARD_CELL_TYPES } from '@/domain/calculation/cellTypes';
import MaterialSearch from '@/app/dashboard/calc/[groupSlug]/[calcSlug]/components/MaterialSearch';
import React, { useRef } from 'react';

interface CellConfigProps {
  cellType: CellType;
  configuration: CellConfiguration;
  onConfigurationChange: (config: CellConfiguration) => void;
  groupSlug?: string;
}

const CORE_CELL_TYPE_GROUP = {
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
      {
        value: 'input',
        label: 'Ввод',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        ),
      },
      {
        value: 'section_switch',
        label: 'Секционный выключатель',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-purple-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        ),
      },
      {
        value: 'outgoing',
        label: 'Отходящая',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-orange-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ),
      },
    ],
};

const KSO_A17_20_CELL_TYPE_GROUP = {
  label: 'КСО А17-20',
  types: [
    {
      value: 'kso_a17_zssh',
      label: KSO_A17_20_CELL_TYPE_LABELS.kso_a17_zssh,
      icon: (
        <svg
          className="w-5 h-5 mr-1 text-teal-600"
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
      value: 'busbar_grounding',
      label: KSO_A17_20_CELL_TYPE_LABELS.busbar_grounding,
      icon: (
        <svg
          className="w-5 h-5 mr-1 text-amber-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ],
};

const BHA_CELL_TYPE_GROUP = {
  label: 'BHA (КСО А12-10)',
  types: [
      {
        value: 'bha_input',
        label: BHA_CALCULATION_PRESETS.bha_input.label,
        icon: (
          <svg className="w-5 h-5 mr-1 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        ),
      },
      {
        value: 'bha_transformer',
        label: BHA_CALCULATION_PRESETS.bha_transformer.label,
        icon: (
          <svg className="w-5 h-5 mr-1 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        value: 'bha_outgoing',
        label: BHA_CALCULATION_PRESETS.bha_outgoing.label,
        icon: (
          <svg className="w-5 h-5 mr-1 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ),
      },
    ],
};

const EQUIPMENT_CELL_TYPE_GROUP = {
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
      {
        value: 'rps',
        label: 'РПС',
        icon: (
          <svg
            className="w-5 h-5 mr-1 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ),
      },
    ],
};

function getVisibleCellTypeGroups(groupSlug?: string) {
  if (isKsoA12CalculationGroup(groupSlug)) {
    return [CORE_CELL_TYPE_GROUP, BHA_CELL_TYPE_GROUP, EQUIPMENT_CELL_TYPE_GROUP];
  }
  if (isKsoA17CalculationGroup(groupSlug)) {
    return [CORE_CELL_TYPE_GROUP, KSO_A17_20_CELL_TYPE_GROUP, EQUIPMENT_CELL_TYPE_GROUP];
  }
  return [CORE_CELL_TYPE_GROUP, EQUIPMENT_CELL_TYPE_GROUP];
}

function getAllowedCellTypes(groupSlug?: string): CellType[] {
  if (isKsoA12CalculationGroup(groupSlug) || isKsoA17CalculationGroup(groupSlug)) {
    return ALL_CELL_TYPES;
  }
  return STANDARD_CELL_TYPES;
}

const CELL_MATERIALS: Record<CellType, { type: MaterialType; label: string }[]> = {
  '10kv': [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'withdrawable_breaker', label: 'Автомат выкатной' },
    { type: 'molded_case_breaker', label: 'Автомат литой корпус' },
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
    { type: 'withdrawable_breaker', label: 'Автомат выкатной' },
    { type: 'molded_case_breaker', label: 'Автомат литой корпус' },
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
    { type: 'withdrawable_breaker', label: 'Автомат выкатной' },
    { type: 'molded_case_breaker', label: 'Автомат литой корпус' },
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
    { type: 'withdrawable_breaker', label: 'Автомат выкатной' },
    { type: 'molded_case_breaker', label: 'Автомат литой корпус' },
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
  input: [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'withdrawable_breaker', label: 'Автомат выкатной' },
    { type: 'molded_case_breaker', label: 'Автомат литой корпус' },
    { type: 'disconnector', label: 'Разъединитель' },
    { type: 'busbar', label: 'Сборные шины' },
    { type: 'busbridge', label: 'Шинный мост' },
    { type: 'pu', label: 'ПУ' },
    { type: 'rza', label: 'РЗА' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
    { type: 'tt', label: 'Трансформатор тока' },
  ],
  section_switch: [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'withdrawable_breaker', label: 'Автомат выкатной' },
    { type: 'molded_case_breaker', label: 'Автомат литой корпус' },
    { type: 'disconnector', label: 'Разъединитель' },
    { type: 'busbar', label: 'Сборные шины' },
    { type: 'busbridge', label: 'Шинный мост' },
    { type: 'pu', label: 'ПУ' },
    { type: 'rza', label: 'РЗА' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
    { type: 'tt', label: 'Трансформатор тока' },
  ],
  outgoing: [
    { type: 'switch', label: 'Вакуумный выключатель' },
    { type: 'withdrawable_breaker', label: 'Автомат выкатной' },
    { type: 'molded_case_breaker', label: 'Автомат литой корпус' },
    { type: 'disconnector', label: 'Разъединитель' },
    { type: 'busbar', label: 'Сборные шины' },
    { type: 'busbridge', label: 'Шинный мост' },
    { type: 'pu', label: 'ПУ' },
    { type: 'rza', label: 'РЗА' },
    { type: 'counter', label: 'Счетчик' },
    { type: 'sr', label: 'СР' },
    { type: 'tt', label: 'Трансформатор тока' },
    { type: 'rps', label: 'РПС' },
    { type: 'rubilnik', label: 'Рубильник' },
  ],
  bha_input: [],
  bha_transformer: [],
  bha_outgoing: [],
  kso_a17_zssh: [],
  busbar_grounding: [],
};

export default function CellConfig({
  cellType,
  configuration,
  onConfigurationChange,
  groupSlug,
}: CellConfigProps) {
  const [selectedMaterialType, setSelectedMaterialType] = useState<MaterialType | null>(null);
  const buttonRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const visibleCellTypeGroups = getVisibleCellTypeGroups(groupSlug);
  const allowedCellTypes = getAllowedCellTypes(groupSlug);

  const normalizedCellType: CellType = allowedCellTypes.includes(cellType as CellType)
    ? (cellType as CellType)
    : '10kv';

  const [selectedCellType, setSelectedCellType] = useState<CellType>(normalizedCellType);
  const isBhaSelected = isBhaCellType(selectedCellType);

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
      withdrawable_breaker: [],
      molded_case_breaker: [],
      rps: [],
      rubilnik: [],
    };

    if (!configuration.materials) {
      onConfigurationChange({
        ...configuration,
        materials: initialMaterials,
      });
    }
  }, []);

  useEffect(() => {
    if (configuration.type && allowedCellTypes.includes(configuration.type as CellType)) {
      setSelectedCellType(configuration.type as CellType);
    } else if (isBhaCellType(configuration.type) && !isKsoA12CalculationGroup(groupSlug)) {
      setSelectedCellType('10kv');
      onConfigurationChange({
        ...configuration,
        type: '10kv',
      });
    } else {
      setSelectedCellType(normalizedCellType);
      onConfigurationChange({
        ...configuration,
        type: normalizedCellType,
      });
    }
  }, [configuration.type, normalizedCellType, groupSlug]);

  const handleCellTypeChange = (type: CellType) => {
    setSelectedCellType(type);
    onConfigurationChange({
      ...configuration,
      type,
      materials: isBhaCellType(type) ? {} : configuration.materials,
      rzaCellTargets: type === 'rza' ? configuration.rzaCellTargets || [] : undefined,
    });
  };

  const availableRzaCellTargets = getRzaCellTargetsForGroup(groupSlug);
  const isRzaSelected = selectedCellType === 'rza';

  const toggleRzaCellTarget = (target: RzaCellTarget) => {
    const current = configuration.rzaCellTargets || [];
    const next = current.includes(target)
      ? current.filter((item) => item !== target)
      : [...current, target];

    onConfigurationChange({
      ...configuration,
      rzaCellTargets: next,
    });
  };

  const materialRows = isRzaSelected
    ? [{ type: 'rza' as MaterialType, label: 'РЗА' }]
    : CELL_MATERIALS[selectedCellType] || [];

  const handleMaterialSelect = (material: {
    id: string;
    name: string;
    price: number;
    unit?: string;
  }) => {
    if (!selectedMaterialType) return;


    const updatedMaterials = [...(configuration.materials[selectedMaterialType] || [])];
    const materialId = Number(material.id);
    
    // Всегда добавляем новый экземпляр материала, даже если такой уже существует
    updatedMaterials.push({
      id: materialId,
      name: material.name,
      price: Number(material.price) || 0,
      type: selectedMaterialType,
    });


    onConfigurationChange({
      ...configuration,
      materials: {
        ...configuration.materials,
        [selectedMaterialType]: updatedMaterials,
      },
    });
    setSelectedMaterialType(null);
  };

  const removeMaterial = (materialType: MaterialType, materialIndex: number) => {

    const updatedMaterials = {
      ...configuration.materials,
      [materialType]: configuration.materials[materialType].filter((_, index) => index !== materialIndex),
    };


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
            <input
              ref={(el) => {
                buttonRefs.current[materialType] = el;
              }}
              onClick={() => setSelectedMaterialType(materialType)}
              type="button"
              value="Добавить материал"
              className="px-3 py-1.5 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa31a] transition-colors cursor-pointer text-xs"
            />
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
            materials.map((material, index) => (
              <div
                key={`${materialType}-${material.id}-${index}`}
                className="flex items-center justify-between bg-[#8eba1e]/5 px-3 py-2 rounded-lg border border-[#8eba1e]/15"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{material.name}</div>
                  <div className="text-sm text-gray-500">
                    {(Number(material.price) || 0).toLocaleString()} ₸
                  </div>
                </div>
                <button
                  onClick={() => removeMaterial(materialType, index)}
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
    <div className="space-y-5">
      <div>
        <span className="text-sm font-medium text-gray-700 block mb-2">Тип ячейки:</span>
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
          {visibleCellTypeGroups.map((group) => (
            <div key={group.label} className="flex-1">
              <div className="text-xs text-[#8eba1e] mb-1 pl-1 font-semibold">{group.label}</div>
              <div className="flex flex-wrap gap-2">
                {group.types.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleCellTypeChange(type.value as CellType)}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-sm
                      ${
                        selectedCellType === (type.value as CellType)
                          ? 'bg-[#8eba1e] text-white border-[#8eba1e] shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-[#8eba1e]/10'
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
      {!isBhaSelected && (
        <div className="text-sm text-gray-600 font-semibold mt-1">
          Текущий тип ячейки:{' '}
          {
            visibleCellTypeGroups.flatMap((g) => g.types).find((t) => t.value === selectedCellType)
              ?.label || selectedCellType
          }
          {isRzaSelected && configuration.rzaCellTargets?.length ? (
            <span className="text-gray-500 font-normal">
              {' '}
              — {formatRzaCellTargets(configuration.rzaCellTargets)}
            </span>
          ) : null}
        </div>
      )}
      {isRzaSelected && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-800 block">
              Ячейки для этой калькуляции РЗА
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Выберите одну или несколько ячеек, для которых применяется эта калькуляция РЗиА
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableRzaCellTargets.map((target) => {
              const isChecked = configuration.rzaCellTargets?.includes(target) ?? false;
              return (
                <label
                  key={target}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => toggleRzaCellTarget(target)}
                  />
                  {RZA_CELL_TARGET_LABELS[target]}
                </label>
              );
            })}
          </div>
          {!configuration.rzaCellTargets?.length && (
            <p className="text-xs text-amber-700">
              Выберите хотя бы одну ячейку — без этого калькуляция не будет подставляться в РУСН
            </p>
          )}
        </div>
      )}
      {!isBhaSelected && (
        <div className="space-y-4">
          {materialRows.map(({ type, label }) => (
            <div key={type}>{renderMaterialInput(label, type, configuration.materials[type])}</div>
          ))}
        </div>
      )}
    </div>
  );
}
