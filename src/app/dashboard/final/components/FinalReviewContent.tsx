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
  emptyBmzTableConfig,
  runnTableConfig,
} from '@/components/FinalReview/tableConfigs';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type {
  AdditionalEquipmentState,
  AdditionalEquipmentItem,
} from '@/store/useAdditionalEquipmentStore';
import type { WorkItem } from '@/store/useWorksStore';
import { useRunnStore } from '@/store/useRunnStore';

interface FinalReviewContentProps {
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  selectedEquipment: AdditionalEquipmentState['selected'];
  equipmentList: AdditionalEquipmentItem[];
  selectedWorks: Record<string, { checked: boolean; count: number }>;
  worksList: WorkItem[];
}

export default function FinalReviewContent({
  bmzStore,
  selectedTransformer,
  rusnStore,
  selectedEquipment,
  equipmentList,
  selectedWorks,
  worksList,
}: FinalReviewContentProps) {
  // Выбираем конфигурацию БМЗ в зависимости от типа
  const bmzConfig = bmzStore.buildingType && bmzStore.buildingType !== 'none' 
    ? bmzTableConfig 
    : emptyBmzTableConfig;
  const runn = useRunnStore();
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

  return (
    <div className="space-y-6">
      {/* БМЗ */}
      <UniversalTable 
        config={bmzConfig}
        data={bmzStore}
      />
      
      {/* Трансформатор */}
      <UniversalTable 
        config={transformerTableConfig}
        data={selectedTransformer}
      />
      
      {/* РУСН */}
      <RusnUniversalTable voltage="10" />
      
      {/* Общая сводка РУНН - РУ-0.4кВ */}
      {isHydrated && (
        <UniversalTable 
          config={runnTableConfig}
          data={runn}
        />
      )}
      
      {/* Дополнительное оборудование */}
      <UniversalTable 
        config={additionalEquipmentTableConfig}
        data={{ selected: selectedEquipment, equipmentList }}
      />
      
      {/* Работы и транспортные расходы - показываем если есть строки (включая командировочные) после гидратации */}
      {isHydrated && worksRows.length > 0 && (
        <UniversalTable 
          config={worksTableConfig}
          data={{ selected: selectedWorks, worksList }}
          additionalData={{ businessTravelTotal }}
        />
      )}
    </div>
  );
}
