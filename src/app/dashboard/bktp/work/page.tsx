'use client';

import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { useWorksStore } from '@/store/useWorksStore';
import WorksTable from '@/components/FinalReview/WorksTable';
import WorkToggle from './components/WorkToggle';
import InstallationTables from './components/InstallationTables';

export default function WorkPage() {
  const selected = useWorksStore((s) => s.selected);
  const worksList = useWorksStore((s) => s.worksList);
  const [isWorksEnabled, setIsWorksEnabled] = useState(false);

  const handleWorksToggle = (enabled: boolean) => {
    setIsWorksEnabled(enabled);
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto bg-gray-100 pb-16">
      <div className="max-w-7xl mx-auto px-2 md:px-8 pt-6">
        <Breadcrumbs />

        {/* Компонент переключателя Да/Нет */}
        <WorkToggle onToggle={handleWorksToggle} />

        {/* Компонент с таблицами монтажа - показывается всегда */}
        <InstallationTables isVisible={true} />

        {/* Показываем таблицу работ только если выбрано "Да" */}
        {isWorksEnabled && (
          <div className="w-full mt-12">
            <div className="max-w-6xl mx-auto">
              <WorksTable selected={selected} worksList={worksList} />
              <div className="flex justify-end mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow transition text-lg">
                  Добавить в спецификацию
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
