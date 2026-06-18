'use client';

import { useState, useEffect } from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnStore } from '@/store/useRusnStore';
import RusnFormFields from './layout/RusnFormFields';
import { RusnNotConfigured } from '@/components/bktp/rusn/RusnNotConfigured';
import { RusnNextStepButton } from '@/components/bktp/rusn/RusnNextStepButton';
import RusnHeader from './layout/RusnHeader';
import RusnModeSelector, { type RusnMode } from './layout/RusnModeSelector';

export default function RusnConfigurator() {
  const { selectedTransformer } = useTransformerStore();
  const { cellConfigs, clearAllCells } = useRusnStore();
  const voltage = selectedTransformer?.voltage || '10';

  const [mode, setMode] = useState<RusnMode>(() =>
    cellConfigs.length > 0 ? 'configured' : null
  );

  useEffect(() => {
    if (cellConfigs.length > 0 && mode === 'not-configured') {
      setMode('configured');
    }
  }, [cellConfigs, mode]);

  const handleModeChange = (newMode: Exclude<RusnMode, null>) => {
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
        <RusnHeader voltage={voltage} cellCount={cellConfigs.length} />

        {/* Mode Selector */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg mb-6">
          <RusnModeSelector mode={mode} onModeChange={handleModeChange} />
        </div>


        {/* Main Content */}
        <div className="space-y-6">
          {mode === null ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
              <div className="p-10 text-center">
                <p className="text-gray-600">
                  Выберите «Настроить РУСН» или «Не предусмотрено», чтобы продолжить.
                </p>
              </div>
            </div>
          ) : mode === 'configured' ? (
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
              {/* Not Configured Component */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
                <div className="p-6">
                  <RusnNotConfigured />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-start">
            <RusnNextStepButton
              skip={mode === 'not-configured'}
              disabled={mode === null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
