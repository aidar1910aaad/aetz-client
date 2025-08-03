'use client';

import { useState } from 'react';
import RusnGlobalConfig from './RusnGlobalConfig';
import RusnCellTable from './RusnCellTable';
import { RusnBusBridge } from '@/components/bktp/rusn/RusnBusBridge';
import { RusnBusbarSystem } from '@/components/bktp/rusn/RusnBusbarSystem';
import { RusnConfigTabs } from '@/components/bktp/rusn/RusnConfigTabs';
import { useEffect } from 'react';
import { useRusnStore } from '@/store/useRusnStore';

type TabType = 'global' | 'cells' | 'bus-bridge';

const RusnFormFields = () => {
  const rusn = useRusnStore();
  const [activeTab, setActiveTab] = useState<TabType>('global');

  // Обновляем расчет шинного моста при изменении конфигурации
  useEffect(() => {
    rusn.updateBusBridge();
  }, [rusn.cellConfigs, rusn.global.bodyType, rusn.global.busBridge.material]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'global':
        return <RusnGlobalConfig />;
      case 'cells':
        return <RusnCellTable />;
      case 'bus-bridge':
        return (
          <div className="space-y-8">
            <RusnBusbarSystem />
            <RusnBusBridge />
          </div>
        );
      default:
        return <RusnGlobalConfig />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <RusnConfigTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="pt-4">{renderTabContent()}</div>
    </div>
  );
};

export default RusnFormFields;
