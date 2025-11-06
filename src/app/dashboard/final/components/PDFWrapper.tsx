'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFDocument } from './PDFDocument';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorkItem } from '@/store/useWorksStore';

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

export default function PDFWrapper(props: Props) {
  // Более строгая проверка данных
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

  // Если данные не валидны, показываем отключенную кнопку
  if (!hasValidData) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-gray-400 cursor-not-allowed"
      >
        <Download size={16} />
        <span>Нет данных для PDF</span>
      </button>
    );
  }

  try {
    return (
      <PDFDownloadLink
        document={
          <PDFDocument
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
        }
        fileName={`${props.filename}-спецификация.pdf`}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-[#90bd20] hover:bg-[#7ba01c]"
      >
        {({ loading }) => (
          <>
            <Download size={16} />
            <span>{loading ? 'Создание PDF...' : 'Скачать PDF'}</span>
          </>
        )}
      </PDFDownloadLink>
    );
  } catch (error) {
    console.error('Ошибка при создании PDF:', error);
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-red-400 cursor-not-allowed"
      >
        <Download size={16} />
        <span>Ошибка PDF</span>
      </button>
    );
  }
}