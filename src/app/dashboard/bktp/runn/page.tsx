'use client';

import { useState, useEffect } from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRunnStore } from '@/store/useRunnStore';
import RunnFormFields from './RunnFormFields';
import { RunnNotConfigured } from '@/components/runn/RunnNotConfigured';
import { RunnNextStepButton } from '@/components/runn/RunnNextStepButton';
import RunnHeaderSimple from './components/RunnHeaderSimple';
import RunnModeSelector from './components/RunnModeSelector';

type RunnMode = 'configured' | 'not-configured';

export default function RunnConfigurator() {
  const { selectedTransformer } = useTransformerStore();
  const { cellConfigs, clearAllCells } = useRunnStore();
  const voltage = selectedTransformer?.voltage || 0.4;

  // Определяем режим на основе наличия конфигурации
  const [mode, setMode] = useState<RunnMode>(
    cellConfigs.length > 0 ? 'configured' : 'not-configured'
  );

  // Синхронизируем режим с состоянием store при изменении cellConfigs
  useEffect(() => {
    const hasConfiguration = cellConfigs.length > 0;
    setMode(hasConfiguration ? 'configured' : 'not-configured');
  }, [cellConfigs]);
  
  // Текущая активная вкладка
  const [currentTab, setCurrentTab] = useState<'main' | 'bus-bridge' | 'dgu'>('main');

  const handleModeChange = (newMode: RunnMode) => {
    setMode(newMode);
    if (newMode === 'not-configured') {
      // Очищаем конфигурацию при выборе "не предусмотрено"
      clearAllCells();
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <RunnHeaderSimple voltage={voltage} cellCount={cellConfigs.length} />

        {/* Mode Selector */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg mb-6">
          <RunnModeSelector mode={mode} onModeChange={handleModeChange} />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {mode === 'configured' ? (
            <div className="space-y-6">
              {/* Configuration Form */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Конфигурация РУНН Сборные шины
                  </h2>
                </div>
                <div className="p-6">
                  <RunnFormFields onTabChange={setCurrentTab} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Not Configured Component */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
                <div className="p-6">
                  <RunnNotConfigured />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-start">
            <RunnNextStepButton 
              skip={mode === 'not-configured'} 
              currentTab={currentTab}
              onSwitchToBusbar={() => {
                // Переключаемся на вкладку "Сборные шины" в RunnFormFields
                const event = new CustomEvent('switchToBusbar');
                window.dispatchEvent(event);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
