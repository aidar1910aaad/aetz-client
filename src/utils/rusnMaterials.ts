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
  'Трансформатор собственных нужд': [
    { field: 'transformerPower', label: 'Силовой трансформатор', materialType: 'tsn' },
  ],
  'Кабельная перемычка': [
    { field: 'breaker', label: 'Выключатель', materialType: 'breaker' },
    { field: 'rza', label: 'РЗА', materialType: 'rza' },
    { field: 'transformerCurrent', label: 'Трансформатор тока', materialType: 'tt' },
  ],
} as const;

// Получение конфигурации полей для ячейки
export const getCellFieldConfig = (cellPurpose: string, materials: RusnMaterials, cameraType?: string, selectedGroupName?: string) => {
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

  return config.filter(({ materialType }) => {
    const materialList = materials[materialType as keyof RusnMaterials];
    return materialList && materialList.length > 0;
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
  cellPurpose: string
): Material[] => {
  if (field === 'breaker' && cellPurpose === 'Секционный разьединитель') {
    return materials.sr;
  }

  if (field === 'sr') {
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
export const formatCellDescription = (cell: RusnCell, materials: RusnMaterials, cameraType?: string): string | string[] => {
  // Используем переданный тип камеры или получаем из глобальных настроек
  let cameraName = cameraType;
  
  // Если cameraType не передан, получаем из глобальных настроек
  if (!cameraName) {
    try {
      const { useRusnStore } = require('@/store/useRusnStore');
      const globalState = useRusnStore.getState();
      cameraName = globalState.global.bodyType;
    } catch (error) {
      // Fallback к cell.cellType если не удалось получить глобальные настройки
      cameraName = cell.cellType || 'КСО А12-10';
    }
  }

  // Для секционных разъединителей КСО 366 используем cell.cellType вместо глобального bodyType
  if (cell.purpose === 'Секционный разьединитель' && cameraName === 'Камера КСО 366' && cell.cellType) {
    cameraName = cell.cellType;
  }
  
  // Специальный формат для КСО 366 и ячейки "Ввод"
  if (cameraName === 'Камера КСО 366' && cell.purpose === 'Ввод') {
    return 'Камера КСО 366-3H-630 (Вводная) Выключатель нагрузки ВНА-10\\630';
  }
  if (cameraName === 'Камера КСО А12-10' && cell.purpose === 'Ввод') {
    return 'Камера КСО А12-10 (Вводная)';
  }
  if (cameraName === 'Камера КСО 366' && cell.purpose === 'Трансформаторная') {
    return 'Камера КСО 366-4H-630  (Трансформаторная)  Выключатель нагрузки ВНА-10\\630 с предохранителем';
  }
  if (cameraName === 'Камера КСО А12-10' && cell.purpose === 'Трансформаторная') {
    return 'Камера КСО А12-10 (Трансформаторная)';
  }
  if (cameraName === 'Камера КСО 366' && cell.purpose === 'Отходящая') {
    return 'Камера  КСО 366-3H-630 (отходящая линия) Выключатель нагрузки ВНА-10\\630';
  }
  if (cameraName === 'Камера КСО А12-10' && cell.purpose === 'Отходящая') {
    return 'Камера КСО А12-10 (Отходящая)';
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
  if (cameraName === 'Камера КСО А12-10' && cell.purpose === 'Секционный выключатель') {
    return 'Камера КСО А12-10 (Секционный выключатель)';
  }
  if (cameraName === 'Камера КСО А12-10' && cell.purpose === 'Секционный разьединитель') {
    return 'Камера КСО А12-10 (Секционный разъединитель)';
  }
  if (cameraName === 'Камера КСО А12-10' && cell.purpose === 'Трансформатор напряжения') {
    return 'Камера КСО А12-10 (Трансформатор напряжения)';
  }
  if (cameraName === 'Камера КСО А12-10' && cell.purpose === 'Трансформатор собственных нужд') {
    return 'Камера КСО А12-10 (Трансформатор собственных нужд)';
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
    // Получаем трансформатор из store
    const { useTransformerStore } = require('@/store/useTransformerStore');
    const selectedTransformer = useTransformerStore.getState().selectedTransformer;
    
    if (selectedTransformer?.voltage === '10') {
      return 'Кабельная перемычка 10кВ';
    } else if (selectedTransformer?.voltage === '20') {
      return 'Кабельная перемычка 20кВ';
    } else {
      return 'Кабельная перемычка';
    }
  }

  // Для Изоляционный адаптер возвращаем название с напряжением
  if (cell.purpose === 'Изоляционный адаптер') {
    // Получаем трансформатор из store
    const { useTransformerStore } = require('@/store/useTransformerStore');
    const selectedTransformer = useTransformerStore.getState().selectedTransformer;
    
    if (selectedTransformer?.voltage === '10') {
      return 'Изоляционный адаптер 10кВ';
    } else if (selectedTransformer?.voltage === '20') {
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
