import React from 'react';
import {
  CalculationResult,
  CalculationData,
  formatCurrency,
  getCalculationStepName,
  getCalculationStepDescription,
} from '@/utils/calculationUtils';

interface CalculationDisplayProps {
  title: string;
  calculation: CalculationResult;
  calculationData: CalculationData;
  showMaterialsTable?: boolean;
  materialsTableComponent?: React.ReactNode;
  additionalMaterialsTotal?: number; // Стоимость выбранных материалов
}

export default function CalculationDisplay({
  title,
  calculation,
  calculationData,
  showMaterialsTable = false,
  materialsTableComponent,
  additionalMaterialsTotal = 0,
}: CalculationDisplayProps) {
  const calculationSteps: (keyof CalculationResult)[] = [
    'materialsTotal',
    'salary',
    'overheadCost',
    'productionCost',
    'adminCost',
    'fullCost',
    'plannedProfit',
    'wholesalePrice',
    'ndsAmount',
    'finalPrice',
  ];

  const renderCalculationStep = (step: keyof CalculationResult) => {
    const value = calculation[step];
    const name = getCalculationStepName(step);
    const description = getCalculationStepDescription(step, calculationData);
    const isMainStep = [
      'materialsTotal',
      'productionCost',
      'fullCost',
      'wholesalePrice',
      'finalPrice',
    ].includes(step);

    // Получаем процент для соответствующего шага
    const getPercentage = (step: keyof CalculationResult): string => {
      switch (step) {
        case 'overheadCost':
          return `${calculationData.overheadPercentage}%`;
        case 'adminCost':
          return `${calculationData.adminPercentage}%`;
        case 'plannedProfit':
          return `${calculationData.plannedProfitPercentage}%`;
        case 'ndsAmount':
          return `${calculationData.ndsPercentage}%`;
        default:
          return '';
      }
    };

    // Для materialsTotal показываем сумму с дополнительными материалами
    const displayValue = value; // materialsTotal уже включает дополнительные материалы

    return (
      <div key={step} className="space-y-2">
        {isMainStep ? (
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">{name}:</span>
            <span className="text-lg font-medium">{formatCurrency(displayValue)} ₸</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span>{name}:</span>
              <span>{step === 'salary' ? formatCurrency(value) : getPercentage(step)}</span>
            </div>
            {description && (
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Сумма: {description}</span>
                <span>{formatCurrency(value)} ₸</span>
              </div>
            )}
          </>
        )}
        {description && !isMainStep && <div className="text-sm text-gray-600">{description}</div>}
      </div>
    );
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {/* Категории материалов */}
        {showMaterialsTable && materialsTableComponent}

        {/* Расчет стоимости */}
        <div className="mt-8 space-y-6">{calculationSteps.map(renderCalculationStep)}</div>
      </div>
    </div>
  );
}
