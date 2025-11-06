import { useEffect, useRef } from 'react';
import { useWorksStore } from '@/store/useWorksStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import {
  calculateBmzInstallationCost,
  calculateBmzExternalGroundingCost,
  calculateRusnInstallationCost,
  calculateRusnAveragePricePerCell,
  calculateBmzAveragePricePerBlock,
  calculateBmzExternalGroundingAveragePricePerBlock,
  BMZ_PRICES,
  RUSN_PRICES,
  TRANSFORMER_PRICES,
} from '@/utils/worksCalculationUtils';

interface CalculatedWork {
  name: string;
  price: number;
  unit: string;
  category: string;
  quantity: number;
  total: number;
}

export function useAutoWorksCalculation() {
  const { setWorksList, setSelected, worksList, isEnabled, selected } = useWorksStore();
  const bmzStore = useBmzStore();
  const rusnStore = useRusnStore();
  const { selectedTransformer } = useTransformerStore();
  const hasInitialized = useRef(false);
  const lastCalculationRef = useRef<string>('');

  useEffect(() => {
    console.log('useAutoWorksCalculation: useEffect triggered', { isEnabled, buildingType: bmzStore.buildingType, blockCount: bmzStore.blockCount });
    
    // Если работы отключены, очищаем рассчитанные работы
    if (!isEnabled) {
      const calculatedWorks = worksList.filter(work => 
        work.category === 'Монтаж БМЗ' || 
        work.category === 'Монтаж РУСН' || 
        work.category === 'Монтаж трансформаторов' ||
        work.category === 'Заземление' ||
        work.name === 'Монтаж оборудования'
      );
      
      if (calculatedWorks.length > 0) {
        const remainingWorks = worksList.filter(work => 
          !calculatedWorks.some(calc => calc.name === work.name)
        );
        setWorksList(remainingWorks);
        
        // Очищаем выбранные работы
        const newSelected: Record<string, { checked: boolean; count: number }> = {};
        remainingWorks.forEach(work => {
          if (selected[work.name]) {
            newSelected[work.name] = selected[work.name];
          }
        });
        setSelected(newSelected);
        hasInitialized.current = false; // Сбрасываем флаг для повторной инициализации
        lastCalculationRef.current = '';
      }
      return;
    }

    // Инициализируем только если работы включены
    if (!isEnabled) {
      return;
    }

    // Создаем ключ для отслеживания изменений
    const calculationKey = JSON.stringify({
      bmzType: bmzStore.buildingType,
      bmzBlocks: bmzStore.blockCount,
      bmzLength: bmzStore.length,
      bmzWidth: bmzStore.width,
      rusnCells: rusnStore.cellConfigs?.map(cell => ({ count: cell.count, purpose: cell.purpose })) || [],
      transformerId: selectedTransformer?.id,
      transformerPower: selectedTransformer?.power,
      // Добавляем версию для принудительного обновления при изменении цен
      version: '1.1',
    });

    // Если данные не изменились, не пересчитываем
    if (lastCalculationRef.current === calculationKey) {
      return;
    }

    lastCalculationRef.current = calculationKey;

    const calculatedWorks: CalculatedWork[] = [];

    // Расчет работ для БМЗ
    if (bmzStore.buildingType === 'bmz' && bmzStore.blockCount > 0) {
      // Монтаж БМЗ с учетом сложной логики цен
      const bmzInstallationTotal = calculateBmzInstallationCost(bmzStore.blockCount);
      const bmzAveragePrice = calculateBmzAveragePricePerBlock(bmzStore.blockCount);

      // Отладочная информация
      console.log('BMZ Calculation Debug:', {
        blockCount: bmzStore.blockCount,
        totalCost: bmzInstallationTotal,
        averagePrice: bmzAveragePrice,
        expectedTotal: 513710, // Для 10 блоков
        expectedAverage: 51371, // Для 10 блоков
      });

      calculatedWorks.push({
        name: `Монтаж БМЗ (${bmzStore.blockCount} блоков)`,
        price: bmzAveragePrice,
        unit: 'блок',
        category: 'Монтаж БМЗ',
        quantity: bmzStore.blockCount,
        total: bmzInstallationTotal,
      });

      // Внешний контур заземления с учетом сложной логики цен
      const externalGroundingTotal = calculateBmzExternalGroundingCost(bmzStore.blockCount);
      const externalGroundingAveragePrice = calculateBmzExternalGroundingAveragePricePerBlock(bmzStore.blockCount);

      // Отладочная информация для внешнего контура
      console.log('External Grounding Debug:', {
        blockCount: bmzStore.blockCount,
        totalCost: externalGroundingTotal,
        averagePrice: externalGroundingAveragePrice,
        expectedTotal: 361336, // Для 10 блоков
        expectedAverage: 36134, // Для 10 блоков
      });

      calculatedWorks.push({
        name: 'Внешний контур заземления',
        price: externalGroundingAveragePrice,
        unit: 'раб',
        category: 'Заземление',
        quantity: bmzStore.blockCount,
        total: externalGroundingTotal,
      });

      // Внутренний контур заземления (фиксированная цена)
      calculatedWorks.push({
        name: 'Внутренний контур заземления',
        price: BMZ_PRICES.internalGrounding,
        unit: 'раб',
        category: 'Заземление',
        quantity: 1,
        total: BMZ_PRICES.internalGrounding,
      });

      // Монтаж кабельных стоек и полок (фиксированная цена)
      calculatedWorks.push({
        name: 'Монтаж кабельных металлических стоек и полок',
        price: BMZ_PRICES.cableRacks,
        unit: 'раб',
        category: 'Монтаж БМЗ',
        quantity: 1,
        total: BMZ_PRICES.cableRacks,
      });
    }

    // Расчет работ для РУСН
    if (rusnStore.cellConfigs && rusnStore.cellConfigs.length > 0) {
      // Подсчитываем общее количество ячеек с учетом поля count каждой ячейки
      const totalCellCount = rusnStore.cellConfigs.reduce((total, cell) => total + (cell.count || 1), 0);
      
      // Монтаж РУСН с учетом сложной логики цен
      const rusnInstallationTotal = calculateRusnInstallationCost(totalCellCount);
      const rusnAveragePrice = calculateRusnAveragePricePerCell(totalCellCount);

      calculatedWorks.push({
        name: `Монтаж РУСН (${totalCellCount} ячеек)`,
        price: rusnAveragePrice,
        unit: 'ячейка',
        category: 'Монтаж РУСН',
        quantity: totalCellCount,
        total: rusnInstallationTotal,
      });

      // Шинный мост
      if (rusnStore.busBridgeSummary) {
        calculatedWorks.push({
          name: 'Шинный мост монтаж и изготовление',
          price: RUSN_PRICES.busBridge,
          unit: 'шт',
          category: 'Монтаж РУСН',
          quantity: 1,
          total: RUSN_PRICES.busBridge,
        });
      }

      // Трансформаторы для РУСН
      if (selectedTransformer) {
        calculatedWorks.push({
          name: `Узел силового трансформатора ${selectedTransformer.voltage}кВ`,
          price: RUSN_PRICES.transformerUnit,
          unit: 'шт',
          category: 'Монтаж РУСН',
          quantity: 2,
          total: RUSN_PRICES.transformerUnit * 2,
        });
      }
    }

    // Расчет работ для трансформаторов
    if (selectedTransformer) {
      calculatedWorks.push({
        name: `Монтаж трансформатора (${selectedTransformer.power} кВА)`,
        price: TRANSFORMER_PRICES.installation,
        unit: 'шт',
        category: 'Монтаж трансформаторов',
        quantity: 2,
        total: TRANSFORMER_PRICES.installation * 2,
      });
    }

    // Обновляем список работ
    if (calculatedWorks.length > 0) {
      console.log('useAutoWorksCalculation: Adding calculated works:', calculatedWorks.map(w => w.name));
      
      // Рассчитываем общую сумму всех работ по монтажу
      const totalInstallationCost = calculatedWorks.reduce((sum, work) => sum + work.total, 0);
      
      // Удаляем старые рассчитанные работы и добавляем одну общую работу
      const otherWorks = worksList.filter(work => 
        !work.category || (
          work.category !== 'Монтаж БМЗ' && 
          work.category !== 'Монтаж РУСН' && 
          work.category !== 'Монтаж трансформаторов' &&
          work.category !== 'Заземление' &&
          work.name !== 'Монтаж оборудования'
        )
      );

      const newWorksList = [
        ...otherWorks,
        {
          name: 'Монтаж оборудования',
          price: totalInstallationCost,
          unit: 'раб',
          category: 'Монтаж оборудования',
        }
      ];

      console.log('useAutoWorksCalculation: New worksList:', newWorksList.map(w => w.name));
      console.log('useAutoWorksCalculation: Total installation cost:', totalInstallationCost);
      setWorksList(newWorksList);

      // Обновляем выбранные работы
      const newSelected: Record<string, { checked: boolean; count: number }> = {};
      
      // Сохраняем существующие выбранные работы (не рассчитанные)
      Object.keys(selected).forEach(workName => {
        const work = worksList.find(w => w.name === workName);
        if (work && (!work.category || (
          work.category !== 'Монтаж БМЗ' && 
          work.category !== 'Монтаж РУСН' && 
          work.category !== 'Монтаж трансформаторов' &&
          work.category !== 'Заземление' &&
          work.name !== 'Монтаж оборудования'
        ))) {
          newSelected[workName] = selected[workName];
        }
      });

      // Добавляем общую работу по монтажу оборудования
      newSelected['Монтаж оборудования'] = {
        checked: true,
        count: 1,
      };

      setSelected(newSelected);
      hasInitialized.current = true;
    }
  }, [
    bmzStore.buildingType,
    bmzStore.blockCount,
    bmzStore.length,
    bmzStore.width,
    rusnStore.cellConfigs,
    rusnStore.busBridgeSummary,
    selectedTransformer?.id,
    selectedTransformer?.power,
    isEnabled,
    setWorksList,
    setSelected,
  ]);
}