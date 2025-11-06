'use client';

import { useUserStore } from '@/store/useUserStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useRouter } from 'next/navigation';
import { Building2, FileText, User, Calendar, Clock, ArrowRight, Lightbulb } from 'lucide-react';
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
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col">
      <div className="flex-1 p-6 space-y-8">
        <Breadcrumbs />

        {/* Заголовок с иконкой */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gray-100 rounded-xl">
            <Building2 className="w-6 h-6 text-[#8eba1e]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Новая заявка: БКТП</h1>
            <p className="text-gray-600">Заполните основную информацию о заявке</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная форма - занимает 2 колонки */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Заголовок карточки */}
              <div className="bg-[#8eba1e] px-8 py-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  Информация о заявке
                </h2>
              </div>

              {/* Форма */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Номер задачи */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#8eba1e]" />
                      Номер задачи в Битрикс
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        value={taskNumber}
                        onChange={(e) => setField('taskNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Введите номер задачи"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Заказчик */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#8eba1e]" />
                      Заказчик / Объект
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        value={client}
                        onChange={(e) => setField('client', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Введите название заказчика или объекта"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Дата и время */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#8eba1e]" />
                      Дата
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={date || ''}
                        onChange={(e) => setField('date', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200 text-gray-900"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#8eba1e]" />
                      Время
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={time || ''}
                        onChange={(e) => setField('time', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200 text-gray-900"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Информация о пользователе */}
                {user && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#8eba1e] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Исполнитель</p>
                        <p className="text-sm text-gray-600">{fullName || 'Не указан'}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Информационная карточка - занимает 1 колонку справа */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#8eba1e] rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
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

      </div>

      {/* Navigation - прижата к низу */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <div className="flex justify-start">
          <button
            onClick={handleNext}
            disabled={!taskNumber.trim() || !client.trim() || !date || !time}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
              !taskNumber.trim() || !client.trim() || !date || !time
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#8eba1e] hover:bg-[#7aa31a] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
            Перейти к настройке БМЗ
          </button>
        </div>
      </div>
    </div>
  );
}
