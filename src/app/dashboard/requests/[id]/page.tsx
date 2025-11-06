'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getApplicationById } from '@/api/requests';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { FinalReviewHeader, FinalReviewContent, FinalReviewTotal } from '@/app/dashboard/final/components';

interface RequestData {
  id: number;
  bidNumber: string;
  type: string;
  date: string;
  client: string;
  taskNumber: string;
  totalAmount: number;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  data: {
    bmz: any;
    transformer: any;
    rusn: any;
    runn: any;
    additionalEquipment: any;
    works: any;
  };
  createdAt: string;
  updatedAt: string;
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestId = params.id as string;

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
        console.log('📋 Данные заявки:', data);
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
            onClick={() => router.back()}
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
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  // Формируем данные для компонентов Final
  const filename = `${requestData.taskNumber}-${requestData.type}-${requestData.client}-${requestData.date}`;
  const fullName = requestData.user
    ? `${requestData.user.lastName || ''} ${requestData.user.firstName || ''}`.trim() || requestData.user.username
    : 'Пользователь';

  // Преобразуем данные в формат, ожидаемый компонентами Final
  const bmzStore = requestData.data.bmz;
  const selectedTransformer = requestData.data.transformer?.selected || null;
  const rusnStore = requestData.data.rusn;
  const runnStore = requestData.data.runn;
  const selectedEquipment = requestData.data.additionalEquipment?.selected || {};
  const equipmentList = requestData.data.additionalEquipment?.equipmentList || [];
  const selectedWorks = requestData.data.works?.selected || {};
  const worksList = requestData.data.works?.worksList || [];

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />

      {/* Заголовок с информацией о заявке */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Заявка <span className="text-[#90bd20]">{requestData.bidNumber}</span>
            </h1>
            <div className="text-gray-600 text-sm space-y-1">
              <p><strong>Клиент:</strong> {requestData.client}</p>
              <p><strong>Тип:</strong> {requestData.type}</p>
              <p><strong>Дата:</strong> {new Date(requestData.date).toLocaleDateString('ru-RU')}</p>
              <p><strong>Номер задачи:</strong> {requestData.taskNumber}</p>
              <p><strong>Автор:</strong> {fullName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {requestData.totalAmount.toLocaleString('ru-RU')} ₸
            </div>
            <div className="text-sm text-gray-500">
              Общая сумма
            </div>
          </div>
        </div>
      </div>

      {/* Компоненты из Final страницы */}
      <FinalReviewHeader
        filename={filename}
        fullName={fullName}
        user={requestData.user}
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
        runnStore={runnStore}
        selectedEquipment={selectedEquipment}
        equipmentList={equipmentList}
        selectedWorks={selectedWorks}
        worksList={worksList}
        user={requestData.user}
        taskNumber={requestData.taskNumber}
        client={requestData.client}
        date={requestData.date}
      />
    </div>
  );
}