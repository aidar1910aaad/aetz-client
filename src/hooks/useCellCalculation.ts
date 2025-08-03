import { useEffect, useState, useMemo } from 'react';
import { RusnCell } from '@/store/useRusnStore';
import { RusnMaterials } from '@/utils/rusnMaterials';
import { useRusnCalculation } from './useRusnCalculation';
import { getMaterialById } from '@/utils/rusnMaterials';
import { calculateCost, CalculationData } from '@/utils/calculationUtils';

interface UseCellCalculationProps {
  cell: RusnCell;
  materials: RusnMaterials;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
}

export const useCellCalculation = ({
  cell,
  materials,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
}: UseCellCalculationProps) => {
  const { calculations } = useRusnCalculation(groupSlug);
  const [currentCalculation, setCurrentCalculation] = useState<string>(selectedCalculationName);
  const [total, setTotal] = useState(0);
  const [rzaCalc, setRzaCalc] = useState<{
    id: number;
    name: string;
    slug: string;
    data: {
      categories: Array<{
        name: string;
        items: Array<{
          name: string;
          unit: string;
          price: number;
          quantity: number;
        }>;
      }>;
      calculation?: {
        manufacturingHours?: number;
        hourlyRate?: number;
        overheadPercentage?: number;
        adminPercentage?: number;
        plannedProfitPercentage?: number;
        ndsPercentage?: number;
      };
    };
  } | null>(null);

  useEffect(() => {
    setCurrentCalculation(selectedCalculationName);
  }, [selectedCalculationName]);

  const findMatchingCalculation = (
    breakerId: string,
    rzaId?: string,
    disconnectorId?: string,
    puId?: string,
    tsnId?: string,
    tnId?: string
  ) => {
    if (!calculations.cell || (!breakerId && !rzaId && !disconnectorId && !puId && !tsnId && !tnId))
      return null;

    // Логирование для отладки поиска по ID
    // console.log('=== FINDING CALCULATIONS BY ID ===');
    // console.log('Searching for IDs:', { breakerId, rzaId, disconnectorId, puId, tsnId, tnId });

    const breakerCalculation = breakerId
      ? calculations.cell.find((calc) => {
          if (!calc.data?.cellConfig?.materials?.switch) return false;
          const switchMaterials = calc.data.cellConfig.materials.switch as Array<{ id: string }>;
          const found = switchMaterials.some((switchItem) => {
            const match = String(switchItem.id) === String(breakerId);
            console.log('[breaker] Сравниваю', switchItem.id, 'и', breakerId, '=>', match);
            return match;
          });
          return found;
        })
      : null;

    const rzaCalculation = rzaId
      ? calculations.cell.find((calc) => {
          if (!calc.data?.cellConfig?.materials?.rza) return false;
          const rzaMaterials = calc.data.cellConfig.materials.rza as Array<{ id: string }>;
          const found = rzaMaterials.some((rzaItem) => {
            const match = String(rzaItem.id) === String(rzaId);
            console.log('[rza] Сравниваю', rzaItem.id, 'и', rzaId, '=>', match);
            return match;
          });
          return found;
        })
      : null;

    const disconnectorCalculation = disconnectorId
      ? calculations.cell.find((calc) => {
          if (!calc.data?.cellConfig?.materials?.disconnector) return false;
          const disconnectorMaterials = calc.data.cellConfig.materials.disconnector as Array<{
            id: string;
          }>;
          const found = disconnectorMaterials.some((disconnectorItem) => {
            const match = String(disconnectorItem.id) === String(disconnectorId);
            console.log(
              '[disconnector] Сравниваю',
              disconnectorItem.id,
              'и',
              disconnectorId,
              '=>',
              match
            );
            return match;
          });
          return found;
        })
      : null;

    const puCalculation = puId
      ? calculations.cell.find((calc) => {
          if (!calc.data?.cellConfig?.materials?.pu) return false;
          const puMaterials = calc.data.cellConfig.materials.pu as Array<{ id: string }>;
          const found = puMaterials.some((puItem) => {
            const match = String(puItem.id) === String(puId);
            console.log('[pu] Сравниваю', puItem.id, 'и', puId, '=>', match);
            return match;
          });
          return found;
        })
      : null;

    const tsnCalculation = tsnId
      ? calculations.cell.find((calc) => {
          if (!calc.data?.cellConfig?.materials?.tsn) return false;
          const tsnMaterials = calc.data.cellConfig.materials.tsn as Array<{ id: string }>;
          const found = tsnMaterials.some((tsnItem) => {
            const match = String(tsnItem.id) === String(tsnId);
            console.log('[tsn] Сравниваю', tsnItem.id, 'и', tsnId, '=>', match);
            return match;
          });
          return found;
        })
      : null;

    const tnCalculation = tnId
      ? calculations.cell.find((calc) => {
          if (!calc.data?.cellConfig?.materials?.tn) return false;
          const tnMaterials = calc.data.cellConfig.materials.tn as Array<{ id: string }>;
          const found = tnMaterials.some((tnItem) => {
            const match = String(tnItem.id) === String(tnId);
            console.log('[tn] Сравниваю', tnItem.id, 'и', tnId, '=>', match);
            return match;
          });
          return found;
        })
      : null;

    // console.log('Found calculations by ID:', {
    //   breaker: !!breakerCalculation,
    //   rza: !!rzaCalculation,
    //   disconnector: !!disconnectorCalculation,
    //   pu: !!puCalculation,
    //   tsn: !!tsnCalculation,
    //   tn: !!tnCalculation,
    // });
    // console.log('================================');

    // После поиска всех калькуляций логируем, что нашли
    console.log('[findMatchingCalculation] Итог:', {
      breakerCalculation: breakerCalculation ? breakerCalculation.name : null,
      rzaCalculation: rzaCalculation ? rzaCalculation.name : null,
      disconnectorCalculation: disconnectorCalculation ? disconnectorCalculation.name : null,
      puCalculation: puCalculation ? puCalculation.name : null,
      tsnCalculation: tsnCalculation ? tsnCalculation.name : null,
      tnCalculation: tnCalculation ? tnCalculation.name : null,
    });

    return {
      breakerCalculation,
      rzaCalculation,
      disconnectorCalculation,
      puCalculation,
      tsnCalculation,
      tnCalculation,
    };
  };

  const calculateTotal = () => {
    let newCalculationName = currentCalculation;

    // Получаем ID всех материалов ячейки
    const tempBreakerId = cell.breaker?.id;
    const tempRzaId = cell.rza?.id;
    const tempDisconnectorId =
      cell.purpose === 'Секционный разьединитель' ? cell.breaker?.id : undefined;
    const tempPuId = cell.meterType?.id;
    const tempTsnId = cell.transformerPower?.id;
    const tempTnId = cell.transformerVoltage?.id;

    // Если у ячейки нет материалов, возвращаем 0
    if (
      !tempBreakerId &&
      !tempRzaId &&
      !tempDisconnectorId &&
      !tempPuId &&
      !tempTsnId &&
      !tempTnId
    ) {
      setTotal(0);
      return;
    }

    // Находим подходящие калькуляции
    const {
      breakerCalculation,
      rzaCalculation,
      disconnectorCalculation,
      puCalculation,
      tsnCalculation,
      tnCalculation,
    } = findMatchingCalculation(
      tempBreakerId || '',
      tempRzaId,
      tempDisconnectorId,
      tempPuId,
      tempTsnId,
      tempTnId
    );

    // Если не нашли калькуляцию ПУ по ID, ищем по типу калькуляции
    let finalPuCalculation = puCalculation;
    if (!puCalculation && tempPuId) {
      finalPuCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'pu');
    }

    // Если не нашли калькуляцию разъединителя по ID, ищем по типу калькуляции
    let finalDisconnectorCalculation = disconnectorCalculation;
    if (!disconnectorCalculation && tempDisconnectorId) {
      finalDisconnectorCalculation = calculations.cell.find(
        (calc) => calc.data?.cellConfig?.type === 'disconnector'
      );
    }

    // Если не нашли калькуляцию ТН по ID, ищем по типу калькуляции
    let finalTnCalculation = tnCalculation;
    if (!tnCalculation && tempTnId) {
      finalTnCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'tn');
      if (finalTnCalculation) {
        // console.log('Found TN calculation by type:', finalTnCalculation.name);
      } else {
        // console.log('No TN calculation found by type');
      }
    }

    // Дополнительный fallback для ТН по назначению ячейки
    if (!finalTnCalculation && cell.purpose === 'Трансформатор напряжения') {
      finalTnCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'tn');
      if (finalTnCalculation) {
        // console.log('Found TN calculation by cell purpose:', finalTnCalculation.name);
      } else {
        // console.log('No TN calculation found by cell purpose');
      }
    }

    // Если не нашли калькуляцию ТСН по ID, ищем по типу калькуляции
    let finalTsnCalculation = tsnCalculation;
    if (!tsnCalculation && tempTsnId) {
      finalTsnCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'tsn');
      if (finalTsnCalculation) {
        // console.log('Found TSN calculation by type:', finalTsnCalculation.name);
      } else {
        // console.log('No TSN calculation found by type');
      }
    }

    // Дополнительный fallback для ТСН по назначению ячейки
    if (!finalTsnCalculation && cell.purpose === 'Трансформатор собственных нужд') {
      finalTsnCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'tsn');
      if (finalTsnCalculation) {
        // console.log('Found TSN calculation by cell purpose:', finalTsnCalculation.name);
      } else {
        // console.log('No TSN calculation found by cell purpose');
      }
    }

    // Определяем тип ячейки на основе найденных калькуляций
    let cellType = 'Выключатель'; // По умолчанию

    // Приоритет определения типа ячейки
    if (finalPuCalculation) {
      cellType = 'ПУ';
    } else if (finalDisconnectorCalculation) {
      cellType = 'Разъединитель';
    } else if (finalTsnCalculation) {
      cellType = 'ТСН';
    } else if (finalTnCalculation) {
      cellType = 'ТН';
    } else if (breakerCalculation) {
      cellType = 'Выключатель';
    }

    // Дополнительная логика определения типа по назначению ячейки и выбранным материалам
    if (cell.purpose === 'Секционный разьединитель') {
      cellType = 'Разъединитель';
    } else if (cell.purpose === 'Трансформатор собственных нужд') {
      cellType = 'ТСН';
    } else if (cell.purpose === 'Трансформатор напряжения') {
      cellType = 'ТН';
    } else if (cell.meterType && !finalPuCalculation) {
      // Если выбран ПУ, но калькуляция не найдена, все равно определяем как ПУ
      cellType = 'ПУ';
    } else if (
      cell.purpose === 'Ввод' &&
      !finalPuCalculation &&
      !finalTsnCalculation &&
      !finalTnCalculation
    ) {
      cellType = 'Выключатель';
    }

    // Сохраняем все найденные калькуляции
    const nextFoundCalculations = {
      breakerCalculation,
      rzaCalculation,
      disconnectorCalculation: finalDisconnectorCalculation,
      puCalculation: finalPuCalculation,
      tsnCalculation: finalTsnCalculation,
      tnCalculation: finalTnCalculation,
      cellType,
    };

    // Определяем основную калькуляцию
    const mainCalculation =
      breakerCalculation ||
      finalDisconnectorCalculation ||
      finalPuCalculation ||
      finalTsnCalculation ||
      finalTnCalculation;

    if (mainCalculation) {
      newCalculationName = mainCalculation.name;
      setCurrentCalculation(mainCalculation.name);
    } else if (selectedGroupName && selectedCalculationName) {
      const cellCalculation = calculations.cell.find((c) => c.name === selectedCalculationName);
      if (cellCalculation) {
        newCalculationName = cellCalculation.name;
        setCurrentCalculation(cellCalculation.name);
      }
    }

    const currentCalc = calculations.cell.find((c) => c.name === newCalculationName);
    if (!currentCalc) return;

    setRzaCalc(rzaCalculation);

    // Логи для получения данных калькуляции
    // console.log('=== CALCULATION DATA DEBUG ===');
    // console.log('Selected calculation name:', newCalculationName);
    // console.log('Current calc full data:', currentCalc);
    // console.log('RZA calc data:', rzaCalculation);
    // console.log('Cell type determined:', cellType);
    // console.log('PU calculation search:', {
    //   tempPuId,
    //   puCalculation: !!puCalculation,
    //   finalPuCalculation: !!finalPuCalculation,
    //   puMaterial: materials.meter?.find((m) => m.id.toString() === tempPuId)?.name,
    // });
    // console.log('Disconnector calculation search:', {
    //   tempDisconnectorId,
    //   disconnectorCalculation: !!disconnectorCalculation,
    //   finalDisconnectorCalculation: !!finalDisconnectorCalculation,
    //   disconnectorMaterial: materials.sr?.find((m) => m.id.toString() === tempDisconnectorId)?.name,
    // });
    // console.log('TN calculation search:', {
    //   tempTnId,
    //   tnCalculation: !!tnCalculation,
    //   finalTnCalculation: !!finalTnCalculation,
    //   tnMaterial: materials.tn?.find((m) => m.id.toString() === tempTnId)?.name,
    // });
    // console.log('TSN calculation search:', {
    //   tempTsnId,
    //   tsnCalculation: !!tsnCalculation,
    //   finalTsnCalculation: !!finalTsnCalculation,
    //   tsnMaterial: materials.tsn?.find((m) => m.id.toString() === tempTsnId)?.name,
    // });
    // console.log('Found calculations:', {
    //   breaker: !!breakerCalculation,
    //   rza: !!rzaCalculation,
    //   disconnector: !!finalDisconnectorCalculation,
    //   pu: !!finalPuCalculation,
    //   tsn: !!finalTsnCalculation,
    //   tn: !!finalTnCalculation,
    // });
    // console.log(
    //   'Available calculations:',
    //   calculations.cell.map((c) => c.name)
    // );
    // console.log(
    //   'All calculations with types:',
    //   calculations.cell.map((c) => ({
    //     name: c.name,
    //     type: c.data?.cellConfig?.type,
    //     hasMaterials: {
    //       tn: !!c.data?.cellConfig?.materials?.tn,
    //       tsn: !!c.data?.cellConfig?.materials?.tsn,
    //       pu: !!c.data?.cellConfig?.materials?.pu,
    //       disconnector: !!c.data?.cellConfig?.materials?.disconnector,
    //     },
    //   }))
    // );
    // console.log('================================');

    // Функция для расчета стоимости материала
    const calculateMaterialCost = (
      calculation: {
        data: {
          calculation?: {
            hourlyRate?: number;
            manufacturingHours?: number;
            overheadPercentage?: number;
            adminPercentage?: number;
            plannedProfitPercentage?: number;
            ndsPercentage?: number;
          };
          categories: Array<{
            items: Array<{
              price: number;
              quantity: number;
            }>;
          }>;
        };
      },
      materialId: string,
      materialType: string
    ) => {
      if (!calculation || !materialId) return 0;

      const calculationData: CalculationData = {
        hourlyRate: calculation.data.calculation?.hourlyRate || 1000,
        manufacturingHours: calculation.data.calculation?.manufacturingHours || 4,
        overheadPercentage: calculation.data.calculation?.overheadPercentage || 15,
        adminPercentage: calculation.data.calculation?.adminPercentage || 10,
        plannedProfitPercentage: calculation.data.calculation?.plannedProfitPercentage || 20,
        ndsPercentage: calculation.data.calculation?.ndsPercentage || 12,
      };

      const materialsTotal = calculation.data.categories.reduce(
        (sum: number, category: { items: Array<{ price: number; quantity: number }> }) =>
          sum +
          category.items.reduce(
            (itemSum: number, item: { price: number; quantity: number }) =>
              itemSum + item.price * item.quantity,
            0
          ),
        0
      );

      const selectedMaterialsTotal = Number(
        getMaterialById(materials, materialType, materialId)?.price || 0
      );

      const calculationResult = calculateCost(
        materialsTotal,
        calculationData,
        selectedMaterialsTotal
      );
      return calculationResult.finalPrice;
    };

    // Рассчитываем стоимость для каждого типа материала
    let totalCost = 0;

    // Выключатель
    if (tempBreakerId && breakerCalculation) {
      totalCost += calculateMaterialCost(breakerCalculation, tempBreakerId, 'breaker');
    }

    // РЗА
    if (tempRzaId && rzaCalculation) {
      totalCost += calculateMaterialCost(rzaCalculation, tempRzaId, 'rza');
    }

    // Разъединитель
    if (tempDisconnectorId && finalDisconnectorCalculation) {
      totalCost += calculateMaterialCost(finalDisconnectorCalculation, tempDisconnectorId, 'sr');
    }

    // ПУ
    if (tempPuId && finalPuCalculation) {
      totalCost += calculateMaterialCost(finalPuCalculation, tempPuId, 'meter');
    }

    // ТСН
    if (tempTsnId && finalTsnCalculation) {
      totalCost += calculateMaterialCost(finalTsnCalculation, tempTsnId, 'tsn');
    }

    // ТН
    if (tempTnId && finalTnCalculation) {
      totalCost += calculateMaterialCost(finalTnCalculation, tempTnId, 'tn');
    }

    // Добавляем стоимость трансформатора тока (умножаем на 3 для всех ячеек)
    const transformerCurrentTotal = cell.transformerCurrent
      ? Number(getMaterialById(materials, 'tt', cell.transformerCurrent.id)?.price || 0) * 3
      : 0;

    totalCost += transformerCurrentTotal;

    // Умножаем на количество
    const totalWithQuantity = totalCost * (cell.count || 1);

    setTotal(totalWithQuantity);
  };

  // --- Новый useMemo для foundCalculations ---
  const foundCalculations = useMemo(() => {
    // Получаем ID всех материалов ячейки
    const tempBreakerId = cell.breaker?.id;
    const tempRzaId = cell.rza?.id;
    const tempDisconnectorId =
      cell.purpose === 'Секционный разьединитель' ? cell.breaker?.id : undefined;
    const tempPuId = cell.meterType?.id;
    const tempTsnId = cell.transformerPower?.id;
    const tempTnId = cell.transformerVoltage?.id;

    // Находим подходящие калькуляции
    const {
      breakerCalculation,
      rzaCalculation,
      disconnectorCalculation,
      puCalculation,
      tsnCalculation,
      tnCalculation,
    } =
      findMatchingCalculation(
        tempBreakerId || '',
        tempRzaId,
        tempDisconnectorId,
        tempPuId,
        tempTsnId,
        tempTnId
      ) || {};

    // Если не нашли калькуляцию ПУ по ID, ищем по типу калькуляции
    let finalPuCalculation = puCalculation;
    if (!puCalculation && tempPuId) {
      finalPuCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'pu');
    }

    // Если не нашли калькуляцию разъединителя по ID, ищем по типу калькуляции
    let finalDisconnectorCalculation = disconnectorCalculation;
    if (!disconnectorCalculation && tempDisconnectorId) {
      finalDisconnectorCalculation = calculations.cell.find(
        (calc) => calc.data?.cellConfig?.type === 'disconnector'
      );
    }

    // Если не нашли калькуляцию ТН по ID, ищем по типу калькуляции
    let finalTnCalculation = tnCalculation;
    if (!tnCalculation && tempTnId) {
      finalTnCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'tn');
    }
    if (!finalTnCalculation && cell.purpose === 'Трансформатор напряжения') {
      finalTnCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'tn');
    }

    // Если не нашли калькуляцию ТСН по ID, ищем по типу калькуляции
    let finalTsnCalculation = tsnCalculation;
    if (!tsnCalculation && tempTsnId) {
      finalTsnCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'tsn');
    }
    if (!finalTsnCalculation && cell.purpose === 'Трансформатор собственных нужд') {
      finalTsnCalculation = calculations.cell.find((calc) => calc.data?.cellConfig?.type === 'tsn');
    }

    // Определяем тип ячейки на основе найденных калькуляций
    let cellType = 'Выключатель'; // По умолчанию
    if (finalPuCalculation) {
      cellType = 'ПУ';
    } else if (finalDisconnectorCalculation) {
      cellType = 'Разъединитель';
    } else if (finalTsnCalculation) {
      cellType = 'ТСН';
    } else if (finalTnCalculation) {
      cellType = 'ТН';
    } else if (breakerCalculation) {
      cellType = 'Выключатель';
    }
    if (cell.purpose === 'Секционный разьединитель') {
      cellType = 'Разъединитель';
    } else if (cell.purpose === 'Трансформатор собственных нужд') {
      cellType = 'ТСН';
    } else if (cell.purpose === 'Трансформатор напряжения') {
      cellType = 'ТН';
    } else if (cell.meterType && !finalPuCalculation) {
      cellType = 'ПУ';
    } else if (
      cell.purpose === 'Ввод' &&
      !finalPuCalculation &&
      !finalTsnCalculation &&
      !finalTnCalculation
    ) {
      cellType = 'Выключатель';
    }

    return {
      breakerCalculation,
      rzaCalculation,
      disconnectorCalculation: finalDisconnectorCalculation,
      puCalculation: finalPuCalculation,
      tsnCalculation: finalTsnCalculation,
      tnCalculation: finalTnCalculation,
      cellType,
    };
  }, [cell, calculations.cell]);

  useEffect(() => {
    calculateTotal();
  }, [
    cell.breaker,
    cell.rza,
    cell.meterType,
    cell.transformer,
    cell.transformerCurrent,
    cell.transformerVoltage,
    cell.transformerPower,
    cell.count,
    cell.purpose,
    calculations.cell,
    currentCalculation,
    selectedCalculationName,
    selectedGroupName,
    materials,
  ]);

  return {
    total,
    currentCalculation,
    calculations,
    rzaCalculation: rzaCalc,
    foundCalculations,
  };
};
