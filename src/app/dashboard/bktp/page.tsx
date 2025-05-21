'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs'; // ✅ добавь путь, где у тебя лежит компонент
import { showToast } from '@/shared/modals/ToastProvider';

export default function BktpRequestPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { taskNumber, client, time, date, setField } = useBktpStore();

  const [showResult, setShowResult] = useState(false);
  const equipmentName = 'БКТП';

  const fullName = user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : '';

  const handleNext = () => {
    if (!taskNumber.trim() || !client.trim() || !date || !time) {
      showToast('Пожалуйста, заполните все поля', 'error');
      return;
    }

    setField('executor', fullName);
    router.push('/dashboard/bktp/bmz');
  };

  const filename = `${taskNumber}-${equipmentName}-${client}-${date}`;

  return (
    <div className="p-6 w-[750px] space-y-6">
      <Breadcrumbs /> {/* ✅ вот здесь появляется навигация */}
      <h1 className="text-2xl font-semibold">Новая заявка: БКТП</h1>
      {!showResult && (
        <div className="space-y-4 w-[300px]">
          <label className="block">
            Номер задачи в Битрикс:
            <input
              value={taskNumber}
              onChange={(e) => setField('taskNumber', e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label className="block">
            Заказчик / Объект:
            <input
              value={client}
              onChange={(e) => setField('client', e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <button
            onClick={handleNext}
            className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-[#2e46c5]"
          >
            Далее
          </button>
        </div>
      )}
      {showResult && (
        <div className="p-4 bg-gray-100 rounded border text-lg font-medium">{filename}</div>
      )}
    </div>
  );
}
