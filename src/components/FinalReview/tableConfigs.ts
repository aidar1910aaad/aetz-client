import type { TableConfig } from './UniversalTable';
import type { BmzData } from '@/utils/bmzCalculations';
import { calculateBasePrice, getActiveEquipment } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { AdditionalEquipmentState, AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';
import type { WorkItem } from '@/store/useWorksStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useCellSummariesStore } from '@/store/useCellSummariesStore';

// Общие колонки для всех таблиц
const commonColumns = [
  {
    key: 'name',
    title: 'Наименование',
    width: 'w-1/2',
    align: 'left' as const,
  },
  {
    key: 'unit',
    title: 'Ед. изм.',
    width: 'w-16',
    align: 'center' as const,
  },
  {
    key: 'quantity',
    title: 'Кол-во',
    width: 'w-16',
    align: 'center' as const,
  },
  {
    key: 'price',
    title: 'Цена',
    width: 'w-24',
    align: 'center' as const,
    formatter: (value: any) => typeof value === 'number' ? value.toLocaleString('ru-RU') + ' ₸' : '—',
  },
  {
    key: 'total',
    title: 'Сумма',
    width: 'w-24',
    align: 'center' as const,
    formatter: (value: any, row: any) => {
      const price = typeof row.price === 'number' ? row.price : 0;
      const quantity = typeof row.quantity === 'number' ? row.quantity : 1;
      const total = price * quantity;
      return typeof total === 'number' ? total.toLocaleString('ru-RU') + ' ₸' : '—';
    },
  },
];

// Конфигурация для БМЗ
export const bmzTableConfig: TableConfig = {
  id: 'bmz',
  title: 'Блочно модульное здание',
  columns: commonColumns,
  dataMapper: (bmzData: BmzData) => {
    if (!bmzData.buildingType || bmzData.buildingType === 'none') {
      return [];
    }
    
    const area = (bmzData.length / 1000) * (bmzData.width / 1000);
    const roundedArea = Math.round(area * 10) / 10;
    
    // Используем импортированные функции для расчетов
    
    const unitPrice = bmzData.buildingType === 'bmz' 
      ? calculateBasePrice(bmzData.settings, bmzData.thickness, area) 
      : 0;
    
    const activeEquipment = getActiveEquipment(bmzData);
    
    const rows = [];
    
    // Основная строка здания
    if (bmzData.buildingType === 'bmz') {
      rows.push({
        id: 'bmz-base',
        name: `Здание БМЗ (${bmzData.length}×${bmzData.width}×${bmzData.height} мм, толщина ${bmzData.thickness} мм, ${bmzData.blockCount} блоков)`,
        unit: 'м²',
        quantity: roundedArea,
        price: unitPrice,
        total: unitPrice * roundedArea,
      });
    } else if (bmzData.buildingType === 'tp') {
      rows.push({
        id: 'tp-base',
        name: `Здание ТП (${bmzData.length}×${bmzData.width}×${bmzData.height} мм)`,
        unit: 'м²',
        quantity: roundedArea,
        price: 0,
        total: 0,
      });
    }
    
    // Активное оборудование
    activeEquipment.forEach((equipment, index) => {
      rows.push({
        id: `equipment-${index}`,
        name: equipment.name,
        unit: equipment.unit,
        quantity: equipment.quantity,
        price: equipment.price,
        total: equipment.totalPrice,
      });
    });
    
    return rows;
  },
  emptyMessage: 'БМЗ не предусмотрено',
  showTotal: true,
};

// Конфигурация для трансформатора
export const transformerTableConfig: TableConfig = {
  id: 'transformer',
  title: 'Трансформатор',
  columns: commonColumns,
  dataMapper: (transformer: any) => {
    if (!transformer) {
      return [];
    }
    
    const rows = [
      {
        id: 'transformer-1',
        name: transformer.model,
        unit: 'шт',
        quantity: transformer.quantity || 2,
        price: transformer.price,
        total: transformer.price * (transformer.quantity || 2),
      },
    ];

    // Добавляем все УСТ калькуляции, если они есть
    if (transformer.ustCalculations && transformer.ustCalculations.length > 0) {
      const calculateUstPrice = (calc: any, additionalUstCost: number = 0) => {
        if (!calc.data?.categories) return 0;
        
        let materialsTotal = 0;
        calc.data.categories.forEach((category: any) => {
          category.items.forEach((item: any) => {
            materialsTotal += item.price * item.quantity;
          });
        });

        // Добавляем стоимость УСТ из конфигурации шин
        const totalMaterialsWithUst = materialsTotal + additionalUstCost;

        const calculation = calc.data.calculation;
        if (!calculation) return totalMaterialsWithUst;

        const manufacturingCost = (calculation.manufacturingHours || 0) * (calculation.hourlyRate || 0);
        const overheadCost = totalMaterialsWithUst * ((calculation.overheadPercentage || 0) / 100);
        const productionCost = totalMaterialsWithUst + manufacturingCost + overheadCost;
        const adminCost = totalMaterialsWithUst * ((calculation.adminPercentage || 0) / 100);
        const fullCost = productionCost + adminCost;
        const profitCost = fullCost * ((calculation.plannedProfitPercentage || 0) / 100);
        const wholesalePrice = fullCost + profitCost;
        const vatCost = wholesalePrice * ((calculation.ndsPercentage || 0) / 100);
        const finalPrice = wholesalePrice + vatCost;

        return finalPrice;
      };

      // Получаем данные о шинах из transformer
      const busbarUstData = transformer.busbarUstData;
      const busbarUstCost = busbarUstData ? 
        (busbarUstData.mainUstWeight + busbarUstData.zeroUstWeight) * 
        (busbarUstData.material === 'Алюминий' ? 2800 : 5600) : 0;

      transformer.ustCalculations.forEach((calc: any, index: number) => {
        // Добавляем стоимость шин только для УСТ-0.4кВ
        const shouldAddBusbarCost = calc.name.includes('0.4кВ') || calc.name.includes('УСТ-0.4кВ');
        const additionalCost = shouldAddBusbarCost ? busbarUstCost : 0;
        const ustPrice = calculateUstPrice(calc, additionalCost);
        
        rows.push({
          id: `ust-${index + 1}`,
          name: calc.name,
          unit: 'шт',
          quantity: transformer.quantity || 2,
          price: ustPrice,
          total: ustPrice * (transformer.quantity || 2),
        });
      });
    } else if (transformer.ustCalculation) {
      // Fallback для старой логики
      const calculateUstPrice = (calc: any) => {
        if (!calc.data?.categories) return 0;
        
        let materialsTotal = 0;
        calc.data.categories.forEach((category: any) => {
          category.items.forEach((item: any) => {
            materialsTotal += item.price * item.quantity;
          });
        });

        const calculation = calc.data.calculation;
        if (!calculation) return materialsTotal;

        const manufacturingCost = (calculation.manufacturingHours || 0) * (calculation.hourlyRate || 0);
        const overheadCost = materialsTotal * ((calculation.overheadPercentage || 0) / 100);
        const productionCost = materialsTotal + manufacturingCost + overheadCost;
        const adminCost = materialsTotal * ((calculation.adminPercentage || 0) / 100);
        const fullCost = productionCost + adminCost;
        const profitCost = fullCost * ((calculation.plannedProfitPercentage || 0) / 100);
        const wholesalePrice = fullCost + profitCost;
        const vatCost = wholesalePrice * ((calculation.ndsPercentage || 0) / 100);
        const finalPrice = wholesalePrice + vatCost;

        return finalPrice;
      };

      const ustPrice = calculateUstPrice(transformer.ustCalculation);
      
      rows.push({
        id: 'ust-1',
        name: transformer.ustCalculation.name,
        unit: 'шт',
        quantity: transformer.quantity || 2,
        price: ustPrice,
        total: ustPrice * (transformer.quantity || 2),
      });
    }
    
    return rows;
  },
  emptyMessage: 'Трансформатор не выбран',
  showTotal: true,
};

// Конфигурация для дополнительного оборудования
export const additionalEquipmentTableConfig: TableConfig = {
  id: 'additional-equipment',
  title: 'Доп. оборудование',
  columns: commonColumns,
  dataMapper: (data: { selected: AdditionalEquipmentState['selected']; equipmentList: AdditionalEquipmentItem[] }) => {
    const { selected, equipmentList } = data;
    
    // Получаем все выбранные элементы (checked = true и количество > 0)
    const allSelected = Object.entries(selected)
      .filter(([name, val]) => val.checked && (val.count ?? 0) > 0)
      .map(([name, val], index) => {
        // Находим элемент в equipmentList для получения unit
        const equipmentItem = equipmentList.find(item => item.name === name);
        
        const result = {
          id: `equipment-${index}`,
          name,
          unit: equipmentItem?.unit || 'шт.',
          quantity: val.count ?? 0,
          price: val.price || 0,
          total: (val.price || 0) * (val.count ?? 0),
        };
        
        return result;
      });
    
    return allSelected;
  },
  emptyMessage: 'Оборудование не выбрано',
  showTotal: true,
};

// Конфигурация для работ
export const worksTableConfig: TableConfig = {
  id: 'works',
  title: 'Работы и транспортные расходы',
  columns: commonColumns,
  dataMapper: (
    data: { selected: Record<string, { checked: boolean; count: number }>; worksList: WorkItem[] },
    additionalData?: { businessTravelTotal?: number }
  ) => {
    const { selected, worksList } = data;

    const rows = worksList
      .filter((work) => selected[work.name]?.checked)
      .map((work, idx) => ({
        id: `work-${idx}`,
        name: work.name,
        unit: `${work.unit || 'раб'}.`,
        quantity: 1, // Всегда 1
        price: work.price || 0,
        total: work.price || 0, // Сумма равна цене
      }));

    // Добавляем командировочные из additionalData, если переданы
    const businessTravelTotal = Number(additionalData?.businessTravelTotal || 0);

    if (businessTravelTotal > 0) {
      rows.push({
        id: `work-business-travel`,
        name: 'Командировочные (вместе с проживанием)',
        unit: 'раб.',
        quantity: 1,
        price: businessTravelTotal,
        total: businessTravelTotal,
      });
    }

    return rows;
  },
  emptyMessage: 'Работы не выбраны',
  showTotal: true,
};

// Конфигурация для РУСН
export const rusnTableConfig: TableConfig = {
  id: 'rusn',
  title: 'РУ-10кВ',
  columns: commonColumns,
  dataMapper: (rusnData: RusnState) => {
    const { cellConfigs, cellSummaries, busbarSummary, busBridgeSummary, busBridgeSummaries } = rusnData;
    const rows = [];
    let rowNumber = 1;

    // Приоритет: cellSummaries, fallback к cellConfigs
    if (cellSummaries && cellSummaries.length > 0) {
      // Используем готовые summary данные
      cellSummaries.forEach((cellSummary) => {
        rows.push({
          id: `cell-${rowNumber++}`,
          name: cellSummary.name,
          unit: 'шт',
          quantity: cellSummary.quantity,
          price: cellSummary.pricePerUnit,
          total: cellSummary.totalPrice,
        });
      });
    } else if (cellConfigs && cellConfigs.length > 0) {
      // Fallback: используем данные из cellConfigs
      cellConfigs.forEach((cell) => {
        rows.push({
          id: `cell-${rowNumber++}`,
          name: cell.purpose || `Ячейка ${rowNumber - 1}`,
          unit: 'шт',
          quantity: cell.count || 1,
          price: 0, // Будет рассчитано через хук
          total: 0, // Будет рассчитано через хук
        });
      });
    }

    // Добавляем шинные мосты, если есть данные
    if (busBridgeSummaries && busBridgeSummaries.length > 0) {
      busBridgeSummaries.forEach((busBridgeSummary) => {
        rows.push({
          id: `busbridge-${rowNumber++}`,
          name: busBridgeSummary.name,
          unit: 'шт',
          quantity: busBridgeSummary.quantity,
          price: busBridgeSummary.pricePerUnit,
          total: busBridgeSummary.totalPrice,
        });
      });
    }

    // Добавляем сборные шины, если есть данные
    if (busbarSummary) {
      rows.push({
        id: `busbar-${rowNumber++}`,
        name: busbarSummary.name,
        unit: 'шт',
        quantity: busbarSummary.quantity,
        price: busbarSummary.pricePerUnit,
        total: busbarSummary.totalPrice,
      });
    }

    return rows;
  },
  emptyMessage: 'РУСН-10кВ не предусмотрено',
  showTotal: true,
};

// Конфигурация для пустого БМЗ
export const emptyBmzTableConfig: TableConfig = {
  id: 'empty-bmz',
  title: 'РУ-0,4кВ',
  columns: commonColumns,
  dataMapper: () => [],
  emptyMessage: 'БМЗ не предусмотрено',
  showTotal: false,
};

// Конфигурация для РУНН (РУ-0.4кВ)
export const runnTableConfig: TableConfig = {
  id: 'runn',
  title: 'РУ-0.4кВ',
  columns: [
    {
      key: 'name',
      title: 'Наименование',
      width: 'w-1/2',
      align: 'left' as const,
    },
    {
      key: 'unit',
      title: 'Ед. изм.',
      width: 'w-16',
      align: 'center' as const,
    },
    {
      key: 'quantity',
      title: 'Кол-во',
      width: 'w-16',
      align: 'center' as const,
    },
    {
      key: 'price',
      title: 'Цена',
      width: 'w-32',
      align: 'center' as const,
      formatter: (value: any) => typeof value === 'number' && value > 0 ? value.toLocaleString('ru-RU') : '—',
    },
    {
      key: 'total',
      title: 'Сумма',
      width: 'w-32',
      align: 'center' as const,
      formatter: (value: any, row: any) => {
        const price = typeof row.price === 'number' ? row.price : 0;
        const quantity = typeof row.quantity === 'number' ? row.quantity : 1;
        const total = price * quantity;
        return typeof total === 'number' && total > 0 ? total.toLocaleString('ru-RU') : '—';
      },
    },
  ],
  dataMapper: (data?: ReturnType<typeof useRunnStore.getState>) => {
    // Приоритет: использовать переданные данные (реактивно), иначе текущее состояние стора
    const runnStoreState = (data as any) || useRunnStore.getState();
    const externalCellSummaries = useCellSummariesStore.getState().cellSummaries || [];
    const cellSummaries = (runnStoreState.cellSummaries && runnStoreState.cellSummaries.length > 0)
      ? runnStoreState.cellSummaries
      : externalCellSummaries;
    const cellConfigs = runnStoreState.cellConfigs || [];
    const busbarSummary = runnStoreState.busbarSummary;
    const busBridgeSummary = runnStoreState.busBridgeSummary;
    const busBridgeSummaries = runnStoreState.busBridgeSummaries || [];

    // Строим строки по приоритету: cellSummaries -> fallback к cellConfigs
    const cellItems =
      cellSummaries.length > 0
        ? cellSummaries.map((summary, index) => ({
            id: `cell-${summary.cellId}`,
            name: summary.name,
            unit: 'шт.',
            quantity: summary.quantity,
            price: summary.pricePerUnit,
            total: summary.totalPrice,
            order: index + 1,
          }))
        : cellConfigs
            // Показываем ячейки даже при нулевой цене, если они есть в конфиге
            .map((c: any, index: number) => {
              const qty = c.quantity || 1;
              const inferredFromParts = ['breakerPrice','meterPrice','rzaPrice','transformerPrice']
                .reduce((sum: number, key: string) => sum + (Number((c as any)[key]) || 0), 0);
              const total = (c.totalPrice ?? 0) || inferredFromParts;
              const pricePerUnit = qty > 0 ? total / qty : total;
              const name = c.selectedCalculationName || c.calculationName || c.purpose || `Ячейка ${index + 1}`;
              return {
                id: `cell-${c.id || index}`,
                name,
                unit: 'шт.',
                quantity: qty,
                price: pricePerUnit,
                total,
                order: index + 1,
              };
            });

    const allItems = [
      ...cellItems,
      ...(busbarSummary ? [{
        id: 'busbar',
        name: busbarSummary.name,
        unit: 'шт.',
        quantity: busbarSummary.quantity,
        price: busbarSummary.pricePerUnit,
        total: busbarSummary.totalPrice,
        order: cellItems.length + 1,
      }] : []),
      ...(busBridgeSummary ? [{
        id: 'busbridge',
        name: busBridgeSummary.name,
        unit: 'шт.',
        quantity: busBridgeSummary.quantity,
        price: busBridgeSummary.pricePerUnit,
        total: busBridgeSummary.totalPrice,
        order: cellItems.length + (busbarSummary ? 1 : 0) + 1,
      }] : []),
      ...busBridgeSummaries.map((bbs, i) => ({
        id: `busbridge-extra-${i}`,
        name: bbs.name,
        unit: 'шт.',
        quantity: bbs.quantity,
        price: bbs.pricePerUnit,
        total: bbs.totalPrice,
        order: cellItems.length + (busbarSummary ? 1 : 0) + (busBridgeSummary ? 1 : 0) + 1 + i,
      })),
    ];

    return allItems;
  },
  emptyMessage: 'Нет данных РУНН',
  showTotal: true,
};