'use client';

import BmzInstallationTable from './BmzInstallationTable';
import TransformerInstallationTable from './TransformerInstallationTable';
import RusnInstallationTable from './RusnInstallationTable';

interface InstallationTablesProps {
  isVisible: boolean;
}

export default function InstallationTables({ isVisible }: InstallationTablesProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Монтаж
      </h3>
      
      <div className="space-y-6">
        {/* Таблица монтажа БМЗ */}
        <BmzInstallationTable isVisible={true} />
        
        {/* Таблица монтажа РУСН */}
        <RusnInstallationTable isVisible={true} />
        
        {/* Таблица монтажа трансформаторов */}
        <TransformerInstallationTable isVisible={true} />
      </div>
    </div>
  );
} 