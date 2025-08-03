import { Material } from '@/api/material';
import { RusnCell } from '@/store/useRusnStore';

export interface RusnMaterials {
  breaker: Material[];
  rza: Material[];
  meter: Material[];
  transformer: Material[];
  sr: Material[];
  tsn: Material[];
  tn: Material[];
  tt: Material[];
}

// Конфигурация полей для каждого типа ячейки
export const CELL_FIELD_CONFIG = {
  Ввод: [
    { field: 'breaker', label: 'Вакуумный выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'meterType', label: 'ПУ', materialType: 'meter' },
    { field: 'transformerCurrent', label: 'Трансформатор тока', materialType: 'tt' },
  ],
  'Секционный выключатель': [
    { field: 'breaker', label: 'Вакуумный выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'transformerCurrent', label: 'Трансформатор тока', materialType: 'tt' },
  ],
  'Секционный разьединитель': [{ field: 'breaker', label: 'Разъединитель', materialType: 'sr' }],
  Трансформаторная: [
    { field: 'breaker', label: 'Выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'meterType', label: 'ПУ', materialType: 'meter' },
    { field: 'transformerCurrent', label: 'Трансформатор тока', materialType: 'tt' },
  ],
  Отходящая: [
    { field: 'breaker', label: 'Выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'meterType', label: 'ПУ', materialType: 'meter' },
    { field: 'transformerCurrent', label: 'Трансформатор тока', materialType: 'tt' },
  ],
  'Трансформатор напряжения': [
    { field: 'transformerVoltage', label: 'Трансформатор напряжения', materialType: 'tn' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
  ],
  'Трансформатор собственных нужд': [
    { field: 'transformerPower', label: 'Силовой трансформатор', materialType: 'tsn' },
  ],
} as const;

// Получение конфигурации полей для ячейки
export const getCellFieldConfig = (cellPurpose: string, materials: RusnMaterials) => {
  const config = CELL_FIELD_CONFIG[cellPurpose as keyof typeof CELL_FIELD_CONFIG] || [];

  return config.filter(({ materialType }) => {
    const materialList = materials[materialType as keyof RusnMaterials];
    return materialList && materialList.length > 0;
  });
};

// Получение материала по ID
export const getMaterialById = (
  materials: RusnMaterials,
  materialType: string,
  id: string
): Material | undefined => {
  const materialList = materials[materialType as keyof RusnMaterials];
  return materialList?.find((m) => m.id.toString() === id);
};

// Получение отображаемого названия для поля
export const getFieldDisplayName = (field: string, cellPurpose: string): string => {
  if (field === 'breaker' && cellPurpose === 'Секционный разьединитель') {
    return 'Разъединитель';
  }

  const fieldNames: Record<string, string> = {
    breaker: 'Выключатель',
    rza: 'РЗА',
    meterType: 'ПУ',
    transformerCurrent: 'Трансформатор тока',
    transformerVoltage: 'Трансформатор напряжения',
    transformerPower: 'Силовой трансформатор',
  };

  return fieldNames[field] || field;
};

// Получение массива материалов для поля
export const getMaterialArrayForField = (
  materials: RusnMaterials,
  field: string,
  cellPurpose: string
): Material[] => {
  if (field === 'breaker' && cellPurpose === 'Секционный разьединитель') {
    return materials.sr;
  }

  const fieldToMaterialMap: Record<string, keyof RusnMaterials> = {
    breaker: 'breaker',
    rza: 'rza',
    meterType: 'meter',
    transformerCurrent: 'tt',
    transformerVoltage: 'tn',
    transformerPower: 'tsn',
  };

  const materialType = fieldToMaterialMap[field];
  return materialType ? materials[materialType] : [];
};

// Форматирование описания ячейки
export const formatCellDescription = (cell: RusnCell, materials: RusnMaterials): string => {
  // Начинаем с назначения ячейки и типа
  const parts = [];
  parts.push(`Ячейка ${cell.purpose}`);
  parts.push('Камера КСО А12-10'); // Без размера

  // Собираем значения выбранных материалов (без подписей)
  const materialParts: string[] = [];

  if (cell.breaker && cell.purpose !== 'Секционный разьединитель') {
    const material = getMaterialById(materials, 'breaker', cell.breaker.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.rza) {
    const material = getMaterialById(materials, 'rza', cell.rza.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.transformerCurrent) {
    const material = getMaterialById(materials, 'tt', cell.transformerCurrent.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.transformerVoltage) {
    const material = getMaterialById(materials, 'tn', cell.transformerVoltage.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.transformerPower) {
    const material = getMaterialById(materials, 'tsn', cell.transformerPower.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.meterType) {
    const material = getMaterialById(materials, 'meter', cell.meterType.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (materialParts.length > 0) {
    parts.push(materialParts.join(', '));
  }

  return parts.join(' ');
};
