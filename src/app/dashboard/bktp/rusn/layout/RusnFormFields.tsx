'use client';

import React, { useState, useEffect } from 'react';
import RusnGlobalConfig from '../config/RusnGlobalConfig';
import RusnCellTable from '../cells/RusnCellTable';
import { RusnBusBridge } from '@/components/bktp/rusn/RusnBusBridge';
import { RusnBusbarSystem } from '@/components/bktp/rusn/RusnBusbarSystem';
import { RusnConfigTabs } from '@/components/bktp/rusn/RusnConfigTabs';
import RusnMaterialsSummary from '@/components/bktp/rusn/RusnMaterialsSummary';
import { useRusnStore } from '@/store/useRusnStore';
import { useRusnMaterials } from '@/hooks/useRusnMaterials';

type TabType = 'main' | 'bus-bridge';

interface RusnFormFieldsProps {
  currentTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

const RusnFormFields = ({ currentTab = 'main', onTabChange }: RusnFormFieldsProps) => {
  const rusn = useRusnStore();
  const { materials, loading: materialsLoading } = useRusnMaterials();

  // Очищаем все старые записи при загрузке компонента
  useEffect(() => {
    rusn.clearCellSummaries();
    rusn.clearOldKso366Summaries();
  }, []);

  // Очищаем старые записи из cellSummaries
  useEffect(() => {
    const oldEntries = rusn.cellSummaries.filter(s => 
      s.name.includes('Ячейка Секционный разьединитель Камера КСО 366') ||
      s.name.includes('Ячейка Секционный разьединитель Камера Камера КСО 366') ||
      (s.name.includes('Ячейка Секционный разьединитель') && s.totalPrice === 0) ||
      (s.name.includes('Ячейка Секционный разьединитель') && !s.cellId.includes('_main') && !s.cellId.includes('_additional'))
    );
    if (oldEntries.length > 0) {
      oldEntries.forEach(entry => {
        rusn.removeCellSummary(entry.cellId);
      });
    }
  }, [rusn]);

  // Обновляем расчет шинного моста при изменении конфигурации
  useEffect(() => {
    rusn.updateBusBridge();
  }, [rusn.cellConfigs, rusn.global.bodyType, rusn.global.busBridge.material]);

  const handleTabChange = (tab: TabType) => {
    onTabChange?.(tab);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'bus-bridge':
        return (
          <div className="space-y-8">
            <RusnBusbarSystem />
            <RusnBusBridge />
            
            {/* Сводка по материалам шин */}
            <RusnMaterialsSummary title="Сводка по материалам (Сборные шины)" showClearButton={true} />
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Общие настройки</h3>
              <RusnGlobalConfig />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ячейки</h3>
              <RusnCellTable />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <RusnConfigTabs activeTab={currentTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default RusnFormFields;