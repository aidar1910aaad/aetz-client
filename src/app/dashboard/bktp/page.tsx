'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  User,
  Calendar,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { showToast } from '@/shared/modals/ToastProvider';
import { formatBktpDateTime } from '@/utils/bktpDateTime';

const steps = [
  { n: 1, title: 'Основные данные', desc: 'Номер задачи в Битрикс и заказчик' },
  { n: 2, title: 'БМЗ и трансформатор', desc: 'Параметры здания и силовое оборудование' },
  { n: 3, title: 'РУСН и РУНН', desc: 'Распределительные устройства' },
  { n: 4, title: 'Работы и доп. оборудование', desc: 'Монтаж и прочие позиции' },
  { n: 5, title: 'Спецификация', desc: 'Итог, PDF и сохранение в базу' },
];

export default function BktpRequestPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { taskNumber, client, date, time, stampDateTime, setField } = useBktpStore();

  const fullName = user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : '';
  const canContinue = Boolean(taskNumber.trim() && client.trim());

  useEffect(() => {
    stampDateTime();
  }, [stampDateTime]);

  const handleNext = () => {
    if (!canContinue) {
      showToast('Укажите номер задачи в Битрикс и заказчика', 'error');
      return;
    }

    setField('executor', fullName);
    stampDateTime();
    router.push('/dashboard/bktp/bmz');
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-gray-50">
      <div className="flex-1 p-6">
        <Breadcrumbs />

        <div className="mb-8">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8eba1e]/10">
              <Building2 className="h-6 w-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Новая заявка: БКТП</h1>
              <p className="mt-1 text-gray-600">
                Укажите номер задачи и заказчика — дата и время подставятся автоматически при сохранении
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-4 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-[#8eba1e] px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <FileText className="h-5 w-5" />
                  Данные заявки
                </h2>
                <p className="mt-1 text-sm text-white/85">Обязательные поля отмечены *</p>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="taskNumber" className="text-sm font-medium text-gray-700">
                      Номер задачи в Битрикс <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="taskNumber"
                      value={taskNumber}
                      onChange={(e) => setField('taskNumber', e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-[#8eba1e] focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/20"
                      placeholder="Например, 28451"
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="client" className="text-sm font-medium text-gray-700">
                      Заказчик / объект <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="client"
                      value={client}
                      onChange={(e) => setField('client', e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-[#8eba1e] focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/20"
                      placeholder="Название организации или объекта"
                      autoComplete="organization"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#8eba1e]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Дата и время
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        {formatBktpDateTime(date, time)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">Обновятся при сохранении заявки</p>
                    </div>
                  </div>

                  {user && (
                    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8eba1e]">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Исполнитель
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-900">
                          {fullName || 'Не указан'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">Подставится при переходе далее</p>
                      </div>
                    </div>
                  )}
                </div>

                {canContinue && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#8eba1e]/25 bg-[#8eba1e]/5 px-4 py-3 text-sm text-gray-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#8eba1e]" />
                    Можно перейти к настройке БМЗ
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8eba1e]">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Этапы конфигурации</h3>
              </div>
              <ol className="space-y-3">
                {steps.map((step) => (
                  <li key={step.n} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-[#8eba1e]">
                      {step.n}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className={`inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all ${
            canContinue
              ? 'bg-[#8eba1e] text-white shadow-md hover:bg-[#7aa31a] hover:shadow-lg'
              : 'cursor-not-allowed bg-gray-200 text-gray-500'
          }`}
        >
          Перейти к настройке БМЗ
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
