import { useEffect, useState, useMemo } from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { RusnCell } from '@/store/useRusnStore';
import { RusnMaterials } from '@/utils/rusnMaterials';
import { useRusnCalculation } from './useRusnCalculation';
import { getRusnMaterialById } from '@/utils/rusnMaterials';
import { calculateCost, CalculationData } from '@/utils/calculationUtils';

interface UseCellCalculationProps {
  cell: RusnCell;
  materials: RusnMaterials;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
  onUpdate?: (id: string, field: keyof RusnCell, value: RusnCell[keyof RusnCell]) => void;
}

export const useCellCalculation = ({
  cell,
  materials,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
  onUpdate,
}: UseCellCalculationProps) => {
  const { calculations, calculateCellTotal } = useRusnCalculation(groupSlug);
  const { global } = useRusnStore();
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
  
  // Детализация расчета для 8DJH (L)
  const [dj8hLBreakdown, setDj8hLBreakdown] = useState<{
    baseL: number;
    rzaL: number;
    totalL: number;
    baseLName?: string;
    rzaLName?: string;
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

    // Специальная логика для Камера Siemens 8DJH
    if (cell.purpose === 'Камера Siemens 8DJH') {
      const siemens8DJH_R = (cell as any).siemens8DJH_R || 0;
      const siemens8DJH_L = (cell as any).siemens8DJH_L || 0;
      
      console.log('[Siemens 8DJH] Количества:', { siemens8DJH_R, siemens8DJH_L });
      console.log('[Siemens 8DJH] Доступные калькуляции:', calculations.cell.map(c => c.name));
      console.log('[Siemens 8DJH] Все калькуляции с деталями:', calculations.cell.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        data: c.data
      })));
      
      // Находим калькуляции для 8DJH (R) и 8DJH (L)
      const calculationR = calculations.cell.find(calc => calc.name === '8DJH (R) ');
      const calculationL = calculations.cell.find(calc => calc.name === '8DJH (L)');
      // Находим дополнительную калькуляцию для 8DJH (L) РЗиА
      // Ищем калькуляцию, содержащую "8DJH (L) РЗиА" в названии
      const calculationLRza = calculations.cell.find(calc => 
        calc.name.includes('8DJH (L) РЗиА')
      );
      
      console.log('[Siemens 8DJH] Найденные калькуляции:', { 
        calculationR: !!calculationR, 
        calculationL: !!calculationL,
        calculationLRza: !!calculationLRza
      });
      
      let totalR = 0;
      let totalL = 0;
      
      if (calculationR) {
        totalR = calculateCellTotal(calculationR.id);
        console.log('[Siemens 8DJH] Цена R:', totalR);
      }
      
      // Для 8DJH (L) суммируем две калькуляции: "8DJH (L)" и "8DJH (L) РЗиА "
      if (calculationL) {
        const baseL = calculateCellTotal(calculationL.id);
        console.log('[Siemens 8DJH] Цена L (базовая):', baseL);
        
        // Добавляем стоимость РЗиА, если калькуляция найдена
        let rzaCost = 0;
        if (calculationLRza) {
          rzaCost = calculateCellTotal(calculationLRza.id);
          console.log('[Siemens 8DJH] Цена L РЗиА:', rzaCost);
        }
        
        // Суммируем обе калькуляции для одной штуки 8DJH (L)
        totalL = baseL + rzaCost;
        console.log('[Siemens 8DJH] Цена L (итого за 1 штуку):', totalL);
        
        // Сохраняем детализацию для отображения в UI
        if (siemens8DJH_L > 0) {
          setDj8hLBreakdown({
            baseL,
            rzaL: rzaCost,
            totalL,
            baseLName: calculationL.name,
            rzaLName: calculationLRza?.name,
          });
        } else {
          setDj8hLBreakdown(null);
        }
      } else {
        setDj8hLBreakdown(null);
      }
      
      const grandTotal = (totalR * siemens8DJH_R) + (totalL * siemens8DJH_L);
      console.log('[Siemens 8DJH] Итоговая цена:', grandTotal);
      setTotal(grandTotal);
      return;
    }

    // Специальная логика для Кабельная перемычка
    if (cell.purpose === 'Кабельная перемычка') {
      // Получаем трансформатор из store
      const selectedTransformer = useTransformerStore.getState().selectedTransformer;
      
      console.log('[Кабельная перемычка] Трансформатор из store:', selectedTransformer);
      
      // Определяем тип перемычки на основе напряжения трансформатора
      let calculationName = '';
      if (selectedTransformer?.voltage === '10') {
        calculationName = 'Кабельная перемычка 10кВ';
      } else if (selectedTransformer?.voltage === '20') {
        calculationName = 'Кабельная перемычка 20кВ';
      }
      
      console.log('[Кабельная перемычка] Имя калькуляции:', calculationName);
      
      if (calculationName) {
        const calculation = calculations.cell.find(calc => calc.name === calculationName);
        console.log('[Кабельная перемычка] Найденная калькуляция:', !!calculation);
        
        if (calculation) {
          const price = calculateCellTotal(calculation.id);
          const quantity = cell.count || 1;
          const total = price * quantity;
          
          console.log('[Кабельная перемычка] Цена:', price, 'Количество:', quantity, 'Итого:', total);
          setTotal(total);
          return;
        }
      }
      
      // Если не нашли подходящую калькуляцию, устанавливаем 0
      setTotal(0);
      return;
    }

    // Специальная логика для Изоляционный адаптер
    if (cell.purpose === 'Изоляционный адаптер') {
      console.log('[Изоляционный адаптер] Начинаем расчет');
      console.log('[Изоляционный адаптер] Тип ячейки:', cell.cellType);
      
      // Находим калькуляцию для Изоляционный адаптер по типу ячейки
      const calculation = calculations.cell.find(calc => calc.name === cell.cellType);
      console.log('[Изоляционный адаптер] Найденная калькуляция:', !!calculation, 'Название:', calculation?.name);
      
      if (calculation) {
        const price = calculateCellTotal(calculation.id);
        const quantity = cell.count || 1;
        const total = price * quantity;
        
        console.log('[Изоляционный адаптер] Цена:', price, 'Количество:', quantity, 'Итого:', total);
        setTotal(total);
        return;
      }
      
      // Если не нашли подходящую калькуляцию, устанавливаем 0
      console.log('[Изоляционный адаптер] Калькуляция не найдена, устанавливаем 0');
      setTotal(0);
      return;
    }

    // Получаем ID всех материалов ячейки
    const tempBreakerId = cell.breaker?.id;
    const tempRzaId = cell.rza?.id;
    const tempDisconnectorId =
      cell.purpose === 'Секционный разьединитель' ? cell.sr?.id : undefined;
    const tempPuId = cell.meterType?.id;
    const tempTsnId = cell.transformerPower?.id;
    const tempTnId = cell.transformerVoltage?.id;

    // Специальный режим для КСО 366: статическая калькуляция без материалов
    if (global.bodyType === 'Камера КСО 366') {
      // Если cellType пустой (для селектора типа разъединителя), не выполняем расчеты
      if (!cell.cellType) {
        return {
          total: 0,
          currentCalculation: '',
          isCalculating: false,
          calculations: [],
        };
      }
      const ksoCandidates = (calculations.cell || []).filter((c) => {
        const name = c.name?.toLowerCase() || '';
        return name.includes('ксо-366') || name.includes('ксо 366');
      });

      if (ksoCandidates.length) {
        let preferred = ksoCandidates[0];

        // Карта предпочтительных калькуляций по назначению для КСО-366
        const preferredByPurpose: Record<string, number> = {
          'Ввод': 38,
          'Отходящая': 38,
          'Трансформаторная': 41,
        };

        // Специальная логика для секционных разъединителей
        if (cell.purpose === 'Секционный разьединитель' && cell.cellType) {
          if (cell.cellType === 'Камера КСО 366-13') {
            // Для КСО 366-13 используем калькуляцию с ID 39
            const kso13Calc = ksoCandidates.find((c) => c.id === 39);
            if (kso13Calc) preferred = kso13Calc;
          } else if (cell.cellType === 'Камера КСО 366 ШМР 14, 15') {
            // Для КСО 366 ШМР используем калькуляцию с ID 42 (основная часть)
            const ksoShmrCalc = ksoCandidates.find((c) => c.id === 42);
            if (ksoShmrCalc) preferred = ksoShmrCalc;
          }
        } else {
          // Применяем общую логику только если это не секционный разъединитель
          const preferredId = preferredByPurpose[cell.purpose];
          if (preferredId) {
            const byId = ksoCandidates.find((c) => c.id === preferredId);
            if (byId) preferred = byId;
          }
        }

        // Фолбэк: для «Ввод» ищем по слову в названии
        if (cell.purpose === 'Ввод') {
          const byName = ksoCandidates.find((c) => (c.name || '').toLowerCase().includes('ввод'));
          if (byName) preferred = byName;
        }

        // Временные логи для диагностики выбора калькуляции КСО-366

        const calcData: CalculationData = {
          hourlyRate: preferred.data.calculation?.hourlyRate || 1000,
          manufacturingHours: preferred.data.calculation?.manufacturingHours || 4,
          overheadPercentage: preferred.data.calculation?.overheadPercentage || 15,
          adminPercentage: preferred.data.calculation?.adminPercentage || 10,
          plannedProfitPercentage: preferred.data.calculation?.plannedProfitPercentage || 20,
          ndsPercentage: preferred.data.calculation?.ndsPercentage || 12,
        };
        let base = preferred.data.categories.reduce(
          (sum: number, category: { items: Array<{ price: number; quantity: number }> }) =>
            sum +
            category.items.reduce(
              (itemSum: number, item: { price: number; quantity: number }) =>
                itemSum + item.price * item.quantity,
              0
            ),
          0
        );

        // Для КСО 366 ШМР добавляем дополнительную калькуляцию с ID 44
        if (cell.cellType === 'Камера КСО 366 ШМР 14, 15') {
          const additionalCalc = ksoCandidates.find((c) => c.id === 44);
          if (additionalCalc && onUpdate) {
            // Рассчитываем полную стоимость дополнительной калькуляции
            const additionalBase = additionalCalc.data.categories.reduce(
              (sum: number, category: { items: Array<{ price: number; quantity: number }> }) =>
                sum +
                category.items.reduce(
                  (itemSum: number, item: { price: number; quantity: number }) =>
                    itemSum + item.price * item.quantity,
                  0
                ),
              0
            );
            
            // Рассчитываем полную стоимость дополнительной калькуляции с наценками
            const additionalCalcData: CalculationData = {
              hourlyRate: additionalCalc.data.calculation?.hourlyRate || 2000,
              manufacturingHours: additionalCalc.data.calculation?.manufacturingHours || 25,
              overheadPercentage: additionalCalc.data.calculation?.overheadPercentage || 10,
              adminPercentage: additionalCalc.data.calculation?.adminPercentage || 15,
              plannedProfitPercentage: additionalCalc.data.calculation?.plannedProfitPercentage || 10,
              ndsPercentage: additionalCalc.data.calculation?.ndsPercentage || 12,
            };
            
            const { finalPrice: additionalFinalPrice } = calculateCost(additionalBase, additionalCalcData, 0);
            
            // Рассчитываем итоговую стоимость основной калькуляции
            const { finalPrice: mainFinalPrice } = calculateCost(base, calcData, 0);
            
            // Складываем итоговые стоимости
            const totalFinalPrice = mainFinalPrice + additionalFinalPrice;
            
            // Сохраняем разбивку для отображения
            onUpdate(cell.id, 'calculationBreakdown', {
              main: {
                name: 'Камера КСО 366-14, 15 (Секционная с разъединителем)',
                price: mainFinalPrice
              },
              additional: {
                name: 'Шинный мост с разъединителем',
                price: additionalFinalPrice
              },
              total: totalFinalPrice
            });
            
            // Обновляем base для дальнейшего расчета
            base = totalFinalPrice;
          }
        }

        // Для КСО 366 ШМР используем calculationBreakdown.total напрямую
        if (cell.cellType === 'Камера КСО 366 ШМР 14, 15' && cell.calculationBreakdown) {
          const result = cell.calculationBreakdown.total * (cell.count || 1);
          
          if (total !== result) {
            setTotal(result);
          }
          if (currentCalculation !== preferred.name) {
            setCurrentCalculation(preferred.name);
          }
          return;
        }

        // Простой расчет для всех типов ячеек
        const { finalPrice } = calculateCost(base, calcData, 0);
        const result = finalPrice * (cell.count || 1);
        
        
        if (total !== result) {
          setTotal(result);
        }
        if (currentCalculation !== preferred.name) {
          setCurrentCalculation(preferred.name);
        }
        return;
      }
    }

    // Если у ячейки нет материалов, возвращаем 0
    if (!tempBreakerId && !tempRzaId && !tempDisconnectorId && !tempPuId && !tempTsnId && !tempTnId) {
      if (total !== 0) {
        setTotal(0);
      }
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
      if (currentCalculation !== mainCalculation.name) {
        setCurrentCalculation(mainCalculation.name);
      }
    } else if (selectedGroupName && selectedCalculationName) {
      const cellCalculation = calculations.cell.find((c) => c.name === selectedCalculationName);
      if (cellCalculation) {
        newCalculationName = cellCalculation.name;
        if (currentCalculation !== cellCalculation.name) {
          setCurrentCalculation(cellCalculation.name);
        }
      }
    }

    const currentCalc = calculations.cell.find((c) => c.name === newCalculationName);
    if (!currentCalc) return;

    setRzaCalc((prev) => (prev?.id === rzaCalculation?.id ? prev : rzaCalculation || null));

   

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
        getRusnMaterialById(materials, materialType, materialId)?.price || 0
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
      ? Number(getRusnMaterialById(materials, 'tt', cell.transformerCurrent.id)?.price || 0) * 3
      : 0;

    totalCost += transformerCurrentTotal;

    // Умножаем на количество
    const totalWithQuantity = totalCost * (cell.count || 1);

    if (total !== totalWithQuantity) {
      setTotal(totalWithQuantity);
    }
  };

  // --- Новый useMemo для foundCalculations ---
  const foundCalculations = useMemo(() => {
    // Получаем ID всех материалов ячейки
    const tempBreakerId = cell.breaker?.id;
    const tempRzaId = cell.rza?.id;
    const tempDisconnectorId =
      cell.purpose === 'Секционный разьединитель' ? cell.sr?.id : undefined;
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
  }, [cell, calculations.cell, cell.cellType]);

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
    cell.cellType,
    calculations.cell,
    selectedCalculationName,
    selectedGroupName,
    // Добавляем зависимости для Siemens 8DJH
    (cell as any).siemens8DJH_R,
    (cell as any).siemens8DJH_L,
    // Добавляем зависимость от store трансформатора для Кабельная перемычка
    useTransformerStore.getState().selectedTransformer,
    materials,
  ]);

  return {
    total,
    currentCalculation,
    calculations,
    rzaCalculation: rzaCalc,
    foundCalculations,
    dj8hLBreakdown, // Детализация расчета для 8DJH (L)
  };
};
