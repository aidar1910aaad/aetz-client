'use client';

import React from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useUserStore } from '@/store/useUserStore';
import { useRusnStore } from '@/store/useRusnStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useWorksStore } from '@/store/useWorksStore';
import type { BmzData } from '@/utils/bmzCalculations';
import type { RusnState } from '@/store/useRusnStore';
import type {
  AdditionalEquipmentState,
  AdditionalEquipmentItem,
} from '@/store/useAdditionalEquipmentStore';
import type { WorksState, WorkItem } from '@/store/useWorksStore';
import { FinalReviewHeader, FinalReviewContent, FinalReviewTotal } from './components';

export default function FinalReview() {
  const { selectedTransformer } = useTransformerStore();
  const bmzStore: BmzData = useBmzStore();
  const { taskNumber, client, date } = useBktpStore();
  const { user } = useUserStore();
  const rusnStore: RusnState = useRusnStore();
  const filename = `${taskNumber}-БКТП-${client}-${date}`;

  const selectedEquipment: AdditionalEquipmentState['selected'] = useAdditionalEquipmentStore(
    (s) => s.selected
  );
  const equipmentList: AdditionalEquipmentItem[] = useAdditionalEquipmentStore(
    (s) => s.equipmentList
  );

  const selectedWorks: WorksState['selected'] = useWorksStore((s) => s.selected);
  const worksList: WorkItem[] = useWorksStore((s) => s.worksList);

  // Формируем полное имя пользователя
  const fullName = user
    ? `${user.lastName || ''} ${user.firstName || ''}`.trim() || user.username
    : 'Пользователь';

  // === Формирование объекта заявки ===
  function getApplicationPayload() {
    // Итоги
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
    const worksTotal = worksList
      .filter((work) => selectedWorks[work.name]?.checked)
      .reduce((sum, work) => {
        const count = selectedWorks[work.name]?.count || 1;
        return sum + work.price * count;
      }, 0);
    const grandTotal = bmzTotal + transformerTotal + rusnTotal + worksTotal;

    // Формируем payload
    const payload = {
      meta: {
        taskNumber,
        date,
        client,
        user: user
          ? {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          : null,
        type: 'БКТП',
      },
      bmz: {
        buildingType: bmzStore.buildingType,
        length: bmzStore.length,
        width: bmzStore.width,
        height: bmzStore.height,
        thickness: bmzStore.thickness,
        blockCount: bmzStore.blockCount,
        settings: bmzStore.settings,
        equipmentState: bmzStore.equipmentState,
      },
      transformer: selectedTransformer,
      rusn: {
        cellConfigs: rusnStore.cellConfigs,
        busbarSummary: rusnStore.busbarSummary,
        busBridgeSummary: rusnStore.busBridgeSummary,
        busBridgeSummaries: rusnStore.busBridgeSummaries,
        cellSummaries: rusnStore.cellSummaries,
      },
      additionalEquipment: {
        selected: selectedEquipment,
        equipmentList: equipmentList,
      },
      works: {
        selected: selectedWorks,
        worksList: worksList,
      },
      totals: {
        bmzTotal,
        transformerTotal,
        rusnTotal,
        worksTotal,
        grandTotal,
      },
    };
    return payload;
  }

  // Кнопка для теста
  function handleShowPayload() {
    const payload = getApplicationPayload();
    // Можно отправить на сервер, сохранить в файл и т.д.
    // Для примера просто покажем в alert и консоли
    console.log('Application payload:', payload);
    alert('Сформирован JSON заявки. Смотрите консоль.');
  }

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />

      <button
        onClick={handleShowPayload}
        className="mb-4 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-lg shadow"
      >
        Сформировать JSON заявки
      </button>

      <FinalReviewHeader
        filename={filename}
        fullName={fullName}
        bmzStore={bmzStore}
        selectedTransformer={selectedTransformer}
        rusnStore={rusnStore}
        selectedWorks={selectedWorks}
        worksList={worksList}
      />

      <FinalReviewContent
        bmzStore={bmzStore}
        selectedTransformer={selectedTransformer}
        rusnStore={rusnStore}
        selectedEquipment={selectedEquipment}
        equipmentList={equipmentList}
        selectedWorks={selectedWorks}
        worksList={worksList}
      />

      <FinalReviewTotal
        bmzStore={bmzStore}
        selectedTransformer={selectedTransformer}
        rusnStore={rusnStore}
        selectedWorks={selectedWorks}
        worksList={worksList}
      />
    </div>
  );
}
