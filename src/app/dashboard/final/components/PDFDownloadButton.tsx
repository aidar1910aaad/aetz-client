'use client';

import { Download } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorkItem } from '@/store/useWorksStore';

// Динамический импорт PDF функционала для избежания ошибок SSR
const PDFWrapper = dynamic(
  () => import('./PDFWrapper'),
  { 
    ssr: false,
    loading: () => (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-gray-400 cursor-not-allowed"
      >
        <Download size={16} />
        <span>Загрузка PDF...</span>
      </button>
    )
  }
);

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
}

export default function PDFDownloadButton(props: Props) {
  return (
    <PDFWrapper
      filename={props.filename}
      fullName={props.fullName}
      user={props.user}
      bmzStore={props.bmzStore}
      selectedTransformer={props.selectedTransformer}
      rusnStore={props.rusnStore}
      selectedWorks={props.selectedWorks}
      worksList={props.worksList}
      runnStore={props.runnStore}
    />
  );
}
