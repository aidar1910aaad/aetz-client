'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorksState, WorkItem } from '@/store/useWorksStore';

const PDFDownloadButton = dynamic(() => import('./PDFDownloadButton'), { ssr: false });

interface FinalReviewHeaderProps {
  filename: string;
  fullName: string;
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  selectedWorks: WorksState['selected'];
  worksList: WorkItem[];
}

export default function FinalReviewHeader(props: FinalReviewHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">
          Итоговая спецификация <span className="text-[#3A55DF]">{props.filename}</span>
        </h1>
        <div className="text-gray-600 text-sm mb-6 space-y-1">
          <p>Исполнитель: ТОО &#34;АЭТЗ&#34;</p>
          <p>Создал: {props.fullName}</p>
        </div>
      </div>
      <PDFDownloadButton {...props} />
    </div>
  );
}
