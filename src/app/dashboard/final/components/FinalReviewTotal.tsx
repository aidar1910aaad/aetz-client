'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaUndo } from 'react-icons/fa';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useRunnStore } from '@/store/useRunnStore';

import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useWorksStore } from '@/store/useWorksStore';
import { bmzTableConfig, worksTableConfig, runnTableConfig } from '@/components/FinalReview/tableConfigs';
import { useUserStore } from '@/store/useUserStore';
import { createApplication, type ApplicationData } from '@/api/requests';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
// removed unused WorksState import

interface FinalReviewTotalProps {
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  runnStore: any;
  selectedEquipment: any;
  equipmentList: any[];
  selectedWorks: any;
  worksList: any[];
  user: any;
  taskNumber: string;
  client: string;
  date: string;
  isReadOnly?: boolean; // Новый пропс для режима только чтения
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
}: FinalReviewTotalProps) {
  const router = useRouter();
  const [isResetting, setIsResetting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Получаем методы сброса из всех stores
  const resetTransformer = useTransformerStore((s) => s.reset);
  const resetBmz = useBmzStore((s) => s.reset);
  const resetBktp = useBktpStore((s) => s.reset);
  const resetRusn = useRusnStore((s) => s.reset);
  const resetAdditionalEquipment = useAdditionalEquipmentStore((s) => s.reset);
  const resetWorks = useWorksStore((s) => s.reset);

  // === Итоговая сумма для страницы ===
  // БМЗ: считаем сумму из тех же строк, что в таблице БМЗ (единый источник)
  const bmzRows = React.useMemo(() => bmzTableConfig.dataMapper(bmzStore), [bmzStore]);
  const bmzTotal = bmzRows.reduce((sum, row: any) => sum + (row.total || 0), 0);

  const transformerTotal = selectedTransformer?.price ? selectedTransformer.price * 2 : 0;

  const rusnTotal =
    rusnStore.cellConfigs.reduce((sum: number, cell: any) => sum + (cell.totalPrice || 0), 0) +
    (rusnStore.busBridgeSummary?.totalPrice || 0) +
    (rusnStore.busbarSummary?.totalPrice || 0);

  // Командировочные берём с клиента, чтобы не было SSR рассинхрона
  const [businessTravelTotal, setBusinessTravelTotal] = React.useState<number>(0);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('businessTravelTotal');
    const parsed = saved ? Number(saved) : 0;
    if (!Number.isNaN(parsed)) setBusinessTravelTotal(parsed);
  }, []);

  // Сумма работ - считаем из тех же строк, что рендерятся в таблице (единый источник истины)
  const worksRows = React.useMemo(() => (
    worksTableConfig.dataMapper({ selected: selectedWorks, worksList }, { businessTravelTotal })
  ), [selectedWorks, worksList, businessTravelTotal]);
  const worksTotal = worksRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);

  // Сумма РУНН — из тех же строк, что рендерятся в таблице RUNN
  const runnRows = React.useMemo(() => (
    runnTableConfig.dataMapper(runnStore)
  ), [runnStore.cellSummaries, runnStore.cellConfigs, runnStore.busbarSummary, runnStore.busBridgeSummary, runnStore.busBridgeSummaries]);
  const runnTotal = runnRows.reduce((sum: number, row: any) => sum + (row.total || 0), 0);

  const grandTotal = bmzTotal + transformerTotal + rusnTotal + runnTotal + worksTotal;
  // === / Итоговая сумма для страницы ===

  // Функция сброса всех данных
  const handleReset = () => {
    if (
      confirm(
        'Вы уверены, что хотите сбросить все данные конфигурации?\n\nЭто действие:\n• Сбросит все настройки БМЗ, трансформаторов, РУСН, дополнительного оборудования и работ\n• Сохранит ваш токен авторизации и информацию о пользователе\n• Перенаправит на главную страницу конфигуратора\n\nЭто действие нельзя отменить.'
      )
    ) {
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
      resetAdditionalEquipment();
      resetWorks();

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
        totalAmount: grandTotal,
        
        // Все данные конфигурации
        data: {
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
            cellSummaries: runnStore.cellSummaries || [],
            busbarSummary: runnStore.busbarSummary,
            busBridgeSummary: runnStore.busBridgeSummary,
            busBridgeSummaries: runnStore.busBridgeSummaries || [],
            total: runnTotal,
          },
          additionalEquipment: {
            selected: selectedEquipment,
            equipmentList: equipmentList,
            total: 0, // Пока не рассчитывается отдельно
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
        total: '0 ₸ (не рассчитывается)'
      });
      
      console.log('  🛠️ Работы:', {
        selectedCount: Object.keys(selectedWorks).length,
        worksListCount: worksList.length,
        total: `${worksTotal.toLocaleString('ru-RU')} ₸`
      });
      
      console.log('💰 ОБЩАЯ СУММА:', `${grandTotal.toLocaleString('ru-RU')} ₸`);
      console.log('📦 Полная структура данных:', applicationData);
      console.log('=== КОНЕЦ ДАННЫХ ЗАЯВКИ ===');

      // Отправляем данные на сервер
      const result = await createApplication(applicationData, token);
      
      alert(`Заявка успешно сохранена!\n\nID заявки: ${result.id}\nНомер заявки: ${result.bidNumber}\nОбщая сумма: ${grandTotal.toLocaleString('ru-RU')} ₸`);
      
      // Сбрасываем все сторы после успешного сохранения
      console.log('🔄 Сброс всех сторов после сохранения...');
      resetTransformer();
      resetBmz();
      resetBktp();
      resetRusn();
      resetAdditionalEquipment();
      resetWorks();
      
      // Перенаправляем на главную страницу конфигуратора
      setTimeout(() => {
        console.log('🔄 Перенаправление на главную страницу конфигуратора...');
        router.push('/dashboard/bktp');
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Ошибка при сохранении заявки:', error);
      console.error('📋 Детали ошибки:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Ошибка при сохранении заявки: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const breakdown = [
    { label: 'БМЗ', value: bmzTotal },
    { label: 'Трансформатор', value: transformerTotal },
    { label: 'РУСН-10кВ', value: rusnTotal },
    { label: 'РУНН-0,4кВ', value: runnTotal },
    { label: 'Работы и транспорт', value: worksTotal },
  ];

  return (
    <div className="mt-8">
      {/* Разбивка по категориям */}
      <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
          Разбивка по категориям
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 text-gray-700 font-medium">Категория</th>
              <th className="text-right px-4 py-2 text-gray-700 font-medium">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row) => (
              <tr key={row.label} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-900">{row.label}</td>
                <td className="px-4 py-2 text-right text-gray-900 font-semibold">{row.value.toLocaleString('ru-RU')} тг</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-200 bg-gray-50">
              <td className="px-4 py-2 font-bold text-gray-900">ИТОГО</td>
              <td className="px-4 py-2 text-right font-bold text-gray-900">{grandTotal.toLocaleString('ru-RU')} тг</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold px-6 py-3 rounded-lg shadow transition-colors flex items-center gap-2"
        >
          <FaSave className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold px-6 py-3 rounded-lg shadow transition-colors flex items-center gap-2"
        >
          <FaUndo className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          {isResetting ? 'Сброс...' : 'Сбросить'}
        </button>
      </div>
        <div className="bg-[#90bd20] text-white font-bold text-lg px-8 py-3 rounded-lg shadow">
          Сумма: {grandTotal.toLocaleString('ru-RU')} тг
        </div>
      </div>
    </div>
  );
}
