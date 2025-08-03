'use client';

import { useUserStore } from '@/store/useUserStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { showToast } from '@/shared/modals/ToastProvider';

export default function BktpRequestPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { taskNumber, client, time, date, setField } = useBktpStore();

  const fullName = user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : '';

  const handleNext = () => {
    if (!taskNumber.trim() || !client.trim() || !date || !time) {
      showToast('Пожалуйста, заполните все обязательные поля', 'error');
      return;
    }

    setField('executor', fullName);
    router.push('/dashboard/bktp/bmz');
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Breadcrumbs />

        {/* Заголовок с иконкой */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#3A55DF] to-[#2e46c5] rounded-2xl shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Новая заявка: БКТП</h1>
            <p className="text-gray-600 text-lg">Заполните основную информацию о заявке</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Заголовок карточки */}
          <div className="bg-gradient-to-r from-[#3A55DF] to-[#2e46c5] px-8 py-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Информация о заявке
            </h2>
          </div>

          {/* Форма */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Номер задачи */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#3A55DF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Номер задачи в Битрикс
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={taskNumber}
                    onChange={(e) => setField('taskNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF] transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Введите номер задачи"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Заказчик */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#3A55DF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Заказчик / Объект
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={client}
                    onChange={(e) => setField('client', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF] transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Введите название заказчика или объекта"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Дата и время */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#3A55DF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Дата
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date || ''}
                    onChange={(e) => setField('date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF] transition-all duration-200 text-gray-900"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[#3A55DF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Время
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={time || ''}
                    onChange={(e) => setField('time', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF] transition-all duration-200 text-gray-900"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Информация о пользователе */}
            {user && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3A55DF] to-[#2e46c5] rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Исполнитель</p>
                    <p className="text-sm text-gray-600">{fullName || 'Не указан'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Кнопка */}
            <div className="pt-4">
              <button
                onClick={handleNext}
                disabled={!taskNumber.trim() || !client.trim() || !date || !time}
                className="w-full bg-gradient-to-r from-[#3A55DF] to-[#2e46c5] text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                Перейти к настройке БМЗ
              </button>
            </div>
          </div>
        </div>

        {/* Информационная карточка */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Как использовать программу
              </h3>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>
                  <strong>1. Заполните основную информацию</strong> - номер задачи, заказчика и дату
                  создания заявки.
                </p>
                <p>
                  <strong>2. Настройте параметры здания</strong> - выберите тип БМЗ или ТП, укажите
                  размеры и дополнительное оборудование.
                </p>
                <p>
                  <strong>3. Добавьте трансформаторы</strong> - выберите мощность и количество
                  силовых трансформаторов.
                </p>
                <p>
                  <strong>4. Настройте РУСН и РУНН</strong> - сконфигурируйте распределительные
                  устройства среднего и низкого напряжения.
                </p>
                <p>
                  <strong>5. Добавьте работы и оборудование</strong> - укажите монтажные работы и
                  дополнительное оборудование.
                </p>
                <p>
                  <strong>6. Получите готовую спецификацию</strong> - программа автоматически
                  рассчитает стоимость и сформирует документ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
