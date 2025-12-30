'use client';

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { PDFDocument } from './PDFDocument';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorkItem } from '@/store/useWorksStore';
import type { AdditionalEquipmentState, AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';

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
  customRowsByTable?: Record<string, any[]>;
  onReady?: () => void;
}

function PDFWrapper(props: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [pdfModule, setPdfModule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Убеждаемся, что компонент смонтирован на клиенте
  useEffect(() => {
    setIsMounted(true);
    
    // Загружаем модуль только на клиенте
    if (typeof window !== 'undefined') {
      import('@react-pdf/renderer')
        .then((module) => {
          // Проверяем различные варианты экспорта
          const PDFDownloadLink = module.PDFDownloadLink || module.default?.PDFDownloadLink || (module.default && typeof module.default === 'function' ? module.default : null);
          
          if (PDFDownloadLink && (typeof PDFDownloadLink === 'function' || PDFDownloadLink.$$typeof)) {
            setPdfModule({ PDFDownloadLink });
            setIsLoading(false);
          } else {
            setPdfModule(null);
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error('❌ PDFWrapper: Ошибка при загрузке @react-pdf/renderer:', error);
          setPdfModule(null);
          setIsLoading(false);
        });
    }
  }, []);

  // Проверяем, что все необходимые данные присутствуют
  // Учитываем, что объекты могут быть пустыми, но должны существовать
  // Проверяем наличие ключевых свойств, которые указывают на то, что данные не были сброшены
  // ВАЖНО: buildingType должен быть именно 'bmz', а не 'none' (значение по умолчанию после reset)
  const hasValidData = 
    props.bmzStore !== null && 
    props.bmzStore !== undefined &&
    typeof props.bmzStore === 'object' &&
    // Проверяем, что buildingType именно 'bmz', а не 'none' или пустой
    props.bmzStore.buildingType === 'bmz' &&
    // Проверяем, что есть хотя бы одно из ключевых свойств размеров
    (props.bmzStore.length > 0 || props.bmzStore.width > 0) &&
    props.rusnStore !== null && 
    props.rusnStore !== undefined &&
    typeof props.rusnStore === 'object' &&
    props.selectedWorks !== null && 
    props.selectedWorks !== undefined &&
    typeof props.selectedWorks === 'object' &&
    props.worksList !== null && 
    props.worksList !== undefined &&
    Array.isArray(props.worksList) &&
    props.runnStore !== null && 
    props.runnStore !== undefined &&
    typeof props.runnStore === 'object' &&
    props.filename &&
    props.fullName &&
    props.filename.trim() !== '' &&
    props.fullName.trim() !== '' &&
    // Проверяем, что filename не содержит только дефисы (что означает пустые taskNumber и client)
    !props.filename.match(/^-БКТП--\d{4}-\d{2}-\d{2}$/);

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

  // Если компонент еще не смонтирован или модуль не загружен, показываем загрузку
  if (!isMounted || !pdfModule) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-gray-400 cursor-not-allowed"
      >
        <Download size={16} />
        <span>Загрузка PDF...</span>
      </button>
    );
  }

  // Проверяем, что компонент загружен и готов
  const PDFDownloadLink = pdfModule?.PDFDownloadLink;
  
  if (!isMounted || isLoading || !PDFDownloadLink) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-gray-400 cursor-not-allowed"
      >
        <Download size={16} />
        <span>Загрузка PDF...</span>
      </button>
    );
  }

  // Проверяем, что все необходимые данные присутствуют перед рендером
  if (!props.filename || !props.fullName) {
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

  // Проверяем, что это валидный React компонент
  const isFunction = typeof PDFDownloadLink === 'function';
  const hasTypeof = PDFDownloadLink?.$$typeof !== undefined;
  const isValidComponent = isFunction || hasTypeof;
  
  if (!isValidComponent) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-red-400 cursor-not-allowed"
      >
        <Download size={16} />
        <span>Ошибка загрузки PDF</span>
      </button>
    );
  }

  // Дополнительная проверка перед созданием документа
  if (!props.filename || !props.fullName || !props.filename.trim() || !props.fullName.trim()) {
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

  // Проверяем, что filename не содержит только дефисы (пустые taskNumber и client после сброса)
  if (props.filename.match(/^-БКТП--\d{4}-\d{2}-\d{2}$/)) {
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

  // Проверяем, что bmzStore имеет валидные данные (buildingType должен быть 'bmz', а не 'none')
  if (!props.bmzStore || props.bmzStore.buildingType !== 'bmz' || !props.bmzStore.length || !props.bmzStore.width) {
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

  // Дополнительная проверка перед рендером
  if (!PDFDownloadLink || (typeof PDFDownloadLink !== 'function' && !PDFDownloadLink.$$typeof)) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-gray-400 cursor-not-allowed"
      >
        <Download size={16} />
        <span>Загрузка PDF...</span>
      </button>
    );
  }

  try {
    const fileName = `${props.filename}-спецификация.pdf`;
    const LinkComponent = PDFDownloadLink as React.ComponentType<any>;
    
    return (
      <LinkComponent
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
            selectedEquipment={props.selectedEquipment}
            equipmentList={props.equipmentList}
            totals={props.totals}
            customRowsByTable={props.customRowsByTable}
          />
        }
        fileName={fileName}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-[#90bd20] hover:bg-[#7ba01c]"
      >
        {({ loading, blob }: { loading: boolean; blob: Blob | null }) => {
          // Вызываем onReady когда PDF готов (не загружается и есть blob)
          if (!loading && blob && props.onReady) {
            // Используем setTimeout чтобы избежать вызова во время рендера
            setTimeout(() => {
              props.onReady?.();
            }, 0);
          }

          return (
            <>
              <Download size={16} />
              <span>{loading ? 'Подготовка PDF...' : 'Скачать PDF'}</span>
            </>
          );
        }}
      </LinkComponent>
    );
  } catch (error) {
    // В случае ошибки просто показываем отключенную кнопку
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-gray-400 cursor-not-allowed"
      >
        <Download size={16} />
        <span>Ошибка PDF</span>
      </button>
    );
  }
}

PDFWrapper.displayName = 'PDFWrapper';

// Мемоизируем компонент с кастомной функцией сравнения, чтобы избежать перерендеров при изменении customRowsByTable
export default React.memo(PDFWrapper, (prevProps, nextProps) => {
  // Сравниваем только критичные пропсы, игнорируя customRowsByTable
  return (
    prevProps.filename === nextProps.filename &&
    prevProps.fullName === nextProps.fullName &&
    prevProps.user === nextProps.user &&
    prevProps.bmzStore === nextProps.bmzStore &&
    prevProps.selectedTransformer === nextProps.selectedTransformer &&
    prevProps.rusnStore === nextProps.rusnStore &&
    prevProps.selectedWorks === nextProps.selectedWorks &&
    prevProps.worksList === nextProps.worksList &&
    prevProps.runnStore === nextProps.runnStore &&
    prevProps.selectedEquipment === nextProps.selectedEquipment &&
    prevProps.equipmentList === nextProps.equipmentList &&
    prevProps.totals === nextProps.totals
    // Не сравниваем customRowsByTable, чтобы избежать перерендеров
  );
});