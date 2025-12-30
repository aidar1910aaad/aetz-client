'use client';

import React from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useUserStore } from '@/store/useUserStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useRunnStore } from '@/store/useRunnStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useWorksStore } from '@/store/useWorksStore';
import type { BmzData } from '@/utils/bmzCalculations';
import type { RusnState } from '@/store/useRusnStore';
import type {
  AdditionalEquipmentState,
  AdditionalEquipmentItem,
} from '@/store/useAdditionalEquipmentStore';
import type { WorkItem } from '@/store/useWorksStore';
import { FinalReviewHeader, FinalReviewContent, FinalReviewTotal } from './components';
import { bmzTableConfig, transformerTableConfig, rusnTableConfig, worksTableConfig, runnTableConfig, additionalEquipmentTableConfig, dguTableConfig } from '@/components/FinalReview/tableConfigs';
import { Edit, X } from 'lucide-react';

export default function FinalReview() {
  const { selectedTransformer } = useTransformerStore();
  const bmzStore: BmzData = useBmzStore();
  const { taskNumber, client, date } = useBktpStore();
  const { user } = useUserStore();
  const rusnStore: RusnState = useRusnStore();
  const runnStore = useRunnStore();
  const filename = `${taskNumber}-БКТП-${client}-${date}`;

  const selectedEquipment: AdditionalEquipmentState['selected'] = useAdditionalEquipmentStore(
    (s) => s.selected
  );
  const equipmentList: AdditionalEquipmentItem[] = useAdditionalEquipmentStore(
    (s) => s.equipmentList
  );

  const selectedWorks = useWorksStore((s) => s.selected);
  const worksList: WorkItem[] = useWorksStore((s) => s.worksList);

  // Формируем полное имя пользователя
  const fullName = user
    ? `${user.lastName || ''} ${user.firstName || ''}`.trim() || user.username
    : 'Пользователь';

  // Командировочные берём с клиента, чтобы не было SSR рассинхрона
  const [businessTravelTotal, setBusinessTravelTotal] = React.useState<number>(0);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('businessTravelTotal');
    const parsed = saved ? Number(saved) : 0;
    if (!Number.isNaN(parsed)) setBusinessTravelTotal(parsed);
  }, []);

  // Состояние для пользовательских строк в каждой таблице (должно быть объявлено до расчетов)
  const [customRowsByTable, setCustomRowsByTable] = React.useState<Record<string, any[]>>({});

  // === Расчет итоговых сумм (единый источник истины) ===
  // БМЗ: считаем сумму из тех же строк, что в таблице БМЗ, плюс пользовательские строки
  const bmzRows = React.useMemo(() => bmzTableConfig.dataMapper(bmzStore), [bmzStore]);
  const bmzCustomRows = React.useMemo(() => customRowsByTable[bmzTableConfig.id] || [], [customRowsByTable]);
  const bmzTotal = React.useMemo(() => {
    const baseTotal = bmzRows.reduce((sum, row: any) => sum + (row.total || 0), 0);
    const customTotal = bmzCustomRows.reduce((sum, row: any) => sum + (row.total || 0), 0);
    return baseTotal + customTotal;
  }, [bmzRows, bmzCustomRows]);

  // Трансформатор: учитываем УСТ калькуляции
  const transformerQuantity = selectedTransformer?.quantity || 2;
  const transformerBasePrice = selectedTransformer?.price || 0;
  const transformerBaseTotal = transformerBasePrice * transformerQuantity;
  
  // Функция для расчета цены УСТ
  const calculateUstPrice = React.useCallback((calc: any, additionalUstCost: number = 0) => {
    if (!calc?.data?.categories) return 0;
    
    let materialsTotal = 0;
    calc.data.categories.forEach((category: any) => {
      category.items.forEach((item: any) => {
        materialsTotal += (item.price || 0) * (item.quantity || 0);
      });
    });

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
  }, []);

  // Рассчитываем стоимость УСТ
  const ustTotal = React.useMemo(() => {
    const busbarUstData = selectedTransformer?.busbarUstData;
    const busbarUstCost = busbarUstData ? 
      (busbarUstData.mainUstWeight + busbarUstData.zeroUstWeight) * 
      (busbarUstData.material === 'Алюминий' ? 2800 : 5600) : 0;

    let total = 0;
    if (selectedTransformer?.ustCalculations && selectedTransformer.ustCalculations.length > 0) {
      selectedTransformer.ustCalculations.forEach((calc: any) => {
        const shouldAddBusbarCost = calc.name?.includes('0.4кВ') || calc.name?.includes('УСТ-0.4кВ');
        const additionalCost = shouldAddBusbarCost ? busbarUstCost : 0;
        const ustPrice = calculateUstPrice(calc, additionalCost);
        total += ustPrice * transformerQuantity;
      });
    } else if (selectedTransformer?.ustCalculation) {
      const ustPrice = calculateUstPrice(selectedTransformer.ustCalculation);
      total = ustPrice * transformerQuantity;
    }
    return total;
  }, [selectedTransformer, calculateUstPrice, transformerQuantity]);

  const transformerTotal = transformerBaseTotal + ustTotal;
  const transformerCustomRows = React.useMemo(() => customRowsByTable[transformerTableConfig.id] || [], [customRowsByTable]);
  const transformerTotalWithCustom = React.useMemo(() => {
    const customTotal = transformerCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    return transformerTotal + customTotal;
  }, [transformerTotal, transformerCustomRows]);

  const rusnBaseTotal =
    rusnStore.cellConfigs.reduce((sum: number, cell: any) => sum + (cell.totalPrice || 0), 0) +
    (rusnStore.busBridgeSummary?.totalPrice || 0) +
    (rusnStore.busbarSummary?.totalPrice || 0);
  const rusnCustomRows = React.useMemo(() => customRowsByTable[rusnTableConfig.id] || [], [customRowsByTable]);
  const rusnTotal = React.useMemo(() => {
    const customTotal = rusnCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    return rusnBaseTotal + customTotal;
  }, [rusnBaseTotal, rusnCustomRows]);

  // Сумма работ - считаем из тех же строк, что рендерятся в таблице, плюс пользовательские строки
  const worksRows = React.useMemo(() => (
    worksTableConfig.dataMapper({ selected: selectedWorks, worksList }, { businessTravelTotal })
  ), [selectedWorks, worksList, businessTravelTotal]);
  const worksCustomRows = React.useMemo(() => customRowsByTable[worksTableConfig.id] || [], [customRowsByTable]);
  const worksTotal = React.useMemo(() => {
    const baseTotal = worksRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const customTotal = worksCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    return baseTotal + customTotal;
  }, [worksRows, worksCustomRows]);

  // Сумма РУНН — из тех же строк, что рендерятся в таблице RUNN, плюс пользовательские строки
  const runnRows = React.useMemo(() => (
    runnTableConfig.dataMapper(runnStore)
  ), [runnStore.cellSummaries, runnStore.cellConfigs, runnStore.busbarSummary, runnStore.busBridgeSummary, runnStore.busBridgeSummaries]);
  const runnCustomRows = React.useMemo(() => customRowsByTable[runnTableConfig.id] || [], [customRowsByTable]);
  const runnTotal = React.useMemo(() => {
    const baseTotal = runnRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const customTotal = runnCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    return baseTotal + customTotal;
  }, [runnRows, runnCustomRows]);

  // Сумма дополнительного оборудования - считаем из тех же строк, что рендерятся в таблице, плюс пользовательские строки
  const additionalEquipmentRows = React.useMemo(() => (
    additionalEquipmentTableConfig.dataMapper({ selected: selectedEquipment, equipmentList })
  ), [selectedEquipment, equipmentList]);
  const additionalEquipmentCustomRows = React.useMemo(() => customRowsByTable[additionalEquipmentTableConfig.id] || [], [customRowsByTable]);
  const additionalEquipmentTotal = React.useMemo(() => {
    const baseTotal = additionalEquipmentRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    const customTotal = additionalEquipmentCustomRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);
    return baseTotal + customTotal;
  }, [additionalEquipmentRows, additionalEquipmentCustomRows]);

  const grandTotal = bmzTotal + transformerTotalWithCustom + rusnTotal + runnTotal + worksTotal + additionalEquipmentTotal;
  // === / Расчет итоговых сумм ===

  // Состояние наценки менеджера (общий процент для отображения в FinalReviewTotal)
  const [managerMarkupPercent, setManagerMarkupPercent] = React.useState<number>(20);
  
  // Состояние для хранения процентов наценки для каждой таблицы
  const [tableMarkupPercents, setTableMarkupPercents] = React.useState<Record<string, number>>({});
  
  // Состояние для хранения итоговых сумм с наценкой для каждой таблицы
  const [tableMarkupTotals, setTableMarkupTotals] = React.useState<Record<string, number | null>>({});

  // Состояние режима редактирования
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Состояние видимости таблиц (по умолчанию все видимы, если есть данные)
  const [visibleTables, setVisibleTables] = React.useState<Set<string>>(new Set());

  // Инициализация начальных значений наценки 20% для всех таблиц
  const isInitializedRef = React.useRef(false);
  
  // Инициализация видимости таблиц на основе наличия данных
  // Таблицы с данными автоматически добавляются в visibleTables
  React.useEffect(() => {
    setVisibleTables(prev => {
      const newVisible = new Set(prev);
      let changed = false;
      
      // Добавляем таблицы с данными, если их еще нет
      if (bmzTotal > 0 && !newVisible.has(bmzTableConfig.id)) {
        newVisible.add(bmzTableConfig.id);
        changed = true;
      }
      if (transformerTotalWithCustom > 0 && !newVisible.has(transformerTableConfig.id)) {
        newVisible.add(transformerTableConfig.id);
        changed = true;
      }
      if (rusnTotal > 0 && !newVisible.has(rusnTableConfig.id)) {
        newVisible.add(rusnTableConfig.id);
        changed = true;
      }
      if (runnTotal > 0 && !newVisible.has(runnTableConfig.id)) {
        newVisible.add(runnTableConfig.id);
        changed = true;
      }
      if (additionalEquipmentTotal > 0 && !newVisible.has(additionalEquipmentTableConfig.id)) {
        newVisible.add(additionalEquipmentTableConfig.id);
        changed = true;
      }
      if (worksTotal > 0 && !newVisible.has(worksTableConfig.id)) {
        newVisible.add(worksTableConfig.id);
        changed = true;
      }
      // ДГУ не добавляется автоматически (нет данных по умолчанию)
      
      return changed ? newVisible : prev;
    });
    }, [bmzTotal, transformerTotalWithCustom, rusnTotal, runnTotal, additionalEquipmentTotal, worksTotal]);
  
  React.useEffect(() => {
    // Инициализируем только один раз при первой загрузке
    if (isInitializedRef.current) return;
    
    const initialPercent = 20;
    const initialPercents: Record<string, number> = {};
    const initialTotals: Record<string, number | null> = {};

    // Инициализируем для всех таблиц с положительными суммами
    if (bmzTotal > 0) {
      initialPercents[bmzTableConfig.id] = initialPercent;
      initialTotals[bmzTableConfig.id] = Math.round(bmzTotal * (1 + initialPercent / 100));
    }
    if (transformerTotalWithCustom > 0) {
      initialPercents[transformerTableConfig.id] = initialPercent;
      initialTotals[transformerTableConfig.id] = Math.round(transformerTotalWithCustom * (1 + initialPercent / 100));
    }
    if (rusnTotal > 0) {
      initialPercents[rusnTableConfig.id] = initialPercent;
      initialTotals[rusnTableConfig.id] = Math.round(rusnTotal * (1 + initialPercent / 100));
    }
    if (runnTotal > 0) {
      initialPercents[runnTableConfig.id] = initialPercent;
      initialTotals[runnTableConfig.id] = Math.round(runnTotal * (1 + initialPercent / 100));
    }
    if (additionalEquipmentTotal > 0) {
      initialPercents[additionalEquipmentTableConfig.id] = initialPercent;
      initialTotals[additionalEquipmentTableConfig.id] = Math.round(additionalEquipmentTotal * (1 + initialPercent / 100));
    }
    if (worksTotal > 0) {
      initialPercents[worksTableConfig.id] = initialPercent;
      initialTotals[worksTableConfig.id] = Math.round(worksTotal * (1 + initialPercent / 100));
    }

    if (Object.keys(initialPercents).length > 0) {
      setTableMarkupPercents(initialPercents);
      setTableMarkupTotals(initialTotals);
      isInitializedRef.current = true;
    }
  }, [bmzTotal, transformerTotalWithCustom, rusnTotal, runnTotal, additionalEquipmentTotal, worksTotal]);

  // === Формирование объекта заявки ===
  function getApplicationPayload() {
    // Итоги
    const bmzArea =
      bmzStore.buildingType !== 'none' ? (bmzStore.length / 1000) * (bmzStore.width / 1000) : 0;
    const bmzTotal =
      bmzStore.buildingType !== 'none'
        ? bmzArea * 257000 +
          (bmzStore.settings?.equipment?.reduce((sum: number, eq: any) => {
            const stateKey = eq.name.toLowerCase().replace(/\s+/g, '');
            if (!bmzStore.equipmentState[stateKey]) return sum;
            let quantity = 0;
            if (eq.priceType === 'perSquareMeter') quantity = bmzArea;
            else if (eq.priceType === 'perHalfSquareMeter') quantity = bmzArea / 2;
            else if (eq.priceType === 'fixed') quantity = 1;
            const price = eq.pricePerSquareMeter || eq.fixedPrice || 0;
            return sum + price * quantity;
          }, 0) || 0)
        : 0;
    const transformerTotal = selectedTransformer?.price ? selectedTransformer.price * 2 : 0;
    const rusnTotal =
      rusnStore.cellConfigs.reduce((sum: number, cell: any) => sum + (cell.totalPrice || 0), 0) +
      (rusnStore.busBridgeSummary?.totalPrice || 0) +
      (rusnStore.busbarSummary?.totalPrice || 0);
    const worksTotal = worksList
      .filter((work) => selectedWorks[work.name]?.checked)
      .reduce((sum, work) => {
        const count = selectedWorks[work.name]?.count || 1;
        return sum + work.price * count;
      }, 0);
    const grandTotalForPayload = bmzTotal + transformerTotalForPayload + rusnTotalForPayload + worksTotal;

    // Формируем payload
    const payload = {
      meta: {
        taskNumber,
        date,
        client,
        user: user
          ? {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          : null,
        type: 'БКТП',
      },
      bmz: {
        buildingType: bmzStore.buildingType,
        length: bmzStore.length,
        width: bmzStore.width,
        height: bmzStore.height,
        thickness: bmzStore.thickness,
        blockCount: bmzStore.blockCount,
        settings: bmzStore.settings,
        equipmentState: bmzStore.equipmentState,
      },
        transformer: selectedTransformer as any,
      rusn: {
        cellConfigs: rusnStore.cellConfigs,
        busbarSummary: rusnStore.busbarSummary,
        busBridgeSummary: rusnStore.busBridgeSummary,
        busBridgeSummaries: rusnStore.busBridgeSummaries,
        cellSummaries: rusnStore.cellSummaries,
      },
      additionalEquipment: {
        selected: selectedEquipment,
        equipmentList: equipmentList,
      },
      works: {
        selected: selectedWorks,
        worksList: worksList,
      },
      totals: {
        bmzTotal,
        transformerTotal,
        rusnTotal,
        worksTotal,
        grandTotal,
      },
    };
    return payload;
  }

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />

      <FinalReviewHeader
        filename={filename}
        fullName={fullName}
        user={user}
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
      />

      <FinalReviewContent
        bmzStore={bmzStore}
        selectedTransformer={selectedTransformer as any}
        rusnStore={rusnStore}
        selectedEquipment={selectedEquipment}
        equipmentList={equipmentList}
        selectedWorks={selectedWorks}
        worksList={worksList}
        managerMarkupPercent={managerMarkupPercent}
        tableMarkupPercents={tableMarkupPercents}
        setTableMarkupPercents={setTableMarkupPercents}
        tableMarkupTotals={tableMarkupTotals}
        setTableMarkupTotals={setTableMarkupTotals}
        setManagerMarkupPercent={setManagerMarkupPercent}
        isEditing={isEditing}
        visibleTables={visibleTables}
        onToggleTable={(tableId: string) => {
          setVisibleTables(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tableId)) {
              // Проверяем, можно ли удалить таблицу (таблицы с данными нельзя удалить)
              const hasData = 
                (tableId === bmzTableConfig.id && bmzTotal > 0) ||
                (tableId === transformerTableConfig.id && transformerTotalWithCustom > 0) ||
                (tableId === rusnTableConfig.id && rusnTotal > 0) ||
                (tableId === runnTableConfig.id && runnTotal > 0) ||
                (tableId === additionalEquipmentTableConfig.id && additionalEquipmentTotal > 0) ||
                (tableId === worksTableConfig.id && worksTotal > 0);
              
              // Если у таблицы есть данные, не позволяем её удалить
              if (hasData) {
                return prev;
              }
              
              // Удаляем таблицу только если у неё нет данных
              newSet.delete(tableId);
            } else {
              // Добавляем таблицу
              newSet.add(tableId);
            }
            return newSet;
          });
        }}
        bmzTotal={bmzTotal}
        transformerTotal={transformerTotalWithCustom}
        rusnTotal={rusnTotal}
        runnTotal={runnTotal}
        additionalEquipmentTotal={additionalEquipmentTotal}
        worksTotal={worksTotal}
        customRowsByTable={customRowsByTable}
        onCustomRowsChange={(tableId: string, rows: any[]) => {
          setCustomRowsByTable(prev => ({
            ...prev,
            [tableId]: rows,
          }));
        }}
      />

      <FinalReviewTotal
        bmzStore={bmzStore}
        selectedTransformer={selectedTransformer as any}
        rusnStore={rusnStore}
        runnStore={runnStore}
        selectedEquipment={selectedEquipment}
        equipmentList={equipmentList}
        selectedWorks={selectedWorks}
        worksList={worksList}
        user={user}
        taskNumber={taskNumber}
        client={client}
        date={date}
        totals={{
          bmzTotal,
          transformerTotal: transformerTotalWithCustom,
          rusnTotal,
          runnTotal,
          additionalEquipmentTotal,
          worksTotal,
          grandTotal,
        }}
        filename={filename}
        fullName={fullName}
        managerMarkupPercent={managerMarkupPercent}
        setManagerMarkupPercent={setManagerMarkupPercent}
        tableMarkupPercents={tableMarkupPercents}
        tableMarkupTotals={tableMarkupTotals}
        customRowsByTable={customRowsByTable}
      />
    </div>
  );
}
