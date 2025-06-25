'use client';

import { useState } from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnStore } from '@/store/useRusnStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import RusnFormFields from './RusnFormFields';
import { RusnNotConfigured } from '@/components/bktp/rusn/RusnNotConfigured';
import { RusnNextStepButton } from '@/components/bktp/rusn/RusnNextStepButton';
import { RusnStatusCard } from '@/components/bktp/rusn/RusnStatusCard';
import { RusnQuickActions } from '@/components/bktp/rusn/RusnQuickActions';
import Link from 'next/link';

type RusnMode = 'configured' | 'not-configured';

export default function RusnConfigurator() {
  const { selectedTransformer } = useTransformerStore();
  const { cellConfigs } = useRusnStore();
  const voltage = selectedTransformer?.voltage || '10';

  // Определяем режим на основе наличия конфигурации
  const [mode, setMode] = useState<RusnMode>(
    cellConfigs.length > 0 ? 'configured' : 'not-configured'
  );

  const handleModeChange = (newMode: RusnMode) => {
    setMode(newMode);
    if (newMode === 'not-configured') {
      // Очищаем конфигурацию при выборе "не предусмотрено"
      // Можно добавить подтверждение
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <Breadcrumbs />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Конфигурация РУСН</h1>
            <p className="text-sm text-gray-600 mt-1">
              Напряжение: {voltage} кВ • {cellConfigs.length} ячеек
            </p>
          </div>

          {/* Quick Actions */}
          <RusnQuickActions voltage={voltage} />
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-700">Режим РУСН:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('configured')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                mode === 'configured'
                  ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Настроить РУСН
              </span>
            </button>
            <button
              onClick={() => handleModeChange('not-configured')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                mode === 'not-configured'
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Не предусмотрено
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {mode === 'configured' ? (
          <div className="space-y-6">
            {/* Status Card */}
            <RusnStatusCard voltage={voltage} />

            {/* Configuration Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Конфигурация РУСН-{voltage}кВ
                </h2>
              </div>
              <div className="p-6">
                <RusnFormFields />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Not Configured Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    РУСН-{voltage}кВ не предусмотрен
                  </h3>
                  <p className="text-sm text-gray-700">В данной конфигурации РУСН не требуется</p>
                </div>
              </div>
            </div>

            {/* Not Configured Component */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">РУСН-{voltage}кВ</h2>
              </div>
              <div className="p-6">
                <RusnNotConfigured />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link href="/dashboard/bktp/bmz">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Назад к БМЗ
            </button>
          </Link>

          <RusnNextStepButton skip={mode === 'not-configured'} />
        </div>
      </div>
    </div>
  );
}
