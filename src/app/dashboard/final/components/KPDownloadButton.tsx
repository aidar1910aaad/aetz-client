'use client';

import React from 'react';
import { Download } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorkItem } from '@/store/useWorksStore';
import type { AdditionalEquipmentState, AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';

// Динамический импорт KP функционала для избежания ошибок SSR
const KPWrapper = dynamic(
  () => import('./KPWrapper'),
  { 
    ssr: false,
    loading: () => (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-gray-400 cursor-not-allowed"
      >
        <Download size={16} />
        <span>Загрузка КП...</span>
      </button>
    )
  }
);

interface Totals {
  bmzTotal: number;
  transformerTotal: number;
  rusnTotal: number;
  runnTotal: number;
  additionalEquipmentTotal: number;
  worksTotal: number;
  grandTotal: number;
}

interface Props {
  filename: string;
  fullName: string;
  user: any;
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  selectedWorks: any;
  worksList: WorkItem[];
  runnStore: any;
  selectedEquipment: AdditionalEquipmentState['selected'];
  equipmentList: AdditionalEquipmentItem[];
  totals: Totals;
  tableMarkupTotals: Record<string, number | null>;
  customRowsByTable?: Record<string, any[]>;
  onReady?: () => void;
}

const KPDownloadButton = React.memo(function KPDownloadButton(props: Props) {
  return (
    <KPWrapper
      filename={props.filename}
      fullName={props.fullName}
      user={props.user}
      bmzStore={props.bmzStore}
      selectedTransformer={props.selectedTransformer}
      rusnStore={props.rusnStore}
      selectedWorks={props.selectedWorks}
      worksList={props.worksList}
      runnStore={props.runnStore}
      selectedEquipment={props.selectedEquipment}
      equipmentList={props.equipmentList}
      totals={props.totals}
      tableMarkupTotals={props.tableMarkupTotals}
      customRowsByTable={props.customRowsByTable}
      onReady={props.onReady}
    />
  );
});

export default KPDownloadButton;

