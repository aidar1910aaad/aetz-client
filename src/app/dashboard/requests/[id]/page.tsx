'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getApplicationById, ApplicationResponse } from '@/api/requests';
import { FinalReviewContent, FinalReviewTotal } from '@/app/dashboard/final/components';
import { bmzTableConfig, transformerTableConfig, rusnTableConfig, worksTableConfig, runnTableConfig, additionalEquipmentTableConfig } from '@/components/FinalReview/tableConfigs';
import { FileText, Calendar, Hash, Building2, DollarSign, UserCircle, Edit, X, Save, ArrowLeft, ChevronLeft } from 'lucide-react';
import { formatAmount } from '@/utils/formatAmount';
import { updateApplication, createApplication } from '@/api/requests';
import { useUserStore } from '@/store/useUserStore';
import { showToast } from '@/shared/modals/ToastProvider';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useUserStore();
  const [requestData, setRequestData] = useState<ApplicationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Командировочные берём с клиента, чтобы не было SSR рассинхрона
  const [businessTravelTotal, setBusinessTravelTotal] = useState<number>(0);

  const requestId = params.id as string;

  // Загрузка данных заявки
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Токен авторизации не найден');
          return;
        }

        const data = await getApplicationById(parseInt(requestId), token);
        console.log('📋 Данные заявки (полная структура):', JSON.stringify(data, null, 2));
        console.log('📋 Данные заявки (объект):', data);
        console.log('📋 Наценки менеджера:', {
          managerMarkupPercent: (data as any).data?.managerMarkupPercent || (data as any).managerMarkupPercent,
          tableMarkupPercents: (data as any).data?.tableMarkupPercents || (data as any).tableMarkupPercents,
          tableMarkupTotals: (data as any).data?.tableMarkupTotals || (data as any).tableMarkupTotals,
          hasManagerMarkupPercent: 'managerMarkupPercent' in ((data as any).data || data),
          hasTableMarkupPercents: 'tableMarkupPercents' in ((data as any).data || data),
          hasTableMarkupTotals: 'tableMarkupTotals' in ((data as any).data || data),
        });
        setRequestData(data);
      } catch (err: any) {
        console.error('❌ Ошибка при загрузке заявки:', err);
        setError(err.message || 'Ошибка при загрузке заявки');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  // Загрузка командировочных из localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('businessTravelTotal');
    const parsed = saved ? Number(saved) : 0;
    if (!Number.isNaN(parsed)) setBusinessTravelTotal(parsed);
  }, []);

  // Преобразуем данные в формат, ожидаемый компонентами Final
  // Используем безопасные значения по умолчанию для всех полей
  const bmzStore = requestData?.data?.bmz || {};
  const selectedTransformer = requestData?.data?.transformer?.selected || null;
  const rusnStore = requestData?.data?.rusn || {};
  const runnStore = (requestData?.data?.runn || {}) as any;
  
  // Логирование данных РУНН для отладки
  React.useEffect(() => {
    if (requestData?.data?.runn && process.env.NODE_ENV === 'development') {
      console.log('🔍 RequestDetailPage - РУНН данные из API:', {
        cellConfigs: runnStore?.cellConfigs?.length || 0,
        cellSummaries: runnStore?.cellSummaries?.length || 0,
        busbarSummary: !!runnStore?.busbarSummary,
        busBridgeSummary: !!runnStore?.busBridgeSummary,
        busBridgeSummaries: runnStore?.busBridgeSummaries?.length || 0,
        fullRunnStore: runnStore,
      });
    }
  }, [requestData, runnStore]);
  const selectedEquipment = requestData?.data?.additionalEquipment?.selected || {};
  const equipmentList = requestData?.data?.additionalEquipment?.equipmentList || [];
  const selectedWorks = requestData?.data?.works?.selected || {};
  const worksList = requestData?.data?.works?.worksList || [];

  // Функция для расчета цены УСТ
  const calculateUstPrice = React.useCallback((calc: any, additionalUstCost: number = 0) => {
    if (!calc?.data?.categories) return 0;
    
    let materialsTotal = 0;
    calc.data.categories.forEach((category: any) => {
      category.items.forEach((item: any) => {
        materialsTotal += (item.price || 0) * (item.quantity || 0);
      });
    });

    const totalMaterialsWithUst = materialsTotal + additionalUstCost;
    const calculation = calc.data.calculation;
    if (!calculation) return totalMaterialsWithUst;

    const manufacturingCost = (calculation.manufacturingHours || 0) * (calculation.hourlyRate || 0);
    const overheadCost = totalMaterialsWithUst * ((calculation.overheadPercentage || 0) / 100);
    const productionCost = totalMaterialsWithUst + manufacturingCost + overheadCost;
    const adminCost = totalMaterialsWithUst * ((calculation.adminPercentage || 0) / 100);
    const fullCost = productionCost + adminCost;
    const profitCost = fullCost * ((calculation.plannedProfitPercentage || 0) / 100);
    const wholesalePrice = fullCost + profitCost;
    const vatCost = wholesalePrice * ((calculation.ndsPercentage || 0) / 100);
    const finalPrice = wholesalePrice + vatCost;

    return finalPrice;
  }, []);

  // === Расчет итоговых сумм (единый источник истины) ===
  // БМЗ: считаем сумму из тех же строк, что в таблице БМЗ
  const bmzRows = React.useMemo(() => {
    if (!requestData) return [];
    return bmzTableConfig.dataMapper(bmzStore);
  }, [bmzStore, requestData]);
  const bmzTotal = bmzRows.reduce((sum, row: any) => sum + (row.total || 0), 0);

  // Трансформатор: учитываем УСТ калькуляции
  const transformerQuantity = selectedTransformer?.quantity || 2;
  const transformerBasePrice = selectedTransformer?.price || 0;
  const transformerBaseTotal = transformerBasePrice * transformerQuantity;
  
  // Рассчитываем стоимость УСТ
  const ustTotal = React.useMemo(() => {
    if (!selectedTransformer) return 0;
    const busbarUstData = selectedTransformer.busbarUstData;
    const busbarUstCost = busbarUstData ? 
      (busbarUstData.mainUstWeight + busbarUstData.zeroUstWeight) * 
      (busbarUstData.material === 'Алюминий' ? 2800 : 5600) : 0;

    let total = 0;
    if (selectedTransformer.ustCalculations && selectedTransformer.ustCalculations.length > 0) {
      selectedTransformer.ustCalculations.forEach((calc: any) => {
        const shouldAddBusbarCost = calc.name?.includes('0.4кВ') || calc.name?.includes('УСТ-0.4кВ');
        const additionalCost = shouldAddBusbarCost ? busbarUstCost : 0;
        const ustPrice = calculateUstPrice(calc, additionalCost);
        total += ustPrice * transformerQuantity;
      });
    } else if (selectedTransformer.ustCalculation) {
      const ustPrice = calculateUstPrice(selectedTransformer.ustCalculation);
      total = ustPrice * transformerQuantity;
    }
    return total;
  }, [selectedTransformer, calculateUstPrice, transformerQuantity]);

  const transformerTotal = transformerBaseTotal + ustTotal;

  const rusnTotal = React.useMemo(() => {
    if (!requestData) return 0;
    return (
      ((rusnStore as any).cellConfigs || []).reduce((sum: number, cell: any) => sum + (cell.totalPrice || 0), 0) +
      ((rusnStore as any).busBridgeSummary?.totalPrice || 0) +
      ((rusnStore as any).busbarSummary?.totalPrice || 0)
    );
  }, [rusnStore, requestData]);

  // Сумма работ - считаем из тех же строк, что рендерятся в таблице
  const worksRows = React.useMemo(() => {
    if (!requestData) return [];
    return worksTableConfig.dataMapper({ selected: selectedWorks, worksList }, { businessTravelTotal });
  }, [selectedWorks, worksList, businessTravelTotal, requestData]);
  const worksTotal = worksRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);

  // Сумма РУНН — из тех же строк, что рендерятся в таблице RUNN
  const runnRows = React.useMemo(() => {
    if (!requestData) return [];
    return runnTableConfig.dataMapper(runnStore);
  }, [runnStore, requestData]);
  const runnTotal = runnRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);

  // Сумма дополнительного оборудования - считаем из тех же строк, что рендерятся в таблице
  const additionalEquipmentRows = React.useMemo(() => {
    if (!requestData) return [];
    return additionalEquipmentTableConfig.dataMapper({ selected: selectedEquipment, equipmentList });
  }, [selectedEquipment, equipmentList, requestData]);
  const additionalEquipmentTotal = additionalEquipmentRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);

  const grandTotal = bmzTotal + transformerTotal + rusnTotal + runnTotal + worksTotal + additionalEquipmentTotal;
  // === / Расчет итоговых сумм ===

  // Извлекаем данные о наценках из заявки (проверяем и в data, и на верхнем уровне для обратной совместимости)
  const initialTableMarkupPercents = (requestData as any)?.data?.tableMarkupPercents || (requestData as any)?.tableMarkupPercents || {};
  const initialTableMarkupTotals = (requestData as any)?.data?.tableMarkupTotals || (requestData as any)?.tableMarkupTotals || {};
  const initialManagerMarkupPercent = (requestData as any)?.data?.managerMarkupPercent || (requestData as any)?.managerMarkupPercent || 0;

  // Состояния для редактирования наценок
  const [tableMarkupPercents, setTableMarkupPercents] = useState<Record<string, number>>(initialTableMarkupPercents);
  const [tableMarkupTotals, setTableMarkupTotals] = useState<Record<string, number | null>>(initialTableMarkupTotals);
  const [managerMarkupPercent, setManagerMarkupPercent] = useState<number>(initialManagerMarkupPercent);
  
  // Состояние для заметок
  const [notes, setNotes] = useState<string>('');
  
  // Состояние для пользовательских строк
  const [customRowsByTable, setCustomRowsByTable] = useState<Record<string, any[]>>({});
  
  // Обработчик изменения пользовательских строк для FinalReviewContent
  const handleCustomRowsChange = React.useCallback((tableId: string, rows: any[]) => {
    setCustomRowsByTable(prev => ({
      ...prev,
      [tableId]: rows,
    }));
  }, []);
  
  // Инициализируем заметки при загрузке данных заявки
  React.useEffect(() => {
    if (requestData) {
      const savedNotes = (requestData as any)?.data?.notes || '';
      setNotes(savedNotes);
      
      // Инициализируем пользовательские строки
      const savedCustomRows = (requestData as any)?.data?.customRowsByTable || {};
      setCustomRowsByTable(savedCustomRows);
    }
  }, [requestData]);

  // Обновляем состояния при изменении данных заявки
  React.useEffect(() => {
    if (requestData) {
      const newPercents = (requestData as any)?.data?.tableMarkupPercents || (requestData as any)?.tableMarkupPercents || {};
      const newTotals = (requestData as any)?.data?.tableMarkupTotals || (requestData as any)?.tableMarkupTotals || {};
      const newManagerPercent = (requestData as any)?.data?.managerMarkupPercent || (requestData as any)?.managerMarkupPercent || 0;
      const newNotes = (requestData as any)?.data?.notes || '';
      const newCustomRows = (requestData as any)?.data?.customRowsByTable || {};
      
      if (!isEditing) {
        setTableMarkupPercents(newPercents);
        setTableMarkupTotals(newTotals);
        setManagerMarkupPercent(newManagerPercent);
        setNotes(newNotes);
        setCustomRowsByTable(newCustomRows);
      }
    }
  }, [requestData, isEditing]);

  // Проверка изменений наценок и заметок
  const hasChanges = React.useMemo(() => {
    if (!requestData || !isEditing) return false;
    
    const initialPercents = (requestData as any)?.data?.tableMarkupPercents || (requestData as any)?.tableMarkupPercents || {};
    const initialTotals = (requestData as any)?.data?.tableMarkupTotals || (requestData as any)?.tableMarkupTotals || {};
    const initialManagerPercent = (requestData as any)?.data?.managerMarkupPercent || (requestData as any)?.managerMarkupPercent || 0;
    const initialNotes = (requestData as any)?.data?.notes || '';
    const initialCustomRows = (requestData as any)?.data?.customRowsByTable || {};
    
    const percentsChanged = JSON.stringify(initialPercents) !== JSON.stringify(tableMarkupPercents);
    const totalsChanged = JSON.stringify(initialTotals) !== JSON.stringify(tableMarkupTotals);
    const managerPercentChanged = Math.abs(initialManagerPercent - managerMarkupPercent) > 0.01;
    const notesChanged = (initialNotes || '').trim() !== (notes || '').trim();
    const customRowsChanged = JSON.stringify(initialCustomRows) !== JSON.stringify(customRowsByTable);
    
    return percentsChanged || totalsChanged || managerPercentChanged || notesChanged || customRowsChanged;
  }, [requestData, isEditing, tableMarkupPercents, tableMarkupTotals, managerMarkupPercent, notes, customRowsByTable]);

  // Функция сохранения изменений наценок
  const [isSaving, setIsSaving] = React.useState(false);
  const handleSaveMarkups = async () => {
    if (!requestData || !hasChanges) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      // Определяем originalBidId для новой заявки
      // Если у текущей заявки уже есть originalBidId, то используем ID текущей заявки
      // Иначе используем ID текущей заявки как originalBidId
      const currentOriginalBidId = (requestData as any)?.data?.originalBidId;
      // Если есть originalBidId, значит это уже измененная заявка, поэтому originalBidId новой = ID текущей
      // Если нет originalBidId, значит это оригинальная заявка, поэтому originalBidId новой = ID текущей
      const originalBidId = requestData.id;

      // Вычисляем итоговую сумму с наценками
      // Сумма наценки = сумма разниц между marked-up totals и base totals для каждой таблицы
      let managerMarkupAmount = 0;
      const tableConfigs = [
        { id: bmzTableConfig.id, baseTotal: bmzTotal },
        { id: transformerTableConfig.id, baseTotal: transformerTotal },
        { id: rusnTableConfig.id, baseTotal: rusnTotal },
        { id: runnTableConfig.id, baseTotal: runnTotal },
        { id: worksTableConfig.id, baseTotal: worksTotal },
        { id: additionalEquipmentTableConfig.id, baseTotal: additionalEquipmentTotal },
      ];

      tableConfigs.forEach(({ id, baseTotal }) => {
        if (baseTotal > 0) {
          const markupTotal = tableMarkupTotals[id];
          if (markupTotal && markupTotal > 0) {
            managerMarkupAmount += markupTotal - baseTotal;
          }
        }
      });

      const finalTotal = grandTotal + managerMarkupAmount;

      // Получаем текущую дату в формате YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];

      // Всегда создаем новую заявку при редактировании
      const newApplicationData: any = {
        taskNumber: requestData.taskNumber,
        date: today, // Используем текущую дату
        client: requestData.client,
        type: requestData.type,
        user: currentUser ? {
          id: currentUser.id,
          username: currentUser.username || '',
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
        } : null, // Используем текущего пользователя
        totalAmount: finalTotal, // Используем итоговую сумму с наценками
        data: {
          ...requestData.data,
          managerMarkupPercent,
          tableMarkupPercents,
          tableMarkupTotals,
          // originalBidId всегда равен ID текущей заявки (создаем цепочку)
          originalBidId: originalBidId,
          // Заметки к заявке
          ...(notes.trim() && { notes: notes.trim() }),
          // Пользовательские строки для каждой таблицы
          ...(Object.keys(customRowsByTable).length > 0 && { customRowsByTable }),
        },
      };

      const result = await createApplication(newApplicationData, token);
      
      showToast(`Новая заявка успешно создана! ID: ${result.id}, Номер: ${result.bidNumber}`, 'success');
      
      // Перенаправляем на новую заявку
      router.push(`/dashboard/requests/${result.id}`);
    } catch (error: any) {
      console.error('Ошибка при сохранении наценок:', error);
      showToast(`Ошибка при сохранении: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Логирование данных о наценках для отладки
  React.useEffect(() => {
    if (requestData && process.env.NODE_ENV === 'development') {
      console.log('📊 RequestDetailPage - Данные о наценках:', {
        managerMarkupPercent,
        tableMarkupPercents,
        tableMarkupTotals,
        requestDataMarkup: {
          managerMarkupPercent: (requestData as any).data?.managerMarkupPercent || (requestData as any).managerMarkupPercent,
          tableMarkupPercents: (requestData as any).data?.tableMarkupPercents || (requestData as any).tableMarkupPercents,
          tableMarkupTotals: (requestData as any).data?.tableMarkupTotals || (requestData as any).tableMarkupTotals,
        },
      });
    }
  }, [requestData, managerMarkupPercent, tableMarkupPercents, tableMarkupTotals]);

  // Формируем данные для компонентов Final (используем безопасные значения)
  const filename = requestData 
    ? `${requestData.taskNumber}-${requestData.type}-${requestData.client}-${requestData.date}`
    : '';
  const fullName = requestData?.user
    ? `${requestData.user.lastName || ''} ${requestData.user.firstName || ''}`.trim() || requestData.user.username
    : 'Пользователь';

  // Получаем информацию о родительской заявке
  const originalBidId = requestData ? ((requestData as any)?.data?.originalBidId || (requestData as any)?.originalBidId) : null;
  const hasParentBid = originalBidId && originalBidId !== requestData?.id;

  // Условные возвраты после всех хуков
  if (loading) {
    return (
      <div className="h-[calc(100vh-110px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка заявки...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-110px)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-2">Ошибка загрузки</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/requests')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="h-[calc(100vh-110px)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📄</div>
          <p className="text-gray-600 text-lg mb-4">Заявка не найдена</p>
          <button
            onClick={() => router.push('/dashboard/requests')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      {/* Кнопка "Назад" */}
      <button
        onClick={() => router.push('/dashboard/requests')}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-[#8eba1e] transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-medium">Назад к заявкам</span>
      </button>

      {/* Заголовок с информацией о заявке */}
      <div className="mb-6 bg-gradient-to-br from-[#8eba1e] to-[#7aa31a] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-white">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  Заявка {requestData.bidNumber}
                </h1>
                <p className="text-white/90 text-lg">Детальная информация о заявке</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20 flex items-center justify-end whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-white/90 text-sm">Общая сумма</span>
                  <span className="text-lg font-bold">{formatAmount(requestData.totalAmount)} ₸</span>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Редактировать
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Восстанавливаем исходные значения
                    const newPercents = (requestData as any)?.data?.tableMarkupPercents || (requestData as any)?.tableMarkupPercents || {};
                    const newTotals = (requestData as any)?.data?.tableMarkupTotals || (requestData as any)?.tableMarkupTotals || {};
                    const newManagerPercent = (requestData as any)?.data?.managerMarkupPercent || (requestData as any)?.managerMarkupPercent || 0;
                    setTableMarkupPercents(newPercents);
                    setTableMarkupTotals(newTotals);
                    setManagerMarkupPercent(newManagerPercent);
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Отменить
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-white/90" />
                <span className="text-white/80 text-sm font-medium">Клиент</span>
              </div>
              <p className="text-white text-lg font-semibold">{requestData.client}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-white/90" />
                <span className="text-white/80 text-sm font-medium">Тип</span>
              </div>
              <p className="text-white text-lg font-semibold">{requestData.type}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-white/90" />
                <span className="text-white/80 text-sm font-medium">Дата</span>
              </div>
              <p className="text-white text-lg font-semibold">
                {new Date(requestData.date).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Hash className="w-5 h-5 text-white/90" />
                <span className="text-white/80 text-sm font-medium">Номер задачи</span>
              </div>
              <p className="text-white text-lg font-semibold">{requestData.taskNumber}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 flex-wrap">
            {fullName && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex-1 min-w-[200px]">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-5 h-5 text-white/90" />
                  <div>
                    <span className="text-white/80 text-sm font-medium">Автор: </span>
                    <span className="text-white text-lg font-semibold">{fullName}</span>
                  </div>
                </div>
              </div>
            )}
            {hasParentBid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/requests/${originalBidId}`);
                }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex-1 min-w-[200px] hover:bg-white/20 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <ArrowLeft className="w-5 h-5 text-white/90" />
                  <div>
                    <span className="text-white/80 text-sm font-medium">Пред заявка: </span>
                    <span className="text-white text-lg font-semibold">
                      #{originalBidId}
                    </span>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Компоненты из Final страницы */}
      <FinalReviewContent
        bmzStore={bmzStore as any}
        selectedTransformer={selectedTransformer}
        rusnStore={rusnStore as any}
        runnStore={runnStore}
        selectedEquipment={selectedEquipment}
        equipmentList={equipmentList}
        selectedWorks={selectedWorks}
        worksList={worksList}
        managerMarkupPercent={managerMarkupPercent}
        tableMarkupPercents={tableMarkupPercents}
        setTableMarkupPercents={isEditing ? setTableMarkupPercents : undefined}
        tableMarkupTotals={tableMarkupTotals}
        setTableMarkupTotals={isEditing ? setTableMarkupTotals : undefined}
        setManagerMarkupPercent={isEditing ? setManagerMarkupPercent : undefined}
        isReadOnly={!isEditing}
        customRowsByTable={customRowsByTable}
        onCustomRowsChange={isEditing ? handleCustomRowsChange : undefined}
      />

      <FinalReviewTotal
        bmzStore={bmzStore as any}
        selectedTransformer={selectedTransformer}
        rusnStore={rusnStore as any}
        runnStore={runnStore}
        selectedEquipment={selectedEquipment}
        equipmentList={equipmentList}
        selectedWorks={selectedWorks}
        worksList={worksList}
        user={requestData.user}
        taskNumber={requestData.taskNumber}
        client={requestData.client}
        date={requestData.date}
        totals={{
          bmzTotal,
          transformerTotal,
          rusnTotal,
          runnTotal,
          additionalEquipmentTotal,
          worksTotal,
          grandTotal,
        }}
        filename={filename}
        fullName={fullName}
        isReadOnly={!isEditing}
        managerMarkupPercent={managerMarkupPercent}
        setManagerMarkupPercent={isEditing ? setManagerMarkupPercent : undefined}
        tableMarkupPercents={tableMarkupPercents}
        tableMarkupTotals={tableMarkupTotals}
        hideResetButton={true}
        hasChanges={hasChanges}
        onSave={handleSaveMarkups}
        isSavingExternal={isSaving}
        originalBidId={originalBidId || undefined}
        initialNotes={notes}
        onNotesChange={isEditing ? setNotes : undefined}
        customRowsByTable={customRowsByTable}
      />
    </div>
  );
}