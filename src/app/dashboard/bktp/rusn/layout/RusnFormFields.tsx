'use client';

import React, { useEffect } from 'react';
import RusnGlobalConfig from '../config/RusnGlobalConfig';
import RusnCellTable from '../cells/RusnCellTable';
import { RusnBusBridge } from '@/components/bktp/rusn/RusnBusBridge';
import { RusnBusbarSystem } from '@/components/bktp/rusn/RusnBusbarSystem';
import RusnMaterialsSummary from '@/components/bktp/rusn/RusnMaterialsSummary';
import DebugToggle from '@/components/common/DebugToggle';
import { useRusnStore } from '@/store/useRusnStore';
const RusnFormFields = () => {
  const rusn = useRusnStore();

  // Обновляем расчет шинного моста при изменении конфигурации
  useEffect(() => {
    rusn.updateBusBridge();
  }, [rusn.cellConfigs, rusn.global.bodyType, rusn.global.busBridge.material]);

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Общие настройки</h3>
          <DebugToggle />
        </div>
        <RusnGlobalConfig />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ячейки</h3>
        <RusnCellTable />
      </div>
      <RusnBusbarSystem />
      <RusnBusBridge />
      <RusnMaterialsSummary title="Сводка по материалам (Сборные шины)" showClearButton={true} />
    </div>
  );
};

export default RusnFormFields;