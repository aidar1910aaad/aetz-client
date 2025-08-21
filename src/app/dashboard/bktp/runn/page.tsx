'use client';

import { useState } from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRunnStore } from '@/store/useRunnStore';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import RunnFormFields from './RunnFormFields';
import { RunnNotConfigured } from '@/components/runn/RunnNotConfigured';
import { RunnNextStepButton } from '@/components/runn/RunnNextStepButton';
import { RunnHeader } from '@/components/runn/RunnHeader';
import { RunnModeSelector } from '@/components/runn/RunnModeSelector';

type RunnMode = 'not-configured' | 'configured';

export default function RunnConfigurator() {
  const { selectedTransformer } = useTransformerStore();
  const { cellConfigs } = useRunnStore();
  const voltage = selectedTransformer?.voltage || 0.4;

  // Определяем режим на основе наличия конфигурации, но сохраняем в localStorage
  const [mode, setMode] = useState<RunnMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('runn-mode') as RunnMode;
      if (savedMode) return savedMode;
    }
    return cellConfigs.length > 0 ? 'configured' : 'not-configured';
  });

  const handleModeChange = (newMode: RunnMode) => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('runn-mode', newMode);
    }
    if (newMode === 'not-configured') {
      // Очищаем конфигурацию при выборе "не предусмотрено"
      // Можно добавить подтверждение
    }
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto bg-gray-50">
      {/* Breadcrumbs */}
      <div className="px-6 pt-6">
        <Breadcrumbs />
      </div>
      
      {/* Header */}
      <RunnHeader voltage={voltage} cellCount={cellConfigs.length} />

      {/* Mode Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <RunnModeSelector mode={mode} onModeChange={handleModeChange} />
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {mode === 'configured' && (
          <div className="space-y-6">
            {/* Configuration Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Конфигурация РУНН-{voltage}кВ
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Ячеек: {cellConfigs.length}</span>
                    <span>•</span>
                    <span>Доступно типов: {voltage === 0.4 ? '3' : '5'}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <RunnFormFields />
              </div>
            </div>
          </div>
        )}

        {mode === 'not-configured' && (
          <div className="space-y-6">
            {/* Not Configured Component */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">РУНН-{voltage}кВ</h2>
              </div>
              <div className="p-6">
                <RunnNotConfigured />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link href="/dashboard/bktp/rusn">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Назад к РУСН
            </button>
          </Link>

          <RunnNextStepButton skip={mode === 'not-configured'} />
        </div>
      </div>
    </div>
  );
}
