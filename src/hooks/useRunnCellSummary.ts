import { useEffect } from 'react';
import { useRunnStore, RunnCell, RunnCellSummary } from '@/store/useRunnStore';
import { Material } from '@/api/material';

interface UseRunnCellSummaryProps {
  cell: RunnCell;
  materials: {
    avtomatVyk: Material[];
    avtomatLity: Material[];
    counter: Material[];
    rpsLeft: Material[];
  };
  runnMaterials: any;
  breakerCalculation?: any;
  counterCalculation?: any;
  sectionSwitchCalculation?: any;
  outgoingCalculation?: any;
}

// Функция для форматирования описания панели
const formatPanelDescription = (cell: RunnCell, index: number): string => {
  const parts = [];
  
  // Определяем тип панели на основе назначения ячейки
  let panelType = '';
  if (cell.purpose?.toLowerCase().includes('вводная') || cell.purpose?.toLowerCase().includes('ввод')) {
    panelType = 'вводная';
  } else if (cell.purpose?.toLowerCase().includes('секционная') || cell.purpose?.toLowerCase().includes('секция')) {
    panelType = 'секционная';
  } else if (cell.purpose?.toLowerCase().includes('отходящая') || cell.purpose?.toLowerCase().includes('отход')) {
    panelType = 'отходящая';
  } else {
    panelType = cell.purpose || 'панель';
  }

  // Формируем название панели с порядковым номером (начиная с 62)
  const panelNumber = 62 + index;
  const panelName = `Панель ЩО 70-${panelNumber} С У3 (${panelType})`;
  parts.push(panelName);

  // Добавляем основное оборудование в правильном порядке
  const equipmentParts: string[] = [];

  // Автоматический выключатель (основное оборудование)
  if (cell.breaker) {
    equipmentParts.push(cell.breaker);
  }

  // Счетчик электроэнергии
  if (cell.meterType) {
    equipmentParts.push(`учет эл.эн. (${cell.meterType})`);
  }

  // РЗА
  if (cell.rza) {
    equipmentParts.push(cell.rza);
  }

  // Рубильники для РПС
  if (cell.rubilniki && cell.rubilniki.length > 0) {
    equipmentParts.push(cell.rubilniki.join(', '));
  }

  if (equipmentParts.length > 0) {
    parts.push(equipmentParts.join(', '));
  }

  return parts.join(' - ');
};

// Функция для извлечения ампеража из названия трансформатора тока
const extractCurrentFromTransformerName = (transformerName: string): number | null => {
  if (!transformerName) return null;
  
  // Ищем ток в формате "2500/5", "2000/5", "1000/5" и т.д.
  const patterns = [
    /(\d+)\/5\b/i,  // 2500/5
    /(\d+)\/\s*5\b/i,  // 2500/ 5
    /(\d+)\s*\/\s*5\b/i,  // 2500 / 5
  ];
  
  for (const pattern of patterns) {
    const match = transformerName.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
};

// Функция для поиска подходящего трансформатора тока по амперажу
const findMatchingCurrentTransformer = (requiredCurrent: number, runnMaterials: any): Material | null => {
  if (!runnMaterials.currentTransformer || runnMaterials.currentTransformer.length === 0) return null;
  
  // Ищем трансформатор тока с подходящим амперажем
  for (const material of runnMaterials.currentTransformer) {
    const materialCurrent = extractCurrentFromTransformerName(material.name);
    if (materialCurrent && materialCurrent >= requiredCurrent) {
      return material;
    }
  }
  
  // Если не нашли точного совпадения, берем максимальный доступный
  let maxCurrent = 0;
  let bestMatch = null;
  
  for (const material of runnMaterials.currentTransformer) {
    const materialCurrent = extractCurrentFromTransformerName(material.name);
    if (materialCurrent && materialCurrent > maxCurrent) {
      maxCurrent = materialCurrent;
      bestMatch = material;
    }
  }
  
  return bestMatch;
};

// Функция для извлечения тока из названия автомата
const extractCurrentFromBreakerName = (breakerName: string): number | null => {
  const patterns = [
    // CHINT NA 4000 -4000, 4000 A
    /NA\s+\d+\s*-\d+,\s*(\d+)\s*A/i,
    // Другие форматы
    /(\d+)\s*A(?!\w)/i,
    /(\d+)\s*А(?!\w)/i
  ];

  for (const pattern of patterns) {
    const match = breakerName.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  return null;
};

export function useRunnCellSummary({
  cell,
  materials,
  runnMaterials,
  breakerCalculation,
  counterCalculation,
  sectionSwitchCalculation,
  outgoingCalculation,
}: UseRunnCellSummaryProps) {
  const { setCellSummary, removeCellSummary, cellSummaries } = useRunnStore();

  useEffect(() => {
    const calculateCellPrice = (): number => {
      let totalPrice = 0;
      
      if (cell.purpose === 'Ввод' && breakerCalculation) {
        // Для вводных ячеек используем логику из RunnCellTable
        const materialsTotal = breakerCalculation.data.categories.reduce(
          (sum: number, category: any) =>
            sum + category.items.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0),
          0
        );

        const selectedBreaker = breakerCalculation.data.cellConfig?.materials?.withdrawable_breaker?.find(
          (material: any) => material.name === cell.breaker
        ) || breakerCalculation.data.cellConfig?.materials?.withdrawable_breaker?.[0];
        
        let selectedMaterialsTotal = selectedBreaker?.price || 0;

        // Добавляем стоимость трансформатора тока
        if (runnMaterials.currentTransformer.length > 0) {
          const breakerCurrent = extractCurrentFromBreakerName(cell.breaker);
          if (breakerCurrent) {
            const matchingTransformer = findMatchingCurrentTransformer(breakerCurrent, runnMaterials);
            if (matchingTransformer) {
              const baseTransformerQuantity = cell.meterType ? 6 : 3;
              const transformerQuantity = baseTransformerQuantity;
              const transformerTotal = parseFloat(matchingTransformer.price.toString()) * transformerQuantity;
              selectedMaterialsTotal += transformerTotal;
            }
          }
        }

        // Рассчитываем цену автомата выкатного
        const { calculateCost } = require('@/utils/calculationUtils');
        const calculationResult = calculateCost(
          materialsTotal,
          breakerCalculation.data.calculation,
          selectedMaterialsTotal
        );
        
        totalPrice = calculationResult.totalCost;

        // Добавляем цену счетчика, если есть
        if (counterCalculation && cell.meterType) {
          const counterCalculationResult = calculateCost(
            counterCalculation.data.categories.reduce(
              (sum: number, category: any) =>
                sum + category.items.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0),
              0
            ),
            counterCalculation.data.calculation,
            counterCalculation.data.cellConfig?.materials?.counter?.find(
              (material: any) => material.name === cell.meterType
            )?.price || 0
          );
          totalPrice += counterCalculationResult.totalCost;
        }
      } else if (cell.purpose === 'Секционный выключатель' && sectionSwitchCalculation) {
        // Для секционных выключателей
        const materialsTotal = sectionSwitchCalculation.data.categories.reduce(
          (sum: number, category: any) =>
            sum + category.items.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0),
          0
        );

        const selectedBreaker = sectionSwitchCalculation.data.cellConfig?.materials?.molded_case_breaker?.find(
          (material: any) => material.name === cell.breaker
        ) || sectionSwitchCalculation.data.cellConfig?.materials?.molded_case_breaker?.[0];
        
        const selectedMaterialsTotal = selectedBreaker?.price || 0;

        const { calculateCost } = require('@/utils/calculationUtils');
        const calculationResult = calculateCost(
          materialsTotal,
          sectionSwitchCalculation.data.calculation,
          selectedMaterialsTotal
        );
        
        totalPrice = calculationResult.totalCost;
      } else if (cell.purpose === 'Отходящая' && outgoingCalculation) {
        // Для отходящих ячеек
        const materialsTotal = outgoingCalculation.data.categories.reduce(
          (sum: number, category: any) =>
            sum + category.items.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0),
          0
        );

        const selectedBreaker = outgoingCalculation.data.cellConfig?.materials?.molded_case_breaker?.find(
          (material: any) => material.name === cell.breaker
        ) || outgoingCalculation.data.cellConfig?.materials?.molded_case_breaker?.[0];
        
        const selectedMaterialsTotal = selectedBreaker?.price || 0;

        const { calculateCost } = require('@/utils/calculationUtils');
        const calculationResult = calculateCost(
          materialsTotal,
          outgoingCalculation.data.calculation,
          selectedMaterialsTotal
        );
        
        totalPrice = calculationResult.totalCost;
      }

      return totalPrice;
    };

    const totalPrice = calculateCellPrice();
    const quantity = cell.quantity || 1;
    const pricePerUnit = totalPrice / quantity;
    const totalSum = totalPrice;

    if (totalPrice > 0) {
      // Находим индекс ячейки для правильного номера панели
      const cellIndex = cellSummaries.findIndex(s => s.cellId === cell.id);
      const panelDescription = formatPanelDescription(cell, cellIndex >= 0 ? cellIndex : 0);

      const newSummary: RunnCellSummary = {
        cellId: cell.id,
        name: panelDescription,
        quantity: quantity,
        pricePerUnit: pricePerUnit,
        totalPrice: totalSum,
      };

      setCellSummary(newSummary);
    } else {
      // Проверяем, есть ли summary для этой ячейки, чтобы не вызывать removeCellSummary бесконечно
      if (cellSummaries.some((s) => s.cellId === cell.id)) {
        removeCellSummary(cell.id);
      }
    }
  }, [
    cell.id,
    cell.purpose,
    cell.breaker,
    cell.meterType,
    cell.rza,
    cell.rubilniki,
    cell.quantity,
    materials,
    runnMaterials,
    breakerCalculation,
    counterCalculation,
    sectionSwitchCalculation,
    outgoingCalculation,
    cellSummaries,
    setCellSummary,
    removeCellSummary,
  ]);
}