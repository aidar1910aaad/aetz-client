'use client';

import React from 'react';
import TransformerSection from '@/components/FinalReview/TransformerSection';
import RusnSection from '@/components/FinalReview/RusnSection';
import BmzSection from '@/components/FinalReview/BmzSection';
import AdditionalEquipmentTable from '@/components/FinalReview/AdditionalEquipmentTable';
import WorksTable from '@/components/FinalReview/WorksTable';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type {
  AdditionalEquipmentState,
  AdditionalEquipmentItem,
} from '@/store/useAdditionalEquipmentStore';
import type { WorksState, WorkItem } from '@/store/useWorksStore';

interface FinalReviewContentProps {
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  selectedEquipment: AdditionalEquipmentState['selected'];
  equipmentList: AdditionalEquipmentItem[];
  selectedWorks: WorksState['selected'];
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
  return (
    <div className="space-y-6">
      <BmzSection bmz={bmzStore} />
      <TransformerSection
        transformer={
          selectedTransformer
            ? {
                model: selectedTransformer.model,
                spec: `${selectedTransformer.voltage}кВ, ${selectedTransformer.power}кВА, ${selectedTransformer.manufacturer}, ${selectedTransformer.type}`,
                price: selectedTransformer.price,
                quantity: 2, // По умолчанию 2 трансформатора
              }
            : null
        }
      />
      <RusnSection voltage="10" />
      {/* Дополнительное оборудование */}
      <AdditionalEquipmentTable selected={selectedEquipment} equipmentList={equipmentList} />
      {/* Работы и транспортные расходы */}
      <WorksTable selected={selectedWorks} worksList={worksList} />
    </div>
  );
}
