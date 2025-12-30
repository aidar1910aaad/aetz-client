'use client';

import React from 'react';
import UniversalTable from '@/components/FinalReview/UniversalTable';
import RusnUniversalTable from '@/components/FinalReview/RusnUniversalTable';
import { useWorksStore } from '@/store/useWorksStore';
import {
  bmzTableConfig,
  transformerTableConfig,
  additionalEquipmentTableConfig,
  worksTableConfig,
  runnTableConfig,
  rusnTableConfig,
  dguTableConfig,
} from '@/components/FinalReview/tableConfigs';
import { Plus, X } from 'lucide-react';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type {
  AdditionalEquipmentState,
  AdditionalEquipmentItem,
} from '@/store/useAdditionalEquipmentStore';
import type { WorkItem } from '@/store/useWorksStore';
import { useRunnStore } from '@/store/useRunnStore';
import TableManager from './TableManager';

interface FinalReviewContentProps {
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  runnStore?: any; // Опциональный проп для данных РУНН из API
  selectedEquipment: AdditionalEquipmentState['selected'];
  equipmentList: AdditionalEquipmentItem[];
  selectedWorks: Record<string, { checked: boolean; count: number }>;
  worksList: WorkItem[];
  managerMarkupPercent?: number;
  tableMarkupPercents?: Record<string, number>;
  setTableMarkupPercents?: (percents: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  tableMarkupTotals?: Record<string, number | null>;
  setTableMarkupTotals?: (totals: Record<string, number | null> | ((prev: Record<string, number | null>) => Record<string, number | null>)) => void;
  setManagerMarkupPercent?: (value: number) => void;
  isReadOnly?: boolean;
  isEditing?: boolean;
  visibleTables?: Set<string>;
  onToggleTable?: (tableId: string) => void;
  bmzTotal?: number;
  transformerTotal?: number;
  rusnTotal?: number;
  runnTotal?: number;
  additionalEquipmentTotal?: number;
  worksTotal?: number;
  customRowsByTable?: Record<string, any[]>;
  onCustomRowsChange?: (tableId: string, rows: any[]) => void;
}

export default function FinalReviewContent({
  bmzStore,
  selectedTransformer,
  rusnStore,
  runnStore: propRunnStore,
  selectedEquipment,
  equipmentList,
  selectedWorks,
  worksList,
  managerMarkupPercent = 0,
  tableMarkupPercents = {},
  setTableMarkupPercents,
  tableMarkupTotals = {},
  setTableMarkupTotals,
  setManagerMarkupPercent,
  isReadOnly = false,
  isEditing = false,
  visibleTables = new Set(),
  onToggleTable,
  bmzTotal = 0,
  transformerTotal = 0,
  rusnTotal = 0,
  runnTotal = 0,
  additionalEquipmentTotal = 0,
  worksTotal = 0,
  customRowsByTable = {},
  onCustomRowsChange,
}: FinalReviewContentProps) {
  const runnStoreFromZustand = useRunnStore();
  // Используем переданные данные РУНН, если они есть, иначе данные из Zustand store
  const runn = propRunnStore || runnStoreFromZustand;
  const [businessTravelTotal, setBusinessTravelTotal] = React.useState<number>(0);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const worksRows = React.useMemo(() => {
    return worksTableConfig.dataMapper(
      { selected: selectedWorks, worksList },
      { businessTravelTotal }
    );
  }, [selectedWorks, worksList, businessTravelTotal]);

  // Читаем командировочные только на клиенте и передаём в таблицу работ через additionalData
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('businessTravelTotal');
    const parsed = saved ? Number(saved) : 0;
    if (!Number.isNaN(parsed)) setBusinessTravelTotal(parsed);
    setIsHydrated(true);
  }, []);

  // Авто-бэкаповка сводок РУНН на финальной странице, если конфигурации есть, а сводок нет
  React.useEffect(() => {
    if (!isHydrated) return;
    if (!runn) return;
    if ((runn.cellSummaries || []).length > 0) return;
    if (!runn.setCellSummary) return;
    const cells = runn.cellConfigs || [];
    if (cells.length === 0) return;

    cells.forEach((c: any, idx: number) => {
      const qty = c.quantity || 1;
      const inferredTotal = ['breakerPrice','meterPrice','rzaPrice','transformerPrice']
        .reduce((sum: number, key: string) => sum + (Number(c?.[key]) || 0), 0);
      if (inferredTotal <= 0) return; // не создаём пустые
      const name = c.selectedCalculationName || c.calculationName || c.purpose || `Ячейка ${idx + 1}`;
      runn.setCellSummary({
        cellId: c.id || String(idx),
        name,
        quantity: qty,
        pricePerUnit: inferredTotal / (qty || 1),
        totalPrice: inferredTotal,
      });
    });
  }, [isHydrated, runn]);

  // Проверяем наличие данных для каждой секции
  const bmzRows = React.useMemo(() => {
    if (bmzStore.buildingType && bmzStore.buildingType !== 'none') {
      return bmzTableConfig.dataMapper(bmzStore);
    }
    return [];
  }, [bmzStore]);

  const transformerRows = React.useMemo(() => {
    if (selectedTransformer) {
      return transformerTableConfig.dataMapper(selectedTransformer);
    }
    return [];
  }, [selectedTransformer]);

  const rusnRows = React.useMemo(() => {
    const cellConfigs = rusnStore?.cellConfigs || [];
    const cellSummaries = rusnStore?.cellSummaries || [];
    const busbarSummary = rusnStore?.busbarSummary;
    const busBridgeSummary = rusnStore?.busBridgeSummary;
    const busBridgeSummaries = rusnStore?.busBridgeSummaries || [];
    
    const hasRusnData = 
      cellConfigs.length > 0 ||
      cellSummaries.length > 0 ||
      !!busbarSummary ||
      !!busBridgeSummary ||
      busBridgeSummaries.length > 0;

    if (hasRusnData) {
      return rusnTableConfig.dataMapper(rusnStore);
    }
    return [];
  }, [rusnStore]);

  const runnRows = React.useMemo(() => {
    const cellConfigs = runn?.cellConfigs || [];
    const cellSummaries = runn?.cellSummaries || [];
    const busbarSummary = runn?.busbarSummary;
    const busBridgeSummary = runn?.busBridgeSummary;
    const busBridgeSummaries = runn?.busBridgeSummaries || [];
    
    const hasRunnData = 
      cellConfigs.length > 0 ||
      cellSummaries.length > 0 ||
      !!busbarSummary ||
      !!busBridgeSummary ||
      busBridgeSummaries.length > 0;

    if (hasRunnData) {
      const shouldCheck = propRunnStore ? true : isHydrated;
      if (shouldCheck) {
        return runnTableConfig.dataMapper(runn);
      }
    }
    return [];
  }, [runn, propRunnStore, isHydrated]);

  const additionalEquipmentRows = React.useMemo(() => {
    return additionalEquipmentTableConfig.dataMapper({ selected: selectedEquipment, equipmentList });
  }, [selectedEquipment, equipmentList]);

  // Данные для ДГУ (заглушка)
  const dguRows = React.useMemo(() => {
    return dguTableConfig.dataMapper({});
  }, []);

  // Проверяем наличие данных в каждой таблице
  const hasBmzRows = bmzRows.length > 0;
  const hasTransformerRows = transformerRows.length > 0;
  const hasRusnRows = rusnRows.length > 0;
  const hasRunnRows = runnRows.length > 0;
  const hasAdditionalEquipmentRows = additionalEquipmentRows.length > 0;
  const hasWorksRows = worksRows.length > 0;
  const hasDguRows = dguRows.length > 0;

  // Функция для проверки, должна ли таблица отображаться
  // В режиме редактирования показываем только видимые таблицы
  // В обычном режиме тоже показываем только видимые таблицы (таблицы с данными автоматически добавлены)
  const shouldShowTable = (tableId: string, hasRows: boolean) => {
    // Если visibleTables не передан (undefined) или пустой, показываем все таблицы с данными
    if (!visibleTables || visibleTables.size === 0) {
      return hasRows;
    }
    // Если visibleTables передан, проверяем наличие в Set
    return visibleTables.has(tableId);
  };
  
  // Для отладки: логируем видимые таблицы
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 FinalReviewContent - Видимые таблицы:', Array.from(visibleTables));
      console.log('🔍 FinalReviewContent - ДГУ видна:', visibleTables.has(dguTableConfig.id));
    }
  }, [visibleTables]);

  return (
    <div className="space-y-6">
      {/* Менеджер таблиц (только в режиме редактирования) */}
      {isEditing && onToggleTable && (
        <TableManager
          visibleTables={visibleTables}
          onToggleTable={onToggleTable}
          isEditing={isEditing}
          hasBmzData={hasBmzRows}
          hasTransformerData={hasTransformerRows}
          hasRusnData={hasRusnRows}
          hasRunnData={hasRunnRows}
          hasAdditionalEquipmentData={hasAdditionalEquipmentRows}
          hasWorksData={hasWorksRows}
          hasBmzRows={hasBmzRows}
        />
      )}

      {/* БМЗ - показываем только если видна (должны быть данные, иначе таблица не будет видна) */}
      {shouldShowTable(bmzTableConfig.id, hasBmzRows) && hasBmzRows && (
        <UniversalTable 
          config={bmzTableConfig}
          data={bmzStore}
          managerMarkupPercent={tableMarkupPercents[bmzTableConfig.id] ?? managerMarkupPercent}
          tableId={bmzTableConfig.id}
          tableMarkupPercent={tableMarkupPercents[bmzTableConfig.id] ?? managerMarkupPercent}
          setTableMarkupPercent={(value: number) => {
            if (setTableMarkupPercents) {
              setTableMarkupPercents(prev => ({ ...prev, [bmzTableConfig.id]: value }));
            }
          }}
          tableMarkupTotal={tableMarkupTotals[bmzTableConfig.id]}
          setTableMarkupTotal={(value: number | null) => {
            if (setTableMarkupTotals) {
              setTableMarkupTotals(prev => ({ ...prev, [bmzTableConfig.id]: value }));
            }
          }}
          isReadOnly={isReadOnly}
          isEditing={isEditing}
          customRows={customRowsByTable[bmzTableConfig.id] || []}
          onCustomRowsChange={(rows) => onCustomRowsChange?.(bmzTableConfig.id, rows)}
        />
      )}
      
      {/* Трансформатор - показываем только если видна и есть данные */}
      {shouldShowTable(transformerTableConfig.id, hasTransformerRows) && hasTransformerRows && (
        <UniversalTable 
          config={transformerTableConfig}
          data={selectedTransformer}
          managerMarkupPercent={tableMarkupPercents[transformerTableConfig.id] ?? managerMarkupPercent}
          tableId={transformerTableConfig.id}
          tableMarkupPercent={tableMarkupPercents[transformerTableConfig.id] ?? managerMarkupPercent}
          setTableMarkupPercent={(value: number) => {
            if (setTableMarkupPercents) {
              setTableMarkupPercents(prev => ({ ...prev, [transformerTableConfig.id]: value }));
            }
          }}
          tableMarkupTotal={tableMarkupTotals[transformerTableConfig.id]}
          setTableMarkupTotal={(value: number | null) => {
            if (setTableMarkupTotals) {
              setTableMarkupTotals(prev => ({ ...prev, [transformerTableConfig.id]: value }));
            }
          }}
          isReadOnly={isReadOnly}
          isEditing={isEditing}
          customRows={customRowsByTable[transformerTableConfig.id] || []}
          onCustomRowsChange={(rows) => onCustomRowsChange?.(transformerTableConfig.id, rows)}
        />
      )}
      
      {/* РУСН - показываем только если видна и есть данные */}
      {shouldShowTable(rusnTableConfig.id, hasRusnRows) && hasRusnRows && (
        <UniversalTable 
          config={rusnTableConfig}
          data={rusnStore}
          managerMarkupPercent={tableMarkupPercents[rusnTableConfig.id] ?? managerMarkupPercent}
          tableId={rusnTableConfig.id}
          tableMarkupPercent={tableMarkupPercents[rusnTableConfig.id] ?? managerMarkupPercent}
          setTableMarkupPercent={(value: number) => {
            if (setTableMarkupPercents) {
              setTableMarkupPercents(prev => ({ ...prev, [rusnTableConfig.id]: value }));
            }
          }}
          tableMarkupTotal={tableMarkupTotals[rusnTableConfig.id]}
          setTableMarkupTotal={(value: number | null) => {
            if (setTableMarkupTotals) {
              setTableMarkupTotals(prev => ({ ...prev, [rusnTableConfig.id]: value }));
            }
          }}
          isReadOnly={isReadOnly}
          isEditing={isEditing}
          customRows={customRowsByTable[rusnTableConfig.id] || []}
          onCustomRowsChange={(rows) => onCustomRowsChange?.(rusnTableConfig.id, rows)}
        />
      )}
      {/* Если данных нет в пропсах, проверяем store (для страницы final) */}
      {rusnRows.length === 0 && !propRunnStore && <RusnUniversalTable voltage="10" managerMarkupPercent={managerMarkupPercent} />}
      
      {/* Общая сводка РУНН - РУ-0.4кВ - показываем только если видна и есть данные */}
      {shouldShowTable(runnTableConfig.id, hasRunnRows) && hasRunnRows && (
        <UniversalTable 
          config={runnTableConfig}
          data={runn}
          managerMarkupPercent={tableMarkupPercents[runnTableConfig.id] ?? managerMarkupPercent}
          tableId={runnTableConfig.id}
          tableMarkupPercent={tableMarkupPercents[runnTableConfig.id] ?? managerMarkupPercent}
          setTableMarkupPercent={(value: number) => {
            if (setTableMarkupPercents) {
              setTableMarkupPercents(prev => ({ ...prev, [runnTableConfig.id]: value }));
            }
          }}
          tableMarkupTotal={tableMarkupTotals[runnTableConfig.id]}
          setTableMarkupTotal={(value: number | null) => {
            if (setTableMarkupTotals) {
              setTableMarkupTotals(prev => ({ ...prev, [runnTableConfig.id]: value }));
            }
          }}
          isReadOnly={isReadOnly}
          isEditing={isEditing}
          customRows={customRowsByTable[runnTableConfig.id] || []}
          onCustomRowsChange={(rows) => onCustomRowsChange?.(runnTableConfig.id, rows)}
        />
      )}
      
      {/* Дополнительное оборудование - показываем только если видна и есть данные */}
      {shouldShowTable(additionalEquipmentTableConfig.id, hasAdditionalEquipmentRows) && hasAdditionalEquipmentRows && (
        <UniversalTable 
          config={additionalEquipmentTableConfig}
          data={{ selected: selectedEquipment, equipmentList }}
          managerMarkupPercent={tableMarkupPercents[additionalEquipmentTableConfig.id] ?? managerMarkupPercent}
          tableId={additionalEquipmentTableConfig.id}
          tableMarkupPercent={tableMarkupPercents[additionalEquipmentTableConfig.id] ?? managerMarkupPercent}
          setTableMarkupPercent={(value: number) => {
            if (setTableMarkupPercents) {
              setTableMarkupPercents(prev => ({ ...prev, [additionalEquipmentTableConfig.id]: value }));
            }
          }}
          tableMarkupTotal={tableMarkupTotals[additionalEquipmentTableConfig.id]}
          setTableMarkupTotal={(value: number | null) => {
            if (setTableMarkupTotals) {
              setTableMarkupTotals(prev => ({ ...prev, [additionalEquipmentTableConfig.id]: value }));
            }
          }}
          isReadOnly={isReadOnly}
          isEditing={isEditing}
          customRows={customRowsByTable[additionalEquipmentTableConfig.id] || []}
          onCustomRowsChange={(rows) => onCustomRowsChange?.(additionalEquipmentTableConfig.id, rows)}
        />
      )}
      
      {/* Работы и транспортные расходы - показываем если видна и есть строки (включая командировочные) после гидратации */}
      {isHydrated && shouldShowTable(worksTableConfig.id, hasWorksRows) && hasWorksRows && (
        <UniversalTable 
          config={worksTableConfig}
          data={{ selected: selectedWorks, worksList }}
          additionalData={{ businessTravelTotal }}
          managerMarkupPercent={tableMarkupPercents[worksTableConfig.id] ?? managerMarkupPercent}
          tableId={worksTableConfig.id}
          tableMarkupPercent={tableMarkupPercents[worksTableConfig.id] ?? managerMarkupPercent}
          setTableMarkupPercent={(value: number) => {
            if (setTableMarkupPercents) {
              setTableMarkupPercents(prev => ({ ...prev, [worksTableConfig.id]: value }));
            }
          }}
          tableMarkupTotal={tableMarkupTotals[worksTableConfig.id]}
          setTableMarkupTotal={(value: number | null) => {
            if (setTableMarkupTotals) {
              setTableMarkupTotals(prev => ({ ...prev, [worksTableConfig.id]: value }));
            }
          }}
          isReadOnly={isReadOnly}
          isEditing={isEditing}
          customRows={customRowsByTable[worksTableConfig.id] || []}
          onCustomRowsChange={(rows) => onCustomRowsChange?.(worksTableConfig.id, rows)}
        />
      )}

      {/* ДГУ - показываем если видна (можно добавить пустую таблицу) */}
      {visibleTables.has(dguTableConfig.id) && (
        <UniversalTable 
          config={dguTableConfig}
          data={{}}
          managerMarkupPercent={tableMarkupPercents[dguTableConfig.id] ?? managerMarkupPercent}
          tableId={dguTableConfig.id}
          tableMarkupPercent={tableMarkupPercents[dguTableConfig.id] ?? managerMarkupPercent}
          setTableMarkupPercent={(value: number) => {
            if (setTableMarkupPercents) {
              setTableMarkupPercents(prev => ({ ...prev, [dguTableConfig.id]: value }));
            }
          }}
          tableMarkupTotal={tableMarkupTotals[dguTableConfig.id]}
          setTableMarkupTotal={(value: number | null) => {
            if (setTableMarkupTotals) {
              setTableMarkupTotals(prev => ({ ...prev, [dguTableConfig.id]: value }));
            }
          }}
          isReadOnly={isReadOnly}
          isEditing={isEditing}
          customRows={customRowsByTable[dguTableConfig.id] || []}
          onCustomRowsChange={(rows) => onCustomRowsChange?.(dguTableConfig.id, rows)}
        />
      )}
    </div>
  );
}
