import { useEffect, useRef } from 'react';
import { useWorksStore } from '@/store/useWorksStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useWorkPricesStore } from '@/store/useWorkPricesStore';
import {
  calculateBmzInstallationCost,
  calculateBmzExternalGroundingCost,
  calculateBmzExternalGroundingLength,
  calculateRusnInstallationCost,
  calculateRusnAveragePricePerCell,
  calculateBmzAveragePricePerBlock,
  calculateRunnAveragePricePerPanel,
  calculateRunnInstallationCost,
  getRunnTransformerUnitPriceKey,
  getTransformerInstallationPrice,
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
  const runnStore = useRunnStore();
  const { selectedTransformer } = useTransformerStore();
  const workPrices = useWorkPricesStore();
  const hasInitialized = useRef(false);
  const lastCalculationRef = useRef<string>('');

  useEffect(() => {
    console.log('useAutoWorksCalculation: useEffect triggered', { isEnabled, buildingType: bmzStore.buildingType, blockCount: bmzStore.blockCount });
    
    // Если работы отключены, очищаем рассчитанные работы
    if (!isEnabled) {
      const calculatedWorks = worksList.filter(work => 
        work.category === 'Монтаж БМЗ' || 
        work.category === 'Монтаж РУСН' || 
        work.category === 'Монтаж РУНН' ||
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
      rusnBusBridges: rusnStore.busBridges,
      runnCells: runnStore.cellConfigs?.map(cell => ({ quantity: cell.quantity, purpose: cell.purpose })) || [],
      runnBusBridges: runnStore.busBridges,
      runnBusbarSummary: runnStore.busbarSummary?.name,
      transformerId: selectedTransformer?.id,
      transformerPower: selectedTransformer?.power,
      transformerQuantity: selectedTransformer?.quantity,
      workPrices,
      version: '2.0',
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
      const bmzInstallationTotal = calculateBmzInstallationCost(bmzStore.blockCount, workPrices);
      const bmzAveragePrice = calculateBmzAveragePricePerBlock(bmzStore.blockCount, workPrices);

      // Отладочная информация
      console.log('BMZ Calculation Debug:', {
        blockCount: bmzStore.blockCount,
        totalCost: bmzInstallationTotal,
        averagePrice: bmzAveragePrice,
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
      const externalGroundingLength = calculateBmzExternalGroundingLength(
        bmzStore.length,
        bmzStore.width
      );
      const externalGroundingTotal = calculateBmzExternalGroundingCost(
        bmzStore.length,
        bmzStore.width,
        workPrices
      );

      // Отладочная информация для внешнего контура
      console.log('External Grounding Debug:', {
        blockCount: bmzStore.blockCount,
        length: externalGroundingLength,
        totalCost: externalGroundingTotal,
        pricePerMeter: workPrices.bmzExternalGroundingPerMeter,
      });

      calculatedWorks.push({
        name: 'Внешний контур заземления',
        price: workPrices.bmzExternalGroundingPerMeter,
        unit: 'м',
        category: 'Заземление',
        quantity: externalGroundingLength,
        total: externalGroundingTotal,
      });

      // Внутренний контур заземления (фиксированная цена)
      calculatedWorks.push({
        name: 'Внутренний контур заземления',
        price: workPrices.bmzInternalGroundingPerKit,
        unit: 'раб',
        category: 'Заземление',
        quantity: 1,
        total: workPrices.bmzInternalGroundingPerKit,
      });

      // Монтаж кабельных стоек и полок (фиксированная цена)
      calculatedWorks.push({
        name: 'Монтаж кабельных металлических стоек и полок',
        price: workPrices.bmzCableRacks,
        unit: 'раб',
        category: 'Монтаж БМЗ',
        quantity: 1,
        total: workPrices.bmzCableRacks,
      });
    }

    // Расчет работ для РУСН
    if (rusnStore.cellConfigs && rusnStore.cellConfigs.length > 0) {
      // Подсчитываем общее количество ячеек с учетом поля count каждой ячейки
      const totalCellCount = rusnStore.cellConfigs.reduce((total, cell) => total + (cell.count || 1), 0);
      
      // Монтаж РУСН с учетом сложной логики цен
      const rusnInstallationTotal = calculateRusnInstallationCost(totalCellCount, workPrices);
      const rusnAveragePrice = calculateRusnAveragePricePerCell(totalCellCount, workPrices);

      calculatedWorks.push({
        name: `Монтаж РУСН (${totalCellCount} ячеек)`,
        price: rusnAveragePrice,
        unit: 'ячейка',
        category: 'Монтаж РУСН',
        quantity: totalCellCount,
        total: rusnInstallationTotal,
      });

      // Шинный мост
      const totalBusBridgeCount =
        rusnStore.busBridges?.reduce((total, bridge) => total + (bridge.quantity || 1), 0) ||
        rusnStore.busBridgeSummaries?.reduce((total, bridge) => total + (bridge.quantity || 1), 0) ||
        (rusnStore.busBridgeSummary ? rusnStore.busBridgeSummary.quantity || 1 : 0);

      if (totalBusBridgeCount > 0) {
        calculatedWorks.push({
          name: 'Шинный мост монтаж и изготовление',
          price: workPrices.rusnBusBridgePrice,
          unit: 'шт',
          category: 'Монтаж РУСН',
          quantity: 1,
          total: workPrices.rusnBusBridgePrice,
        });
        calculatedWorks.push({
          name: 'Установка шинного моста',
          price: workPrices.rusnBusBridgeInstallationPrice,
          unit: 'шт',
          category: 'Монтаж РУСН',
          quantity: totalBusBridgeCount,
          total: workPrices.rusnBusBridgeInstallationPrice * totalBusBridgeCount,
        });
      }

      // Трансформаторы для РУСН
      if (selectedTransformer) {
        const transformerQuantity = selectedTransformer.quantity || 2;
        calculatedWorks.push({
          name: `Узел силового трансформатора ${selectedTransformer.voltage}кВ`,
          price: workPrices.rusnTransformerUnitPrice,
          unit: 'шт',
          category: 'Монтаж РУСН',
          quantity: transformerQuantity,
          total: workPrices.rusnTransformerUnitPrice * transformerQuantity,
        });
      }
    }

    const totalRunnPanelCount = runnStore.cellConfigs?.reduce(
      (total, cell) => total + (cell.quantity || 1),
      0
    ) || 0;

    if (totalRunnPanelCount > 0) {
      const runnInstallationTotal = calculateRunnInstallationCost(totalRunnPanelCount, workPrices);
      const runnAveragePrice = calculateRunnAveragePricePerPanel(totalRunnPanelCount, workPrices);

      calculatedWorks.push({
        name: `Монтаж РУНН (${totalRunnPanelCount} панелей)`,
        price: runnAveragePrice,
        unit: 'панель',
        category: 'Монтаж РУНН',
        quantity: totalRunnPanelCount,
        total: runnInstallationTotal,
      });

      const runnBusBridgeCount =
        runnStore.busBridges?.reduce((total, bridge) => total + (bridge.quantity || 1), 0) ||
        runnStore.busBridgeSummaries
          ?.filter((summary) => summary.name.toLowerCase().includes('шинный мост'))
          .reduce((total, bridge) => total + (bridge.quantity || 1), 0) ||
        0;

      if (runnBusBridgeCount > 0) {
        calculatedWorks.push({
          name: 'Установка ШМ РУ-0,4 кВ',
          price: workPrices.runnShmInstallation,
          unit: 'шт',
          category: 'Монтаж РУНН',
          quantity: runnBusBridgeCount,
          total: workPrices.runnShmInstallation * runnBusBridgeCount,
        });
      }

      const runnTransformerUnitPriceKey = getRunnTransformerUnitPriceKey(runnStore.busbarSummary?.name);
      if (selectedTransformer && runnTransformerUnitPriceKey) {
        const transformerQuantity = selectedTransformer.quantity || 2;
        const unitPrice = Number(workPrices[runnTransformerUnitPriceKey]) || 0;
        calculatedWorks.push({
          name: 'Узел силового трансформатора 0,4 кВ',
          price: unitPrice,
          unit: 'шт',
          category: 'Монтаж РУНН',
          quantity: transformerQuantity,
          total: unitPrice * transformerQuantity,
        });
      }
    }

    // Расчет работ для трансформаторов
    if (selectedTransformer) {
      const transformerQuantity = selectedTransformer.quantity || 2;
      const installationPrice = getTransformerInstallationPrice(selectedTransformer.power, workPrices);
      calculatedWorks.push({
        name: `Монтаж трансформатора (${selectedTransformer.power} кВА)`,
        price: installationPrice,
        unit: 'шт',
        category: 'Монтаж трансформаторов',
        quantity: transformerQuantity,
        total: installationPrice * transformerQuantity,
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
          work.category !== 'Монтаж РУНН' &&
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
          calculationDetails: calculatedWorks,
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
          work.category !== 'Монтаж РУНН' &&
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
    rusnStore.busBridges,
    rusnStore.busBridgeSummary,
    rusnStore.busBridgeSummaries,
    runnStore.cellConfigs,
    runnStore.busBridges,
    runnStore.busBridgeSummaries,
    runnStore.busbarSummary,
    selectedTransformer?.id,
    selectedTransformer?.power,
    selectedTransformer?.quantity,
    workPrices,
    isEnabled,
    setWorksList,
    setSelected,
  ]);
}