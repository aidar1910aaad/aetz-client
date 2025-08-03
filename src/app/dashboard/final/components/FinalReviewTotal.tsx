'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaUndo } from 'react-icons/fa';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useWorksStore } from '@/store/useWorksStore';
import type { BmzData } from '@/utils/bmzCalculations';
import type { Transformer } from '@/api/transformers';
import type { RusnState } from '@/store/useRusnStore';
import type { WorksState } from '@/store/useWorksStore';

interface FinalReviewTotalProps {
  bmzStore: BmzData;
  selectedTransformer: Transformer | null;
  rusnStore: RusnState;
  selectedWorks: WorksState['selected'];
  worksList: any[];
}

export default function FinalReviewTotal({
  bmzStore,
  selectedTransformer,
  rusnStore,
  selectedWorks,
  worksList,
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
  const bmzArea =
    bmzStore.buildingType !== 'none' ? (bmzStore.length / 1000) * (bmzStore.width / 1000) : 0;

  const bmzTotal =
    bmzStore.buildingType !== 'none'
      ? bmzArea * 257000 +
        (bmzStore.settings?.equipment?.reduce((sum: number, eq: any) => {
          const stateKey = eq.name.toLowerCase().replace(/\s+/g, '');
          if (!bmzStore.equipmentState[stateKey]) return sum;
          let quantity = 0;
          if (eq.priceType === 'perSquareMeter') quantity = bmzArea;
          else if (eq.priceType === 'perHalfSquareMeter') quantity = bmzArea / 2;
          else if (eq.priceType === 'fixed') quantity = 1;
          const price = eq.pricePerSquareMeter || eq.fixedPrice || 0;
          return sum + price * quantity;
        }, 0) || 0)
      : 0;

  const transformerTotal = selectedTransformer?.price ? selectedTransformer.price * 2 : 0;

  const rusnTotal =
    rusnStore.cellConfigs.reduce((sum: number, cell: any) => sum + (cell.totalPrice || 0), 0) +
    (rusnStore.busBridgeSummary?.totalPrice || 0) +
    (rusnStore.busbarSummary?.totalPrice || 0);

  // Сумма работ
  const worksTotal = worksList
    .filter((work) => selectedWorks[work.name]?.checked)
    .reduce((sum, work) => {
      const count = selectedWorks[work.name]?.count || 1;
      return sum + work.price * count;
    }, 0);

  const grandTotal = bmzTotal + transformerTotal + rusnTotal + worksTotal;
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

  // Функция сохранения (пока просто показывает сообщение)
  const handleSave = () => {
    setIsSaving(true);

    setTimeout(() => {
      alert(
        `Функция сохранения конфигурации будет реализована в будущем.\n\nТекущая сумма: ${grandTotal.toLocaleString(
          'ru-RU'
        )} тг\n\nВ будущих версиях здесь будет возможность:\n• Сохранить конфигурацию в базу данных\n• Создать PDF-отчет\n• Отправить на согласование`
      );
      setIsSaving(false);
    }, 300);
  };

  return (
    <div className="flex justify-between items-center mt-8">
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
      <div className="bg-blue-600 text-white font-bold text-lg px-8 py-3 rounded-lg shadow">
        Сумма: {grandTotal.toLocaleString('ru-RU')} тг
      </div>
    </div>
  );
}
