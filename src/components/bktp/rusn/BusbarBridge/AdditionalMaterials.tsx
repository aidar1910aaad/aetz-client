import React, { useState } from 'react';
import MaterialsTable from '@/app/dashboard/bktp/rusn/components/MaterialsTable';

interface AdditionalMaterialsProps {
  busbarBridgeCalculation: any;
}

export const AdditionalMaterials: React.FC<AdditionalMaterialsProps> = ({
  busbarBridgeCalculation,
}) => {
  const [showMaterials, setShowMaterials] = useState(false);

  if (!busbarBridgeCalculation || !busbarBridgeCalculation.data?.categories) {
    return null;
  }

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold text-gray-900">Дополнительные материалы</h5>
        <button
          onClick={() => setShowMaterials(!showMaterials)}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            showMaterials
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showMaterials ? 'Скрыть' : 'Показать'} материалы
        </button>
      </div>

      {/* Дополнительные материалы */}
      {showMaterials && (
        <div className="space-y-4">
          {busbarBridgeCalculation.data.categories.map((category: any, index: number) => (
            <MaterialsTable key={index} category={category} />
          ))}
        </div>
      )}
    </div>
  );
};
