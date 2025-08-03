'use client';

import { Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFDocument } from './PDFDocument';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorksState, WorkItem } from '@/store/useWorksStore';

interface Props {
  filename: string;
  fullName: string;
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  selectedWorks: WorksState['selected'];
  worksList: WorkItem[];
}

export default function PDFDownloadButton(props: Props) {
  return (
    <PDFDownloadLink
      document={
        <PDFDocument
          filename={props.filename}
          fullName={props.fullName}
          bmzStore={props.bmzStore}
          selectedTransformer={props.selectedTransformer}
          rusnStore={props.rusnStore}
          selectedWorks={props.selectedWorks}
          worksList={props.worksList}
        />
      }
      fileName={`${props.filename}-спецификация.pdf`}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-blue-600 hover:bg-blue-700"
    >
      {({ loading }) => (
        <>
          <Download size={16} />
          <span>{loading ? 'Создание PDF...' : 'Скачать PDF'}</span>
        </>
      )}
    </PDFDownloadLink>
  );
}
