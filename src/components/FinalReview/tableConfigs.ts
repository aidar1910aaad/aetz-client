import type { TableConfig } from './UniversalTable';
import type { BmzData } from '@/utils/bmzCalculations';
import {
  calculateArea,
  calculateBasePrice,
  formatAreaQuantity,
  getActiveEquipment,
  roundArea,
} from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { AdditionalEquipmentState, AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';
import type { WorkItem } from '@/store/useWorksStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useDguStore } from '@/store/useDguStore';
import { formatAmount } from '@/utils/formatAmount';
import { mapDguRowsForRunnTable } from '@/utils/dguSnapshot';
import type { DguSnapshot } from '@/utils/dguSnapshot';
import {
  calculateBusbarUstCost,
  isUst04CalculationName,
  type BusbarMaterialPrices,
} from '@/utils/busbarUstCost';
import { getCellTypesForGroup } from '@/config/cellTypeConfigs';
import { resolveSummaryToCellId } from '@/domain/rusn/cellSummary';

// Общие колонки для всех таблиц
// Ширины: Номер (5%) + Наименование (60%) + Ед. изм. (5%) + Кол-во (5%) + Цена (12.5%) + Сумма (12.5%) = 100%
const commonColumns = [
  {
    key: 'name',
    title: 'Наименование',
    width: '60%',
    align: 'left' as const,
  },
  {
    key: 'unit',
    title: 'Ед. изм.',
    width: '5%',
    align: 'center' as const,
  },
  {
    key: 'quantity',
    title: 'Кол-во',
    width: '5%',
    align: 'center' as const,
  },
  {
    key: 'price',
    title: 'Цена',
    width: '12.5%',
    align: 'right' as const,
    formatter: (value: any) => typeof value === 'number' ? formatAmount(value) + ' ₸' : '—',
  },
  {
    key: 'total',
    title: 'Сумма',
    width: '12.5%',
    align: 'right' as const,
    formatter: (value: any, row: any) => {
      // Используем value если оно есть, иначе вычисляем из price * quantity
      const total = typeof value === 'number' ? value : (
        (typeof row.price === 'number' ? row.price : 0) * 
        (typeof row.quantity === 'number' ? row.quantity : 1)
      );
      return typeof total === 'number' ? formatAmount(total) + ' ₸' : '—';
    },
  },
];

// Конфигурация для БМЗ
export const bmzTableConfig: TableConfig = {
  id: 'bmz',
  title: 'Блочно модульное здание',
  columns: [
    ...commonColumns.slice(0, 2),
    {
      key: 'quantity',
      title: 'Кол-во',
      width: '5%',
      align: 'center' as const,
      formatter: (value: any, row: any) => {
        if (typeof value !== 'number') return value ?? '';
        return row?.unit === 'м²' ? formatAreaQuantity(value) : String(value);
      },
    },
    ...commonColumns.slice(3),
  ],
  dataMapper: (bmzData: BmzData) => {
    if (!bmzData.buildingType || bmzData.buildingType === 'none') {
      return [];
    }
    
    const area = calculateArea(bmzData.width, bmzData.length);
    const roundedArea = roundArea(area);
    
    const unitPrice = bmzData.buildingType === 'bmz' 
      ? calculateBasePrice(bmzData.settings, bmzData.thickness, area, bmzData.height)
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
        total: Math.round(unitPrice * roundedArea),
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
  dataMapper: (transformer: any, additionalData?: { busbarMaterialPrices?: BusbarMaterialPrices }) => {
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

      const busbarMaterialPrices = additionalData?.busbarMaterialPrices;
      const busbarUstData = transformer.busbarUstData;

      transformer.ustCalculations.forEach((calc: any, index: number) => {
        const shouldAddBusbarCost = isUst04CalculationName(calc.name);
        const additionalCost = shouldAddBusbarCost
          ? calculateBusbarUstCost(busbarUstData, busbarMaterialPrices)
          : 0;
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

function getRusnPageCellPurposeOrder(bodyType?: string): string[] {
  const cellTypes = getCellTypesForGroup(bodyType || 'Камера КСО А12-10');
  const staticTypes = cellTypes.filter((type) => type !== 'Отходящая');
  return cellTypes.includes('Отходящая') ? [...staticTypes, 'Отходящая'] : staticTypes;
}

function sortRusnSummariesByPageOrder(
  cellSummaries: RusnState['cellSummaries'],
  cellConfigs: RusnState['cellConfigs'],
  bodyType?: string
) {
  const purposeOrder = getRusnPageCellPurposeOrder(bodyType);
  const purposeRank = new Map(purposeOrder.map((purpose, index) => [purpose, index]));
  const cellIndexById = new Map(cellConfigs.map((cell, index) => [cell.id, index]));
  const cellById = new Map(cellConfigs.map((cell) => [cell.id, cell]));

  return [...cellSummaries].sort((a, b) => {
    const aCellId = resolveSummaryToCellId(a.cellId);
    const bCellId = resolveSummaryToCellId(b.cellId);
    const aCell = cellById.get(aCellId);
    const bCell = cellById.get(bCellId);

    const aPurposeRank = purposeRank.get(aCell?.purpose || '') ?? Number.MAX_SAFE_INTEGER;
    const bPurposeRank = purposeRank.get(bCell?.purpose || '') ?? Number.MAX_SAFE_INTEGER;
    if (aPurposeRank !== bPurposeRank) return aPurposeRank - bPurposeRank;

    const aCellIndex = cellIndexById.get(aCellId) ?? Number.MAX_SAFE_INTEGER;
    const bCellIndex = cellIndexById.get(bCellId) ?? Number.MAX_SAFE_INTEGER;
    if (aCellIndex !== bCellIndex) return aCellIndex - bCellIndex;

    return a.cellId.localeCompare(b.cellId);
  });
}

// Конфигурация для РУСН
export const rusnTableConfig: TableConfig = {
  id: 'rusn',
  title: 'РУ-10кВ',
  columns: commonColumns,
  dataMapper: (rusnData: RusnState) => {
    const {
      cellConfigs,
      cellSummaries,
      busbarSummary,
      busBridgeSummary,
      busBridgeSummaries,
      global,
    } = rusnData;
    const rows = [];
    let rowNumber = 1;
    const bodyType = global?.bodyType;

    // Приоритет: cellSummaries, fallback к cellConfigs (порядок как секции на странице РУСН)
    if (cellSummaries && cellSummaries.length > 0) {
      sortRusnSummariesByPageOrder(cellSummaries, cellConfigs || [], bodyType).forEach(
        (cellSummary) => {
          rows.push({
            id: `cell-${rowNumber++}`,
            name: cellSummary.name,
            unit: 'шт',
            quantity: cellSummary.quantity,
            price: cellSummary.pricePerUnit,
            total: cellSummary.totalPrice,
          });
        }
      );
    } else if (cellConfigs && cellConfigs.length > 0) {
      const purposeOrder = getRusnPageCellPurposeOrder(bodyType);
      const purposeRank = new Map(purposeOrder.map((purpose, index) => [purpose, index]));
      [...cellConfigs]
        .sort((a, b) => {
          const aRank = purposeRank.get(a.purpose || '') ?? Number.MAX_SAFE_INTEGER;
          const bRank = purposeRank.get(b.purpose || '') ?? Number.MAX_SAFE_INTEGER;
          return aRank - bRank;
        })
        .forEach((cell: any) => {
          const cellTotalPrice =
            cell.totalPrice ||
            (cell.breakerPrice || 0) +
              (cell.meterPrice || 0) +
              (cell.rzaPrice || 0) +
              (cell.transformerPrice || 0);

          const cellQuantity = cell.count || cell.quantity || 1;
          const cellPricePerUnit = cellQuantity > 0 ? cellTotalPrice / cellQuantity : cellTotalPrice;
          const cellName =
            cell.purpose ||
            cell.selectedCalculationName ||
            cell.calculationName ||
            `Ячейка ${rowNumber}`;

          rows.push({
            id: `cell-${rowNumber++}`,
            name: cellName,
            unit: 'шт',
            quantity: cellQuantity,
            price: cellPricePerUnit,
            total: cellTotalPrice,
          });
        });
    }

    // Как на странице РУСН: сначала сборные шины, потом шинный мост
    if (busbarSummary) {
      rows.push({
        id: `busbar-${rowNumber++}`,
        name: busbarSummary.name || 'Сборные шины',
        unit: 'шт',
        quantity: busbarSummary.quantity || 1,
        price: busbarSummary.pricePerUnit || 0,
        total: busbarSummary.totalPrice || 0,
      });
    }

    if (busBridgeSummaries && busBridgeSummaries.length > 0) {
      busBridgeSummaries.forEach((summary) => {
        rows.push({
          id: `busbridge-${rowNumber++}`,
          name: summary.name || 'Шинный мост',
          unit: 'шт',
          quantity: summary.quantity || 1,
          price: summary.pricePerUnit || 0,
          total: summary.totalPrice || 0,
        });
      });
    } else if (busBridgeSummary) {
      rows.push({
        id: `busbridge-${rowNumber++}`,
        name: busBridgeSummary.name || 'Шинный мост',
        unit: 'шт',
        quantity: busBridgeSummary.quantity || 1,
        price: busBridgeSummary.pricePerUnit || 0,
        total: busBridgeSummary.totalPrice || 0,
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
      width: '60%',
      align: 'left' as const,
    },
    {
      key: 'unit',
      title: 'Ед. изм.',
      width: '5%',
      align: 'center' as const,
    },
    {
      key: 'quantity',
      title: 'Кол-во',
      width: '5%',
      align: 'center' as const,
    },
    {
      key: 'price',
      title: 'Цена',
      width: '12.5%',
      align: 'right' as const,
      formatter: (value: any, row: any) => {
        if (row?.isSectionHeader || row?.hidePrice) return '';
        return typeof value === 'number' && value > 0 ? formatAmount(value) + ' ₸' : '—';
      },
    },
    {
      key: 'total',
      title: 'Сумма',
      width: '12.5%',
      align: 'right' as const,
      formatter: (value: any, row: any) => {
        if (row?.isSectionHeader || row?.hidePrice) return '';
        const total = typeof value === 'number' ? value : (
          (typeof row.price === 'number' ? row.price : 0) * 
          (typeof row.quantity === 'number' ? row.quantity : 1)
        );
        return typeof total === 'number' && total > 0 ? formatAmount(total) + ' ₸' : '—';
      },
    },
  ],
  dataMapper: (data?: ReturnType<typeof useRunnStore.getState> & { dgu?: DguSnapshot | null }) => {
    // Приоритет: использовать переданные данные (реактивно), иначе текущее состояние стора
    const runnStoreState = (data as any) || useRunnStore.getState();
    
    // Если данные переданы через пропсы (из API), используем их напрямую.
    const cellSummaries = runnStoreState.cellSummaries || [];
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

    const dguFromApi = (runnStoreState as { dgu?: DguSnapshot | null }).dgu;
    const dguLive = useDguStore.getState();
    const dguSource = dguFromApi ?? {
      enabled: dguLive.enabled,
      settings: dguLive.settings,
      cellSummaries: dguLive.cellSummaries,
      busbarSummary: dguLive.busbarSummary,
      busBridgeSummaries: dguLive.busBridgeSummaries,
    };

    const dguItems = mapDguRowsForRunnTable(dguSource, allItems.length);

    return [...allItems, ...dguItems];
  },
  emptyMessage: 'Нет данных РУНН',
  showTotal: true,
};

// Конфигурация для ДГУ (РУНН-ДГУ)
export const dguTableConfig: TableConfig = {
  id: 'dgu',
  title: 'ДГУ',
  columns: commonColumns,
  dataMapper: (data?: ReturnType<typeof useDguStore.getState>) => {
    const dguState = (data as ReturnType<typeof useDguStore.getState>) || useDguStore.getState();

    if (!dguState.enabled) return [];

    const cellItems = (dguState.cellSummaries || []).map((summary: any, index: number) => ({
      id: `dgu-cell-${summary.cellId}`,
      name: summary.name,
      unit: 'шт.',
      quantity: summary.quantity,
      price: summary.pricePerUnit,
      total: summary.totalPrice,
      order: index + 1,
    }));

    const busbarSummary = dguState.busbarSummary;
    const busBridgeSummaries = dguState.busBridgeSummaries || [];
    const settingsPrice = dguState.settings?.price || 0;

    const allItems = [
      ...cellItems,
      ...busBridgeSummaries.map((bbs: any, i: number) => ({
        id: `dgu-busbridge-${i}`,
        name: bbs.name,
        unit: 'шт.',
        quantity: bbs.quantity,
        price: bbs.pricePerUnit,
        total: bbs.totalPrice,
        order: cellItems.length + i + 1,
      })),
      ...(busbarSummary
        ? [
            {
              id: 'dgu-busbar',
              name: busbarSummary.name,
              unit: 'шт.',
              quantity: busbarSummary.quantity,
              price: busbarSummary.pricePerUnit,
              total: busbarSummary.totalPrice,
              order: cellItems.length + busBridgeSummaries.length + 1,
            },
          ]
        : []),
      ...(settingsPrice > 0
        ? [
            {
              id: 'dgu-generator',
              name: `ДГУ (${dguState.settings?.nominalPowerKva || 0} кВА)`,
              unit: 'шт.',
              quantity: 1,
              price: settingsPrice,
              total: settingsPrice,
              order:
                cellItems.length + busBridgeSummaries.length + (busbarSummary ? 1 : 0) + 1,
            },
          ]
        : []),
    ];

    return allItems;
  },
  emptyMessage: 'Нет данных ДГУ',
  showTotal: true,
};