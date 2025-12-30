'use client';

import { useRunnStore, type RunnCellSummary } from '@/store/useRunnStore';
import { useCellSummariesStore } from '@/store/useCellSummariesStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import TogglerWithInput from './TogglerWithInput';
import OutgoingCellSection from './components/cells/OutgoingCellSection';
import { useState, useEffect, useRef } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import { useRunnBreakerCalculation, useRunnCounterCalculation, useRunnSectionSwitchCalculation, useRunnOutgoingCalculation, useRunnTorcevaiaCalculation } from '@/hooks/useRunnInputCalculation';
import { useRunnMaterials } from '@/hooks/useRunnMaterials';
import { useCalculationResultsStore } from '@/store/useCalculationResultsStore';
import CalculationDisplay from './components/calculations/CalculationDisplay';
import SectionSwitchCalculation from './components/calculations/SectionSwitchCalculation';
import OutgoingCalculation from './components/calculations/OutgoingCalculation';
import { calculateCost } from '@/utils/calculationUtils';
import { getPanelNameForBreaker, extractCurrentFromBreakerName } from '@/utils/panelNameUtils';
import RunnCellSummaryTable from './components/summary/RunnCellSummaryTable';

const cellTypes = ['Ввод', 'Секционный выключатель', 'Торцевая панель'];

interface RunnCellTableProps {
  categoryMaterials?: Material[];
  autoSelectedMaterial?: Material | null;
  autoSelectedSvMaterial?: Material | null;
  meterMaterials?: Material[];
  meterMaterialsLoading?: boolean;
  rpsLeftMaterials?: Material[];
  fusesPnMaterials?: Material[];
  avtomatLityMaterials?: Material[];
}

export default function RunnCellTable({
  categoryMaterials = [],
  autoSelectedMaterial,
  autoSelectedSvMaterial,
  meterMaterials = [],
  meterMaterialsLoading = false,
  rpsLeftMaterials = [],
  fusesPnMaterials = [],
  avtomatLityMaterials = [],
}: RunnCellTableProps = {}) {
  const { cellConfigs, addCell, updateCell, removeCell } = useRunnStore();
  const { setCellSummary, removeCellSummary, clearCellSummaries } = useCellSummariesStore();
  const { selectedTransformer } = useTransformerStore();
  const [openCellMap, setOpenCellMap] = useState<Record<string, string>>({});
  const { materials: runnMaterials } = useRunnMaterials();
  const { results: calculationResults, updateCellResult } = useCalculationResultsStore();


  // Находим ячейку "Ввод" и получаем её калькуляции
  const inputCell = cellConfigs.find(cell => cell.purpose === 'Ввод');
  const { calculation: breakerCalculation, loading: breakerCalculationLoading, error: breakerCalculationError } = useRunnBreakerCalculation(inputCell || null);
  const { calculation: counterCalculation, loading: counterCalculationLoading, error: counterCalculationError } = useRunnCounterCalculation(inputCell || null);

  // Находим ячейку "Секционный выключатель" и получаем её калькуляцию
  const sectionSwitchCell = cellConfigs.find(cell => cell.purpose === 'Секционный выключатель');
  const { calculation: sectionSwitchCalculation, loading: sectionSwitchCalculationLoading, error: sectionSwitchCalculationError } = useRunnSectionSwitchCalculation(sectionSwitchCell || null, inputCell || null);

  // Находим ячейку "Торцевая панель" и получаем её калькуляцию
  const torcevaiaCell = cellConfigs.find(cell => cell.purpose === 'Торцевая панель');
  const { calculation: torcevaiaCalculation, loading: torcevaiaCalculationLoading, error: torcevaiaCalculationError } = useRunnTorcevaiaCalculation(torcevaiaCell || null);

  // Находим все отходящие ячейки
  const outgoingCells = cellConfigs.filter(cell => cell.purpose.includes('Отходящая'));
  











  const prevCellConfigsRef = useRef<RunnCell[]>([]);
  const processedMaterialsRef = useRef<{
    vvodMaterial: string | null;
    svMaterial: string | null;
  }>({ vvodMaterial: null, svMaterial: null });

  // Получаем автоматически выбранные материалы из пропсов вместо хука
  // const { autoSelectedMaterial, autoSelectedSvMaterial } = useAutoMaterialSelection({
  //   categoryMaterials,
  //   categoryName,
  // });

  // Создаем опции автоматов из реальных материалов
  const breakerOptions = categoryMaterials.map((material) => material.name);

  // Создаем опции для ПУ из материалов счетчика
  const meterOptions = meterMaterials.map((material) => material.name);
  





  // Функция для получения selectedMaterials для ячейки (с правильным учетом количества)
  const getSelectedMaterialsForSectionSwitch = (cell: RunnCell, calculation: any) => {
    if (!calculation || !cell.breaker) return [];

    // Получаем финальную цену из калькуляции
    const materialsTotal = calculation.data.categories.reduce(
      (sum, category) =>
        sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
      0
    );

    // Получаем материалы из калькуляции
    const materials = calculation.data.cellConfig?.materials || {};
    const materialTypes = Object.keys(materials);
    
    // Рассчитываем общую стоимость выбранных материалов
    let selectedMaterialsTotal = 0;
    let selectedMaterial = null;
    
    materialTypes.forEach(type => {
      if (materials[type]?.length > 0 && type === 'withdrawable_breaker') {
        // Ищем материал по имени
        selectedMaterial = materials[type].find((material: any) => material.name === cell.breaker);
        
        if (!selectedMaterial) {
          // Если не найден по точному названию, ищем по току
          const cellCurrent = extractCurrentFromBreakerName(cell.breaker);
          if (cellCurrent) {
            selectedMaterial = materials[type].find((material: any) => {
              const materialCurrent = extractCurrentFromBreakerName(material.name);
              return materialCurrent === cellCurrent;
            });
          }
        }
        
        if (selectedMaterial) {
          selectedMaterialsTotal = selectedMaterial.price;
        }
      }
    });

    // Используем утилиту для расчета
    const calculationResult = calculateCost(
      materialsTotal,
      calculation.data.calculation,
      selectedMaterialsTotal
    );

    const finalPrice = calculationResult.finalPrice || 0;
    
    // Формируем правильное название панели для секционного выключателя (как в старой логике)
    const panelName = getPanelNameForBreaker(cell.breaker, 'Секционный выключатель');
    let fullName = `${panelName} - ${cell.breaker}`;
    
    // Добавляем АВР для секционного выключателя
    if ((cell as any).hasAVR !== false) {
      fullName += `, АВР на LOGO`;
    }
    
    return [{
      name: fullName,
      price: finalPrice,
      quantity: cell.quantity || 1
    }];
  };

  const getSelectedMaterialsForCell = (cell: RunnCell) => {
    const selectedMaterials = [];

    // Обработка торцевой панели
    if (cell.purpose === 'Торцевая панель' && torcevaiaCalculation) {
      const quantity = cell.quantity || 1;
      let totalPrice = 0;
      
      // Используем калькуляцию торцевой панели
      if (torcevaiaCalculation.data) {
        // Рассчитываем стоимость на основе калькуляции
        const materialsTotal = torcevaiaCalculation.data.categories?.reduce(
          (sum: number, category: any) =>
            sum + (category.items?.reduce((itemSum: number, item: any) => itemSum + (item.price || 0) * (item.quantity || 0), 0) || 0),
          0
        ) || 0;

        const calculationData = torcevaiaCalculation.data.calculation;
        if (calculationData) {
          const calculationResult = calculateCost(
            materialsTotal,
            calculationData,
            0 // Нет выбранных материалов
          );
          totalPrice = (calculationResult.finalPrice || 0) * quantity;
        } else {
          // Если нет данных расчета, используем финальную цену из калькуляции
          totalPrice = (torcevaiaCalculation.data.finalPrice || torcevaiaCalculation.data.totalPrice || 0) * quantity;
        }
      }

      const material = {
        name: 'Торцевая панель',
        price: totalPrice / quantity, // Цена за единицу
        quantity: quantity,
        unit: 'шт',
        type: 'torcevaia'
      };
      
      selectedMaterials.push(material);
      return selectedMaterials;
    }

    // Обработка отходящих ячеек
    if (cell.purpose === 'Отходящая') {
      // Используем ту же логику, что и в OutgoingCellSection
      const parts = [];
      const calculationName = cell.calculationName || cell.selectedCalculationName || "Панель ЩО 70-75 У3 (отходящая)";
      parts.push(calculationName);
      
      const materialParts = [];
      
      // Для "Воздушный" добавляем breaker, для других типов - нет
      if (cell.breaker && cell.switchingDevice === 'Воздушный') {
        materialParts.push(cell.breaker);
      }
      
      if (cell.meterType) {
        materialParts.push(cell.meterType);
      }
      
      if (cell.rubilniki && cell.rubilniki.length > 0) {
        cell.rubilniki.forEach(rubilnik => {
          if (rubilnik && rubilnik.trim() !== '') {
            materialParts.push(rubilnik);
          }
        });
      }
      
      if (materialParts.length > 0) {
        parts.push(materialParts.join(', '));
      }
      
      const fullName = parts.join(' - ');
      const quantity = cell.quantity || 1;
      
      // Используем реальные цены из calculationResults (только из основной калькуляции)
      let totalPrice = 0;
      const cellResults = calculationResults[cell.id];
      
      if (cellResults) {
        // Используем только mainCalculation (основная калькуляция)
        totalPrice = cellResults.mainCalculation || 0;
        // Добавляем meterCalculation если есть ПУ
        if (cell.meterType && cellResults.meterCalculation) {
          totalPrice += cellResults.meterCalculation;
        }
        // НЕ добавляем дополнительную калькуляцию, так как она уже учтена в mainCalculation
      } else {
        // Fallback: приблизительные цены
        const approximatePrice = 380000; // Базовая цена
        const meterPrice = cell.meterType ? 157000 : 0; // Цена счетчика
        totalPrice = approximatePrice + meterPrice;
      }
      
      const material = {
        name: fullName,
        price: totalPrice,
        quantity: quantity,
        unit: 'шт',
        type: 'outgoing'
      };
      
      selectedMaterials.push(material);
      
      return selectedMaterials;
    }

    // Выбираем правильную калькуляцию в зависимости от типа ячейки
    let calculation = null;
    if (cell.purpose === 'Секционный выключатель') {
      // Для секционного выключателя используем sectionSwitchCalculation только если это именно эта ячейка
      if (cell.id === sectionSwitchCell?.id) {
        calculation = sectionSwitchCalculation;
      } else {
        // Если это не основная ячейка секционного выключателя, используем breakerCalculation
        calculation = breakerCalculation;
      }
    } else {
      calculation = breakerCalculation;
    }

    // Если нет расчета или ячейки, возвращаем пустой массив
    if (!calculation || !cell || !cell.breaker) {
      return selectedMaterials;
    }

    // Добавляем только итоговую калькуляцию автомата выкатного (сумма двух калькуляций)
    if (calculation && cell.breaker) {
      let totalPrice = 0;
      let materialName = '';
      let panelName = '';
      let fullName = '';
      const cellQuantity = cell.quantity || 1;

      if (cell.purpose === 'Секционный выключатель' && calculation === sectionSwitchCalculation && calculation?.data) {
        // Для секционного выключателя используем ту же логику, что и в SectionSwitchCalculation
        const materialsTotal = calculation.data.categories.reduce(
          (sum, category) =>
            sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
          0
        );

        // Получаем все материалы из калькуляции
        const materials = calculation.data.cellConfig?.materials || {};
        const materialTypes = Object.keys(materials);
        
        // Рассчитываем общую стоимость выбранных материалов
        let selectedMaterialsTotal = 0;
        
        materialTypes.forEach(type => {
          if (materials[type]?.length > 0) {
            // Ищем материал по имени, выбранному в ячейке
            let selectedMaterial = null;
            if (type === 'molded_case_breaker' && cell.breaker) {
              // Для секционного выключателя ищем по току
              const cellCurrent = extractCurrentFromBreakerName(cell.breaker);
              if (cellCurrent) {
                selectedMaterial = materials[type].find((material: any) => {
                  const materialCurrent = extractCurrentFromBreakerName(material.name);
                  return materialCurrent === cellCurrent;
                });
              }
              
              // Если не найден по току, ищем по точному имени
              if (!selectedMaterial) {
                selectedMaterial = materials[type].find((material: any) => material.name === cell.breaker);
              }
            }
            
            // Если не найден по имени, берем первый
            if (!selectedMaterial) {
              selectedMaterial = materials[type][0];
            }
            
            selectedMaterialsTotal += selectedMaterial.price;
          }
        });

        // Используем утилиту для расчета
        const calculationResult = calculation?.data ? calculateCost(
          materialsTotal,
          calculation.data.calculation,
          selectedMaterialsTotal
        ) : null;

        // Цена за единицу (без учета количества)
        const pricePerUnit = calculationResult.finalPrice || 0;
        // Общая цена с учетом количества
        const finalPrice = pricePerUnit * cellQuantity;
        
        if (calculationResult) {
          totalPrice = finalPrice;
          materialName = breakerCalculation?.data?.cellConfig?.materials?.withdrawable_breaker?.find(
            (material: any) => material.name === cell.breaker
          )?.name || cell.breaker;
          panelName = cell.breaker ? getPanelNameForBreaker(cell.breaker, cell.purpose, calculation?.name) : calculation?.name;
          
          // Формируем название с учетом АВР
          const avrText = (cell as any).hasAVR !== false ? ', АВР на LOGO' : '';
          fullName = `${panelName} - ${materialName}${avrText}`;
        }
      } else {
        // Для вводных ячеек используем ТЕ ЖЕ калькуляции, что и в CalculationDisplay
        // Получаем цены напрямую из калькуляций, а не пересчитываем
        
        // Получаем цену автомата выкатного из breakerCalculation
        let breakerPrice = 0;
        if (breakerCalculation) {
          
          const materialsTotal = breakerCalculation.data.categories.reduce(
            (sum, category) =>
              sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
            0
          );

          // Ищем точное совпадение по названию
          let selectedBreaker = breakerCalculation.data.cellConfig?.materials?.withdrawable_breaker?.find(
            (material: any) => material.name === cell.breaker
          );
          
          // Если точного совпадения нет, ищем по току для CHINT автоматов
          if (!selectedBreaker && cell.breaker.includes('CHINT')) {
            const cellCurrent = extractCurrentFromBreakerName(cell.breaker);
            if (cellCurrent) {
              selectedBreaker = breakerCalculation.data.cellConfig?.materials?.withdrawable_breaker?.find(
                (material: any) => {
                  const materialCurrent = extractCurrentFromBreakerName(material.name);
                  return materialCurrent === cellCurrent;
                }
              );
            }
          }
          
          // Если все еще не найден, берем первый элемент
          if (!selectedBreaker) {
            selectedBreaker = breakerCalculation.data.cellConfig?.materials?.withdrawable_breaker?.[0];
          }
          
          let selectedMaterialsTotal = selectedBreaker?.price || 0;

          // Добавляем стоимость трансформатора тока
          if (runnMaterials.currentTransformer.length > 0) {
            const breakerCurrent = extractCurrentFromBreakerName(cell.breaker);
            if (breakerCurrent) {
              const matchingTransformer = findMatchingCurrentTransformer(breakerCurrent);
              if (matchingTransformer) {
                const baseTransformerQuantity = cell.meterType ? 6 : 3;
                const transformerQuantity = baseTransformerQuantity;
                const transformerTotal = parseFloat(matchingTransformer.price.toString()) * transformerQuantity;
                selectedMaterialsTotal += transformerTotal;
              }
            }
          }

          const calculationResult = calculateCost(
            materialsTotal,
            breakerCalculation.data.calculation,
            selectedMaterialsTotal
          );
          
          breakerPrice = calculationResult.finalPrice || 0;
          
        }
        
        // Получаем цену ПУ из counterCalculation
        let counterPrice = 0;
        if (counterCalculation && cell.meterType) {
          const materialsTotal = counterCalculation.data.categories.reduce(
            (sum, category) =>
              sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
            0
          );

          const selectedCounter = counterCalculation.data.cellConfig?.materials?.counter?.find(
            (material: any) => material.name === cell.meterType
          ) || counterCalculation.data.cellConfig?.materials?.counter?.[0];
          
          const selectedMaterialsTotal = selectedCounter?.price || 0;

          const calculationResult = calculateCost(
            materialsTotal,
            counterCalculation.data.calculation,
            selectedMaterialsTotal
          );
          
          counterPrice = calculationResult.finalPrice || 0;
        }
        
        // Отладочная информация
        
        // Простое суммирование (цены уже с учетом всех расчетов)
        const pricePerUnit = breakerPrice + counterPrice;
        totalPrice = pricePerUnit * cellQuantity;
        
        
        // Получаем название материала с улучшенной логикой поиска
        let selectedBreaker = breakerCalculation?.data?.cellConfig?.materials?.withdrawable_breaker?.find(
          (material: any) => material.name === cell.breaker
        );
        
        // Если точное совпадение не найдено, используем гибкое сравнение
        if (!selectedBreaker) {
          selectedBreaker = breakerCalculation?.data?.cellConfig?.materials?.withdrawable_breaker?.find(
            (material: any) => {
              // Извлекаем токи из обеих строк для сравнения
              const cellCurrent = extractCurrentFromBreakerName(cell.breaker);
              const materialCurrent = extractCurrentFromBreakerName(material.name);
              return cellCurrent && materialCurrent && cellCurrent === materialCurrent;
            }
          );
        }
        
        // Если все еще не найдено, берем первый элемент
        if (!selectedBreaker) {
          selectedBreaker = breakerCalculation?.data?.cellConfig?.materials?.withdrawable_breaker?.[0];
        }
        
        
        materialName = selectedBreaker?.name || cell.breaker;
        const counterName = counterCalculation?.data?.cellConfig?.materials?.counter?.find(
          (material: any) => material.name === cell.meterType
        )?.name || cell.meterType;
        
        // Получаем правильное название панели на основе номинала автомата
        panelName = cell.breaker ? getPanelNameForBreaker(cell.breaker, cell.purpose, breakerCalculation?.name) : breakerCalculation?.name;
        
        // Формируем название в зависимости от типа ячейки
        fullName = `${panelName} - ${materialName}`;
        
        if (cell.purpose === 'Ввод' && counterName && counterName !== 'undefined') {
          fullName += `, учет эл.эн. (${counterName})`;
        } else if (cell.purpose === 'Секционный выключатель' && (cell as any).hasAVR !== false) {
          fullName += `, АВР на LOGO`;
        }
        
      }
      
      if (totalPrice > 0) {
        // Для блока сводки ячейки передаем цену за единицу
        const pricePerUnit = totalPrice / cellQuantity;
        selectedMaterials.push({
          name: fullName,
          price: pricePerUnit, // Цена за единицу
          quantity: cellQuantity,
          unit: 'шт',
          type: cell.purpose === 'Секционный выключатель' ? 'Калькуляция секционного выключателя' : 'Калькуляция автомата выкатного',
        });
      }
    }

    return selectedMaterials;
  };

  // Используем ref для отслеживания предыдущих значений сводок
  const prevSummariesRef = useRef<Map<string, RunnCellSummary>>(new Map());

  // Оптимизированное обновление сводок - объединяем всю логику в один useEffect
  useEffect(() => {
    // Используем ref для отслеживания предыдущих значений и предотвращения лишних обновлений
    const updateSummaries = () => {
      const { cellSummaries } = useCellSummariesStore.getState();
      const summariesToUpdate: RunnCellSummary[] = [];
      const summariesToRemove: string[] = [];

      cellConfigs.forEach((cell) => {
        const selectedMaterials = getSelectedMaterialsForCell(cell);
        
        if (selectedMaterials.length > 0) {
          const material = selectedMaterials[0];
          const panelDescription = `${material.name}`;
          
          const newSummary: RunnCellSummary = {
            cellId: cell.id,
            name: panelDescription,
            quantity: material.quantity,
            pricePerUnit: material.price,
            totalPrice: material.price * material.quantity,
          };

          // Получаем предыдущую сводку для сравнения
          const prevSummary = prevSummariesRef.current.get(cell.id);
          
          // Проверяем, изменились ли данные (сравниваем только с предыдущим значением)
          const hasChanged = !prevSummary ||
              prevSummary.name !== newSummary.name ||
              prevSummary.pricePerUnit !== newSummary.pricePerUnit ||
              prevSummary.quantity !== newSummary.quantity ||
              prevSummary.totalPrice !== newSummary.totalPrice;
          
          if (hasChanged) {
            summariesToUpdate.push(newSummary);
            prevSummariesRef.current.set(cell.id, newSummary);
          }
        } else {
          // Удаляем сводку только если она существует
          if (cellSummaries.some(s => s.cellId === cell.id)) {
            summariesToRemove.push(cell.id);
            prevSummariesRef.current.delete(cell.id);
          }
        }
      });

      // Батчинг обновлений - обновляем все сводки за один раз
      summariesToRemove.forEach(cellId => removeCellSummary(cellId));
      summariesToUpdate.forEach(summary => setCellSummary(summary));
    };

    // Запускаем обновление с небольшой задержкой для батчинга изменений
    const timeoutId = setTimeout(() => {
      updateSummaries();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [
    cellConfigs,
    breakerCalculation?.data?.calculation,
    breakerCalculation?.data?.cellConfig,
    counterCalculation?.data?.calculation,
    counterCalculation?.data?.cellConfig,
    sectionSwitchCalculation?.data?.calculation,
    sectionSwitchCalculation?.data?.cellConfig,
    torcevaiaCalculation?.data?.calculation,
    torcevaiaCalculation?.data?.cellConfig,
    runnMaterials?.currentTransformer,
    inputCell?.breaker,
    inputCell?.meterType,
    inputCell?.quantity,
  ]);


  // Функция для загрузки материалов категории 8907

  // Функция для извлечения ампеража из названия автомата
  const extractCurrentFromBreakerName = (breakerName: string): number | null => {
    if (!breakerName) return null;
    
    // Ищем ток в формате "2500A", "2500 A", "2500А", "2500 А"
    const patterns = [
      /(\d+)\s*A\b/i,  // 2500 A
      /(\d+)A\b/i,     // 2500A
      /(\d+)\s*А\b/i,  // 2500 А
      /(\d+)А\b/i,     // 2500А
      /(\d+)\s*[AaАа]\b/i,  // 2500 A (любая буква A)
      /(\d+)[AaАа]\b/i,     // 2500A (любая буква A)
    ];
    
    for (const pattern of patterns) {
      const match = breakerName.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    return null;
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
  const findMatchingCurrentTransformer = (requiredCurrent: number): Material | null => {
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


  // Инициализируем openCellMap на основе существующих ячеек
  useEffect(() => {
    // Проверяем, изменились ли cellConfigs
    const cellConfigsChanged =
      JSON.stringify(cellConfigs) !== JSON.stringify(prevCellConfigsRef.current);

    if (cellConfigsChanged) {
      // Обновляем openCellMap на основе существующих ячеек
      const newOpenCellMap: Record<string, string> = {};
      cellConfigs.forEach((cell) => {
        if (cell.purpose === 'Ввод' || cell.purpose === 'Секционный выключатель' || cell.purpose === 'Торцевая панель') {
          newOpenCellMap[cell.purpose] = cell.id;
        }
      });
      setOpenCellMap(newOpenCellMap);
      prevCellConfigsRef.current = cellConfigs;
    }
  }, [cellConfigs]);


  // Автоматически создаем ячейку "Ввод" при наличии autoSelectedMaterial
  useEffect(() => {
    if (autoSelectedMaterial && !cellConfigs.find((c) => c.purpose === 'Ввод')) {
      const vvodId = crypto.randomUUID();
      addCell({
        id: vvodId,
        purpose: 'Ввод',
        breaker: autoSelectedMaterial.name,
        quantity: 1,
      });
      setOpenCellMap((prev) => ({ ...prev, 'Ввод': vvodId }));
    }
  }, [autoSelectedMaterial, addCell]);

  // Автоматически создаем ячейку "Секционный выключатель" при наличии autoSelectedSvMaterial
  useEffect(() => {
    if (autoSelectedSvMaterial && !cellConfigs.find((c) => c.purpose === 'Секционный выключатель')) {
      const svId = crypto.randomUUID();
      addCell({
        id: svId,
        purpose: 'Секционный выключатель',
        breaker: autoSelectedSvMaterial.name,
        quantity: 1,
      });
      // Устанавливаем АВР после создания ячейки
      updateCell(svId, 'hasAVR', true);
      setOpenCellMap((prev) => ({ ...prev, 'Секционный выключатель': svId }));
    }
  }, [autoSelectedSvMaterial, addCell]);

  // Обработка изменений в материалах
  useEffect(() => {
    // Проверяем, изменились ли обработанные материалы
    const currentVvodMaterial = autoSelectedMaterial?.name || null;
    const currentSvMaterial = autoSelectedSvMaterial?.name || null;

    const materialsChanged =
      currentVvodMaterial !== processedMaterialsRef.current.vvodMaterial ||
      currentSvMaterial !== processedMaterialsRef.current.svMaterial;

    if (materialsChanged) {
      // Обновляем ячейку "Ввод"
      const vvodCell = cellConfigs.find((c) => c.purpose === 'Ввод');
      if (vvodCell && currentVvodMaterial) {
        updateCell(vvodCell.id, 'breaker', currentVvodMaterial);
      }

      // Обновляем ячейку "Секционный выключатель"
      const svCell = cellConfigs.find((c) => c.purpose === 'Секционный выключатель');
      if (svCell && currentSvMaterial) {
        updateCell(svCell.id, 'breaker', currentSvMaterial);
      }

      // Обновляем ссылки на обработанные материалы
      processedMaterialsRef.current = {
        vvodMaterial: currentVvodMaterial,
        svMaterial: currentSvMaterial,
      };
    }
  }, [autoSelectedMaterial, autoSelectedSvMaterial, cellConfigs, updateCell]);

  const renderSelectBlock = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[],
    isLoading: boolean = false
  ) => (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <span className="text-xs font-medium text-[#3A55DF]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
        disabled={isLoading}
      >
        <option value="">—</option>
        {options.map((opt, index) => (
          <option key={`${opt}-${index}`} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCellConfig = (
    cell: RunnCell & {
      update: (field: keyof RunnCell, val: string | number) => void;
      remove: () => void;
    },
    title: string,
    isRunnDgu: boolean = false
  ) => {

    return (
      <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
        {/* Показываем селектор автомата выкатного для всех ячеек, кроме отходящих и торцевой панели */}
        {!title.includes('Отходящая') && title !== 'Торцевая панель' && renderSelectBlock(
          'Автомат выкатной',
          cell.breaker,
          (val) => cell.update('breaker', val),
          breakerOptions
        )}

        {/* ПУ показываем только для ячеек Ввод и Отходящая, но не для Секционного выключателя и Торцевой панели */}
        {title !== 'Секционный выключатель' && title !== 'Торцевая панель' &&
          renderSelectBlock(
            'ПУ',
            cell.meterType ?? '',
            (val) => cell.update('meterType', val),
            meterOptions,
            meterMaterialsLoading
          )}

        {/* АВР показываем только для секционного выключателя */}
        {title === 'Секционный выключатель' && (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-xs font-medium text-[#3A55DF]">АВР</span>
            <select
              value={cell.hasAVR !== false ? 'Да' : 'Нет'}
              onChange={(e) => {
                const hasAVR = e.target.value === 'Да';
                updateCell(cell.id, 'hasAVR', hasAVR);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            >
              <option value="Да">Да</option>
              <option value="Нет">Нет</option>
            </select>
          </div>
        )}

        {/* Дополнительные поля для РУНН-ДГУ */}
        {isRunnDgu && (
          <>
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="text-xs font-medium text-[#3A55DF]">Номинальная мощность (кВт)</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={cell.nominalPower || ''}
                onChange={(e) => cell.update('nominalPower', Number(e.target.value) || 0)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
                placeholder="0"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="text-xs font-medium text-[#3A55DF]">Цена (₸)</span>
              <input
                type="number"
                min={0}
                value={cell.price || ''}
                onChange={(e) => cell.update('price', Number(e.target.value) || 0)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
                placeholder="0"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1 min-w-[100px]">
          <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
          <input
            type="number"
            min={1}
            value={cell.quantity || 1}
            onChange={(e) => cell.update('quantity', Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
          />
        </div>

        <button
          onClick={cell.remove}
          className="text-red-600 hover:text-red-800 text-sm font-bold ml-auto"
          title="Удалить ячейку"
        >
          ✕
        </button>
      </div>
    );
  };

  const handleToggle = (type: string) => {
    const isOpen = !!openCellMap[type];

    if (isOpen) {
      const id = openCellMap[type];
      removeCell(id);
      setOpenCellMap((prev) => {
        const copy = { ...prev };
        delete copy[type];
        return copy;
      });
    } else {
      // Ячейка "Ввод" создается только автоматически, не позволяем создавать её вручную
      if (type === 'Ввод') {
        return;
      }

      const newId = crypto.randomUUID();
      setOpenCellMap((prev) => ({ ...prev, [type]: newId }));

      // Определяем правильный материал для ячейки
      let defaultBreaker = '';
      let hasAVR = false;
      if (type === 'Секционный выключатель' && autoSelectedSvMaterial) {
        defaultBreaker = autoSelectedSvMaterial.name;
        hasAVR = true; // По умолчанию АВР включен для секционного выключателя
      }

      addCell({ id: newId, purpose: type, breaker: defaultBreaker, quantity: 1 });
      if (hasAVR) {
        updateCell(newId, 'hasAVR', true);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Показываем сообщение, если трансформатор не выбран */}
      {!selectedTransformer && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-yellow-800">
            Выберите трансформатор для отображения ячеек "Ввод" и "СВ"
          </p>
        </div>
      )}
      
      {cellTypes.map((type) => {
        // Проверяем, есть ли ячейка этого типа в cellConfigs
        const existingCell = cellConfigs.find((c) => c.purpose === type);
        const id = openCellMap[type] || (existingCell ? existingCell.id : null);
        const cell = cellConfigs.find((c) => c.id === id);



        // Если ячейка существует, но не в openCellMap, добавляем её
        if (existingCell && !openCellMap[type]) {
          setOpenCellMap((prev) => ({ ...prev, [type]: existingCell.id }));
        }

        // Для ячеек "Ввод" и "Секционный выключателя" проверяем наличие автоматически выбранных материалов
        const shouldShowVvod = type === 'Ввод' && !!autoSelectedMaterial;
        const shouldShowSv = type === 'Секционный выключатель' && !!autoSelectedSvMaterial;
        const isToggled =
          type === 'Ввод'
            ? shouldShowVvod
            : type === 'Секционный выключатель'
            ? shouldShowSv
            : !!id;

        return (
          <TogglerWithInput
            key={type}
            label={`Ячейка: ${type}`}
            toggled={isToggled}
            onToggle={() => handleToggle(type)}
          >
            {cell &&
              renderCellConfig(
                {
                  ...cell,
                  update: (field: keyof RunnCell, val: string | number) =>
                    updateCell(cell.id, field, val),
                  remove: () => removeCell(cell.id),
                },
                type,
                type === 'РУНН-ДГУ Ввод' || type === 'РУНН-ДГУ Отходящая 1'
              )}
            
            
            {/* Калькуляция для ячейки "Ввод" */}
            {type === 'Ввод' && inputCell && breakerCalculation && (
              <>
                {(() => {
                  // Находим подходящий трансформатор тока
                  let currentTransformer = null;
                  if (inputCell.breaker && runnMaterials.currentTransformer.length > 0) {
                    const breakerCurrent = extractCurrentFromBreakerName(inputCell.breaker);
                    if (breakerCurrent) {
                      const matchingTransformer = findMatchingCurrentTransformer(breakerCurrent);
                      if (matchingTransformer) {
                        const baseTransformerQuantity = inputCell.meterType ? 6 : 3;
                        // Для калькуляции используем базовое количество без учета cellQuantity
                        currentTransformer = {
                          name: matchingTransformer.name,
                          price: parseFloat(matchingTransformer.price.toString()),
                          quantity: baseTransformerQuantity
                        };
                      }
                    }
                  }
                  
                  return (
                    <CalculationDisplay 
                      cell={cell}
                      calculation={breakerCalculation} 
                      materialType="withdrawable_breaker"
                      currentTransformer={currentTransformer}
                    />
                  );
                })()}
              </>
            )}
            
            {/* Индикатор загрузки калькуляции для ячейки "Ввод" */}
            {type === 'Ввод' && inputCell && breakerCalculationLoading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-600">Загрузка калькуляции...</p>
              </div>
            )}
            
            {/* Сообщение об ошибке загрузки калькуляции для ячейки "Ввод" */}
            {type === 'Ввод' && inputCell && breakerCalculationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-red-600">{breakerCalculationError}</p>
              </div>
            )}

            {/* Калькуляция для ячейки "Ввод" */}
            {type === 'Ввод' && inputCell && counterCalculation && (
              <CalculationDisplay 
                cell={cell}
                calculation={counterCalculation} 
                materialType="counter"
              />
            )}
            
            {/* Индикатор загрузки калькуляции для ячейки "Ввод" */}
            {type === 'Ввод' && inputCell && counterCalculationLoading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-600">Загрузка калькуляции...</p>
              </div>
            )}
            
            {/* Сообщение об ошибке загрузки калькуляции для ячейки "Ввод" */}
            {type === 'Ввод' && inputCell && counterCalculationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-red-600">{counterCalculationError}</p>
              </div>
            )}

            {/* Калькуляция для секционного выключателя */}
            {type === 'Секционный выключатель' &&
              sectionSwitchCell &&
              sectionSwitchCalculation && (
                <SectionSwitchCalculation
                  cell={sectionSwitchCell}
                  calculation={sectionSwitchCalculation}
                  inputCell={inputCell}
                />
              )}
            

            
            {/* Индикатор загрузки калькуляции для секционного выключателя */}
            {type === 'Секционный выключатель' && sectionSwitchCell && sectionSwitchCalculationLoading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-600">Загрузка калькуляции...</p>
              </div>
            )}
            
            {/* Сообщение об ошибке загрузки калькуляции для секционного выключателя */}
            {type === 'Секционный выключатель' && sectionSwitchCell && sectionSwitchCalculationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-red-600">{sectionSwitchCalculationError}</p>
              </div>
            )}

            {/* Калькуляция для торцевой панели */}
            {type === 'Торцевая панель' && cell && torcevaiaCalculation && (() => {
              const materialsTotal = torcevaiaCalculation.data?.categories?.reduce(
                (sum: number, category: any) =>
                  sum + (category.items?.reduce((itemSum: number, item: any) => itemSum + (item.price || 0) * (item.quantity || 0), 0) || 0),
                0
              ) || 0;

              const calculationData = torcevaiaCalculation.data?.calculation;
              let finalPrice = 0;
              
              if (calculationData) {
                const calculationResult = calculateCost(
                  materialsTotal,
                  calculationData,
                  0
                );
                finalPrice = calculationResult.finalPrice || 0;
              } else {
                finalPrice = torcevaiaCalculation.data?.finalPrice || torcevaiaCalculation.data?.totalPrice || 0;
              }

              const totalPrice = finalPrice * (cell.quantity || 1);

              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-blue-900">Калькуляция торцевой панели</h4>
                    <div className="text-sm text-blue-700 font-bold">
                      {finalPrice.toLocaleString('ru-RU', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} ₸
                    </div>
                  </div>
                  {torcevaiaCalculation.name && (
                    <p className="text-xs text-blue-600 mt-1">
                      Название: {torcevaiaCalculation.name}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-blue-700">
                    <div>Цена за единицу: {finalPrice.toLocaleString('ru-RU')} ₸</div>
                    <div className="font-medium">Итого: {totalPrice.toLocaleString('ru-RU')} ₸</div>
                  </div>
                </div>
              );
            })()}
            
            {/* Индикатор загрузки калькуляции для торцевой панели */}
            {type === 'Торцевая панель' && cell && torcevaiaCalculationLoading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-600">Загрузка калькуляции...</p>
              </div>
            )}
            
            {/* Сообщение об ошибке загрузки калькуляции для торцевой панели */}
            {type === 'Торцевая панель' && cell && torcevaiaCalculationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-red-600">{torcevaiaCalculationError}</p>
              </div>
            )}

            {/* Сводка по материалам ячейки (как в РУСН) */}
            {cell && (
              <RunnCellSummaryTable
                cell={cell}
                selectedMaterials={
                  cell.purpose === 'Секционный выключатель' && sectionSwitchCalculation
                    ? getSelectedMaterialsForSectionSwitch(cell, sectionSwitchCalculation)
                    : getSelectedMaterialsForCell(cell)
                }
                materials={{
                  avtomatVyk: categoryMaterials,
                  avtomatLity: avtomatLityMaterials,
                  counter: meterMaterials,
                  rpsLeft: rpsLeftMaterials
                }}
              />
            )}
          </TogglerWithInput>
        );
      })}

      <OutgoingCellSection
        categoryMaterials={categoryMaterials}
        meterMaterials={meterMaterials}
        meterMaterialsLoading={meterMaterialsLoading}
        rpsLeftMaterials={rpsLeftMaterials}
        fusesPnMaterials={fusesPnMaterials}
        avtomatLityMaterials={avtomatLityMaterials}
        inputCell={inputCell}
        onCalculationResult={updateCellResult}
      />



    </div>
  );
}
