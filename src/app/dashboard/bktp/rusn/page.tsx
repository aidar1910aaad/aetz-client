'use client';

import { useState, useEffect } from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnStore } from '@/store/useRusnStore';
import RusnFormFields from './layout/RusnFormFields';
import { RusnNotConfigured } from '@/components/bktp/rusn/RusnNotConfigured';
import { RusnNextStepButton } from '@/components/bktp/rusn/RusnNextStepButton';
import RusnHeader from './layout/RusnHeader';
import RusnModeSelector from './layout/RusnModeSelector';

type RusnMode = 'configured' | 'not-configured';

export default function RusnConfigurator() {
  const { selectedTransformer } = useTransformerStore();
  const { cellConfigs, clearAllCells } = useRusnStore();
  const voltage = selectedTransformer?.voltage || '10';

  // Определяем режим на основе наличия конфигурации
  const [mode, setMode] = useState<RusnMode>(
    cellConfigs.length > 0 ? 'configured' : 'not-configured'
  );

  // Синхронизируем режим с состоянием store при изменении cellConfigs
  // НО только если режим еще не был установлен пользователем
  useEffect(() => {
    const hasConfiguration = cellConfigs.length > 0;
    // Переключаем режим только если:
    // 1. Есть конфигурация и текущий режим "not-configured" (первая загрузка)
    // 2. Нет конфигурации и пользователь явно выбрал "not-configured"
    if (hasConfiguration && mode === 'not-configured') {
      setMode('configured');
    }
    // НЕ переключаем на "not-configured" автоматически при очистке ячеек
  }, [cellConfigs, mode]);
  
  // Текущая активная вкладка
  const [currentTab, setCurrentTab] = useState<'main' | 'bus-bridge'>('main');

  const handleModeChange = (newMode: RusnMode) => {
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
                    Конфигурация РУСН-{voltage}кВ
                  </h2>
                </div>
                <div className="p-6">
                  <RusnFormFields currentTab={currentTab} onTabChange={setCurrentTab} />
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
              currentTab={currentTab}
              onSwitchToBusbar={() => {
                // Переключаемся на вкладку "Сборные шины"
                setCurrentTab('bus-bridge');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
