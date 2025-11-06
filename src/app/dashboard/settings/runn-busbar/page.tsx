'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { showToast } from '@/shared/modals/ToastProvider';
import { getAllCalculationGroups } from '@/api/calculations';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';

interface NewSwitchgearConfig {
  type: string;
  breaker: string;
  amperage: string;
  group: string;
  busbar: string;
  cells: {
    name: string;
    quantity: number;
  }[];
}

export default function RunnBusbarSettingsPage() {
  const router = useRouter();
  const [allSwitchgearConfigs, setAllSwitchgearConfigs] = useState<Switchgear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTypes, setAllTypes] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const configs = await switchgearApi.getAll();
      setAllSwitchgearConfigs(configs);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    getAllCalculationGroups(token)
      .then((groups) => {
        setAllTypes(groups.map((g) => g.name));
      })
      .catch(() => setAllTypes([]));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A55DF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/settings/runn-busbar"
    >
      <div className="h-[calc(100vh-110px)] overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Сборные шины РУНН</h1>
            <p className="text-sm text-gray-600">Настройка сборных шин РУНН</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Конфигурации сборных шин</h2>
            <button
              onClick={() => {
                // Здесь будет логика добавления новой конфигурации
                showToast('Функция добавления конфигурации в разработке', 'info');
              }}
              className="px-4 py-2 bg-[#3A55DF] text-white rounded-lg hover:bg-[#2e46c5] transition-colors"
            >
              Добавить конфигурацию
            </button>
          </div>

          {allSwitchgearConfigs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет конфигураций сборных шин
              </h3>
              <p className="text-sm text-gray-600">
                Добавьте первую конфигурацию для настройки сборных шин РУНН
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allSwitchgearConfigs.map((config, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#3A55DF] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {config.type} - {config.breaker} {config.amperage}А
                      </h3>
                      <p className="text-sm text-gray-600">
                        Группа: {config.group} | Шина: {config.busbar}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Логика редактирования
                          showToast('Функция редактирования в разработке', 'info');
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => {
                          // Логика удаления
                          showToast('Функция удаления в разработке', 'info');
                        }}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ячейки:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {config.cells.map((cell, cellIndex) => (
                        <div key={cellIndex} className="text-sm text-gray-600">
                          {cell.name}: {cell.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </RoleGuard>
  );
} 