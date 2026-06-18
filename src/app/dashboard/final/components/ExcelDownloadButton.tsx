'use client';

import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorkItem } from '@/store/useWorksStore';
import type { AdditionalEquipmentState, AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';
import { useBktpStore } from '@/store/useBktpStore';
import { exportFinalReviewToExcel } from '@/utils/exportFinalReviewToExcel';
import type { PdfHeaderMeta } from './PdfCommercialHeader';

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
  pdfHeader?: PdfHeaderMeta;
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  selectedWorks: Record<string, { checked?: boolean }>;
  worksList: WorkItem[];
  runnStore: any;
  selectedEquipment: AdditionalEquipmentState['selected'];
  equipmentList: AdditionalEquipmentItem[];
  totals: Totals;
  customRowsByTable?: Record<string, any[]>;
}

const ExcelDownloadButton = React.memo(function ExcelDownloadButton(props: Props) {
  const { aluminum, copper, loading } = useMaterialPrices();
  const executor = useBktpStore((s) => s.executor);

  const handleExport = async () => {
    let businessTravelTotal = 0;
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('businessTravelTotal');
      const parsed = saved ? Number(saved) : 0;
      if (!Number.isNaN(parsed)) businessTravelTotal = parsed;
    }

    await exportFinalReviewToExcel({
      ...props,
      executor,
      busbarMaterialPrices: { aluminum, copper },
      businessTravelTotal,
    });
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-[#3A55DF] hover:bg-[#2d48be] disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      <FileSpreadsheet size={16} />
      <span>{loading ? 'Загрузка...' : 'Скачать Excel'}</span>
    </button>
  );
});

export default ExcelDownloadButton;
