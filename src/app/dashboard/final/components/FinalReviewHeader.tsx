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
  user: any;
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  selectedWorks: WorksState['selected'];
  worksList: WorkItem[];
  runnStore: any;
}

export default function FinalReviewHeader(props: FinalReviewHeaderProps) {
  // Проверяем, что все необходимые данные присутствуют
  const hasValidData = 
    props.bmzStore && 
    typeof props.bmzStore === 'object' &&
    props.rusnStore && 
    typeof props.rusnStore === 'object' &&
    props.selectedWorks && 
    typeof props.selectedWorks === 'object' &&
    props.worksList && 
    Array.isArray(props.worksList) &&
    props.runnStore && 
    typeof props.runnStore === 'object' &&
    props.filename &&
    props.fullName;

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">
          Итоговая спецификация <span className="text-[#90bd20]">{props.filename}</span>
        </h1>
        <div className="text-gray-600 text-sm mb-6 space-y-1">
          <p>Исполнитель: ТОО &#34;АЭТЗ&#34;</p>
          <p>
            Исполнитель{' '}
            <span className="font-semibold text-[#90bd20]">
              {props.user?.lastName || ''} {props.user?.firstName || ''}
            </span>
            {props.user?.phone && (
              <>
                {' | '}
                <span className="font-semibold text-[#90bd20]">{props.user.phone}</span>
              </>
            )}
            {props.user?.email && (
              <>
                {' | '}
                <span className="font-semibold text-[#90bd20]">{props.user.email}</span>
              </>
            )}
          </p>
        </div>
      </div>
      {hasValidData ? (
        <PDFDownloadButton {...props} />
      ) : (
        <button
          disabled
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-gray-400 cursor-not-allowed"
        >
          <span>Загрузка данных...</span>
        </button>
      )}
    </div>
  );
}
