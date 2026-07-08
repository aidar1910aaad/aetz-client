import { useEffect, useState, useMemo } from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { RusnCell } from '@/store/useRusnStore';
import { RusnMaterials } from '@/utils/rusnMaterials';
import { useRusnCalculation } from './useRusnCalculation';
import { getRusnMaterialById } from '@/utils/rusnMaterials';
import { calculateCost, CalculationData } from '@/utils/calculationUtils';
import { applyApiCalculationRates } from '@/utils/calculationSettings';
import { resolveRusnCellCalculations } from '@/domain/rusn/calculationMatcher';
import { findKsoA12BhaCalculation } from '@/domain/rusn/bhaCalculation';
import {
  KSO_366_CALCULATION_IDS,
  KSO_366_CELL_TYPE,
  RUSN_CAMERA,
  RUSN_CELL_PURPOSE,
  SIEMENS_8DJH_CALCULATION_NAMES,
  findKsoA17ZsshCalculation,
  findKsoA17BusbarGroundingCalculation,
} from '@/domain/rusn/rusnConstants';

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
  const { calculations, calculateCellTotal, settingsRates } = useRusnCalculation(groupSlug);
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

  const getApiBackedCalculationData = (
    calculation?: {
      manufacturingHours?: number;
    },
    fallbackManufacturingHours = 4
  ): CalculationData =>
    applyApiCalculationRates(
      {
        manufacturingHours: calculation?.manufacturingHours ?? fallbackManufacturingHours,
      },
      settingsRates
    );

  const calculateTotal = () => {
    let newCalculationName = currentCalculation;

    // Специальная логика для Камера Siemens 8DJH
    if (cell.purpose === RUSN_CELL_PURPOSE.SIEMENS_8DJH) {
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
      const calculationR = calculations.cell.find(
        (calc) => calc.name === SIEMENS_8DJH_CALCULATION_NAMES.R
      );
      const calculationL = calculations.cell.find(
        (calc) => calc.name === SIEMENS_8DJH_CALCULATION_NAMES.L
      );
      // Находим дополнительную калькуляцию для 8DJH (L) РЗиА
      // Ищем калькуляцию, содержащую "8DJH (L) РЗиА" в названии
      const calculationLRza = calculations.cell.find(calc => 
        calc.name.includes(SIEMENS_8DJH_CALCULATION_NAMES.L_RZA_TOKEN)
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
    if (cell.purpose === RUSN_CELL_PURPOSE.CABLE_JUMPER) {
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
    if (cell.purpose === RUSN_CELL_PURPOSE.INSULATION_ADAPTER) {
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

    // Режим BHA для КСО А12-10: фиксированная калькуляция по slug
    if (global.bodyType === RUSN_CAMERA.KSO_A12_10 && cell.bhaMode) {
      const bhaCalculation = findKsoA12BhaCalculation(calculations.cell, cell.purpose);

      if (bhaCalculation) {
        const price = calculateCellTotal(bhaCalculation.id);
        const result = price * (cell.count || 1);

        if (total !== result) {
          setTotal(result);
        }
        if (currentCalculation !== bhaCalculation.name) {
          setCurrentCalculation(bhaCalculation.name);
        }
        if (onUpdate && cell.calculationId !== bhaCalculation.id) {
          onUpdate(cell.id, 'calculationId', bhaCalculation.id);
        }
        setRzaCalc(null);
        return;
      }

      if (total !== 0) {
        setTotal(0);
      }
      if (currentCalculation !== '') {
        setCurrentCalculation('');
      }
      return;
    }

    // Ячейка ТН с ЗСШ для КСО А17-20: база ЗСШ + выбранные ТН и РЗА
    if (
      global.bodyType === RUSN_CAMERA.KSO_A17_20 &&
      cell.purpose === RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER_ZSSH
    ) {
      const tempTnId = cell.transformerVoltage?.id;
      const tempRzaId = cell.rza?.id;

      if (!tempTnId && !tempRzaId) {
        if (total !== 0) {
          setTotal(0);
        }
        if (currentCalculation !== '') {
          setCurrentCalculation('');
        }
        setRzaCalc(null);
        return;
      }

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

        const calculationData = getApiBackedCalculationData(calculation.data.calculation);
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

        return calculateCost(materialsTotal, calculationData, selectedMaterialsTotal).finalPrice;
      };

      let totalCost = 0;
      const zsshCalculation = findKsoA17ZsshCalculation(calculations.cell);

      if (zsshCalculation) {
        const calcData = getApiBackedCalculationData(zsshCalculation.data.calculation);
        const base = zsshCalculation.data.categories.reduce(
          (sum: number, category: { items: Array<{ price: number; quantity: number }> }) =>
            sum +
            category.items.reduce(
              (itemSum: number, item: { price: number; quantity: number }) =>
                itemSum + item.price * item.quantity,
              0
            ),
          0
        );
        totalCost += calculateCost(base, calcData, 0).finalPrice;
      }

      const { rzaCalculation, tnCalculation } = resolveRusnCellCalculations(
        calculations.cell,
        {
          breakerId: undefined,
          rzaId: tempRzaId,
          disconnectorId: undefined,
          puId: undefined,
          tsnId: undefined,
          tnId: tempTnId,
        },
        cell.purpose,
        false,
        global.bodyType
      );

      if (tempTnId && tnCalculation) {
        totalCost += calculateMaterialCost(tnCalculation, tempTnId, 'tn');
      }

      if (tempRzaId && rzaCalculation) {
        totalCost += calculateMaterialCost(rzaCalculation, tempRzaId, 'rza');
      }

      const result = totalCost * (cell.count || 1);

      if (total !== result) {
        setTotal(result);
      }
      if (currentCalculation !== 'Камера КСО-А17-20 500x1450 (ТН с ЗСШ)') {
        setCurrentCalculation('Камера КСО-А17-20 500x1450 (ТН с ЗСШ)');
      }
      setRzaCalc((prev) => (prev?.id === rzaCalculation?.id ? prev : rzaCalculation || null));
      return;
    }

    // Заземление сборных шин для КСО А17-20: фиксированная калькуляция
    if (
      global.bodyType === RUSN_CAMERA.KSO_A17_20 &&
      cell.purpose === RUSN_CELL_PURPOSE.BUSBAR_GROUNDING
    ) {
      const groundingCalculation = findKsoA17BusbarGroundingCalculation(calculations.cell);

      if (groundingCalculation) {
        const price = calculateCellTotal(groundingCalculation.id);
        const result = price * (cell.count || 1);

        if (total !== result) {
          setTotal(result);
        }
        if (currentCalculation !== groundingCalculation.name) {
          setCurrentCalculation(groundingCalculation.name);
        }
        setRzaCalc(null);
        return;
      }

      if (total !== 0) {
        setTotal(0);
      }
      return;
    }

    // Получаем ID всех материалов ячейки
    const tempBreakerId = cell.breaker?.id;
    const tempRzaId = cell.rza?.id;
    const tempDisconnectorId =
      cell.purpose === RUSN_CELL_PURPOSE.SECTION_DISCONNECTOR ? cell.sr?.id : undefined;
    const tempPuId = cell.meterType?.id;
    const tempTsnId = cell.transformerPower?.id;
    const tempTnId = cell.transformerVoltage?.id;

    // Специальный режим для КСО 366: статическая калькуляция без материалов
    if (global.bodyType === RUSN_CAMERA.KSO_366) {
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
          [RUSN_CELL_PURPOSE.INPUT]: KSO_366_CALCULATION_IDS.INPUT_OR_OUTGOING,
          [RUSN_CELL_PURPOSE.OUTGOING]: KSO_366_CALCULATION_IDS.INPUT_OR_OUTGOING,
          [RUSN_CELL_PURPOSE.TRANSFORMER]: KSO_366_CALCULATION_IDS.TRANSFORMER,
        };

        // Специальная логика для секционных разъединителей
        if (cell.purpose === RUSN_CELL_PURPOSE.SECTION_DISCONNECTOR && cell.cellType) {
          if (cell.cellType === KSO_366_CELL_TYPE.KSO_13) {
            // Для КСО 366-13 используем калькуляцию с ID 39
            const kso13Calc = ksoCandidates.find((c) => c.id === KSO_366_CALCULATION_IDS.KSO_13);
            if (kso13Calc) preferred = kso13Calc;
          } else if (cell.cellType === KSO_366_CELL_TYPE.SHMR_14_15) {
            // Для КСО 366 ШМР используем калькуляцию с ID 42 (основная часть)
            const ksoShmrCalc = ksoCandidates.find(
              (c) => c.id === KSO_366_CALCULATION_IDS.SHMR_MAIN
            );
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
        if (cell.purpose === RUSN_CELL_PURPOSE.INPUT) {
          const byName = ksoCandidates.find((c) => (c.name || '').toLowerCase().includes('ввод'));
          if (byName) preferred = byName;
        }

        // Временные логи для диагностики выбора калькуляции КСО-366

        const calcData = getApiBackedCalculationData(preferred.data.calculation);
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
        if (cell.cellType === KSO_366_CELL_TYPE.SHMR_14_15) {
          const additionalCalc = ksoCandidates.find(
            (c) => c.id === KSO_366_CALCULATION_IDS.SHMR_ADDITIONAL
          );
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
            const additionalCalcData = getApiBackedCalculationData(
              additionalCalc.data.calculation,
              25
            );
            
            const { finalPrice: additionalFinalPrice } = calculateCost(additionalBase, additionalCalcData, 0);
            
            // Рассчитываем итоговую стоимость основной калькуляции
            const { finalPrice: mainFinalPrice } = calculateCost(base, calcData, 0);
            
            // Складываем итоговые стоимости
            const totalFinalPrice = mainFinalPrice + additionalFinalPrice;
            const nextBreakdown = {
              main: {
                name: 'Камера КСО 366-14, 15 (Секционная с разъединителем)',
                price: mainFinalPrice,
              },
              additional: {
                name: 'Шинный мост с разъединителем',
                price: additionalFinalPrice,
              },
              total: totalFinalPrice,
            };

            if (
              !cell.calculationBreakdown ||
              JSON.stringify(cell.calculationBreakdown) !== JSON.stringify(nextBreakdown)
            ) {
              onUpdate(cell.id, 'calculationBreakdown', nextBreakdown);
            }
            
            // Обновляем base для дальнейшего расчета
            base = totalFinalPrice;
          }
        }

        // Для КСО 366 ШМР используем calculationBreakdown.total напрямую
        if (cell.cellType === KSO_366_CELL_TYPE.SHMR_14_15 && cell.calculationBreakdown) {
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

    const {
      breakerCalculation,
      rzaCalculation,
      disconnectorCalculation: finalDisconnectorCalculation,
      puCalculation: finalPuCalculation,
      tsnCalculation: finalTsnCalculation,
      tnCalculation: finalTnCalculation,
    } = resolveRusnCellCalculations(
      calculations.cell,
      {
        breakerId: tempBreakerId,
        rzaId: tempRzaId,
        disconnectorId: tempDisconnectorId,
        puId: tempPuId,
        tsnId: tempTsnId,
        tnId: tempTnId,
      },
      cell.purpose,
      Boolean(cell.meterType),
      global.bodyType
    );

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

      const calculationData = getApiBackedCalculationData(calculation.data.calculation);

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

  const foundCalculations = useMemo(() => {
    if (global.bodyType === RUSN_CAMERA.KSO_A12_10 && cell.bhaMode) {
      return { cellType: 'BHA' };
    }

    const tempBreakerId = cell.breaker?.id;
    const tempRzaId = cell.rza?.id;
    const tempDisconnectorId =
      cell.purpose === RUSN_CELL_PURPOSE.SECTION_DISCONNECTOR ? cell.sr?.id : undefined;
    const tempPuId = cell.meterType?.id;
    const tempTsnId = cell.transformerPower?.id;
    const tempTnId = cell.transformerVoltage?.id;

    return resolveRusnCellCalculations(
      calculations.cell,
      {
        breakerId: tempBreakerId,
        rzaId: tempRzaId,
        disconnectorId: tempDisconnectorId,
        puId: tempPuId,
        tsnId: tempTsnId,
        tnId: tempTnId,
      },
      cell.purpose,
      Boolean(cell.meterType),
      global.bodyType
    );
  }, [
    calculations.cell,
    cell.breaker?.id,
    cell.rza?.id,
    cell.sr?.id,
    cell.meterType?.id,
    cell.transformerPower?.id,
    cell.transformerVoltage?.id,
    cell.purpose,
    cell.bhaMode,
    global.bodyType,
  ]);

  useEffect(() => {
    calculateTotal();
  }, [
    cell.bhaMode,
    cell.breaker,
    cell.sr,
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
    settingsRates,
    global.bodyType,
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
