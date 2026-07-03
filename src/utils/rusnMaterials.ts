import { Material } from '@/api/material';
import { RusnCell, RusnGlobalOptions } from '@/store/useRusnStore';
import { getKsoA12BhaCellDescription } from '@/domain/calculation/bhaPresets';
import {
  isRusnCameraWithPerCellMeter,
  supportsCellMeterSelection,
  RUSN_CAMERA,
  RUSN_CELL_PURPOSE,
} from '@/domain/rusn/rusnConstants';

export type RusnGlobalCategorySelections = Pick<
  RusnGlobalOptions,
  'breaker' | 'rza' | 'meterType' | 'sr' | 'tsn' | 'tn' | 'tt'
>;

const MATERIAL_TYPE_TO_GLOBAL_KEY: Record<
  keyof RusnMaterials,
  keyof RusnGlobalCategorySelections | null
> = {
  breaker: 'breaker',
  rza: 'rza',
  meter: 'meterType',
  transformer: null,
  sr: 'sr',
  tsn: 'tsn',
  tn: 'tn',
  tt: 'tt',
};

const FIELD_TO_GLOBAL_CATEGORY_KEY: Record<string, keyof RusnGlobalCategorySelections> = {
  breaker: 'breaker',
  rza: 'rza',
  meterType: 'meterType',
  sr: 'sr',
  transformerCurrent: 'tt',
  transformerVoltage: 'tn',
  transformerPower: 'tsn',
};

export function filterMaterialsByCategory(
  materialList: Material[],
  categorySelection?: { id: number | string; name: string } | null
): Material[] {
  if (!categorySelection?.id) return materialList;

  const categoryId = Number(categorySelection.id);
  if (!Number.isFinite(categoryId)) return materialList;

  return materialList.filter((material) => material.category?.id === categoryId);
}

export function getCategoryFilteredMaterials(
  materials: RusnMaterials,
  materialType: keyof RusnMaterials,
  globalCategories?: RusnGlobalCategorySelections | null
): Material[] {
  const materialList = materials[materialType] ?? [];
  if (!globalCategories) return materialList;

  const globalKey = MATERIAL_TYPE_TO_GLOBAL_KEY[materialType];
  if (!globalKey) return materialList;

  return filterMaterialsByCategory(materialList, globalCategories[globalKey]);
}

function getCellMeterMaterials(
  materials: RusnMaterials,
  cellPurpose: string,
  cameraName: string | undefined,
  globalCategories?: RusnGlobalCategorySelections | null
): Material[] | null {
  if (!supportsCellMeterSelection(cameraName, cellPurpose)) {
    return null;
  }

  if (!globalCategories?.meterType) {
    return [];
  }

  return filterMaterialsByCategory(materials.meter, globalCategories.meterType);
}

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
  'Секционный разьединитель': [{ field: 'sr', label: 'Разъединитель', materialType: 'sr' }],
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
  'ТН с ЗСШ': [
    { field: 'transformerVoltage', label: 'Трансформатор напряжения', materialType: 'tn' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
  ],
  'Трансформатор собственных нужд': [
    { field: 'transformerPower', label: 'Силовой трансформатор', materialType: 'tsn' },
  ],
  'Заземление сборных шин': [],
  'Кабельная перемычка': [
    { field: 'breaker', label: 'Выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'transformerCurrent', label: 'Трансформатор тока', materialType: 'tt' },
  ],
} as const;

// Получение конфигурации полей для ячейки
export const getCellFieldConfig = (
  cellPurpose: string,
  materials: RusnMaterials,
  cameraType?: string,
  selectedGroupName?: string,
  globalCategories?: RusnGlobalCategorySelections | null
) => {
  // Для ячеек 8DJH не показываем поля выбора оборудования
  if (cellPurpose === 'Камера Siemens 8DJH') {
    return [];
  }

  // Для секционных разъединителей КСО 366 блокируем поле только если не выбран тип разъединителя
  if (cellPurpose === 'Секционный разьединитель' && 
      selectedGroupName === 'Камера КСО 366' &&
      (!cameraType || cameraType === '' || cameraType === 'Камера КСО 366')) {
    return [];
  }

  // Для ячеек "Ввод", "Трансформаторная" и "Отходящая" в КСО 366 не показываем поля выбора материалов
  if ((cellPurpose === 'Ввод' || cellPurpose === 'Трансформаторная' || cellPurpose === 'Отходящая') && selectedGroupName === 'Камера КСО 366') {
    return [];
  }

  const config = CELL_FIELD_CONFIG[cellPurpose as keyof typeof CELL_FIELD_CONFIG] || [];

  return config.filter(({ materialType, field }) => {
    const baseList = materials[materialType as keyof RusnMaterials];
    if (!baseList?.length) return false;

    if (field === 'meterType') {
      if (
        isRusnCameraWithPerCellMeter(selectedGroupName) &&
        !supportsCellMeterSelection(selectedGroupName, cellPurpose)
      ) {
        return false;
      }

      if (supportsCellMeterSelection(selectedGroupName, cellPurpose)) {
        const meterMaterials = getCellMeterMaterials(
          materials,
          cellPurpose,
          selectedGroupName,
          globalCategories
        );
        return (meterMaterials?.length ?? 0) > 0;
      }
    }

    if (!globalCategories) return true;

    const materialList = getMaterialArrayForField(
      materials,
      field,
      cellPurpose,
      globalCategories,
      selectedGroupName
    );
    return materialList.length > 0;
  });
};

// Получение материала по ID
export const getRusnMaterialById = (
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
  cellPurpose: string,
  globalCategories?: RusnGlobalCategorySelections | null,
  cameraName?: string
): Material[] => {
  if (field === 'meterType') {
    const cellMeterMaterials = getCellMeterMaterials(
      materials,
      cellPurpose,
      cameraName,
      globalCategories
    );
    if (cellMeterMaterials !== null) {
      return cellMeterMaterials;
    }
  }

  let baseList: Material[];

  if (field === 'breaker' && cellPurpose === 'Секционный разьединитель') {
    baseList = materials.sr;
  } else if (field === 'sr') {
    baseList = materials.sr;
  } else {
    const fieldToMaterialMap: Record<string, keyof RusnMaterials> = {
      breaker: 'breaker',
      rza: 'rza',
      meterType: 'meter',
      transformerCurrent: 'tt',
      transformerVoltage: 'tn',
      transformerPower: 'tsn',
    };

    const materialType = fieldToMaterialMap[field];
    baseList = materialType ? materials[materialType] : [];
  }

  if (!globalCategories) return baseList;

  if (field === 'breaker' && cellPurpose === 'Секционный разьединитель') {
    return filterMaterialsByCategory(baseList, globalCategories.sr);
  }

  const globalKey = FIELD_TO_GLOBAL_CATEGORY_KEY[field];
  if (globalKey && globalCategories[globalKey]) {
    return filterMaterialsByCategory(baseList, globalCategories[globalKey]);
  }

  return baseList;
};

const getSelectedMaterialName = (
  materials: RusnMaterials,
  materialType: keyof RusnMaterials,
  selected?: { id: string; name: string }
): string | null => {
  if (!selected) return null;

  return getRusnMaterialById(materials, materialType, selected.id)?.name || selected.name || null;
};

const cleanMeterName = (name: string): string =>
  name
    .replace(/^счетчик\s*(э\/э|э\.э\.|эл\.?\s*эн\.?|электрической\s+энергии)\s*/i, '')
    .trim();

const withPrefix = (prefix: string, name: string): string => {
  const lowerName = name.toLowerCase();
  const lowerPrefix = prefix.toLowerCase();

  return lowerName.startsWith(lowerPrefix) ? name : `${prefix} ${name}`;
};

const KSO_A12_CELL_LABELS: Record<string, { code: string; purpose: string }> = {
  Ввод: { code: '1ВК', purpose: 'вводная' },
  'Секционный выключатель': { code: '3СВ', purpose: 'секционный выключатель' },
  'Секционный разьединитель': { code: '4РСВ', purpose: 'секционный разъединитель' },
  Трансформаторная: { code: '2ВК', purpose: 'трансформаторная' },
  Отходящая: { code: 'ОТХ', purpose: 'отходящая' },
  'Трансформатор напряжения': { code: 'ТН', purpose: 'трансформатор напряжения' },
  'ТН с ЗСШ': { code: 'ТН с ЗСШ', purpose: 'трансформатор напряжения с ЗСШ' },
  'Трансформатор собственных нужд': { code: 'ТСН', purpose: 'трансформатор собственных нужд' },
};

const formatKsoA12Description = (cell: RusnCell, materials: RusnMaterials): string => {
  const label = KSO_A12_CELL_LABELS[cell.purpose] || {
    code: cell.purpose,
    purpose: cell.purpose.toLowerCase(),
  };
  const parts = [`Камера КСО А12-10 ${label.code} (${label.purpose})`];
  const materialParts: string[] = [];

  const breakerName = getSelectedMaterialName(materials, 'breaker', cell.breaker);
  if (breakerName && cell.purpose !== 'Секционный разьединитель') {
    materialParts.push(withPrefix('Вакуумный выключатель', breakerName));
  }

  const srName = getSelectedMaterialName(materials, 'sr', cell.sr);
  if (srName && cell.purpose === 'Секционный разьединитель') {
    materialParts.push(withPrefix('Разъединитель', srName));
  }

  const rzaName = getSelectedMaterialName(materials, 'rza', cell.rza);
  if (rzaName) {
    materialParts.push(withPrefix('Микропроцессорная защита', rzaName));
  }

  const transformerCurrentName = getSelectedMaterialName(materials, 'tt', cell.transformerCurrent);
  if (transformerCurrentName) {
    materialParts.push(withPrefix('Трансформатор тока', transformerCurrentName));
  }

  const transformerVoltageName = getSelectedMaterialName(materials, 'tn', cell.transformerVoltage);
  if (transformerVoltageName) {
    materialParts.push(withPrefix('Трансформатор напряжения', transformerVoltageName));
  }

  const transformerPowerName = getSelectedMaterialName(materials, 'tsn', cell.transformerPower);
  if (transformerPowerName) {
    materialParts.push(withPrefix('Силовой трансформатор', transformerPowerName));
  }

  const meterName = getSelectedMaterialName(materials, 'meter', cell.meterType);
  if (meterName) {
    materialParts.push(`учет эл.эн. ${cleanMeterName(meterName)}`);
  }

  if (materialParts.length > 0) {
    parts.push(materialParts.join(', '));
  }

  return parts.join(' ');
};

// Форматирование описания ячейки
export const formatCellDescription = (
  cell: RusnCell,
  materials: RusnMaterials,
  cameraType?: string,
  transformerVoltage?: string
): string | string[] => {
  let cameraName = cameraType || cell.cellType || 'КСО А12-10';

  // Для секционных разъединителей КСО 366 используем cell.cellType вместо глобального bodyType
  if (cell.purpose === 'Секционный разьединитель' && cameraName === 'Камера КСО 366' && cell.cellType) {
    cameraName = cell.cellType;
  }
  
  // Специальный формат для КСО 366 и ячейки "Ввод"
  if (cameraName === 'Камера КСО 366' && cell.purpose === 'Ввод') {
    return 'Камера КСО 366-3H-630 (Вводная) Выключатель нагрузки ВНА-10\\630';
  }
  if (cameraName === 'Камера КСО 366' && cell.purpose === 'Трансформаторная') {
    return 'Камера КСО 366-4H-630  (Трансформаторная)  Выключатель нагрузки ВНА-10\\630 с предохранителем';
  }
  if (cameraName === 'Камера КСО 366' && cell.purpose === 'Отходящая') {
    return 'Камера  КСО 366-3H-630 (отходящая линия) Выключатель нагрузки ВНА-10\\630';
  }
  if (cameraName === 'Камера КСО 366-13' && cell.purpose === 'Секционный разьединитель') {
    return 'Камера КСО 366-13 (Секционная с разъединителем) Разъединитель РВЗ- 10/ 630';
  }
  if (cameraName === 'Камера КСО 366 ШМР 14, 15' && cell.purpose === 'Секционный разьединитель') {
    // Если есть разбивка расчета, используем её
    if (cell.calculationBreakdown) {
      return [
        `${cell.calculationBreakdown.main.name} Разъединитель РВЗ- 10/ 630`,
        `${cell.calculationBreakdown.additional.name}`
      ];
    }
    return [
      'Камера КСО 366-14, 15 (Секционная с разъединителем) Разъединитель РВЗ- 10/ 630',
      'Шинный мост с разъединителем'
    ];
  }

  // Правила для камеры КСО А12-10
  if (cameraName === 'Камера КСО А12-10' || cameraName === 'КСО А12-10') {
    if (cell.bhaMode) {
      const bhaDescription = getKsoA12BhaCellDescription(cell.purpose);
      if (bhaDescription) {
        return bhaDescription;
      }
    }
    return formatKsoA12Description(cell, materials);
  }

  if (
    cameraName === RUSN_CAMERA.KSO_A17_20 &&
    cell.purpose === RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER_ZSSH
  ) {
    const parts = ['Камера КСО-А17-20 500x1450 (ТН с ЗСШ)'];
    const materialParts: string[] = [];

    const transformerVoltageName = getSelectedMaterialName(materials, 'tn', cell.transformerVoltage);
    if (transformerVoltageName) {
      materialParts.push(withPrefix('Трансформатор напряжения', transformerVoltageName));
    }

    const rzaName = getSelectedMaterialName(materials, 'rza', cell.rza);
    if (rzaName) {
      materialParts.push(withPrefix('Микропроцессорная защита', rzaName));
    }

    if (materialParts.length > 0) {
      parts.push(materialParts.join(', '));
    }

    return parts.join(', ');
  }

  if (cameraName === RUSN_CAMERA.KSO_A17_20) {
    return formatKsoA12Description(cell, materials).replace(
      'Камера КСО А12-10',
      'Камера КСО А17-20'
    );
  }

  if (cell.purpose === RUSN_CELL_PURPOSE.BUSBAR_GROUNDING) {
    return 'Заземление сборных шин';
  }

  // Начинаем с назначения ячейки и типа
  const parts = [];
  parts.push(`Ячейка ${cell.purpose}`);
  // Проверяем, не начинается ли cameraName уже с "Камера"
  if (cameraName.startsWith('Камера')) {
    parts.push(cameraName);
  } else {
    parts.push(`Камера ${cameraName}`);
  }

  // Для КСО 366 ШМР 14, 15 возвращаем специальное описание
  if (cameraName === 'Камера КСО 366 ШМР 14, 15' && cell.purpose === 'Секционный разьединитель') {
    if (cell.calculationBreakdown) {
      return [
        `${cell.calculationBreakdown.main.name} Разъединитель РВЗ- 10/ 630`,
        `${cell.calculationBreakdown.additional.name}`
      ];
    }
    return [
      'Камера КСО 366-14, 15 (Секционная с разъединителем) Разъединитель РВЗ- 10/ 630',
      'Шинный мост с разъединителем'
    ];
  }

  // Для Кабельная перемычка возвращаем название на основе трансформатора
  if (cell.purpose === 'Кабельная перемычка') {
    if (transformerVoltage === '10') {
      return 'Кабельная перемычка 10кВ';
    } else if (transformerVoltage === '20') {
      return 'Кабельная перемычка 20кВ';
    } else {
      return 'Кабельная перемычка';
    }
  }

  // Для Изоляционный адаптер возвращаем название с напряжением
  if (cell.purpose === 'Изоляционный адаптер') {
    if (transformerVoltage === '10') {
      return 'Изоляционный адаптер 10кВ';
    } else if (transformerVoltage === '20') {
      return 'Изоляционный адаптер 20кВ';
    } else {
      return 'Изоляционный адаптер';
    }
  }

  // Для Камера Siemens 8DJH возвращаем полное название с динамическим формированием
  if (cameraName === 'Камера 8DJH' && cell.purpose === 'Камера Siemens 8DJH') {
    // Получаем количества для L и R
    const siemens8DJH_L = (cell as any).siemens8DJH_L || 0;
    const siemens8DJH_R = (cell as any).siemens8DJH_R || 0;
    
    // Генерируем строки L и R на основе количества
    const totalSymbols = Math.max(1, siemens8DJH_L + siemens8DJH_R);
    
    // Если сумма не делится на 2, возвращаем базовое название
    if (totalSymbols % 2 !== 0) {
      return 'Камера Siemens 8DJH (Микропроцессорная защита РЗА Системз РС83-А2.0)';
    }
    
    const leftHalf = Math.floor(totalSymbols / 2);
    const rightHalf = Math.ceil(totalSymbols / 2);
    
    // Специальная логика для R=2
    if (siemens8DJH_R === 2) {
      const leftL = leftHalf - 1; // Оставляем место для 1R в левой части
      const leftR = 1; // 1R в левой части
      const rightR = 1; // 1R в правой части
      const rightL = rightHalf - 1; // Остальные L в правой части
      
      const lString = 'L'.repeat(leftL) + 'R'.repeat(leftR);
      const rString = 'R'.repeat(rightR) + 'L'.repeat(rightL);
      
      return `Камера Siemens 8DJH ${lString}-${rString} (Микропроцессорная защита РЗА Системз РС83-А2.0)`;
    }
    
    // Для других случаев формируем стандартно
    // Распределяем R символы равномерно между левой и правой частями
    const leftR = Math.floor(siemens8DJH_R / 2);
    const rightR = siemens8DJH_R - leftR;
    
    // Остальные места заполняем L
    const leftL = leftHalf - leftR;
    const rightL = rightHalf - rightR;
    
    const lString = 'L'.repeat(leftL) + 'R'.repeat(leftR);
    const rString = 'R'.repeat(rightR) + 'L'.repeat(rightL);
    
    return `Камера Siemens 8DJH ${lString}-${rString} (Микропроцессорная защита РЗА Системз РС83-А2.0)`;
  }
  

  // Собираем значения выбранных материалов (без подписей)
  const materialParts: string[] = [];

  if (cell.breaker && cell.purpose !== 'Секционный разьединитель') {
    const material = getRusnMaterialById(materials, 'breaker', cell.breaker.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.rza) {
    const material = getRusnMaterialById(materials, 'rza', cell.rza.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.transformerCurrent) {
    const material = getRusnMaterialById(materials, 'tt', cell.transformerCurrent.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.transformerVoltage) {
    const material = getRusnMaterialById(materials, 'tn', cell.transformerVoltage.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.transformerPower) {
    const material = getRusnMaterialById(materials, 'tsn', cell.transformerPower.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (cell.meterType) {
    const material = getRusnMaterialById(materials, 'meter', cell.meterType.id);
    if (material) {
      materialParts.push(material.name);
    }
  }

  if (materialParts.length > 0) {
    parts.push(materialParts.join(', '));
  }

  return parts.join(' ');
};
