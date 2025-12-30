'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaUndo } from 'react-icons/fa';
import { FileText, Download } from 'lucide-react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useCellSummariesStore } from '@/store/useCellSummariesStore';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useWorksStore } from '@/store/useWorksStore';
import { bmzTableConfig, transformerTableConfig, rusnTableConfig, worksTableConfig, runnTableConfig, additionalEquipmentTableConfig } from '@/components/FinalReview/tableConfigs';
import { useUserStore } from '@/store/useUserStore';
import { createApplication, type ApplicationData } from '@/api/requests';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorksState, WorkItem } from '@/store/useWorksStore';
import type { AdditionalEquipmentState, AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';
import dynamic from 'next/dynamic';
import { formatAmount } from '@/utils/formatAmount';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { showToast } from '@/shared/modals/ToastProvider';

const PDFDownloadButton = dynamic(() => import('./PDFDownloadButton'), { ssr: false });
const KPDownloadButton = dynamic(() => import('./KPDownloadButton'), { ssr: false });
// removed unused WorksState import

// Компонент для заметок, изолированный от остального компонента
const NotesSection = React.memo(function NotesSection({
  notes,
  onNotesChange,
  isReadOnly,
}: {
  notes: string;
  onNotesChange: (notes: string) => void;
  isReadOnly: boolean;
}) {
  // Инициализируем состояние на основе наличия заметок при монтировании
  // Если есть заметки, блок открывается автоматически
  const [showNotes, setShowNotes] = React.useState(() => !!notes.trim());
  // Отслеживаем, был ли блок закрыт пользователем вручную
  const userClosedRef = React.useRef(false);
  // Отслеживаем, была ли выполнена первоначальная инициализация
  const isInitialMount = React.useRef(true);
  
  // Отслеживаем изменения notes после монтирования
  // Если заметки загружаются позже (становятся не пустыми) и пользователь еще не закрывал блок, открываем
  React.useEffect(() => {
    // Пропускаем первый рендер (инициализация уже выполнена через useState)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Если заметки появились (стали не пустыми) и пользователь еще не закрывал блок, открываем
    const hasNotes = !!notes.trim();
    if (hasNotes && !userClosedRef.current) {
      setShowNotes(true);
    }
  }, [notes]);
  
  // Обработчик клика на кнопку открытия/закрытия
  const handleToggleNotes = () => {
    const newShowNotes = !showNotes;
    setShowNotes(newShowNotes);
    // Если пользователь закрыл блок, запоминаем это (блок больше не откроется автоматически)
    if (!newShowNotes) {
      userClosedRef.current = true;
    }
    // Если пользователь открыл блок вручную, сбрасываем флаг (можно снова автоматически открывать)
    else {
      userClosedRef.current = false;
    }
  };

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <button
        onClick={handleToggleNotes}
        className="w-full flex items-center justify-between text-left text-sm font-semibold text-gray-700 hover:text-[#8eba1e] transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Добавить заметки</span>
          {notes.trim() && (
            <span className="text-xs bg-[#8eba1e] text-white px-2 py-0.5 rounded-full">
              ✓
            </span>
          )}
        </div>
        <span className={`text-xs transition-transform ${showNotes ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {showNotes && (
        <div className="mt-3">
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Введите заметки к заявке..."
            className="w-full min-h-[100px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-transparent resize-y text-sm"
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
          {notes.trim() && (
            <p className="mt-2 text-xs text-gray-500">
              {notes.trim().length} символов
            </p>
          )}
        </div>
      )}
    </div>
  );
});

// Компонент для кнопок PDF с подготовкой по запросу
const PDFButtons = function PDFButtons({
  filename,
  fullName,
  user,
  bmzStore,
  selectedTransformer,
  rusnStore,
  selectedWorks,
  worksList,
  runnStore,
  selectedEquipment,
  equipmentList,
  totals,
  tableMarkupTotals,
  tableMarkupPercents,
  customRowsByTable,
}: {
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
  tableMarkupPercents?: Record<string, number>;
  customRowsByTable?: Record<string, any[]>;
}) {
  const [isPreparing, setIsPreparing] = React.useState(false);
  const [isPDFReady, setIsPDFReady] = React.useState(false);
  const [isKPReady, setIsKPReady] = React.useState(false);
  
  // Создаем строковое представление данных для отслеживания изменений
  const dataSnapshot = React.useMemo(() => {
    return JSON.stringify({
      tableMarkupTotals,
      tableMarkupPercents,
      customRowsByTable,
    });
  }, [tableMarkupTotals, tableMarkupPercents, customRowsByTable]);

  // Используем ref для отслеживания предыдущего snapshot и состояния рендеринга
  const prevSnapshotRef = React.useRef<string | null>(null);
  const shouldRenderPDFRef = React.useRef(false);
  const [shouldRenderPDF, setShouldRenderPDF] = React.useState(false);
  const [renderKey, setRenderKey] = React.useState(0);

  // Инициализируем при первом рендере
  if (prevSnapshotRef.current === null) {
    prevSnapshotRef.current = dataSnapshot;
  }

  // Синхронно проверяем изменение данных в рендере
  // prevSnapshotRef.current хранит snapshot данных на момент нажатия "Сформировать PDF"
  // Если данные изменились после начала подготовки, сбрасываем флаг рендеринга
  const hasDataChanged = prevSnapshotRef.current !== null && prevSnapshotRef.current !== dataSnapshot;
  
  // Если данные изменились после начала подготовки, синхронно сбрасываем флаг рендеринга
  if (hasDataChanged && shouldRenderPDFRef.current) {
    shouldRenderPDFRef.current = false;
  }
  
  // Отслеживаем изменения данных и сбрасываем состояние при изменении
  React.useEffect(() => {
    if (hasDataChanged && shouldRenderPDFRef.current) {
      // Сбрасываем состояние через state (для следующего рендера)
      setShouldRenderPDF(false);
      setIsPreparing(false);
      setIsPDFReady(false);
      setIsKPReady(false);
      setRenderKey(prev => prev + 1);
    }
  }, [dataSnapshot, hasDataChanged]);

  // Обновляем shouldRenderPDF когда начинаем подготовку
  React.useEffect(() => {
    if (isPreparing) {
      shouldRenderPDFRef.current = true;
      setShouldRenderPDF(true);
    }
  }, [isPreparing]);

  const handlePrepare = () => {
    // Сохраняем snapshot данных на момент нажатия "Сформировать PDF"
    prevSnapshotRef.current = dataSnapshot;
    shouldRenderPDFRef.current = true;
    setShouldRenderPDF(true);
    setIsPreparing(true);
    setIsPDFReady(false);
    setIsKPReady(false);
  };

  const handlePDFReady = () => {
    // Проверяем, что мы все еще в состоянии подготовки перед установкой готовности
    if (isPreparing) {
      setIsPDFReady(true);
    }
  };

  const handleKPReady = () => {
    // Проверяем, что мы все еще в состоянии подготовки перед установкой готовности
    if (isPreparing) {
      setIsKPReady(true);
    }
  };

  // Если данные изменились, не рендерим PDF компоненты вообще
  // Проверяем синхронно, до рендеринга PDF компонентов
  const canRenderPDF = !hasDataChanged && shouldRenderPDFRef.current && shouldRenderPDF && (isPreparing || isPDFReady || isKPReady);

  // Если еще не начали подготовку или состояние было сброшено, показываем одну кнопку "Сформировать PDF"
  if (!canRenderPDF) {
    return (
      <button
        onClick={handlePrepare}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-colors bg-[#90bd20] hover:bg-[#7ba01c]"
      >
        <Download size={16} />
        <span>Сформировать PDF</span>
      </button>
    );
  }

  // Рендерим PDF компоненты только если данные не изменились и все флаги разрешают рендеринг
  // Передаем актуальные данные, так как мы уже проверили, что данные не изменились (canRenderPDF === true)
  return (
    <div className="flex gap-3" key={`pdf-buttons-${renderKey}`}>
      <PDFDownloadButton
        key={`pdf-${renderKey}`}
        filename={filename}
        fullName={fullName}
        user={user}
        bmzStore={bmzStore}
        selectedTransformer={selectedTransformer}
        rusnStore={rusnStore}
        selectedWorks={selectedWorks}
        worksList={worksList}
        runnStore={runnStore}
        selectedEquipment={selectedEquipment}
        equipmentList={equipmentList}
        totals={totals}
        customRowsByTable={customRowsByTable}
        onReady={handlePDFReady}
      />
      <KPDownloadButton
        key={`kp-${renderKey}`}
        filename={filename}
        fullName={fullName}
        user={user}
        bmzStore={bmzStore}
        selectedTransformer={selectedTransformer}
        rusnStore={rusnStore}
        selectedWorks={selectedWorks}
        worksList={worksList}
        runnStore={runnStore}
        selectedEquipment={selectedEquipment}
        equipmentList={equipmentList}
        totals={totals}
        tableMarkupTotals={tableMarkupTotals}
        customRowsByTable={customRowsByTable}
        onReady={handleKPReady}
      />
    </div>
  );
};

interface Totals {
  bmzTotal: number;
  transformerTotal: number;
  rusnTotal: number;
  runnTotal: number;
  additionalEquipmentTotal: number;
  worksTotal: number;
  grandTotal: number;
}

interface FinalReviewTotalProps {
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  runnStore: any;
  selectedEquipment: AdditionalEquipmentState['selected'];
  equipmentList: AdditionalEquipmentItem[];
  selectedWorks: WorksState['selected'];
  worksList: WorkItem[];
  user: any;
  taskNumber: string;
  client: string;
  date: string;
  totals: Totals;
  filename: string;
  fullName: string;
  isReadOnly?: boolean; // Новый пропс для режима только чтения
  managerMarkupPercent: number;
  setManagerMarkupPercent: (value: number) => void;
  tableMarkupPercents?: Record<string, number>;
  tableMarkupTotals?: Record<string, number | null>;
  hideResetButton?: boolean; // Скрыть кнопку сброса
  hasChanges?: boolean; // Есть ли изменения для сохранения
  onSave?: () => void | Promise<void>; // Функция сохранения (для страницы просмотра заявки)
  isSavingExternal?: boolean; // Внешнее состояние сохранения (для страницы просмотра заявки)
  originalBidId?: number; // ID исходной заявки (если создается новая на основе существующей)
  initialNotes?: string; // Начальные заметки (для страницы просмотра заявки)
  onNotesChange?: (notes: string) => void; // Обработчик изменения заметок (для страницы просмотра заявки)
  customRowsByTable?: Record<string, any[]>; // Пользовательские строки для каждой таблицы
}

export default function FinalReviewTotal({
  bmzStore,
  selectedTransformer,
  rusnStore,
  runnStore,
  selectedEquipment,
  equipmentList,
  selectedWorks,
  worksList,
  user,
  taskNumber,
  client,
  date,
  totals,
  filename,
  fullName,
  isReadOnly = false,
  managerMarkupPercent,
  setManagerMarkupPercent,
  tableMarkupPercents = {},
  tableMarkupTotals = {},
  hideResetButton = false,
  hasChanges = true,
  onSave,
  isSavingExternal,
  originalBidId,
  initialNotes = '',
  onNotesChange,
  customRowsByTable = {},
}: FinalReviewTotalProps) {
  const router = useRouter();
  const [isResetting, setIsResetting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showNotes, setShowNotes] = React.useState(false);
  const [notes, setNotes] = React.useState(initialNotes || '');

  // Обновляем заметки при изменении initialNotes
  React.useEffect(() => {
    if (initialNotes !== undefined) {
      setNotes(initialNotes);
      // Показываем блок заметок, если есть заметки
      if (initialNotes.trim()) {
        setShowNotes(true);
      }
    }
  }, [initialNotes]);

  // Обрабатываем изменение заметок
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    if (onNotesChange) {
      onNotesChange(newNotes);
    }
  };
  
  // Используем внешнее состояние сохранения, если оно передано, иначе внутреннее
  const isSavingState = isSavingExternal !== undefined ? isSavingExternal : isSaving;

  // Получаем методы сброса из всех stores
  const resetTransformer = useTransformerStore((s) => s.reset);
  const resetBmz = useBmzStore((s) => s.reset);
  const resetBktp = useBktpStore((s) => s.reset);
  const resetRusn = useRusnStore((s) => s.reset);
  const resetRunn = useRunnStore((s) => s.reset);
  const clearCellSummaries = useCellSummariesStore((s) => s.clearCellSummaries);
  const resetAdditionalEquipment = useAdditionalEquipmentStore((s) => s.reset);
  const resetWorks = useWorksStore((s) => s.reset);

  // Используем переданные суммы (единый источник истины из родительского компонента)
  const { bmzTotal, transformerTotal, rusnTotal, runnTotal, additionalEquipmentTotal, worksTotal, grandTotal } = totals;

  // Расчет наценки менеджера как сумма разниц между итогами с наценкой и базовыми суммами для всех таблиц
  const managerMarkupAmount = React.useMemo(() => {
    let totalMarkup = 0;
    
    // БМЗ
    if (bmzTotal > 0) {
      const bmzMarkupTotal = tableMarkupTotals[bmzTableConfig.id];
      if (bmzMarkupTotal !== null && bmzMarkupTotal !== undefined) {
        totalMarkup += bmzMarkupTotal - bmzTotal;
      }
    }
    
    // Трансформатор
    if (transformerTotal > 0) {
      const transformerMarkupTotal = tableMarkupTotals[transformerTableConfig.id];
      if (transformerMarkupTotal !== null && transformerMarkupTotal !== undefined) {
        totalMarkup += transformerMarkupTotal - transformerTotal;
      }
    }
    
    // РУСН
    if (rusnTotal > 0) {
      const rusnMarkupTotal = tableMarkupTotals[rusnTableConfig.id];
      if (rusnMarkupTotal !== null && rusnMarkupTotal !== undefined) {
        totalMarkup += rusnMarkupTotal - rusnTotal;
      }
    }
    
    // РУНН
    if (runnTotal > 0) {
      const runnMarkupTotal = tableMarkupTotals[runnTableConfig.id];
      if (runnMarkupTotal !== null && runnMarkupTotal !== undefined) {
        totalMarkup += runnMarkupTotal - runnTotal;
      }
    }
    
    // Дополнительное оборудование
    if (additionalEquipmentTotal > 0) {
      const equipmentMarkupTotal = tableMarkupTotals[additionalEquipmentTableConfig.id];
      if (equipmentMarkupTotal !== null && equipmentMarkupTotal !== undefined) {
        totalMarkup += equipmentMarkupTotal - additionalEquipmentTotal;
      }
    }
    
    // Работы
    if (worksTotal > 0) {
      const worksMarkupTotal = tableMarkupTotals[worksTableConfig.id];
      if (worksMarkupTotal !== null && worksMarkupTotal !== undefined) {
        totalMarkup += worksMarkupTotal - worksTotal;
      }
    }
    
    return Math.round(totalMarkup);
  }, [tableMarkupTotals, bmzTotal, transformerTotal, rusnTotal, runnTotal, additionalEquipmentTotal, worksTotal]);

  // Итоговая сумма с наценкой
  const finalTotal = React.useMemo(() => {
    return grandTotal + managerMarkupAmount;
  }, [grandTotal, managerMarkupAmount]);

  // Расчет общего процента наценки: (сумма с наценкой - базовая сумма) / базовая сумма * 100
  const averageMarkupPercent = React.useMemo(() => {
    if (grandTotal <= 0) return 0;
    
    const totalWithMarkup = grandTotal + managerMarkupAmount;
    if (totalWithMarkup <= grandTotal) return 0;
    
    return ((totalWithMarkup - grandTotal) / grandTotal) * 100;
  }, [grandTotal, managerMarkupAmount]);

  // Функция сброса всех данных
  const handleReset = async () => {
    const confirmed = await showConfirm({
      title: 'Сброс всех данных конфигурации',
      message: 'Вы уверены, что хотите сбросить все данные конфигурации?\n\nЭто действие:\n• Сбросит все настройки БМЗ, трансформаторов, РУСН, дополнительного оборудования и работ\n• Сохранит ваш токен авторизации и информацию о пользователе\n• Перенаправит на главную страницу конфигуратора\n\nЭто действие нельзя отменить.',
    });

    if (confirmed) {
      setIsResetting(true);

      // Проверяем, что токен и информация о пользователе сохранятся
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user-storage');

      console.log('Сброс данных конфигурации...');
      console.log('Токен сохранен:', !!token);
      console.log('Информация о пользователе сохранена:', !!userInfo);

      // Сбрасываем все stores
      resetTransformer();
      resetBmz();
      resetBktp();
      resetRusn();
      resetRunn();
      clearCellSummaries();
      resetAdditionalEquipment();
      resetWorks();
      if (setManagerMarkupPercent) {
        setManagerMarkupPercent(0);
      }

      // Небольшая задержка перед перенаправлением
      setTimeout(() => {
        console.log('Перенаправление на главную страницу конфигуратора...');
        router.push('/dashboard/bktp');
      }, 500);
    }
  };

  // Функция сохранения заявки
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      // Формируем данные заявки
      const applicationData: ApplicationData = {
        // Метаданные заявки
        taskNumber,
        date,
        client,
        type: 'БКТП',
        user: user ? {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        } : null,
        totalAmount: finalTotal,
        
        // Все данные конфигурации
        data: {
          // Наценки менеджера
          ...(averageMarkupPercent > 0 && { managerMarkupPercent: averageMarkupPercent }),
          ...(Object.keys(tableMarkupPercents).length > 0 && { tableMarkupPercents }),
          ...(Object.keys(tableMarkupTotals).length > 0 && { tableMarkupTotals }),
          // ID исходной заявки (если создается новая на основе существующей)
          ...(originalBidId && { originalBidId }),
          // Заметки к заявке
          ...(notes.trim() && { notes: notes.trim() }),
          // Пользовательские строки для каждой таблицы
          ...(Object.keys(customRowsByTable).length > 0 && { customRowsByTable }),
          bmz: {
            buildingType: bmzStore.buildingType,
            length: bmzStore.length,
            width: bmzStore.width,
            height: bmzStore.height,
            thickness: bmzStore.thickness,
            blockCount: bmzStore.blockCount,
            settings: bmzStore.settings,
            equipmentState: bmzStore.equipmentState,
            total: bmzTotal,
          },
          transformer: {
            selected: selectedTransformer,
            total: transformerTotal,
          },
          rusn: {
            cellConfigs: rusnStore.cellConfigs,
            busbarSummary: rusnStore.busbarSummary,
            busBridgeSummary: rusnStore.busBridgeSummary,
            busBridgeSummaries: rusnStore.busBridgeSummaries,
            cellSummaries: rusnStore.cellSummaries,
            total: rusnTotal,
          },
          runn: {
            cellConfigs: runnStore.cellConfigs || [],
            cellSummaries: runnStore.cellSummaries || [],
            busbarSummary: runnStore.busbarSummary,
            busBridgeSummary: runnStore.busBridgeSummary,
            busBridgeSummaries: runnStore.busBridgeSummaries || [],
            global: runnStore.global || {},
            busBridges: runnStore.busBridges || [],
            total: runnTotal,
          },
          additionalEquipment: {
            selected: selectedEquipment,
            equipmentList: equipmentList,
            total: additionalEquipmentTotal,
          },
          works: {
            selected: selectedWorks,
            worksList: worksList,
            total: worksTotal,
          },
        },
      };

      // Логируем данные перед отправкой
      console.log('=== ДАННЫЕ ЗАЯВКИ ДЛЯ ОТПРАВКИ ===');
      console.log('📋 Метаданные заявки:', {
        taskNumber,
        date,
        client,
        type: 'БКТП',
        user: user ? `${user.lastName} ${user.firstName} (${user.username})` : 'Не авторизован',
        totalAmount: `${grandTotal.toLocaleString('ru-RU')} ₸`
      });
      
      console.log('📦 Данные конфигурации:');
      console.log('  🏢 БМЗ:', {
        buildingType: bmzStore.buildingType,
        dimensions: `${bmzStore.length}x${bmzStore.width}x${bmzStore.height}мм`,
        thickness: `${bmzStore.thickness}мм`,
        blockCount: bmzStore.blockCount,
        total: `${bmzTotal.toLocaleString('ru-RU')} ₸`
      });
      
      console.log('  ⚡ Трансформатор:', selectedTransformer ? {
        name: (selectedTransformer as any).name || (selectedTransformer as any).model,
        power: selectedTransformer.power,
        price: `${selectedTransformer.price?.toLocaleString('ru-RU')} ₸`,
        total: `${transformerTotal.toLocaleString('ru-RU')} ₸`
      } : 'Не выбран');
      
      console.log('  🔌 РУСН:', {
        cellConfigs: rusnStore.cellConfigs.length,
        cellSummaries: rusnStore.cellSummaries.length,
        busbarSummary: rusnStore.busbarSummary ? 'Есть' : 'Нет',
        busBridgeSummary: rusnStore.busBridgeSummary ? 'Есть' : 'Нет',
        total: `${rusnTotal.toLocaleString('ru-RU')} ₸`
      });
      
      console.log('  🔌 РУНН:', {
        cellSummaries: runnStore.cellSummaries?.length || 0,
        busbarSummary: runnStore.busbarSummary ? 'Есть' : 'Нет',
        busBridgeSummary: runnStore.busBridgeSummary ? 'Есть' : 'Нет',
        total: `${runnTotal.toLocaleString('ru-RU')} ₸`
      });
      
      console.log('  🔧 Дополнительное оборудование:', {
        selectedCount: Object.keys(selectedEquipment).length,
        equipmentListCount: equipmentList.length,
        total: `${additionalEquipmentTotal.toLocaleString('ru-RU')} ₸`
      });
      
      console.log('  💰 Переданные суммы:', totals);
      
      console.log('  🛠️ Работы:', {
        selectedCount: Object.keys(selectedWorks).length,
        worksListCount: worksList.length,
        total: `${worksTotal.toLocaleString('ru-RU')} ₸`
      });
      
      console.log('💰 ОБЩАЯ СУММА (без наценки):', `${grandTotal.toLocaleString('ru-RU')} ₸`);
      console.log('💰 НАЦЕНКА МЕНЕДЖЕРА:', `${averageMarkupPercent.toFixed(1)}% = ${managerMarkupAmount.toLocaleString('ru-RU')} ₸`);
      console.log('💰 ИТОГОВАЯ СУММА (с наценкой):', `${finalTotal.toLocaleString('ru-RU')} ₸`);
      console.log('📊 НАЦЕНКИ ПО ТАБЛИЦАМ:', {
        percents: tableMarkupPercents,
        totals: tableMarkupTotals,
      });
      console.log('📦 Наценки в applicationData:', {
        managerMarkupPercent: applicationData.data.managerMarkupPercent,
        tableMarkupPercents: applicationData.data.tableMarkupPercents,
        tableMarkupTotals: applicationData.data.tableMarkupTotals,
      });
      console.log('📦 Полная структура данных (JSON):', JSON.stringify(applicationData, null, 2));
      console.log('📦 Полная структура данных (объект):', applicationData);
      console.log('=== КОНЕЦ ДАННЫХ ЗАЯВКИ ===');

      // Отправляем данные на сервер
      const result = await createApplication(applicationData, token);
      
      // Сохраняем информацию о созданной заявке в sessionStorage для показа toast после редиректа
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('createdApplication', JSON.stringify({
          id: result.id,
          bidNumber: result.bidNumber,
          timestamp: Date.now(),
        }));
      }
      
      // Сохраняем данные для сброса сторов после редиректа
      const resetStores = () => {
        console.log('🔄 Сброс всех сторов после сохранения...');
        resetTransformer();
        resetBmz();
        resetBktp();
        resetRusn();
        resetRunn();
        clearCellSummaries();
        resetAdditionalEquipment();
        resetWorks();
        if (setManagerMarkupPercent) {
          setManagerMarkupPercent(0);
        }
        
        // Очищаем localStorage для командировочных, если нужно
        if (typeof window !== 'undefined') {
          localStorage.removeItem('businessTravelTotal');
        }
      };
      
      // Перенаправляем на страницу заявок
      router.push('/dashboard/requests');
      
      // Сбрасываем сторы после редиректа с задержкой
      // Используем requestAnimationFrame для гарантии, что редирект начнется
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          setTimeout(resetStores, 100);
        });
      } else {
        // Если мы на сервере (не должно произойти), сбрасываем сразу
        resetStores();
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка при сохранении заявки:', error);
      console.error('📋 Детали ошибки:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showToast(`Ошибка при сохранении заявки: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Наценка менеджера */}
      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Наценка менеджера:
            </label>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-900 font-medium">
                {averageMarkupPercent.toFixed(1)}
              </div>
              <span className="text-sm text-gray-600">%</span>
            {managerMarkupAmount > 0 && (
              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Сумма наценки:</span>
                  <span className="text-sm font-semibold text-[#8eba1e]">
                    {formatAmount(managerMarkupAmount)} тг
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Сумма с наценкой:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatAmount(grandTotal + managerMarkupAmount)} тг
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Блок заметок - вынесен в отдельный компонент для изоляции от кнопок PDF */}
      <NotesSection
        notes={notes}
        onNotesChange={handleNotesChange}
        isReadOnly={isReadOnly}
      />

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {!isReadOnly && (
            <>
              {!hideResetButton && (
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold w-12 h-12 rounded-lg shadow transition-colors flex items-center justify-center"
                  title="Сбросить все данные"
                >
                  <FaUndo className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
                </button>
              )}
              <button
                onClick={onSave ? async () => { await onSave(); } : handleSave}
                disabled={isSavingState || !hasChanges}
                className={`${hasChanges ? 'bg-[#90bd20] hover:bg-[#7ba01c]' : 'bg-gray-400 cursor-not-allowed'} disabled:bg-gray-400 text-white font-bold px-6 py-3 rounded-lg shadow transition-colors flex items-center gap-2`}
              >
                <FaSave className={`w-4 h-4 ${isSavingState ? 'animate-pulse' : ''}`} />
                {isSavingState ? 'Сохранение...' : 'Сохранить'}
              </button>
            </>
          )}
          {/* Скрываем PDF кнопки во время сохранения и если данные не валидны, чтобы избежать ошибок */}
          {!isSavingState && 
           filename && 
           fullName && 
           bmzStore?.buildingType === 'bmz' && 
           bmzStore?.length > 0 && 
           bmzStore?.width > 0 &&
           !filename.match(/^-БКТП--\d{4}-\d{2}-\d{2}$/) && (
            <PDFButtons
              filename={filename}
              fullName={fullName}
              user={user}
              bmzStore={bmzStore}
              selectedTransformer={selectedTransformer}
              rusnStore={rusnStore}
              selectedWorks={selectedWorks}
              worksList={worksList}
              runnStore={runnStore}
              selectedEquipment={selectedEquipment}
              equipmentList={equipmentList}
              totals={totals}
              tableMarkupTotals={tableMarkupTotals}
              tableMarkupPercents={tableMarkupPercents}
              customRowsByTable={customRowsByTable}
            />
          )}
        </div>
        <div className="bg-[#90bd20] text-white font-bold text-lg px-8 py-3 rounded-lg shadow">
          Сумма: {formatAmount(grandTotal)} тг
        </div>
      </div>
    </div>
  );
}
